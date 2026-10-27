import { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import {
  ArrowLeft,
  X,
  Check,
  Lock,
  ChevronDown,
  Sparkles,
  Tag,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { openAuthModal, updateUserProfile } from "@/features/auth"
import { addQuestionQuota, setQuestionQuota } from "@/features/jyotish"
import {
  fetchBillingCatalog,
  validateCoupon,
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordPaymentFailure,
} from "@/features/billing/billingApi"
import { openRazorpayCheckout } from "@/lib/razorpay"
import { INDIAN_GST_STATES } from "@/lib/constants"
import { formatCurrency, getPackPricing } from "@/lib/utils"

export default function QuestionPacksModal({
  isOpen,
  onClose,
  onOpenAuth,
  initialPromoCode,
  initialPackId,
  currency = "INR",
}) {
  const dispatch = useDispatch()
  const { isAuthenticated, user } = useSelector((state) => state.auth || {})

  // Dynamic backend catalog & currency state
  const [activeCurrency, setActiveCurrency] = useState(currency || "INR")
  const [supportedCurrencies, setSupportedCurrencies] = useState(["INR", "USD"])
  const [packs, setPacks] = useState([])
  const [coupons, setCoupons] = useState([])
  const [isLoadingPacks, setIsLoadingPacks] = useState(false)
  const [packsError, setPacksError] = useState(null)

  // Step & selection
  const [step, setStep] = useState(1) // 1: Pack Selection, 2: Payment Summary
  const [selectedPackId, setSelectedPackId] = useState(initialPackId || "")
  const [billingState, setBillingState] = useState("Delhi")
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false)

  // Promo code & order calculation
  const [appliedPromo, setAppliedPromo] = useState(initialPromoCode || "")
  const [promoInput, setPromoInput] = useState("")
  const [isPromoInputVisible, setIsPromoInputVisible] = useState(false)
  const [isCouponsModalOpen, setIsCouponsModalOpen] = useState(false)
  const [isInitiating, setIsInitiating] = useState(false)
  const [serverBreakdown, setServerBreakdown] = useState(null)
  const [, setIsValidatingPromo] = useState(false)

  // Sync currency prop when passed
  useEffect(() => {
    if (currency) {
      setActiveCurrency(currency)
    }
  }, [currency])

  // Helper: extracts applicable products list from coupon
  const getApplicableProducts = (coupon) => {
    if (!coupon) return []
    if (Array.isArray(coupon.applicable_products)) return coupon.applicable_products
    if (typeof coupon.applicable_products === "string") {
      try {
        return JSON.parse(coupon.applicable_products)
      } catch {
        return []
      }
    }
    return []
  }

  // Helper: get matching coupons for a given pack ID / code
  const getCouponsForPack = useCallback(
    (packId) => {
      if (!packId || !coupons.length) return []
      return coupons.filter((coupon) => {
        if (coupon.is_active === false) return false
        const applicable = getApplicableProducts(coupon)
        return (
          applicable.length === 0 ||
          applicable.includes(packId) ||
          applicable.includes(selectedPackId)
        )
      })
    },
    [coupons, selectedPackId]
  )

  // Helper: get default coupon code for a pack
  const getDefaultPromoForPack = useCallback(
    (packId) => {
      const matching = getCouponsForPack(packId)
      return matching[0]?.code || ""
    },
    [getCouponsForPack]
  )

  // Fetch dynamic packages and coupons from backend API
  const loadCatalog = useCallback(
    async (currToFetch) => {
      const targetCurrency = currToFetch || activeCurrency || "INR"
      setIsLoadingPacks(true)
      setPacksError(null)

      try {
        const response = await fetchBillingCatalog(targetCurrency)
        const catalogData = response?.data || response
        const questionPacks = catalogData?.questionPacks || []
        const availableCoupons = catalogData?.coupons || []
        const backendCurrency = catalogData?.currency || targetCurrency
        const availableCurrencies = catalogData?.supportedCurrencies || ["INR", "USD"]

        setActiveCurrency(backendCurrency)
        setSupportedCurrencies(availableCurrencies)
        setPacks(questionPacks)
        setCoupons(availableCoupons)

        // Auto-select preferred pack: initialPackId -> gold tier -> first pack
        const defaultPack =
          questionPacks.find((p) => p.id === initialPackId || p.code === initialPackId) ||
          questionPacks.find((p) => p.tier === "gold" || p.id?.includes("gold") || p.code?.includes("gold")) ||
          questionPacks[0]

        if (defaultPack) {
          const packKey = defaultPack.id || defaultPack.code
          setSelectedPackId(packKey)

          if (initialPromoCode) {
            setAppliedPromo(initialPromoCode)
          } else {
            const matchingCoupons = availableCoupons.filter((c) => {
              const applicable = getApplicableProducts(c)
              return (
                applicable.length === 0 ||
                applicable.includes(defaultPack.id) ||
                applicable.includes(defaultPack.code)
              )
            })
            if (matchingCoupons.length > 0) {
              setAppliedPromo(matchingCoupons[0].code)
            } else {
              setAppliedPromo("")
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch billing catalog from backend:", err)
        setPacksError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load question packages from server. Please verify your connection."
        )
      } finally {
        setIsLoadingPacks(false)
      }
    },
    [activeCurrency, initialPackId, initialPromoCode]
  )

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      loadCatalog()
    }
  }, [isOpen, loadCatalog])

  const handleCurrencyChange = (newCurrency) => {
    if (newCurrency === activeCurrency || isLoadingPacks) return
    setActiveCurrency(newCurrency)
    setServerBreakdown(null)
    loadCatalog(newCurrency)
  }

  const handleModalClose = () => {
    setStep(1)
    setIsStateDropdownOpen(false)
    setIsPromoInputVisible(false)
    setIsCouponsModalOpen(false)
    setServerBreakdown(null)
    onClose()
  }

  // Selected pack resolution
  const selectedPack =
    packs.find((p) => p.id === selectedPackId || p.code === selectedPackId) ||
    packs[0] ||
    null

  // Selected pack dynamic pricing
  const selectedPricing = getPackPricing(selectedPack, activeCurrency)

  // Badge mapping for UI display
  const getBadgeForPack = (pkg) => {
    if (pkg.tier === "gold" || pkg.id?.includes("gold") || pkg.code?.includes("gold")) return "POPULAR"
    if (pkg.tier === "diamond" || pkg.id?.includes("diamond") || pkg.code?.includes("diamond")) return "BEST VALUE"
    return null
  }

  // Active coupon lookup and applicability
  const activeCoupon = coupons.find(
    (c) => c.code?.toUpperCase() === appliedPromo?.trim().toUpperCase()
  )

  const isPromoApplicable = Boolean(
    activeCoupon &&
    selectedPack &&
    (
      getApplicableProducts(activeCoupon).length === 0 ||
      getApplicableProducts(activeCoupon).includes(selectedPack.id) ||
      getApplicableProducts(activeCoupon).includes(selectedPack.code)
    )
  )

  // Price calculations from dynamic backend pricing
  const subtotal = selectedPricing.originalPrice
  const offerPrice = selectedPricing.offerPrice

  const isServerBreakdownFresh =
    serverBreakdown &&
    (serverBreakdown.packId === selectedPack?.id || serverBreakdown.packId === selectedPack?.code) &&
    serverBreakdown.couponCode === appliedPromo &&
    serverBreakdown.currency === selectedPricing.currency &&
    serverBreakdown.billingState === (selectedPricing.currency === "INR" ? billingState : "International")

  const discount = isServerBreakdownFresh
    ? serverBreakdown.discountAmount
    : isPromoApplicable
    ? Math.max(0, subtotal - offerPrice)
    : 0

  const finalPrice = isServerBreakdownFresh
    ? serverBreakdown.totalAmount
    : Math.max(0, subtotal - discount)

  // Selecting a pack
  const handleSelectPack = (pkg) => {
    if (!pkg) return
    const packKey = pkg.id || pkg.code
    setSelectedPackId(packKey)
    setServerBreakdown(null)

    // Check if current promo is still valid on the newly selected pack
    const packCoupons = getCouponsForPack(packKey)
    const isCurrentStillValid = packCoupons.some(
      (c) => c.code?.toUpperCase() === appliedPromo?.toUpperCase()
    )
    if (!isCurrentStillValid) {
      setAppliedPromo(packCoupons[0]?.code || "")
    }
  }

  // Applying promo code
  const handleApplyPromo = async (codeToApply) => {
    const code = (codeToApply || promoInput).trim().toUpperCase()
    if (!code) return

    const matchedCoupon = coupons.find((c) => c.code?.toUpperCase() === code)
    if (!matchedCoupon) {
      toast.error(`Invalid coupon code "${code}".`)
      return
    }

    const applicable = getApplicableProducts(matchedCoupon)
    const packMatches =
      applicable.length === 0 ||
      (selectedPack && (applicable.includes(selectedPack.id) || applicable.includes(selectedPack.code)))

    if (!packMatches) {
      toast.error(`Coupon "${code}" is not valid for ${selectedPack.name} Pack.`)
      return
    }

    setAppliedPromo(code)
    setIsPromoInputVisible(false)
    setIsCouponsModalOpen(false)
    setPromoInput("")
    toast.success(`Coupon code ${code} applied successfully!`)

    // If authenticated, request verified GST & discount breakdown from backend
    if (isAuthenticated && selectedPack) {
      setIsValidatingPromo(true)
      try {
        const breakdownRes = await validateCoupon({
          packId: selectedPack.code || selectedPack.id,
          couponCode: code,
          currency: selectedPricing.currency,
          billingState: selectedPricing.currency === "INR" ? billingState : "International",
        })
        if (breakdownRes?.data) {
          setServerBreakdown(breakdownRes.data)
        }
      } catch (err) {
        console.warn("Backend coupon validation warning:", err)
      } finally {
        setIsValidatingPromo(false)
      }
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo("")
    setServerBreakdown(null)
    toast.info("Coupon code removed.")
  }

  // Proceed to payment gateway via backend order creation
  const handleProceedToRazorpay = async () => {
    if (!selectedPack) return

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

    setIsInitiating(true)

    try {
      // 1. Create order on backend (passing packId/packCode). Backend computes all amounts.
      const packCodeOrId = selectedPack.code || selectedPack.id
      const orderRes = await createRazorpayOrder({
        packId: packCodeOrId,
        itemType: "questions",
        currency: selectedPricing.currency,
        couponCode: isPromoApplicable ? appliedPromo : undefined,
        billingState: selectedPricing.currency === "INR" ? billingState : "International",
      })

      const backendKeyId = orderRes.keyId || orderRes.data?.keyId
      const backendOrderId = orderRes.orderId || orderRes.data?.orderId
      const amountSubunits = orderRes.amountSubunits || orderRes.data?.amountSubunits
      const finalAmount = orderRes.amount || orderRes.data?.amount || finalPrice
      const orderCurrency = orderRes.currency || orderRes.data?.currency || selectedPricing.currency

      if (!backendKeyId) {
        throw new Error("Razorpay Key ID was not returned by the backend order response.")
      }

      // 2. Release active focus & close Radix Dialog to avoid focus-trap collision with Razorpay iframe
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      handleModalClose()

      // 3. Open official Razorpay modal outside Radix modal scope
      setTimeout(() => {
        openRazorpayCheckout({
          keyId: backendKeyId,
          orderId: backendOrderId,
          amountSubunits: amountSubunits,
          amount: finalAmount,
          currency: orderCurrency,
          name: "AstroTring",
          description: `${selectedPack.name} Pack (${selectedPack.credits} questions)`,
          user: {
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
          },
          onSuccess: async (paymentResponse) => {
            try {
              // 4. Verify signature with real backend & fulfill quota
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                method: "standard",
              })

              const creditsRemaining = verifyRes.data?.creditsRemaining
              if (typeof creditsRemaining === "number") {
                dispatch(setQuestionQuota(creditsRemaining))
                dispatch(updateUserProfile({ creditBalance: creditsRemaining }))
              } else {
                dispatch(addQuestionQuota(selectedPack.credits))
                dispatch(updateUserProfile({ creditBalance: (user?.creditBalance || 0) + selectedPack.credits }))
              }

              // Save local invoice copy
              try {
                const existingInvoices = JSON.parse(
                  localStorage.getItem("astrotring_invoices") || "[]"
                )
                const inv = verifyRes.data?.invoice || {
                  id: "INV-" + Date.now().toString().slice(-6),
                  paymentId: paymentResponse.razorpay_payment_id,
                  orderId: paymentResponse.razorpay_order_id,
                  date: new Date().toISOString(),
                  currency: orderCurrency,
                  itemType: "questions",
                  itemTitle: `${selectedPack.name} Pack (${selectedPack.credits} questions)`,
                  subtotal: selectedPricing.originalPrice,
                  discount: discount,
                  couponCode: appliedPromo || "NONE",
                  taxAmount: orderCurrency === "INR" ? Math.round((finalPrice * 18) / 118) : 0,
                  total: finalPrice,
                  billingState: orderCurrency === "INR" ? billingState : "International",
                  status: "PAID",
                  method: "Razorpay Standard",
                  userName: user?.name || "Customer",
                  userEmail: user?.email || "",
                }
                localStorage.setItem("astrotring_invoices", JSON.stringify([inv, ...existingInvoices]))
              } catch (e) {
                console.warn("Failed to save local invoice:", e)
              }

              toast.success(
                `Payment successful! ${selectedPack.credits} questions added to your account.`
              )
              handleModalClose()
            } catch (verifyErr) {
              console.error("Signature verification failed:", verifyErr)
              toast.error(
                verifyErr?.response?.data?.message ||
                "Payment was successful, but server verification failed. Please contact support."
              )
            }
          },
          onFailure: (err) => {
            recordPaymentFailure({
              razorpay_order_id: backendOrderId,
              status: "failed",
              reason: err?.description || err?.message || "Payment failed",
            })
            toast.error(err?.description || "Payment failed. Please try again.")
          },
          onDismiss: () => {
            recordPaymentFailure({
              razorpay_order_id: backendOrderId,
              status: "cancelled",
              reason: "User closed checkout modal",
            })
            toast.info("Payment window dismissed.")
          },
        })
      }, 50)
    } catch (orderErr) {
      console.error("Failed to create Razorpay order:", orderErr)
      toast.error(
        orderErr?.response?.data?.message ||
        orderErr?.message ||
        "Could not initialize checkout. Please check connection and try again."
      )
    } finally {
      setIsInitiating(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[880px] md:max-w-[900px] w-[95vw] p-0 overflow-hidden border border-white/10 bg-[#07273c] text-foreground rounded-2xl sm:rounded-3xl shadow-2xl"
        >
          {/* ================= STEP 1: PACKAGES POPUP ================= */}
          {step === 1 && (
            <div className="flex flex-col">
              {/* Header */}
              <div className="pt-7 sm:pt-8 px-7 sm:px-9 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-[32px] font-normal text-white tracking-tight leading-tight">
                    Buy more questions
                  </h2>
                  <p className="text-xs sm:text-sm text-white/50 mt-1.5 font-sans leading-relaxed">
                    One-time purchase · never expires · every answer stays chart-bound.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {/* Multi-Currency Toggle */}
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1">
                    {supportedCurrencies.map((curr) => {
                      const isCurrActive = activeCurrency === curr
                      const label = curr === "INR" ? "₹ INR" : "$ USD"
                      return (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => handleCurrencyChange(curr)}
                          disabled={isLoadingPacks}
                          className={`px-2.5 py-1 text-[11px] font-mono rounded-full transition cursor-pointer disabled:opacity-50 ${
                            isCurrActive
                              ? "bg-gradient-to-r from-[#ea650a] to-[#ff7010] text-white font-semibold shadow-sm"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          {label}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={handleModalClose}
                    className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Content Area: Loading, Error, or Loaded Packs */}
              <div className="px-7 sm:px-9 py-6 sm:py-7">
                {/* 1. Loading Skeleton */}
                {isLoadingPacks && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {[1, 2, 3].map((idx) => (
                      <div
                        key={idx}
                        className="rounded-2xl p-6 sm:p-7 border border-white/10 bg-[#1b1726]/60 flex flex-col justify-between min-h-[300px] sm:min-h-[320px]"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-16 bg-white/10" />
                            <Skeleton className="h-5 w-5 rounded-full bg-white/10" />
                          </div>
                          <div className="mt-5 space-y-2">
                            <Skeleton className="h-14 w-20 bg-white/10" />
                            <Skeleton className="h-4 w-24 bg-white/5" />
                          </div>
                        </div>
                        <div>
                          <div className="border-t border-white/10 my-5" />
                          <Skeleton className="h-8 w-32 bg-white/10" />
                          <Skeleton className="h-4 w-24 bg-white/5 mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Error State with Retry Button */}
                {!isLoadingPacks && packsError && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-950/20 p-8 text-center flex flex-col items-center justify-center gap-3">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <h3 className="text-white font-medium text-base">Unable to load packages</h3>
                    <p className="text-white/60 text-xs sm:text-sm max-w-md">{packsError}</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => loadCatalog()}
                      className="mt-2 border-white/20 text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Loading</span>
                    </Button>
                  </div>
                )}

                {/* 3. Loaded Packs Grid */}
                {!isLoadingPacks && !packsError && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {packs.map((pkg) => {
                      const isSelected = selectedPackId === pkg.id || selectedPackId === pkg.code
                      const badge = getBadgeForPack(pkg)
                      const pkgPricing = getPackPricing(pkg, activeCurrency)
                      const unitPriceNum = Number(pkgPricing.offerPrice || 0) / Number(pkg.credits || 1)
                      const defaultPromo = getDefaultPromoForPack(pkg.id || pkg.code)

                      return (
                        <div
                          key={pkg.id || pkg.code}
                          onClick={() => handleSelectPack(pkg)}
                          className={`relative rounded-2xl p-6 sm:p-7 border cursor-pointer transition-all duration-200 flex flex-col justify-between min-h-[300px] sm:min-h-[320px] ${
                            isSelected
                              ? "border-2 border-[#ff7010] bg-[#0e344d] ring-1 ring-[#ff7010]/50 shadow-[0_0_30px_rgba(255,112,16,0.25)]"
                              : "border-white/10 bg-[#07273c]/60 hover:border-white/20 hover:bg-[#07273c]"
                          }`}
                        >
                          {/* Floating Badge (Popular / Best Value) */}
                          {badge && (
                            <span className="absolute -top-3 left-5 bg-[#f59e0b] text-[#1c1209] font-bold text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-[4px] shadow-sm">
                              {badge}
                            </span>
                          )}

                          {/* Top Row: Tier Name + Radio Circle */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/70 font-medium">
                                {pkg.name || pkg.tier}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-[#ff7010] bg-[#ff7010] text-white"
                                    : "border-white/25 bg-transparent"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>

                            {/* Giant Number of Questions */}
                            <div className="mt-4">
                              <div className="font-serif text-[56px] sm:text-[62px] font-light text-white tracking-tight leading-none">
                                {pkg.credits}
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
                                {formatCurrency(pkgPricing.offerPrice, pkgPricing.currency)}
                              </span>
                              {pkgPricing.originalPrice > pkgPricing.offerPrice && (
                                <span className="font-mono text-xs text-white/40 line-through">
                                  {formatCurrency(pkgPricing.originalPrice, pkgPricing.currency)}
                                </span>
                              )}
                            </div>

                            <div className="text-xs text-white/50 mt-1 font-sans">
                              {formatCurrency(unitPriceNum, pkgPricing.currency)} per question
                            </div>

                            {defaultPromo && (
                              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-4">
                                CODE <span className="text-white/70 font-semibold">{defaultPromo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Dark Footer Bar */}
              <div className="bg-[#041826] px-7 sm:px-9 py-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-white/40">
                  SECURE PAYMENT · {selectedPricing.currency === "INR" ? "GST INVOICE" : "TAX INVOICE"} · INSTANT CREDIT
                </span>

                <Button
                  type="button"
                  disabled={!selectedPack || isLoadingPacks}
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto bg-gradient-to-r from-[#ea650a] to-[#ff7010] hover:from-[#f07015] hover:to-[#ff832b] text-white px-8 py-3.5 rounded-full font-medium shadow-lg shadow-[#ff7010]/20 hover:brightness-105 transition flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-50"
                >
                  {selectedPack ? (
                    <>
                      <span>Continue with {selectedPack.credits} questions</span>
                      <span className="text-white/40">·</span>
                      <span>{formatCurrency(selectedPricing.offerPrice, selectedPricing.currency)}</span>
                      <span className="text-base">→</span>
                    </>
                  ) : (
                    <span>Select a Package</span>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: PAYMENT SUMMARY ================= */}
          {step === 2 && selectedPack && (
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

              {/* 2-Column Grid */}
              <div className="px-7 sm:px-9 py-6 sm:py-7 grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Left Column: Pack Review, State, Promo */}
                <div className="md:col-span-7 space-y-6">
                  {/* 1. YOUR PACK & QUICK SWITCH */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50">
                        SELECT RECHARGE PACK
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-[11px] font-mono uppercase tracking-[0.15em] text-amber-400 hover:text-amber-300 transition cursor-pointer"
                      >
                        FULL DETAILS &gt;
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {packs.map((pkg) => {
                        const isSelected = selectedPackId === pkg.id || selectedPackId === pkg.code
                        const badge = getBadgeForPack(pkg)
                        const pPricing = getPackPricing(pkg, activeCurrency)
                        return (
                          <div
                            key={pkg.id || pkg.code}
                            onClick={() => handleSelectPack(pkg)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? "border-amber-400 bg-[#25152a] ring-1 ring-amber-400/50 shadow-md"
                                : "border-white/10 bg-[#1b1726]/70 hover:border-white/20 hover:bg-[#1b1726]"
                            }`}
                          >
                            {badge && (
                              <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-400 text-black">
                                {badge}
                              </span>
                            )}
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                                  isSelected ? "text-amber-300" : "text-white/70"
                                }`}
                              >
                                {pkg.name}
                              </span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "border-amber-400 bg-amber-400 text-black"
                                    : "border-white/25 bg-transparent"
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="font-serif text-lg sm:text-xl font-light text-white leading-tight">
                                {pkg.credits}{" "}
                                <span className="text-xs font-sans text-white/50">Qs</span>
                              </div>
                              <div className="font-mono text-xs text-white/90 font-medium mt-1">
                                {formatCurrency(pPricing.offerPrice, pPricing.currency)}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="text-[11px] text-white/50 mt-2 font-sans flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />
                      <span>{selectedPack.name} Pack ({selectedPack.credits} questions) · never expires</span>
                    </div>
                  </div>

                  {/* 2. BILLING STATE / REGION */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50">
                        {selectedPricing.currency === "INR" ? "BILLING STATE" : "BILLING REGION"}
                      </span>
                      <span className="text-xs text-white/40">
                        {selectedPricing.currency === "INR" ? "Required on your GST invoice" : "International (0% GST)"}
                      </span>
                    </div>

                    {selectedPricing.currency === "INR" ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                          className="w-full rounded-2xl border border-white/10 bg-[#07273c] px-5 py-3.5 text-sm text-white flex items-center justify-between hover:border-white/20 transition cursor-pointer"
                        >
                          <span>{billingState}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-white/40 transition-transform ${
                              isStateDropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isStateDropdownOpen && (
                          <div className="absolute z-30 left-0 right-0 mt-1.5 max-h-52 overflow-y-auto rounded-2xl border border-white/10 bg-[#07273c] p-2 shadow-2xl">
                            {INDIAN_GST_STATES.map((state) => (
                              <div
                                key={state}
                                onClick={() => {
                                  setBillingState(state)
                                  setIsStateDropdownOpen(false)
                                }}
                                className={`px-4 py-2.5 text-xs rounded-xl cursor-pointer transition flex items-center justify-between ${
                                  billingState === state
                                    ? "bg-[#ff7010]/30 text-white font-semibold"
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
                    ) : (
                      <div className="w-full rounded-2xl border border-white/10 bg-[#07273c] px-5 py-3.5 text-sm text-white/80 font-mono">
                        International ({selectedPricing.currency}) · GST Exempt
                      </div>
                    )}
                  </div>

                  {/* 3. PROMO CODE */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-400 font-semibold">
                        PROMO CODE
                      </span>
                      {coupons.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCouponsModalOpen(true)}
                          className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/60 hover:text-white transition cursor-pointer"
                        >
                          VIEW ALL COUPONS &gt;
                        </button>
                      )}
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
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleApplyPromo()
                            }
                          }}
                          className="flex-1 rounded-2xl border border-white/10 bg-[#07273c] px-5 py-3 text-xs text-white uppercase placeholder:text-white/30 focus:outline-none focus:border-[#ff7010] font-mono"
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
                        <span>{selectedPack.credits} Questions</span>
                        <span className="font-mono">{formatCurrency(subtotal, selectedPricing.currency)}</span>
                      </div>

                      {isPromoApplicable && discount > 0 && (
                        <div className="flex justify-between items-center text-emerald-400">
                          <span className="text-xs">{appliedPromo} discount</span>
                          <span className="font-mono">− {formatCurrency(discount, selectedPricing.currency)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-white/50 text-xs">
                        <span>Taxes and fees</span>
                        <span>{selectedPricing.currency === "INR" ? "Included (18% GST)" : "Included (0% Tax)"}</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 my-5" />

                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs font-mono uppercase tracking-[0.2em] text-white/60 block">
                          TOTAL
                        </span>
                        <span className="text-[10px] text-white/40 mt-0.5 block">
                          {selectedPricing.currency === "INR" ? "GST included" : "All taxes included"}
                        </span>
                      </div>
                      <div className="font-serif text-4xl sm:text-[44px] font-normal text-white tracking-tight">
                        {formatCurrency(finalPrice, selectedPricing.currency)}
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Pay Button */}
                  <div className="mt-8 space-y-2.5">
                    <Button
                      type="button"
                      disabled={isInitiating}
                      onClick={handleProceedToRazorpay}
                      className="w-full bg-gradient-to-r from-[#ea650a] to-[#ff7010] hover:from-[#f07015] hover:to-[#ff832b] text-white py-4 rounded-full font-medium shadow-lg shadow-[#ff7010]/20 hover:brightness-105 transition flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60"
                    >
                      {isInitiating ? (
                        <span>Connecting to Gateway...</span>
                      ) : (
                        <>
                          <span>Proceed to Pay</span>
                          <span className="text-lg">→</span>
                        </>
                      )}
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

      {/* Dynamic Coupons List Modal */}
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
              className="text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 py-3 max-h-[60vh] overflow-y-auto">
            {coupons.map((coupon) => {
              const applicable = getApplicableProducts(coupon)
              return (
                <div
                  key={coupon.code}
                  className="p-3.5 rounded-xl border border-white/10 bg-[#1b1726] flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded">
                        {coupon.code}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mt-1.5 font-medium">
                      {coupon.description || `${coupon.code} special discount`}
                    </p>
                    {applicable.length > 0 && (
                      <p className="text-[10px] text-white/40 mt-0.5 font-mono">
                        Valid on: {applicable.join(", ")}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (
                        applicable.length > 0 &&
                        !applicable.includes(selectedPack?.id) &&
                        !applicable.includes(selectedPack?.code)
                      ) {
                        setSelectedPackId(applicable[0])
                      }
                      handleApplyPromo(coupon.code)
                    }}
                    className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-xs shrink-0 cursor-pointer"
                  >
                    Apply
                  </Button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}
