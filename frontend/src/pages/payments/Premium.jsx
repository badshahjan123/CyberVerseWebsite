import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../../contexts/app-context";
import { useRealtime } from "../../contexts/realtime-context";
import {
  Shield,
  Zap,
  Crown,
  Check,
  X,
  ArrowRight,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
  Target,
  Flame,
  Lock,
  Unlock,
  Clock,
  Download,
  Trophy,
  Users,
} from "lucide-react";

const PremiumPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { userStats } = useRealtime();
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' or 'annual'
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const isPremium = userStats?.isPremium || user?.isPremium || false;

  // Pricing data
  const pricing = {
    monthly: { price: 10, display: "10", period: "/mo" },
    annual: {
      price: 90,
      display: "90",
      period: "/yr",
      monthlyEquiv: "7.50/mo",
    },
  };

  const currentPrice = pricing[billingCycle];
  const savings = billingCycle === "annual" ? "Save 25%" : null;

  // Feature comparison data
  const features = [
    { name: "Access to Rooms", free: "10/month", premium: "Unlimited", icon: Target },
    { name: "AttackBox Access", free: "1 hr/day", premium: "Unlimited", icon: Zap },
    { name: "Private VPN Access", free: false, premium: true, icon: Shield },
    { name: "Certification Labs", free: false, premium: true, icon: Award },
    { name: "Exclusive Content", free: false, premium: true, icon: Crown },
    { name: "Priority Support", free: false, premium: true, icon: Sparkles },
    { name: "Resource Downloads", free: "Limited", premium: "Full Access", icon: Download },
  ];

  const faqs = [
    { question: "Can I cancel anytime?", answer: "Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period." },
    { question: "Student discounts available?", answer: "Yes, we offer specialized rates for verified students. Reach out to our operational support team for details." },
    { question: "Accepted payment methods?", answer: "We process all major secure payment protocols including all global credit cards and digital wallets." },
    { question: "Data persistence on cancellation?", answer: "All your achievements, XP, and rank certificates remain permanently etched in the CyberVerse grid." },
  ];

  const handleSubscribe = (planId) => {
    navigate("/checkout", {
      state: {
        plan: {
          name: "Premium",
          price: billingCycle === "monthly" ? "$10" : "$90",
          period: billingCycle === "monthly" ? "month" : "year",
        },
        planId,
        billingCycle,
      },
    });
  };

  return (
    <div className="pp-root">
      <div className="pp-grid" />
      <div className="pp-glow" />

      <div className="container mx-auto px-4 max-w-7xl pb-32">
        {/* ── HERO SECTION ── */}
        <header className="pp-hero">
          <div className="pp-tag">
            <Sparkles size={14} className="animate-pulse" />
            <span>Operational Upgrade Available</span>
          </div>
          <h1 className="pp-title">
             Level Up Your <br/>
             <span className="gradient-text italic font-black">Cyber Arsenal</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-12">
            Unlock the full potential of CyberVerse. Gain unlimited access to premium labs, 
            exclusive certifications, and advanced tactical resources.
          </p>

          <div className="pp-btn-toggle">
             <button 
                onClick={() => setBillingCycle("monthly")}
                className={`pp-toggle-opt ${billingCycle === 'monthly' ? 'pp-toggle-opt--active' : ''}`}
             >
                Monthly Ops
             </button>
             <button 
                onClick={() => setBillingCycle("annual")}
                className={`pp-toggle-opt ${billingCycle === 'annual' ? 'pp-toggle-opt--active' : ''}`}
             >
                Annual Ops {savings && <span className="ml-2 text-[8px] bg-black/10 px-1.5 py-0.5 rounded text-black/60 font-black">{savings}</span>}
             </button>
          </div>
        </header>

        {/* ── PRICING CARDS ── */}
        <div className="pp-card-grid">
           {/* FREE PLAN */}
           <div className="pp-card rcp-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-8">
                 <Shield className="text-slate-600 mb-4" size={32} />
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">Base Operator</h3>
                 <p className="text-xs font-bold text-slate-500 uppercase mt-1">Standard Entry Protocol</p>
              </div>
              <div className="pp-price-wrap">
                 <div className="pp-price">$0</div>
                 <div className="pp-period">Forever Free</div>
              </div>
              <ul className="pp-feat-list">
                 <li className="pp-feat-item"><Check size={16} className="text-slate-600"/> 10 Labs per month</li>
                 <li className="pp-feat-item"><Check size={16} className="text-slate-600"/> 1 hr AttackBox Access</li>
                 <li className="pp-feat-item"><Check size={16} className="text-slate-600"/> Community Intel Access</li>
                 <li className="pp-feat-item"><X size={16} className="text-danger/40"/> No Certifications</li>
              </ul>
              <button disabled className="rcp-secondary-btn !w-full !justify-center !bg-white/5 !border-white/10 !text-slate-500">
                 Current Tier
              </button>
           </div>

           {/* PREMIUM PLAN */}
           <div className="pp-card pp-card--premium rcp-fade-in">
              <div className="absolute top-6 right-8">
                 <div className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest">Highly Advised</div>
              </div>
              <div className="mb-8">
                 <Crown className="text-primary mb-4" size={32} />
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">Elite Infiltrator</h3>
                 <p className="text-xs font-bold text-primary uppercase mt-1">Advanced Tactical Plan</p>
              </div>
              <div className="pp-price-wrap">
                 <div className="pp-price">
                    <span className="text-primary">$</span>
                    {currentPrice.display}
                 </div>
                 <div className="pp-period">Billed {billingCycle}ly</div>
              </div>
              <ul className="pp-feat-list">
                 <li className="pp-feat-item pp-feat-item--inc"><Check size={16} className="text-primary"/> Unlimited Lab Deployment</li>
                 <li className="pp-feat-item pp-feat-item--inc"><Check size={16} className="text-primary"/> Unlimited AttackBox Ops</li>
                 <li className="pp-feat-item pp-feat-item--inc"><Check size={16} className="text-primary"/> Private VPN Pipeline</li>
                 <li className="pp-feat-item pp-feat-item--inc"><Check size={16} className="text-primary"/> Official Certification Labs</li>
                 <li className="pp-feat-item pp-feat-item--inc"><Check size={16} className="text-primary"/> Priority Command Support</li>
              </ul>
              <button 
                onClick={() => handleSubscribe("premium")}
                disabled={isPremium}
                className={`rcp-primary-btn !w-full !justify-center ${isPremium ? "!bg-slate-800 !text-slate-500 !border-slate-700" : ""}`}
              >
                 {isPremium ? 'Active Operation' : 'Initialize Upgrade'}
              </button>
           </div>

           {/* BUSINESS PLAN */}
           <div className="pp-card rcp-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="mb-8">
                 <Users className="text-purple-500 mb-4" size={32} />
                 <h3 className="text-xl font-black text-white uppercase tracking-widest">Tactical Cell</h3>
                 <p className="text-xs font-bold text-slate-500 uppercase mt-1">Enterprise Fleet Ops</p>
              </div>
              <div className="pp-price-wrap">
                 <div className="pp-price">Custom</div>
                 <div className="pp-period">For Organization Grid</div>
              </div>
              <ul className="pp-feat-list">
                 <li className="pp-feat-item"><Check size={16} className="text-purple-500"/> Individual Fleet Management</li>
                 <li className="pp-feat-item"><Check size={16} className="text-purple-500"/> Custom Training Protocols</li>
                 <li className="pp-feat-item"><Check size={16} className="text-purple-500"/> Advanced Fleet Analytics</li>
                 <li className="pp-feat-item"><Check size={16} className="text-purple-500"/> Dedicated Grid Liaison</li>
              </ul>
              <button onClick={() => window.open("mailto:contact@cyberverse.com")} className="rcp-secondary-btn !w-full !justify-center">
                 Contact Command
              </button>
           </div>
        </div>

        {/* ── FEATURE COMPARISON ── */}
        <div className="mt-40 mb-32">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white uppercase italic mb-4 tracking-tighter">Feature Comparison Matrix</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Operational Capability Breakdown</p>
           </div>

           <div className="pp-table-wrap">
              <table className="pp-table">
                 <thead>
                    <tr>
                       <th>capability name</th>
                       <th className="text-center">Base Operator</th>
                       <th className="text-center text-primary">Elite Infiltrator</th>
                    </tr>
                 </thead>
                 <tbody>
                    {features.map((f, i) => {
                       const Icon = f.icon;
                       return (
                          <tr key={i}>
                             <td>
                                <div className="flex items-center gap-3">
                                   <Icon size={18} className="text-slate-500" />
                                   <span className="font-bold text-white">{f.name}</span>
                                </div>
                             </td>
                             <td className="text-center">
                                {typeof f.free === 'boolean' ? (
                                   f.free ? <Check size={18} className="text-slate-600 mx-auto"/> : <X size={18} className="text-danger/20 mx-auto"/>
                                ) : <span className="text-slate-500 font-bold">{f.free}</span>}
                             </td>
                             <td className="text-center">
                                {typeof f.premium === 'boolean' ? (
                                   f.premium ? <Check size={18} className="text-primary mx-auto drop-shadow-[0_0_8px_rgba(0,245,255,0.4)]"/> : <X size={18} className="text-danger mx-auto"/>
                                ) : <span className="text-primary font-black drop-shadow-[0_0_8px_rgba(0,245,255,0.3)]">{f.premium}</span>}
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="max-w-3xl mx-auto mb-40">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white uppercase italic mb-4 tracking-tighter">Mission Intelligence</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">Frequently Asked Questions</p>
           </div>

           <div className="space-y-4">
              {faqs.map((faq, i) => (
                 <div key={i} className="pp-faq-item">
                    <button 
                       onClick={() => setOpenFaq(openFaq === i ? null : i)}
                       className="pp-faq-trigger"
                    >
                       <span className="text-white font-bold">{faq.question}</span>
                       {openFaq === i ? <ChevronUp className="text-primary"/> : <ChevronDown className="text-slate-600"/>}
                    </button>
                    {openFaq === i && (
                       <div className="pp-faq-content rcp-fade-in">
                          {faq.answer}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </div>

        {/* ── FINAL CTA ── */}
        <div className="pp-cta-box">
           <Crown className="w-16 h-16 text-primary mx-auto mb-8 drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]" />
           <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">Ready to transcend?</h2>
           <p className="text-slate-500 text-lg font-medium mb-12 max-w-xl mx-auto">
              Join the elite tier of operators mastering the CyberVerse grid. 
              The most advanced training environment awaits your command.
           </p>
           <button 
             onClick={() => handleSubscribe("premium")}
             className="rcp-primary-btn !py-5 !px-12 !text-lg mx-auto"
           >
              Initialize Upgrade Sequence <ArrowRight size={20} className="ml-2"/>
           </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumPage;
