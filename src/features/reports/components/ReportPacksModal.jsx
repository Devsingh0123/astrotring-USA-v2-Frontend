import { useState, useEffect, useCallback } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Check, ShieldCheck, Sparkles, Tag, ArrowRight, AlertCircle, RefreshCw, X } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { addReportQuota, setReportQuota } from "@/features/vaani"
import { updateUserProfile } from "@/features/auth"
import {
  fetchBillingCatalog,
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordPaymentFailure,
} from "@/features/billing/billingApi"
import { openRazorpayCheckout } from "@/lib/razorpay"

export default function ReportPacksModal({ isOpen, onClose, onSelectPackage, currency = "INR" }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth || {})

  const [packs, setPacks] = useState([])
  const [coupons, setCoupons] = useState([])
  const [isLoadingPacks, setIsLoadingPacks] = useState(false)
  const [packsError, setPacksError] = useState(null)
  const [selectedPackId, setSelectedPackId] = useState("")
  const [isInitiating, setIsInitiating] = useState(false)

  // Fetch real report packages and coupons from backend
  const loadCatalog = useCallback(async () => {
    setIsLoadingPacks(true)
    setPacksError(null)

    try {
      const response = await fetchBillingCatalog(currency)
      const catalogData = response?.data || response
      const reportPacks = catalogData?.reportPacks || []
      const availableCoupons = catalogData?.coupons || []

      setPacks(reportPacks)
      setCoupons(availableCoupons)

      // Auto-select diamond tier, or first pack
      const defaultPack =
        reportPacks.find((p) => p.tier === "diamond" || p.id.includes("diamond")) ||
        reportPacks[reportPacks.length - 1] ||
        reportPacks[0]

      if (defaultPack) {
        setSelectedPackId(defaultPack.id)
      }
    } catch (err) {
      console.error("Failed to load report packs:", err)
      setPacksError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load report packages from server."
      )
    } finally {
      setIsLoadingPacks(false)
    }
  }, [currency])

  useEffect(() => {
    if (isOpen) {
      loadCatalog()
    }
  }, [isOpen, loadCatalog])

  const selectedPack =
    packs.find((p) => p.id === selectedPackId) ||
    packs[0] ||
    null

  // Match coupon applicable to report packs (e.g. VAULT)
  const matchedCoupon = coupons.find((c) => {
    if (!c.is_active) return false
    const applicable = Array.isArray(c.applicable_products)
      ? c.applicable_products
      : typeof c.applicable_products === "string"
      ? JSON.parse(c.applicable_products || "[]")
      : []
    return applicable.length === 0 || (selectedPack && applicable.includes(selectedPack.id))
  })

  const couponCode = matchedCoupon?.code || "VAULT"

  const getBadgeForPack = (pkg) => {
    if (pkg.tier === "diamond" || pkg.id?.includes("diamond") || pkg.credits >= 4) return "Best Value"
    if (pkg.tier === "gold" || pkg.id?.includes("gold")) return "Popular"
    return null
  }

  const handleContinue = async () => {
    if (!selectedPack) return

    setIsInitiating(true)

    try {
      const orderRes = await createRazorpayOrder({
        packId: selectedPack.id,
        itemType: "report_pack",
        currency: selectedPack.currency || "INR",
        couponCode: couponCode,
        billingState: "Delhi",
      })

      const backendKeyId = orderRes.keyId || orderRes.data?.keyId
      const backendOrderId = orderRes.orderId || orderRes.data?.orderId
      const amountSubunits = orderRes.amountSubunits || orderRes.data?.amountSubunits
      const finalAmount = orderRes.amount || orderRes.data?.amount || selectedPack.offerPrice

      if (!backendKeyId) {
        throw new Error("Razorpay Key ID was not returned by the backend order response.")
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur()
      }
      onClose()

      setTimeout(() => {
        openRazorpayCheckout({
          keyId: backendKeyId,
          orderId: backendOrderId,
          amountSubunits: amountSubunits,
          amount: finalAmount,
          currency: orderRes.currency || orderRes.data?.currency || selectedPack.currency || "INR",
          name: "AstroTring",
          description: `${selectedPack.name} Pack (${selectedPack.credits} reports)`,
          user: {
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
          },
          onSuccess: async (paymentResponse) => {
            try {
              const verifyRes = await verifyRazorpayPayment({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                method: "standard",
              })

              const reportCredits = verifyRes.data?.reportCredits
              if (typeof reportCredits === "number") {
                dispatch(setReportQuota(reportCredits))
                dispatch(updateUserProfile({ reportCredits }))
              } else {
                dispatch(addReportQuota(selectedPack.credits))
                dispatch(updateUserProfile({ reportCredits: (user?.reportCredits || 0) + selectedPack.credits }))
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
                  itemType: "report_pack",
                  itemTitle: `${selectedPack.name} Pack (${selectedPack.credits} reports)`,
                  subtotal: selectedPack.originalPrice,
                  discount: selectedPack.originalPrice - selectedPack.offerPrice,
                  couponCode: couponCode,
                  taxAmount: Math.round((Number(selectedPack.offerPrice) * 18) / 118),
                  total: selectedPack.offerPrice,
                  billingState: "Delhi",
                  status: "PAID",
                  method: "Razorpay Standard",
                  userName: user?.name || "Customer",
                  userEmail: user?.email || "",
                }
                localStorage.setItem("astrotring_invoices", JSON.stringify([inv, ...existingInvoices]))
              } catch (e) {
                console.warn("Failed to store invoice:", e)
              }

              if (onSelectPackage) {
                onSelectPackage(selectedPack)
              }

              toast.success(
                `Payment successful! ${selectedPack.credits} report credit${selectedPack.credits > 1 ? "s" : ""} added.`
              )
              onClose()
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
      console.error("Failed to create Razorpay order for reports:", orderErr)
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-[#12131c] border border-white/10 text-white p-5 sm:p-7 space-y-5 rounded-2xl shadow-2xl">
        <DialogHeader className="space-y-1.5 text-left">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-mlh-plum/20 border border-mlh-plum/40 flex items-center justify-center text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <DialogTitle className="text-xl sm:text-2xl font-serif font-medium tracking-tight text-white">
              Buy more reports
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-mlh-muted font-sans leading-relaxed">
            One-time purchase · never expires · unlock any report from the catalogue.
          </DialogDescription>
        </DialogHeader>

        {/* Promo Discount Applied Banner */}
        {couponCode && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span>{couponCode} applied — every price below is already discounted.</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoadingPacks && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <Skeleton className="h-4 w-32 bg-white/10" />
                <Skeleton className="h-6 w-24 bg-white/10" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoadingPacks && packsError && (
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-5 text-center flex flex-col items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <p className="text-xs text-white/70">{packsError}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={loadCatalog}
              className="mt-1 border-white/20 text-white hover:bg-white/10 flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </Button>
          </div>
        )}

        {/* Real Dynamic Report Packages */}
        {!isLoadingPacks && !packsError && (
          <div className="space-y-3 font-sans">
            {packs.map((pkg) => {
              const isSelected = selectedPackId === pkg.id
              const badge = getBadgeForPack(pkg)
              const perReport = Math.round(Number(pkg.offerPrice) / Number(pkg.credits || 1))

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackId(pkg.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex items-center justify-between gap-4 ${
                    isSelected
                      ? "bg-mlh-plum-950/40 border-amber-400 shadow-md ring-1 ring-amber-400/40"
                      : "bg-black/30 border-white/10 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {badge && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs">
                      {badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "border-amber-400 bg-amber-400 text-black"
                          : "border-white/30 bg-transparent"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {pkg.name}
                        </span>
                        <span className="text-xs font-mono text-mlh-muted">
                          · {pkg.credits} report{pkg.credits > 1 ? "s" : ""}
                        </span>
                      </div>
                      {pkg.credits > 1 && (
                        <div className="text-[11px] font-mono text-emerald-400 pt-0.5">
                          ₹{perReport.toLocaleString("en-IN")} per report
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base sm:text-lg font-mono font-bold text-white">
                      ₹{Number(pkg.offerPrice).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs font-mono text-mlh-faint line-through">
                      ₹{Number(pkg.originalPrice).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Trust Badges & Action CTA */}
        <div className="pt-2 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-mlh-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure payment · GST invoice · Instant credit</span>
          </div>

          <Button
            type="button"
            disabled={isInitiating || !selectedPack || isLoadingPacks}
            onClick={handleContinue}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isInitiating ? (
              <span>Connecting to Gateway...</span>
            ) : selectedPack ? (
              <>
                <span>
                  Continue with {selectedPack.credits} report{selectedPack.credits > 1 ? "s" : ""} · ₹
                  {Number(selectedPack.offerPrice).toLocaleString("en-IN")}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <span>Select a Package</span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

