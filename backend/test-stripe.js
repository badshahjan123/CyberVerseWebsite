require('dotenv').config({ path: './.env' });
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Premium Monthly',
            },
            unit_amount: 1000,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'http://localhost:5173/payment-success',
      cancel_url: 'http://localhost:5173/premium',
    });
    console.log('Success:', session.url);
  } catch (error) {
    console.error('Error:', error);
  }
}
test();
