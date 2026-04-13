import { useState, memo } from "react"
import "./Checkout.css"
import { useNavigate, useLocation } from "react-router-dom"
import { ModernButton, Badge } from "../../components/ui-components"
import { useApp } from "../../contexts/app-context"
import { apiCall } from "../../config/api"
import {
  CreditCard,
  Shield,
  Lock,
  Check,
  ArrowLeft,
  Wallet,
  Bitcoin,
  DollarSign,
  AlertCircle,
  Smartphone,
  Building2,
  Banknote,
  Flame
} from "lucide-react"

const CheckoutPage = memo(() => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, updateUserProfile } = useApp()
  const selectedPlan = location.state?.plan || {
    name: "Elite Infiltrator",
    price: "$10",
    period: "month"
  }

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    email: user?.email || "",
    country: "PK",
    phoneNumber: "",
    accountNumber: "",
    selectedBank: ""
  })

  const paymentMethods = [
    { id: "card", name: "Credit/Debit", icon: CreditCard },
    { id: "jazzcash", name: "JazzCash", icon: Smartphone },
    { id: "easypaisa", name: "EasyPaisa", icon: Smartphone },
    { id: "sadapay", name: "SadaPay", icon: Wallet },
    { id: "nayapay", name: "NayaPay", icon: Wallet },
    { id: "bank", name: "Online Bank", icon: Building2 }
  ]

  const pakistaniBanks = [
    { id: "hbl", name: "HBL" },
    { id: "ubl", name: "UBL" },
    { id: "meezan", name: "Meezan Bank" },
    { id: "alfalah", name: "Bank Alfalah" },
    { id: "mcb", name: "MCB" }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    setError("")

    try {
      const transactionId = `CV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const paymentMethodName = paymentMethods.find(m => m.id === selectedPaymentMethod)?.name

      const response = await apiCall('/payments/upgrade-to-premium', {
        method: 'POST',
        body: JSON.stringify({
          transactionId,
          paymentMethod: paymentMethodName,
          plan: selectedPlan.name,
          amount: parseFloat(selectedPlan.price.replace('$', ''))
        })
      })

      if (response.user) {
        updateUserProfile(response.user)
      }

      navigate('/payment-success', {
        state: {
          plan: selectedPlan,
          paymentMethod: { name: paymentMethodName },
          transactionId,
          date: new Date().toLocaleDateString()
        }
      })
    } catch (err) {
      setError(err.message || 'Payment Authorization Failed')
      setProcessing(false)
    }
  }

  /* if (user?.isPremium) {
    navigate('/dashboard')
    return null
  } */

  return (
    <div className="ch-root">
      <div className="ch-grid-bg" />
      <div className="ch-glow" />

      <div className="ch-container">
        {/* HEADER */}
        <header className="cv-page-header rcp-fade-in">
          <button 
            onClick={() => navigate('/premium')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 font-bold text-xs"
          >
            <ArrowLeft size={16} />
            Back to Plans
          </button>
          <p className="cv-page-subtitle">Premium Subscription</p>
          <h1 className="cv-page-title">Complete Upgrade</h1>
        </header>

        <div className="ch-main-grid rcp-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* LEFT: PAYMENT CONTROL */}
          <div className="ch-left-col">
            <div className="ch-card">
              <h2 className="cv-section-title">
                <Shield className="text-primary" size={20} />
                Payment Method
                <span className="ml-auto text-[10px] text-slate-500">STEP 1/2</span>
              </h2>

              <div className="ch-method-grid">
                {paymentMethods.map((m) => {
                  const Icon = m.icon
                  const isActive = selectedPaymentMethod === m.id
                  return (
                    <div 
                      key={m.id}
                      onClick={() => setSelectedPaymentMethod(m.id)}
                      className={`ch-method-opt ${isActive ? 'ch-method-opt--active' : ''}`}
                    >
                      <div className="ch-method-icon">
                        <Icon size={20} />
                      </div>
                      <span className="ch-method-name">{m.name}</span>
                    </div>
                  )
                })}
              </div>

              <h2 className="cv-section-title mt-8">
                <Lock className="text-slate-500" size={20} />
                Security Details
                <span className="ml-auto text-[10px] text-slate-500">STEP 2/2</span>
              </h2>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-8 flex items-center gap-3">
                    <AlertCircle size={18} className="text-danger" />
                    <p className="text-danger text-xs font-bold uppercase">{error}</p>
                  </div>
                )}

                {/* CARD FIELDS */}
                {selectedPaymentMethod === 'card' && (
                  <div className="animate-fade-in">
                    <div className="ch-input-wrap">
                      <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">Card Number</label>
                      <input 
                        className="ch-input"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="XXXX XXXX XXXX XXXX"
                        required
                      />
                    </div>
                    <div className="ch-form-row">
                      <div className="ch-input-wrap">
                        <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">Expiry Date</label>
                        <input 
                          className="ch-input"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div className="ch-input-wrap">
                        <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">CVV</label>
                        <input 
                          className="ch-input"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="XXX"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* MOBILE WALLETS */}
                {(['jazzcash', 'easypaisa', 'sadapay', 'nayapay'].includes(selectedPaymentMethod)) && (
                   <div className="animate-fade-in">
                     <div className="ch-input-wrap">
                        <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">Mobile Number</label>
                        <input 
                          type="tel"
                          className="ch-input"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="03XX-XXXXXXX"
                          required
                        />
                        <p className="text-[9px] font-bold text-slate-500 uppercase mt-4">
                          Note: A secure verification request will be sent to your mobile device.
                        </p>
                     </div>
                   </div>
                )}

                {/* BANK TRANSFER */}
                {selectedPaymentMethod === 'bank' && (
                  <div className="animate-fade-in">
                    <div className="ch-input-wrap">
                      <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">Select Bank</label>
                      <select 
                        className="ch-input"
                        name="selectedBank"
                        value={formData.selectedBank}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Financial Node</option>
                        {pakistaniBanks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="ch-input-wrap">
                      <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">Account Number / IBAN</label>
                      <input 
                        className="ch-input"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        placeholder="PKXX XXXX XXXX XXXX"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="ch-input-wrap mt-8">
                  <label className="cv-page-subtitle !text-xs !font-bold mb-1.5 block">Email Address</label>
                  <input 
                    type="email"
                    className="ch-input"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="operator@nexus.com"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={processing}
                  className="rcp-primary-btn !w-full !justify-center !py-4 mt-8 !text-base"
                >
                  {processing ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-black/20 border-t-black" />
                      UPGRADING...
                    </div>
                  ) : (
                    <>CONFIRM TRANSACTION • {selectedPlan.price}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="ch-right-col">
            <div className="ch-summary-card">
              <div className="ch-plan-preview">
                <div className="text-[10px] font-bold text-slate-500 mb-1">SELECTED UPGRADE</div>
                <h3 className="text-xl font-bold text-white mb-1">{selectedPlan.name}</h3>
                <div className="flex items-center gap-2 text-primary font-black">
                  <Flame size={16} />
                  <span className="text-xs font-bold">+500 XP INSTANT BONUS</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="ch-summary-line">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Standard Access</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="ch-summary-line">
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Premium License</span>
                  <span className="text-white">{selectedPlan.price}</span>
                </div>
                <div className="ch-summary-line">
                  <span>Network Tax</span>
                  <span className="text-white">$0.00</span>
                </div>
                
                <div className="flex justify-between items-center py-4 border-t border-white/10 mt-4">
                  <span className="text-white font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary">{selectedPlan.price}</span>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unlocked Assets</p>
                {[
                  "Unlimited Lab Deployments",
                  "Elite AttackBox Hardware",
                  "Private VPN Grid Access",
                  "Certificate Generation"
                ].map((txt, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400">
                    <Check size={14} className="text-primary" />
                    {txt}
                  </div>
                ))}
              </div>

              <div className="ch-trust-badge">
                <Lock className="text-slate-600" size={24} />
                <div className="ch-trust-text">
                  SECURE VAULT ENCRYPTION <br/>
                  <span className="text-[8px] opacity-60">AES-256 BIT PROTECTED CHANNEL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

CheckoutPage.displayName = 'CheckoutPage'
export default CheckoutPage