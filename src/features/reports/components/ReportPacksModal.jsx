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
import { addReportQuota } from "@/features/vaani"
import RazorpayCheckoutModal from "@/components/common/RazorpayCheckoutModal"

export default function ReportPacksModal({ isOpen, onClose, onSelectPackage }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth || {})
  const [selectedPackId, setSelectedPackId] = useState("diamond")
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false)

  const selectedPack =
    REPORT_PACKAGES.find((p) => p.id === selectedPackId) || REPORT_PACKAGES[2]

  const handleContinue = () => {
    setIsRazorpayOpen(true)
  }

  const handleRazorpaySuccess = (paymentResponse) => {
    // 1. Credit report quota to Redux
    dispatch(addReportQuota(selectedPack.reportsCount))

    // 2. Persist to localStorage invoices
    try {
      const existingInvoices = JSON.parse(
        localStorage.getItem("astrotring_invoices") || "[]"
      )
      const newInvoice = {
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
        userName: user?.name || "Suraj Kumar",
        userEmail: user?.email || "suraj@astrotring.com",
      }
      localStorage.setItem(
        "astrotring_invoices",
        JSON.stringify([newInvoice, ...existingInvoices])
      )
    } catch (e) {
      console.error("Failed to store invoice:", e)
    }

    if (onSelectPackage) {
      onSelectPackage(selectedPack)
    }

    toast.success(
      `Payment of ₹${selectedPack.price.toLocaleString("en-IN")} successful! ${selectedPack.reportsCount} report credits added.`
    )
    setIsRazorpayOpen(false)
    onClose()
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
              onClick={handleContinue}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>
                Continue with {selectedPack.reportsCount} report{selectedPack.reportsCount > 1 ? "s" : ""} · ₹
                {selectedPack.price.toLocaleString("en-IN")}
              </span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Razorpay Standard Checkout Gateway Modal */}
      <RazorpayCheckoutModal
        isOpen={isRazorpayOpen}
        onClose={() => setIsRazorpayOpen(false)}
        orderData={{
          amount: selectedPack.price,
          pack: selectedPack,
          promo: "VAULT",
          billingState: "Delhi",
        }}
        onSuccess={handleRazorpaySuccess}
      />
    </>
  )
}
