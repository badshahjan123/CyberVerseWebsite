import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, Zap, Crown, Check, X, ArrowRight, Star, Sparkles, ChevronDown, ChevronUp, Award, Target, Flame, Lock, Unlock, Clock, Download, Trophy, Users } from 'lucide-react'

const PremiumPage = () => {
  const navigate = useNavigate()
  const [billingCycle, setBillingCycle] = useState('monthly') // 'monthly' or 'annual'
  const [isLoading, setIsLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  // Pricing data
  const pricing = {
    monthly: { price: 10, display: '$10', period: '/month' },
    annual: { price: 90, display: '$90', period: '/year', monthlyEquiv: '$7.50/mo' }
  }

  const currentPrice = pricing[billingCycle]
  const savings = billingCycle === 'annual' ? '20% OFF' : null

  // Feature comparison data
  const features = [
    {
      name: 'Access to Rooms',
      free: 'Limited (10/month)',
      premium: 'Unlimited',
      icon: Target
    },
    {
      name: 'AttackBox Access',
      free: '1 hour/day',
      premium: 'Unlimited',
      icon: Lock
    },
    {
      name: 'Private VPN Access',
      free: false,
      premium: true,
      icon: Shield
    },
    {
      name: 'Certificate of Completion',
      free: false,
      premium: true,
      icon: Award
    },
    {
      name: 'Exclusive Content',
      free: false,
      premium: true,
      icon: Crown
    },
    {
      name: 'Priority Support',
      free: false,
      premium: true,
      icon: Zap
    },
    {
      name: 'Downloadable Resources',
      free: 'Limited',
      premium: 'Full Access',
      icon: Download
    },
    {
      name: 'Leaderboard Badges',
      free: 'Basic',
      premium: 'Premium + Exclusive',
      icon: Trophy
    }
  ]

  // FAQ data
  const faqs = [
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes! You can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes, we offer a 50% discount for students with a valid .edu email address. Contact our support team to get your discount code.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and PayPal through our secure Stripe payment gateway.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'While we don\'t offer a traditional free trial, our Free plan gives you access to limited features so you can experience the platform before upgrading.'
    },
    {
      question: 'What happens to my progress if I cancel?',
      answer: 'Your progress and achievements are saved permanently. If you resubscribe later, you\'ll pick up right where you left off.'
    }
  ]

  // Navigate to checkout page
  const handleSubscribe = (planId) => {
    navigate('/checkout', {
      state: {
        plan: {
          name: 'Premium',
          price: billingCycle === 'monthly' ? '$10' : '$90',
          period: billingCycle === 'monthly' ? 'month' : 'year'
        },
        planId,
        billingCycle
      }
    })
  }

  return (
    <div className="min-h-screen page-container bg-[rgb(8,12,16)] text-text py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect border border-primary/30 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary">Unlock Your Full Potential</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-8">
            Level up your cybersecurity skills with unlimited access to premium content, exclusive resources, and advanced features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${billingCycle === 'monthly'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
            >
              Monthly
            </button>

            <button
              onClick={() => setBillingCycle('annual')}
              className={`relative px-6 py-3 rounded-lg font-semibold transition-all ${billingCycle === 'annual'
                ? 'bg-primary text-white'
                : 'bg-white/5 text-muted hover:bg-white/10'
                }`}
            >
              Annually
              {savings && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-warning text-black text-xs font-bold rounded-full">
                  {savings}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Free Plan */}
          <div className="glass-effect rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-muted" />
              <h3 className="text-2xl font-bold text-text">Free</h3>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-text mb-2">$0</div>
              <p className="text-muted text-sm">Forever free</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted">10 Rooms per month</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted">1 hour AttackBox/day</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-muted">Community support</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <X className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                <span className="text-muted">No certificates</span>
              </li>
            </ul>
            <Link to="/rooms" className="btn-ghost w-full inline-flex items-center justify-center gap-2">
              Current Plan
            </Link>
          </div>

          {/* Premium Plan (Featured) */}
          <div className="relative glass-effect rounded-2xl p-8 border-2 border-primary shadow-[0_0_30px_rgba(155,255,0,0.2)] transform scale-105">
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary to-accent rounded-full">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-black" />
                <span className="text-sm font-bold text-black">MOST POPULAR</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 mt-4">
              <Crown className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold gradient-text">Premium</h3>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-text mb-2">
                {currentPrice.display}
                {billingCycle === 'annual' && (
                  <span className="text-lg text-muted ml-2">{currentPrice.monthlyEquiv}</span>
                )}
              </div>
              <p className="text-muted text-sm">{currentPrice.period}</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-text font-semibold">Unlimited room access</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-text font-semibold">Unlimited AttackBox</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-text font-semibold">Private VPN access</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-text font-semibold">Completion certificates</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-text font-semibold">Exclusive content</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-text font-semibold">Priority support</span>
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe('premium')}
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  Subscribe Now
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Business Plan */}
          <div className="glass-effect rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-6 h-6 text-accent" />
              <h3 className="text-2xl font-bold text-text">Business</h3>
            </div>
            <div className="mb-6">
              <div className="text-4xl font-bold text-text mb-2">Custom</div>
              <p className="text-muted text-sm">For teams & organizations</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted">Everything in Premium</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted">Team management</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted">Custom branding</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-muted">Dedicated support</span>
              </li>
            </ul>
            <a href="mailto:contact@cyberverse.com" className="btn-ghost w-full inline-flex items-center justify-center gap-2">
              Contact Sales
            </a>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">
            Compare <span className="gradient-text">Plans</span>
          </h2>

          <div className="glass-effect rounded-2xl overflow-hidden border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-6 text-text font-semibold">Feature</th>
                  <th className="text-center p-6 text-muted font-semibold">Free</th>
                  <th className="text-center p-6 text-primary font-semibold">Premium</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5 text-primary" />
                          <span className="text-text font-medium">{feature.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-green-400 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-danger mx-auto" />
                          )
                        ) : (
                          <span className="text-muted text-sm">{feature.free}</span>
                        )}
                      </td>
                      <td className="p-6 text-center">
                        {typeof feature.premium === 'boolean' ? (
                          feature.premium ? (
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-danger mx-auto" />
                          )
                        ) : (
                          <span className="text-primary text-sm font-semibold">{feature.premium}</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="glass-effect rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                >
                  <span className="text-text font-semibold pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted flex-shrink-0" />
                  )}
                </button>

                {openFaq === index && (
                  <div className="px-6 pb-6 text-muted">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center glass-effect rounded-2xl p-12 border border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
          <Crown className="w-16 h-16 text-primary mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-muted text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of cybersecurity professionals mastering their skills on CyberVerse
          </p>
          <button
            onClick={() => handleSubscribe('premium')}
            disabled={isLoading}
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                Get Premium Now
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PremiumPage