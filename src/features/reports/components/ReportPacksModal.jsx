import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Check, ShieldCheck, Sparkles, Tag, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { REPORT_PACKAGES } from "@/features/reports/reportsData"
import { addReportQuota, setReportQuota } from "@/features/vaani"
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  recordPaymentFailure,
} from "@/features/billing/billingApi"
import { openRazorpayCheckout } from "@/lib/razorpay"

export default function ReportPacksModal({ isOpen, onClose, onSelectPackage }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth || {})
  const [selectedPackId, setSelectedPackId] = useState("diamond")
  const [isInitiating, setIsInitiating] = useState(false)

  const selectedPack =
    REPORT_PACKAGES.find((p) => p.id === selectedPackId) || REPORT_PACKAGES[2]

  const handleContinue = async () => {
    setIsInitiating(true)

    try {
      const orderRes = await createRazorpayOrder({
        packId: selectedPack.id,
        itemType: "report_pack",
        currency: "INR",
        couponCode: "VAULT",
        billingState: "Delhi",
      })

      const backendKeyId = orderRes.keyId || orderRes.data?.keyId
      const backendOrderId = orderRes.orderId || orderRes.data?.orderId
      const amountSubunits = orderRes.amountSubunits || orderRes.data?.amountSubunits
      const finalAmount = orderRes.amount || orderRes.data?.amount || selectedPack.price

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
        currency: orderRes.currency || orderRes.data?.currency || "INR",
        name: "AstroTring",
        description: `${selectedPack.name} Pack (${selectedPack.reportsCount} reports)`,
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
            } else {
              dispatch(addReportQuota(selectedPack.reportsCount))
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
                itemTitle: `${selectedPack.name} Pack (${selectedPack.reportsCount} reports)`,
                subtotal: selectedPack.originalPrice,
                discount: selectedPack.originalPrice - selectedPack.price,
                couponCode: "VAULT",
                taxAmount: Math.round((selectedPack.price * 18) / 118),
                total: selectedPack.price,
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
              `Payment successful! ${selectedPack.reportsCount} report credits added.`
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
    <>
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
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs font-mono text-amber-300">
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span>VAULT applied — every price below is already discounted.</span>
          </div>

          {/* 3 Report Packages */}
          <div className="space-y-3 font-sans">
            {REPORT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackId === pkg.id
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
                  {/* Badge if present */}
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3.5">
                    {/* Custom Radio Circle */}
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
                          · {pkg.reportsCount} report{pkg.reportsCount > 1 ? "s" : ""}
                        </span>
                      </div>
                      {pkg.perReportText && (
                        <div className="text-[11px] font-mono text-emerald-400 pt-0.5">
                          {pkg.perReportText}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-mono font-bold text-white">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs font-mono text-mlh-faint line-through">
                      ₹{pkg.originalPrice.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Trust Badges & Action CTA */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono text-mlh-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Secure payment · GST invoice · Instant credit</span>
            </div>

            <Button
              type="button"
              disabled={isInitiating}
              onClick={handleContinue}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isInitiating ? (
                <span>Connecting to Gateway...</span>
              ) : (
                <>
                  <span>
                    Continue with {selectedPack.reportsCount} report{selectedPack.reportsCount > 1 ? "s" : ""} · ₹
                    {selectedPack.price.toLocaleString("en-IN")}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </>
  )
}
