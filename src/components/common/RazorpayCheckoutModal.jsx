import { useState, useEffect } from "react"
import {
  ShieldCheck,
  Check,
  X,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Clock,
  QrCode,
  Loader2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// Popular Indian Banks for Netbanking
const POPULAR_BANKS = [
  { id: "HDFC", name: "HDFC Bank", logo: "🏛" },
  { id: "SBI", name: "State Bank of India", logo: "🏦" },
  { id: "ICICI", name: "ICICI Bank", logo: "🏛" },
  { id: "AXIS", name: "Axis Bank", logo: "🏦" },
  { id: "KOTAK", name: "Kotak Mahindra Bank", logo: "🏛" },
  { id: "PNB", name: "Punjab National Bank", logo: "🏦" },
]

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  orderData,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState("upi") // "upi" | "card" | "netbanking" | "wallet" | "paylater"
  const [upiSubTab, setUpiSubTab] = useState("qr") // "qr" | "id"
  const [upiId, setUpiId] = useState("suraj@oksbi")
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8821")
  const [cardExpiry, setCardExpiry] = useState("08/29")
  const [cardCvv, setCardCvv] = useState("782")
  const [cardHolder, setCardHolder] = useState("Suraj Kumar")
  const [selectedBank, setSelectedBank] = useState("HDFC")
  const [selectedWallet, setSelectedWallet] = useState("paytm")

  const [paymentStatus, setPaymentStatus] = useState("idle") // "idle" | "processing" | "success" | "failed"
  const [orderId, setOrderId] = useState("")

  useEffect(() => {
    if (isOpen) {
      setPaymentStatus("idle")
      setOrderId("order_" + Math.random().toString(36).substring(2, 12).toUpperCase())
    }
  }, [isOpen])

  if (!orderData) return null

  const amount = orderData.amount || 799

  const handleSimulatePayment = () => {
    setPaymentStatus("processing")

    setTimeout(() => {
      const paymentResponse = {
        razorpay_payment_id: "pay_" + Math.random().toString(36).substring(2, 11).toUpperCase(),
        razorpay_order_id: orderId,
        razorpay_signature: "sig_" + Math.random().toString(36).substring(2, 16),
      }

      setPaymentStatus("success")

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(paymentResponse)
        }
        onClose()
      }, 1400)
    }, 1800)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && paymentStatus !== "processing" && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[700px] w-[95vw] p-0 overflow-hidden border border-white/10 bg-[#0c1322] text-white rounded-2xl sm:rounded-3xl shadow-2xl font-sans"
      >
        {/* Razorpay Top Banner */}
        <div className="bg-[#080d1a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#0c2340] to-[#1a56db] flex items-center justify-center font-bold text-white tracking-wider text-xs border border-blue-400/30">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Razorpay Standard Checkout</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                  VERIFIED
                </span>
              </div>
              <div className="text-[11px] text-white/50 font-mono">
                AstroTring Vedic Technologies · {orderId}
              </div>
            </div>
          </div>

          <div className="text-right flex items-center gap-3">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/50">Amount to Pay</div>
              <div className="text-xl font-mono font-bold text-emerald-400">₹{amount.toLocaleString("en-IN")}</div>
            </div>
            {paymentStatus !== "processing" && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Payment Screen: Processing State */}
        {paymentStatus === "processing" && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[360px]">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white">Processing payment securely...</h3>
              <p className="text-xs text-white/50 font-mono">
                Communicating with Razorpay gateway & bank 256-bit SSL
              </p>
            </div>
            <div className="text-[11px] text-amber-400/80 bg-amber-950/30 border border-amber-500/20 px-3 py-1.5 rounded-lg">
              Please do not refresh the page or press back
            </div>
          </div>
        )}

        {/* Payment Screen: Success State */}
        {paymentStatus === "success" && (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[360px]">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-medium text-white">Payment Authorized!</h3>
              <p className="text-xs text-white/60 font-mono">
                ₹{amount.toLocaleString("en-IN")} paid · Reference ID generated
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Credits credited to your birth chart account</span>
            </div>
          </div>
        )}

        {/* Payment Screen: Selection State */}
        {paymentStatus === "idle" && (
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
            {/* Left Column: Payment Method Tabs */}
            <div className="md:col-span-4 bg-[#0a0f1d] border-r border-white/5 p-3 space-y-1.5">
              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "upi"
                    ? "bg-blue-600/20 text-white border border-blue-500/40 font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">UPI / QR</div>
                  <div className="text-[10px] text-white/40">GPay, PhonePe, Paytm</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "card"
                    ? "bg-blue-600/20 text-white border border-blue-500/40 font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Cards</div>
                  <div className="text-[10px] text-white/40">Credit / Debit Card</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("netbanking")}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "netbanking"
                    ? "bg-blue-600/20 text-white border border-blue-500/40 font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Netbanking</div>
                  <div className="text-[10px] text-white/40">All Indian Banks</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wallet")}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "wallet"
                    ? "bg-blue-600/20 text-white border border-blue-500/40 font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Wallets</div>
                  <div className="text-[10px] text-white/40">Paytm, PhonePe</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("paylater")}
                className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition cursor-pointer ${
                  activeTab === "paylater"
                    ? "bg-blue-600/20 text-white border border-blue-500/40 font-medium"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold">Pay Later</div>
                  <div className="text-[10px] text-white/40">Simpl, LazyPay</div>
                </div>
              </button>
            </div>

            {/* Right Column: Tab Content */}
            <div className="md:col-span-8 p-6 flex flex-col justify-between">
              {/* UPI Tab */}
              {activeTab === "upi" && (
                <div className="space-y-5">
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 text-xs">
                    <button
                      type="button"
                      onClick={() => setUpiSubTab("qr")}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        upiSubTab === "qr" ? "bg-blue-600 text-white font-medium" : "text-white/60 hover:text-white"
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUpiSubTab("id")}
                      className={`flex-1 py-1.5 rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        upiSubTab === "id" ? "bg-blue-600 text-white font-medium" : "text-white/60 hover:text-white"
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Enter UPI ID</span>
                    </button>
                  </div>

                  {upiSubTab === "qr" ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-[#0a0f1d] border border-white/10 rounded-2xl space-y-3">
                      {/* Stylized QR representation */}
                      <div className="p-3 bg-white rounded-xl shadow-lg">
                        <div className="w-36 h-36 bg-black p-2 flex flex-col justify-between items-center relative">
                          <div className="w-full flex justify-between">
                            <div className="w-8 h-8 border-4 border-white bg-black flex items-center justify-center">
                              <div className="w-3 h-3 bg-white" />
                            </div>
                            <div className="w-8 h-8 border-4 border-white bg-black flex items-center justify-center">
                              <div className="w-3 h-3 bg-white" />
                            </div>
                          </div>
                          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                            ₹
                          </div>
                          <div className="w-full flex justify-between">
                            <div className="w-8 h-8 border-4 border-white bg-black flex items-center justify-center">
                              <div className="w-3 h-3 bg-white" />
                            </div>
                            <div className="w-5 h-5 bg-white/80" />
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-0.5">
                        <div className="text-xs text-white font-medium">Scan and pay with any UPI App</div>
                        <div className="text-[10px] text-white/50 font-mono">
                          Google Pay · PhonePe · Paytm · BHIM
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1.5">
                          Virtual Payment Address (VPA)
                        </label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@okhdfcbank"
                          className="w-full rounded-xl border border-white/10 bg-[#0a0f1d] px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {["@okhdfcbank", "@okaxis", "@paytm", "@ybl"].map((suffix) => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => setUpiId(upiId.split("@")[0] + suffix)}
                            className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/60 hover:text-white cursor-pointer"
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cards Tab */}
              {activeTab === "card" && (
                <div className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="•••• •••• •••• ••••"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0f1d] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1">
                        Expires (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1d] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full rounded-xl border border-white/10 bg-[#0a0f1d] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-white/60 block mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full rounded-xl border border-white/10 bg-[#0a0f1d] px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                    />
                  </div>
                </div>
              )}

              {/* Netbanking Tab */}
              {activeTab === "netbanking" && (
                <div className="space-y-4">
                  <div className="text-xs text-white/60">Select Popular Indian Bank</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {POPULAR_BANKS.map((bank) => (
                      <div
                        key={bank.id}
                        onClick={() => setSelectedBank(bank.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${
                          selectedBank === bank.id
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-[#0a0f1d] border-white/10 text-white/70 hover:border-white/20"
                        }`}
                      >
                        <span className="text-base">{bank.logo}</span>
                        <span className="text-xs font-medium truncate">{bank.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wallets & Paylater */}
              {(activeTab === "wallet" || activeTab === "paylater") && (
                <div className="space-y-3">
                  <div className="text-xs text-white/60">
                    {activeTab === "wallet" ? "Select Wallet Provider" : "Select PayLater Provider"}
                  </div>
                  <div className="space-y-2">
                    {["Paytm Wallet", "PhonePe Wallet", "MobiKwik", "Airtel Payments"].map((w) => (
                      <div
                        key={w}
                        onClick={() => setSelectedWallet(w)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs ${
                          selectedWallet === w
                            ? "bg-blue-600/20 border-blue-500 text-white"
                            : "bg-[#0a0f1d] border-white/10 text-white/70 hover:bg-white/5"
                        }`}
                      >
                        <span>{w}</span>
                        {selectedWallet === w && <Check className="w-4 h-4 text-blue-400" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button & Security Assurance */}
              <div className="pt-6 border-t border-white/10 space-y-2.5">
                <Button
                  type="button"
                  onClick={handleSimulatePayment}
                  className="w-full bg-[#1864e0] hover:bg-[#1554c0] text-white py-3.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ₹{amount.toLocaleString("en-IN")}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-white/40">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>256-bit Encrypted · PCI DSS Compliant · Razorpay Gateway</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
