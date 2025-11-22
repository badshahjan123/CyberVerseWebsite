const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Stripe (will be null if not configured)
let stripe = null;
try {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (stripeKey) {
    stripe = require('stripe')(stripeKey);
  } else {
    console.warn('Stripe not configured - STRIPE_SECRET_KEY missing');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
}

// @route   POST /api/payment/upgrade-to-premium
// @desc    Upgrade user to premium after successful payment
// @access  Private
router.post('/upgrade-to-premium', auth, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('paymentMethod').notEmpty().withMessage('Payment method is required'),
  body('plan').notEmpty().withMessage('Plan is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { transactionId, paymentMethod, plan, amount } = req.body;
    const user = req.user;

    // Temporarily disabled for testing - allows upgrading multiple times
    // if (user.isPremium) {
    //   return res.status(400).json({ 
    //     message: 'User is already a premium member' 
    //   });
    // }

    // Update user to premium
    user.isPremium = true;

    // Add premium subscription details (you can expand this schema later)
    if (!user.premiumSubscription) {
      user.premiumSubscription = {};
    }

    user.premiumSubscription = {
      plan: plan,
      startDate: new Date(),
      transactionId: transactionId,
      paymentMethod: paymentMethod,
      amount: amount,
      status: 'active'
    };

    await user.save();

    res.json({
      message: 'Successfully upgraded to premium',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium,
        level: user.level,
        points: user.points,
        completedLabs: user.completedLabs,
        premiumSubscription: user.premiumSubscription
      }
    });
  } catch (error) {
    console.error('Premium upgrade error:', error);
    res.status(500).json({ message: 'Server error during premium upgrade' });
  }
});

// @route   GET /api/payment/subscription-status
// @desc    Get user's subscription status
// @access  Private
router.get('/subscription-status', auth, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      isPremium: user.isPremium,
      subscription: user.premiumSubscription || null
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/payment/cancel-subscription
// @desc    Cancel premium subscription
// @access  Private
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.isPremium) {
      return res.status(400).json({
        message: 'User does not have an active premium subscription'
      });
    }

    // Downgrade user to free tier
    user.isPremium = false;

    if (user.premiumSubscription) {
      user.premiumSubscription.status = 'cancelled';
      user.premiumSubscription.cancelledAt = new Date();
    }

    await user.save();

    res.json({
      message: 'Premium subscription cancelled successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isPremium: user.isPremium
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error during subscription cancellation' });
  }
});

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe checkout session for Premium subscription
// @access  Private
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { planId, billingCycle } = req.body;
    const userId = req.user._id;

    // Validate inputs
    if (!planId || !billingCycle) {
      return res.status(400).json({ message: 'Plan ID and billing cycle are required' });
    }

    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({ message: 'Invalid billing cycle' });
    }

    // TEST MODE: If Stripe is not configured, simulate payment flow
    if (!stripe) {
      console.log('⚠️ Running in TEST MODE - Stripe not configured');

      // Simulate upgrade to premium immediately
      const user = await User.findById(userId);
      if (user) {
        user.isPremium = true;
        user.premiumSubscription = {
          status: 'active',
          plan: planId,
          billingCycle: billingCycle,
          testMode: true,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + (billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000)
        };
        await user.save();
        console.log(`✅ TEST MODE: User ${userId} upgraded to premium`);
      }

      // Return success URL directly
      return res.json({
        url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-success?test=true&session_id=test_${Date.now()}`,
        testMode: true
      });
    }

    // PRODUCTION MODE: Use Stripe
    const pricing = {
      premium: {
        monthly: { amount: 1000, name: 'Premium Monthly' }, // $10.00
        annual: { amount: 9000, name: 'Premium Annual' }     // $90.00
      }
    };

    const selectedPlan = pricing[planId];
    if (!selectedPlan) {
      return res.status(400).json({ message: 'Invalid plan ID' });
    }

    const priceData = selectedPlan[billingCycle];

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: priceData.name,
              description: `CyberVerse ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
            },
            unit_amount: priceData.amount,
            recurring: {
              interval: billingCycle === 'monthly' ? 'month' : 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/premium`,
      client_reference_id: userId.toString(),
      metadata: {
        userId: userId.toString(),
        planId: planId,
        billingCycle: billingCycle
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    res.status(500).json({ message: 'Failed to create checkout session', error: error.message });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler for subscription events
// @access  Public (verified by Stripe signature)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) {
    return res.status(500).send('Payment system not configured');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;

      // Update user to premium
      try {
        const userId = session.client_reference_id;
        const user = await User.findById(userId);

        if (user) {
          user.isPremium = true;
          user.premiumSubscription = {
            status: 'active',
            plan: session.metadata.planId,
            billingCycle: session.metadata.billingCycle,
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + (session.metadata.billingCycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000)
          };
          await user.save();

          console.log(`User ${userId} upgraded to premium`);
        }
      } catch (error) {
        console.error('Error updating user to premium:', error);
      }
      break;

    case 'customer.subscription.updated':
      // Handle subscription updates
      console.log('Subscription updated');
      break;

    case 'customer.subscription.deleted':
      // Handle subscription cancellation
      const subscription = event.data.object;
      try {
        const user = await User.findOne({ 'premiumSubscription.stripeSubscriptionId': subscription.id });
        if (user) {
          user.isPremium = false;
          user.premiumSubscription.status = 'cancelled';
          await user.save();
          console.log(`User subscription cancelled`);
        }
      } catch (error) {
        console.error('Error cancelling subscription:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;