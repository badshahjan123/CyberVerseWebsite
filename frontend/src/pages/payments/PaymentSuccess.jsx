import { memo, useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ModernButton } from "../../components/ui-components";
import { apiCall } from "../../config/api";
import { useApp } from "../../contexts/app-context";
import {
  CheckCircle,
  Mail,
  ArrowRight,
  Award,
  Sparkles,
  Loader2,
} from "lucide-react";

const PaymentSuccessPage = memo(() => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { updateUserProfile, user } = useApp();
  
  const [verifying, setVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      navigate("/premium");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await apiCall('/payments/verify-session', {
          method: 'POST',
          body: JSON.stringify({ sessionId })
        });
        
        if (res.success) {
           const userRes = await apiCall('/auth/me');
           if (userRes.user) {
             updateUserProfile(userRes.user);
           }
           setPaymentData({
              planName: res.plan === 'annual' ? 'Premium Annual' : 'Premium Monthly',
              amount: res.amount ? `$${res.amount}` : '$10.00',
              period: res.plan === 'annual' ? 'year' : 'month',
              transactionId: sessionId.substring(0, 15) + '...',
              paymentMethod: 'Stripe Secure Checkout',
              date: new Date().toLocaleDateString()
           });
        } else {
           navigate("/premium");
        }
      } catch (error) {
        console.error("Verification failed", error);
        navigate("/premium");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col">
        <Loader2 className="animate-spin text-primary-500 h-12 w-12 mb-4" />
        <h2 className="text-white text-xl font-bold">Verifying your secure payment...</h2>
        <p className="text-slate-400 text-sm mt-2">Please do not close this window.</p>
      </div>
    );
  }

  if (!paymentData) return null;

  return (
    <div className="bg-slate-950 min-h-screen py-12">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 border-4 border-green-500 mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-slate-300">
            Welcome to CyberVerse Premium
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-700">
            <div>
              <h2 className="text-2xl font-bold text-slate-100">
                {paymentData.planName}
              </h2>
              <p className="text-slate-400">Subscription activated</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-400">
                {paymentData.amount}
              </div>
              <p className="text-slate-400">per {paymentData.period}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                Transaction ID
              </h3>
              <p className="text-slate-100 font-mono">
                {paymentData.transactionId}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                Payment Method
              </h3>
              <p className="text-slate-100">
                {paymentData.paymentMethod}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                Date
              </h3>
              <p className="text-slate-100">{paymentData.date}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">
                Status
              </h3>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* What's Next Section */}
        <div className="bg-gradient-to-r from-primary-500/10 to-teal-500/10 border border-primary-500/20 rounded-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-primary-400" />
            <h2 className="text-2xl font-bold text-slate-100">What's Next?</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <span className="text-primary-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1">
                  Check Your Email
                </h3>
                <p className="text-slate-400 text-sm">
                  We've sent a confirmation email with your receipt and
                  subscription details
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <span className="text-primary-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1">
                  Explore Premium Labs
                </h3>
                <p className="text-slate-400 text-sm">
                  Access exclusive cybersecurity challenges and advanced
                  scenarios
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <span className="text-primary-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1">
                  Track Your Progress
                </h3>
                <p className="text-slate-400 text-sm">
                  Use advanced analytics to monitor your learning journey
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <span className="text-primary-400 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1">
                  Earn Certificates
                </h3>
                <p className="text-slate-400 text-sm">
                  Complete labs and earn professional certificates to showcase
                  your skills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">

          <Link to="/certificates" className="w-full">
            <ModernButton variant="glass" size="lg" className="w-full">
              <Award className="mr-2 h-5 w-5" />
              View Certificates
            </ModernButton>
          </Link>

          <Link to="/dashboard" className="w-full">
            <ModernButton variant="primary" size="lg" className="w-full">
              <span>Go to Dashboard</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </ModernButton>
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <div className="flex items-start gap-3 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg">
          <Mail className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-300">
              A confirmation email has been sent to your registered email
              address. If you don't see it, please check your spam folder.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

PaymentSuccessPage.displayName = "PaymentSuccessPage";
export default PaymentSuccessPage;
