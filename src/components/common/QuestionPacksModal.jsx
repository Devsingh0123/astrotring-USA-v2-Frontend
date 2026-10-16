import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  ArrowLeft,
  X,
  Check,
  Lock,
  ChevronDown,
  Sparkles,
  Tag,
  ShieldCheck,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { openAuthModal } from "@/store/slices/authSlice"
import { addQuestionQuota } from "@/store/slices/vaaniSlice"
import RazorpayCheckoutModal from "@/components/common/RazorpayCheckoutModal"

// Melooha Question Packages (INR) matching Authenticated Screenshots 10 & 16
export const QUESTION_PACKAGES = [
  {
    id: "pack_silver_7",
    name: "Silver",
    questions: 7,
    originalPrice: 1399,
    offerPrice: 699,
    unitPrice: 100,
    promoCode: "ASKMAX",
    discountAmount: 700,
    badge: null,
  },
  {
    id: "pack_gold_12",
    name: "Gold",
    questions: 12,
    originalPrice: 2399,
    offerPrice: 799,
    unitPrice: 67,
    promoCode: "QUICKGOLD",
    alternatePromo: "GOLDNOW",
    discountAmount: 1600,
    badge: "POPULAR",
  },
  {
    id: "pack_diamond_20",
    name: "Diamond",
    questions: 20,
    originalPrice: 3999,
    offerPrice: 1199,
    unitPrice: 60,
    promoCode: "ASKMAX",
    discountAmount: 2800,
    badge: "BEST VALUE",
  },
]

// All Indian States & UTs for GST invoice (Delhi default per user Suraj Kumar)
export const INDIAN_GST_STATES = [
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Uttar Pradesh",
  "Gujarat",
  "Tamil Nadu",
  "Telangana",
  "Rajasthan",
  "West Bengal",
  "Haryana",
  "Punjab",
  "Kerala",
  "Madhya Pradesh",
  "Bihar",
  "Andhra Pradesh",
  "Odisha",
  "Assam",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Goa",
  "Jammu & Kashmir",
  "Chandigarh",
  "Other Indian State / UT",
]

const AVAILABLE_COUPONS = [
  {
    code: "QUICKGOLD",
    title: "Flat ₹1,600 off on Gold Pack",
    desc: "Valid on Gold 12-questions pack. Get it for ₹799.",
    packId: "pack_gold_12",
  },
  {
    code: "GOLDNOW",
    title: "Gold Cosmic Offer",
    desc: "Alternative promo code for Gold pack. Saves ₹1,600.",
    packId: "pack_gold_12",
  },
  {
    code: "ASKMAX",
    title: "Up to ₹2,800 off Diamond & Silver",
    desc: "Valid on 20-question Diamond (₹1,199) and 7-question Silver (₹699).",
    packId: "pack_diamond_20",
  },
]

export default function QuestionPacksModal({
  isOpen,
  onClose,
  onOpenAuth,
  initialPromoCode,
  initialPackId,
}) {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth || {})

  const [step, setStep] = useState(1) // 1: Pack Selection, 2: Payment Summary
  const [selectedPackId, setSelectedPackId] = useState(initialPackId || "pack_gold_12")
  const [billingState, setBillingState] = useState("Delhi")
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState(initialPromoCode || "QUICKGOLD")
  const [promoInput, setPromoInput] = useState("")
  const [isPromoInputVisible, setIsPromoInputVisible] = useState(false)
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false)
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false)

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      if (initialPackId) {
        setSelectedPackId(initialPackId)
      }
      if (initialPromoCode) {
        setAppliedPromo(initialPromoCode)
      } else {
        const defaultPack = QUESTION_PACKAGES.find((p) => p.id === (initialPackId || "pack_gold_12"))
        if (defaultPack) {
          setAppliedPromo(defaultPack.promoCode)
        }
      }
    }
  }, [isOpen, initialPackId, initialPromoCode])

  const selectedPack =
    QUESTION_PACKAGES.find((p) => p.id === selectedPackId) ||
    QUESTION_PACKAGES[1]

  const handleModalClose = () => {
    setStep(1)
    setIsStateDropdownOpen(false)
    setIsPromoInputVisible(false)
    setIsCouponsModalOpen(false)
    setIsRazorpayOpen(false)
    onClose()
  }

  // Calculate pricing based on applied promo
  const isPromoApplicable =
    appliedPromo === selectedPack.promoCode ||
    appliedPromo === selectedPack.alternatePromo ||
    (appliedPromo === "ASKMAX" && (selectedPack.id === "pack_silver_7" || selectedPack.id === "pack_diamond_20")) ||
    (appliedPromo === "QUICKGOLD" && selectedPack.id === "pack_gold_12") ||
    (appliedPromo === "GOLDNOW" && selectedPack.id === "pack_gold_12")

  const discount = isPromoApplicable ? selectedPack.discountAmount : 0
  const finalPrice = Math.max(0, selectedPack.originalPrice - discount)

  const handleApplyPromo = (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase()
    if (!code) return

    if (code === "QUICKGOLD" || code === "GOLDNOW" || code === "ASKMAX") {
      setAppliedPromo(code)
      toast.success(`Coupon code ${code} applied successfully!`)
      setIsPromoInputVisible(false)
      setIsCouponsModalOpen(false)
      setPromoInput("")
    } else {
      toast.error("Invalid coupon code. Try QUICKGOLD or ASKMAX.")
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo("")
    toast.info("Coupon code removed.")
  }

  const handleProceedToRazorpay = () => {
    if (!isAuthenticated) {
      if (onOpenAuth) {
        onOpenAuth(() => {
          setStep(2)
        })
      } else {
        dispatch(openAuthModal())
      }
      return
    }

    setIsRazorpayOpen(true)
  }

  const handleRazorpaySuccess = (paymentResponse) => {
    // 1. Credit questions to Redux state immediately
    dispatch(addQuestionQuota(selectedPack.questions))

    // 2. Persist invoice to localStorage for Feature 5
    try {
      const existingInvoices = JSON.parse(
        localStorage.getItem("astrotring_invoices") || "[]"
      )

      const newInvoice = {
        id: "INV-" + Date.now().toString().slice(-6),
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        date: new Date().toISOString(),
        itemType: "questions",
        itemTitle: `${selectedPack.name} Pack (${selectedPack.questions} questions)`,
        subtotal: selectedPack.originalPrice,
        discount: discount,
        couponCode: appliedPromo || "NONE",
        taxAmount: Math.round((finalPrice * 18) / 118), // 18% GST included
        total: finalPrice,
        billingState: billingState,
        status: "PAID",
        method: "Razorpay Standard",
        userName: user?.name || "Suraj Kumar",
        userEmail: user?.email || "suraj@astrotring.com",
      }

      localStorage.setItem(
        "astrotring_invoices",
        JSON.stringify([newInvoice, ...existingInvoices])
      )
    } catch (e) {
      console.error("Failed to save invoice record:", e)
    }

    toast.success(
      `Payment of ₹${finalPrice.toLocaleString("en-IN")} successful! ${selectedPack.questions} questions added to your account.`
    )
    handleModalClose()
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[880px] md:max-w-[900px] w-[95vw] p-0 overflow-hidden border border-white/10 bg-[#161220] text-foreground rounded-2xl sm:rounded-3xl shadow-2xl"
        >
          {/* ================= STEP 1: PACKAGES POPUP (Melooha Ref 10) ================= */}
          {step === 1 && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="pt-7 sm:pt-8 px-7 sm:px-9 pb-2 flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-2xl sm:text-[32px] font-normal text-white tracking-tight leading-tight">
                    Buy more questions
                  </h2>
                  <p className="text-xs sm:text-sm text-white/50 mt-1.5 font-sans leading-relaxed">
                    One-time purchase · never expires · every answer stays chart-bound.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer shrink-0 mt-0.5"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 3 Tier Cards Side-by-Side (Melooha exact proportions & INR prices) */}
              <div className="px-7 sm:px-9 py-6 sm:py-7 grid grid-cols-1 md:grid-cols-3 gap-5">
                {QUESTION_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackId === pkg.id
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => {
                        setSelectedPackId(pkg.id)
                        setAppliedPromo(pkg.promoCode)
                      }}
                      className={`relative rounded-2xl p-6 sm:p-7 border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[300px] sm:min-h-[320px] ${
                        isSelected
                          ? "border-2 border-[#b32b6e] bg-[#22162a] ring-1 ring-[#b32b6e]/50 shadow-[0_0_30px_rgba(179,43,110,0.25)]"
                          : "border-white/10 bg-[#1b1726]/60 hover:border-white/20 hover:bg-[#1b1726]"
                      }`}
                    >
                      {/* Floating Badge (Popular / Best Value) */}
                      {pkg.badge && (
                        <span className="absolute -top-3 left-5 bg-[#f59e0b] text-[#1c1209] font-bold text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-[4px] shadow-sm">
                          {pkg.badge}
                        </span>
                      )}

                      {/* Top Row: Tier Name + Radio Circle */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/70 font-medium">
                            {pkg.name}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                              isSelected
                                ? "border-[#b32b6e] bg-[#b32b6e] text-white"
                                : "border-white/25 bg-transparent"
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Giant Number of Questions */}
                        <div className="mt-4">
                          <div className="font-serif text-[56px] sm:text-[62px] font-light text-white tracking-tight leading-none">
                            {pkg.questions}
                          </div>
                          <div className="text-xs sm:text-sm text-white/50 mt-1 font-sans">
                            questions
                          </div>
                        </div>
                      </div>

                      {/* Divider & Price Section */}
                      <div>
                        <div className="border-t border-white/10 my-5" />

                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-2xl sm:text-[26px] font-semibold text-white">
                            ₹{pkg.offerPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="font-mono text-xs text-white/40 line-through">
                            ₹{pkg.originalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="text-xs text-white/50 mt-1 font-sans">
                          ₹{pkg.unitPrice} per question
                        </div>

                        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-4">
                          CODE <span className="text-white/70 font-semibold">{pkg.promoCode}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Dark Footer Bar (Melooha Ref 10) */}
              <div className="bg-[#100c17] px-7 sm:px-9 py-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/40">
                  SECURE PAYMENT · GST INVOICE · INSTANT CREDIT
                </span>

                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white px-8 py-3.5 rounded-full font-medium shadow-lg shadow-[#b32b6e]/20 hover:brightness-105 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
                >
                  <span>Continue with {selectedPack.questions} questions</span>
                  <span className="text-white/40">·</span>
                  <span>₹{selectedPack.offerPrice.toLocaleString("en-IN")}</span>
                  <span className="text-base">→</span>
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PAYMENT SUMMARY (Melooha Ref 16) ================= */}
          {step === 2 && (
            <div className="flex flex-col">
              {/* Header with Back button and Step indicator */}
              <div className="pt-7 sm:pt-8 px-7 sm:px-9 pb-4 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-9 h-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer"
                    aria-label="Back to packages"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 block leading-tight mb-0.5">
                      STEP 2 OF 2
                    </span>
                    <h2 className="font-serif text-2xl sm:text-[28px] font-normal text-white">
                      Payment summary
                    </h2>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleModalClose}
                  className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 2-Column Grid (Melooha Payment Summary Exact Layout) */}
              <div className="px-7 sm:px-9 py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Pack Review, State, Promo */}
                <div className="md:col-span-7 space-y-6">
                  {/* 1. YOUR PACK */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50">
                        YOUR PACK
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/70 hover:text-white transition cursor-pointer"
                      >
                        CHANGE &gt;
                      </button>
                    </div>

                    <div className="rounded-2xl p-5 border border-[#3c1e3a]/60 bg-[#211526]/80 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#4a1838] border border-[#682451] flex items-center justify-center text-amber-200 shrink-0">
                        <Sparkles className="w-4 h-4 text-amber-300" />
                      </div>
                      <div>
                        <div className="text-white font-serif font-medium text-lg">
                          {selectedPack.name} · {selectedPack.questions} questions
                        </div>
                        <div className="text-xs text-white/50 mt-1 font-sans">
                          Never expires · added to your account instantly
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. BILLING STATE */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50">
                        BILLING STATE
                      </span>
                      <span className="text-xs text-white/40">
                        Required on your GST invoice
                      </span>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                        className="w-full rounded-2xl border border-white/10 bg-[#1b1726] px-5 py-3.5 text-sm text-white flex items-center justify-between hover:border-white/20 transition cursor-pointer"
                      >
                        <span>{billingState}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-white/40 transition-transform ${
                            isStateDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isStateDropdownOpen && (
                        <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-[#181424] p-2 shadow-2xl">
                          {INDIAN_GST_STATES.map((state) => (
                            <div
                              key={state}
                              onClick={() => {
                                setBillingState(state)
                                setIsStateDropdownOpen(false)
                              }}
                              className={`px-4 py-2.5 text-xs rounded-xl cursor-pointer transition flex items-center justify-between ${
                                billingState === state
                                  ? "bg-[#b32b6e]/30 text-white font-semibold"
                                  : "text-white/70 hover:bg-white/5 hover:text-white"
                              }`}
                            >
                              <span>{state}</span>
                              {billingState === state && (
                                <Check className="w-3.5 h-3.5 text-white" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. PROMO CODE */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                        PROMO CODE
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCouponsModalOpen(true)}
                        className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/60 hover:text-white transition cursor-pointer"
                      >
                        VIEW ALL COUPONS &gt;
                      </button>
                    </div>

                    {isPromoApplicable && !isPromoInputVisible ? (
                      <div className="w-full rounded-2xl border border-emerald-500/30 bg-[#102419]/70 px-5 py-3.5 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="text-white font-mono font-semibold tracking-wider">
                            {appliedPromo}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/50">Applied</span>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-white/40 hover:text-white cursor-pointer ml-1 p-0.5"
                            aria-label="Remove promo code"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. QUICKGOLD or ASKMAX"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="flex-1 rounded-2xl border border-white/10 bg-[#1b1726] px-5 py-3 text-xs text-white uppercase placeholder:text-white/30 focus:outline-none focus:border-[#b32b6e] font-mono"
                        />
                        <Button
                          type="button"
                          onClick={() => handleApplyPromo()}
                          className="bg-white/10 hover:bg-white/20 text-white text-xs px-5 rounded-2xl cursor-pointer h-auto"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Order Cost Breakdown & Razorpay CTA */}
                <div className="md:col-span-5 flex flex-col justify-between pt-1">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50 block mb-4">
                      ORDER
                    </span>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center text-white/80">
                        <span>{selectedPack.questions} Questions</span>
                        <span className="font-mono">₹{selectedPack.originalPrice.toLocaleString("en-IN")}</span>
                      </div>

                      {isPromoApplicable && (
                        <div className="flex justify-between items-center text-emerald-400">
                          <span className="text-xs">{appliedPromo} discount</span>
                          <span className="font-mono">− ₹{discount.toLocaleString("en-IN")}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-white/50 text-xs">
                        <span>Taxes and fees</span>
                        <span>Included</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 my-5" />

                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/60 block">
                          TOTAL
                        </span>
                        <span className="text-[10px] text-white/40 mt-0.5 block">
                          GST included
                        </span>
                      </div>
                      <div className="font-serif text-4xl sm:text-[44px] font-normal text-white tracking-tight">
                        ₹{finalPrice.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Pay Button (Melooha Ref 16) */}
                  <div className="mt-8 space-y-2.5">
                    <Button
                      type="button"
                      onClick={handleProceedToRazorpay}
                      className="w-full bg-gradient-to-r from-[#9b1c5c] to-[#b32b6e] hover:from-[#a82064] hover:to-[#c23277] text-white py-4 rounded-full font-medium shadow-lg shadow-[#b32b6e]/20 hover:brightness-105 transition flex items-center justify-center gap-2 text-base cursor-pointer"
                    >
                      <span>Proceed to Pay</span>
                      <span className="text-lg">→</span>
                    </Button>

                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 pt-1">
                      <Lock className="w-3 h-3 text-white/40" />
                      <span>RAZORPAY SECURED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Coupons List Modal */}
      <Dialog open={isCouponsModalOpen} onOpenChange={setIsCouponsModalOpen}>
        <DialogContent className="sm:max-w-[460px] bg-[#161220] border border-white/10 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-400" />
              <h3 className="font-serif text-lg font-medium">Available Coupons</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCouponsModalOpen(false)}
              className="text-white/50 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 py-3">
            {AVAILABLE_COUPONS.map((coupon) => (
              <div
                key={coupon.code}
                className="p-3.5 rounded-xl border border-white/10 bg-[#1b1726] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                      {coupon.code}
                    </span>
                    <span className="text-xs font-medium text-white">{coupon.title}</span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1">{coupon.desc}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (coupon.packId) {
                      setSelectedPackId(coupon.packId)
                    }
                    handleApplyPromo(coupon.code)
                  }}
                  className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-xs shrink-0 cursor-pointer"
                >
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Official Razorpay Standard Checkout Gateway Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        orderData={{
          amount: finalPrice,
          pack: selectedPack,
          promo: appliedPromo,
          billingState: billingState,
        }}
        onSuccess={handleRazorpaySuccess}
      />
    </>
  )
}
