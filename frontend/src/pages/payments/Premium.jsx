import { useState, useEffect } from "react";
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
import "./Premium.css";

const T = {
  cyan: "#00F2FF",
  purple: "#A855F7",
  green: "#88E636",
  danger: "#ef4444",
};

const PremiumPage = () => {
  const navigate = useNavigate();
  const { user } = useApp();
  const { userStats } = useRealtime();
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' or 'annual'
  const [isLoading, setIsLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const isPremium = userStats?.isPremium || user?.isPremium || false;

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
    <div className="pp-root pt-20">
      <div className="pp-glow" />

      <div className="container mx-auto px-6 max-w-6xl pb-32 relative z-20">
        {/* ── HERO SECTION ── */}
        <header className="pp-hero">
           <div className="pp-tag rcp-fade-in">
             <Crown size={12} />
             <span>Join the Elite</span>
           </div>
           <h1 className="cv-page-title !text-center !mb-4">
              Unlock the Full <br/>
              <span className="text-primary">Cyber-Training Experience</span>
           </h1>
           <p className="cv-page-subtitle !text-center !text-lg max-w-xl mx-auto mb-8">
             Get unlimited access to all labs, private networks, and official certification paths without any restrictions.
           </p>

          <div className="pp-btn-toggle rcp-fade-in" style={{ animationDelay: '0.3s' }}>
             <button 
                onClick={() => setBillingCycle("monthly")}
                className={`pp-toggle-opt ${billingCycle === 'monthly' ? 'pp-toggle-opt--active' : ''}`}
             >
                Monthly
             </button>
             <button 
                onClick={() => setBillingCycle("annual")}
                className={`pp-toggle-opt ${billingCycle === 'annual' ? 'pp-toggle-opt--active' : ''}`}
             >
                Annual {savings && <span className="ml-1 text-[9px] text-white bg-green-500 px-1.5 py-0.5 rounded font-black">{savings}</span>}
             </button>
          </div>
        </header>

        {/* ── PRICING CARDS ── */}
        <div className="pp-card-grid">
           {/* FREE PLAN */}
           <div className="pp-card rcp-fade-in">
              <div className="mb-6">
                 <h3 className="text-lg font-bold text-white uppercase">Free</h3>
                 <p className="text-xs text-slate-500 font-medium">Standard Access</p>
              </div>
              <div className="pp-price-wrap">
                 <div className="pp-price">$0</div>
                 <div className="pp-period">Basic Protocol</div>
              </div>
              <ul className="pp-feat-list">
                 <li className="pp-feat-item"><Check size={14} className="text-slate-600"/> 10 Labs per month</li>
                 <li className="pp-feat-item"><Check size={14} className="text-slate-600"/> 1 hr AttackBox Access</li>
                 <li className="pp-feat-item"><X size={14} className="text-danger/40"/> No Certifications</li>
              </ul>
              <button disabled className="rcp-secondary-btn !w-full !cursor-default opacity-50">
                 Current Tier
              </button>
           </div>

           {/* PREMIUM PLAN */}
           <div className="pp-card pp-card--premium rcp-fade-in">
              <div className="mb-6">
                  <h3 className="text-lg font-bold text-white">Premium</h3>
                  <p className="text-xs text-primary font-bold uppercase tracking-wider">Most Popular</p>
               </div>
              <div className="pp-price-wrap">
                 <div className="pp-price">
                    <span>$</span>
                    {currentPrice.display}
                 </div>
                 <div className="pp-period">Billed {billingCycle}ly</div>
              </div>
               <ul className="pp-feat-list">
                  <li className="pp-feat-item pp-feat-item--inc"><Check size={14} style={{ color: T.cyan }}/> Unlimited Lab Deployment</li>
                  <li className="pp-feat-item pp-feat-item--inc"><Check size={14} style={{ color: T.cyan }}/> Unlimited AttackBox Ops</li>
                  <li className="pp-feat-item pp-feat-item--inc"><Check size={14} style={{ color: T.cyan }}/> Private VPN Pipeline</li>
                  <li className="pp-feat-item pp-feat-item--inc"><Check size={14} style={{ color: T.cyan }}/> Official Certification Labs</li>
               </ul>
               <button 
                 onClick={() => handleSubscribe("premium")}
                 className="rcp-primary-btn !w-full"
                 style={isPremium ? { background: 'rgba(0, 242, 255, 0.1)', color: '#00F2FF', border: '1px solid rgba(0, 242, 255, 0.3)', boxShadow: 'none' } : {}}
               >
                  {isPremium ? 'View Plan Details' : 'Get Premium'}
               </button>
           </div>

           {/* BUSINESS PLAN */}
           <div className="pp-card rcp-fade-in">
              <div className="mb-6">
                 <h3 className="text-lg font-bold text-white uppercase">Business</h3>
                 <p className="text-xs text-slate-500 font-medium">Enterprise Units</p>
              </div>
              <div className="pp-price-wrap">
                 <div className="pp-price">Custom</div>
                 <div className="pp-period">Group Pricing</div>
              </div>
              <ul className="pp-feat-list">
                 <li className="pp-feat-item"><Check size={14} className="text-slate-600"/> Fleet Management</li>
                 <li className="pp-feat-item"><Check size={14} className="text-slate-600"/> Custom Training</li>
                 <li className="pp-feat-item"><Check size={14} className="text-slate-600"/> Dedicated Liaison</li>
              </ul>
              <button onClick={() => window.open("mailto:contact@cyberverse.com")} className="rcp-secondary-btn !w-full">
                 Contact Sales
              </button>
           </div>
        </div>

        {/* ── FEATURE COMPARISON ── */}
        <div className="mt-24 mb-16 rcp-fade-in" style={{ animationDelay: '0.7s' }}>
           <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">Operational Matrix</h2>
              <p className="cv-page-subtitle !text-[10px] uppercase tracking-widest">Compare features and capabilities</p>
           </div>

           <div className="pp-table-wrap">
              <table className="pp-table">
                 <thead>
                    <tr>
                       <th>capability name</th>
                       <th className="text-center">Base Operator</th>
                       <th className="text-center font-black italic" style={{ color: T.cyan }}>Elite Infiltrator</th>
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
                                   <span className="font-bold text-white uppercase tracking-tight text-sm">{f.name}</span>
                                </div>
                             </td>
                             <td className="text-center">
                                {typeof f.free === 'boolean' ? (
                                   f.free ? <Check size={18} className="text-slate-600 mx-auto"/> : <X size={18} className="text-danger/20 mx-auto"/>
                                ) : <span className="text-slate-500 font-bold text-xs">{f.free}</span>}
                             </td>
                             <td className="text-center">
                                {typeof f.premium === 'boolean' ? (
                                   f.premium ? <Check size={18} style={{ color: T.cyan }} className="mx-auto" /> : <X size={18} style={{ color: T.danger, opacity: 0.2 }} className="mx-auto"/>
                                ) : <span className="font-black italic text-xs" style={{ color: T.cyan }}>{f.premium}</span>}
                             </td>
                          </tr>
                       );
                    })}
                 </tbody>
              </table>
           </div>
        </div>

        {/* ── FAQ SECTION ── */}
        <div className="max-w-3xl mx-auto mb-24 rcp-fade-in" style={{ animationDelay: '0.8s' }}>
           <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-white mb-2">Frequently Asked Questions</h2>
              <p className="cv-page-subtitle !text-[10px] uppercase tracking-widest">Everything you need to know</p>
           </div>

           <div className="space-y-4">
              {faqs.map((faq, i) => (
                 <div key={i} className="pp-faq-item">
                     <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="pp-faq-trigger"
                     >
                        <span className="text-white font-bold text-sm tracking-tight">{faq.question}</span>
                        {openFaq === i ? <ChevronUp style={{ color: T.cyan }}/> : <ChevronDown style={{ color: 'rgba(255,255,255,0.2)' }}/>}
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
         <div className="pp-cta-box rcp-fade-in" style={{ animationDelay: '0.9s' }}>
            <Crown size={48} style={{ color: T.cyan }} className="mx-auto mb-6 animate-pulse" />
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Journey Today</h2>
            <p className="cv-page-subtitle !text-center !text-sm mb-10 max-w-lg mx-auto">
               Join the elite community and master your cybersecurity skills with our premium training tools and official certification paths.
            </p>
            <button 
              onClick={() => handleSubscribe("premium")}
              className="rcp-primary-btn !py-5 !px-12 mx-auto"
            >
               Upgrade to Premium <ArrowRight size={20} className="ml-2"/>
            </button>
         </div>
      </div>
    </div>
  );
};

export default PremiumPage;
