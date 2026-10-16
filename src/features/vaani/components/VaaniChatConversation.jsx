import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import {
  Sparkles,
  BookOpen,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Clock,
  PlusCircle,
  Tag,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  addConversation,
  clearActiveConversation,
  updateConversationFeedback,
  startGenerating,
  setThinkingStep,
  stopGenerating,
} from "../vaaniSlice"
import { streamChatTurn, submitMessageFeedback } from "@/features/vaani/vaaniApi"
import { toast } from "sonner"

export default function VaaniChatConversation({ onOpenBuyModal }) {
  const dispatch = useDispatch()
  const { conversations, activeConversationId, isGenerating, thinkingStep, questionQuota } =
    useSelector((state) => state.vaani || {})
  const { user, birthDetails } = useSelector((state) => state.auth || {})

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0]

  const [followUpQuery, setFollowUpQuery] = useState("")
  const [expandedAstrology, setExpandedAstrology] = useState(true)
  const [countdownSeconds, setCountdownSeconds] = useState(582) // 09:42 initial
  const messagesEndRef = useRef(null)

  // Countdown timer for the in-chat promo card
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s} left`
  }

  // Scroll to bottom when conversation updates or generates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [activeConv, isGenerating])

  const handleSendFollowUp = (queryToSend) => {
    const text = (queryToSend || followUpQuery).trim()
    if (!text || isGenerating) return

    setFollowUpQuery("")
    const currentEngine = activeConv?.engine || "vaani"

    if (currentEngine === "vaani") {
      if (questionQuota <= 0) {
        if (onOpenBuyModal) {
          onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
        }
        return
      }
      dispatch(startGenerating("Reading your birth chart..."))
    } else {
      dispatch(startGenerating("Consulting classical Vedic texts..."))
    }

    // Call real backend SSE streaming endpoint
    streamChatTurn({
      engine: currentEngine,
      query: text,
      threadId: activeConv?.threadId,
      chartId: birthDetails?.chartId,
      onThinking: (step) => {
        dispatch(setThinkingStep(step))
      },
      onDone: (data) => {
        if (data?.reading) {
          dispatch(
            addConversation({
              ...data.reading,
              creditsRemaining: data.creditsRemaining,
            })
          )
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to consult astrology engine. Please try again.")
        dispatch(stopGenerating())
      },
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendFollowUp()
    }
  }

  const handleFeedback = (feedbackType) => {
    if (activeConv) {
      // 1. Optimistically update local feedback state
      dispatch(updateConversationFeedback({ id: activeConv.id, feedback: feedbackType }))
      // 2. Submit to backend API endpoint PATCH /api/v1/chat/messages/:messageId/feedback
      dispatch(submitMessageFeedback({ messageId: activeConv.id, feedback: feedbackType }))
    }
  }

  if (!activeConv && !isGenerating) {
    return null
  }

  const isVaani = (activeConv?.engine || "vaani") === "vaani"

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start min-h-screen px-4 py-4 sm:py-8 relative z-10 pb-36">
      {/* Top Header Bar & Breadcrumb */}
      <div className="w-full max-w-[760px] flex items-center justify-between py-3 mb-4 border-b border-[#252637]/70 text-xs text-mlh-muted font-sans">
        <div className="flex items-center gap-2">
          <span>AstroTring</span>
          <span>/</span>
          <span className="text-white font-medium flex items-center gap-1.5">
            {isVaani ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Ask Vaani
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5 text-mlh-orrery" />
                Ask Astropedia
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearActiveConversation())}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-white/90 hover:text-white transition-colors cursor-pointer text-xs font-mono"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Reading</span>
        </button>
      </div>

      {/* Main Conversation Container */}
      <div className="w-full max-w-[760px] space-y-6">
        {/* User Question Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-[#2e3045] bg-[#12131c]/80 p-4 sm:p-5 backdrop-blur-md space-y-2 shadow-xs"
        >
          <div className="text-xs font-mono font-semibold tracking-wider text-mlh-muted uppercase">
            You
          </div>
          <p className="text-sm sm:text-base text-white/95 leading-relaxed font-sans font-medium whitespace-pre-wrap">
            {activeConv?.question}
          </p>
        </motion.div>

        {/* AI Astrologer Response Bubble */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-[#2e3045] bg-[#12131c]/95 p-5 sm:p-7 backdrop-blur-md space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#252637]">
            <div className="flex items-center gap-2">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isVaani
                    ? "bg-mlh-plum/20 border border-mlh-plum/40 text-amber-300"
                    : "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                }`}
              >
                {isVaani ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <BookOpen className="w-3.5 h-3.5" />
                )}
              </span>
              <span className="text-xs sm:text-[13px] font-sans font-semibold text-white/90 tracking-wide">
                {isVaani
                  ? "Vaani · reading from your birth chart"
                  : "Astropedia · Universal Vedic Astrology Encyclopedia"}
              </span>
            </div>
          </div>

          {/* Progressive Thought / Thinking Indicator */}
          {isGenerating ? (
            <div className="p-4 rounded-xl bg-mlh-plum-950/40 border border-mlh-plum-800/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-mlh-plum-200 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>{thinkingStep || "Consulting cosmic calculations..."}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Opening Thought Note */}
              {activeConv?.openingThought && (
                <div className="p-3.5 rounded-xl bg-[#1b1522] border border-mlh-plum-800/30 text-xs sm:text-[13px] text-mlh-plum-100 font-sans italic leading-relaxed">
                  {activeConv.openingThought}
                </div>
              )}

              {/* Status stream pills */}
              {activeConv?.thinkingSteps && activeConv.thinkingSteps.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {activeConv.thinkingSteps.map((step, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      {step}
                    </span>
                  ))}
                </div>
              )}

              {/* Main Reading Paragraphs */}
              <div className="space-y-4 text-sm sm:text-[15px] text-white/90 font-sans leading-[1.7] tracking-[0.01em]">
                {activeConv?.paragraphs?.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              {/* In-Chat Promotional Offer Card (Only shown for Vaani when offer is available) */}
              {isVaani && activeConv?.offer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#2a1728] via-[#1b1122] to-[#140b19] p-5 sm:p-6 space-y-3 relative overflow-hidden shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold tracking-wider bg-amber-400 text-black uppercase">
                      OFFER
                    </span>
                    <span className="flex items-center gap-1 text-xs font-mono text-amber-300 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {formatCountdown(countdownSeconds)}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-medium text-white tracking-tight">
                    {activeConv.offer.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-white/80 font-sans leading-relaxed">
                    {activeConv.offer.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/30 bg-black/40 text-xs font-mono text-amber-200">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Code {activeConv.offer.promoCode}</span>
                    </div>

                    <Button
                      type="button"
                      onClick={() =>
                        onOpenBuyModal &&
                        onOpenBuyModal({ promoCode: activeConv.offer.promoCode })
                      }
                      className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                    >
                      Buy Now · {activeConv.offer.discountedPrice}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* The Astrology Behind This (Collapsible Citations) */}
              {activeConv?.astrologyBehind && activeConv.astrologyBehind.length > 0 && (
                <div className="pt-2 border-t border-[#252637]">
                  <button
                    type="button"
                    onClick={() => setExpandedAstrology(!expandedAstrology)}
                    className="w-full flex items-center justify-between py-2.5 text-xs sm:text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className={isVaani ? "text-amber-400" : "text-blue-400"}>✦</span>
                      <span>
                        {isVaani ? "The astrology behind this" : "Classical references & principles"}
                      </span>
                    </span>
                    {expandedAstrology ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <AnimatePresence>
                    {expandedAstrology && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 pt-2"
                      >
                        <div className="text-xs font-mono text-mlh-muted uppercase tracking-wider">
                          {isVaani ? "What I read from your chart" : "Citations from classical Vedic treatises"}
                        </div>
                        <ul className="space-y-2 text-xs sm:text-[13px] text-white/80 font-sans leading-relaxed">
                          {activeConv.astrologyBehind.map((rule, idx) => (
                            <li
                              key={idx}
                              className="p-2.5 rounded-xl bg-white/5 border border-white/5"
                            >
                              {rule}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Was This Useful? (Feedback) */}
              <div className="flex items-center justify-between pt-4 border-t border-[#252637] text-xs font-sans">
                <span className="text-mlh-muted">Was this useful?</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleFeedback("yes")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                      activeConv?.feedback === "yes"
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                        : "border-[#2e3045] bg-[#12131c] text-mlh-muted hover:text-white"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedback("no")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                      activeConv?.feedback === "no"
                        ? "bg-rose-950/60 border-rose-500 text-rose-300"
                        : "border-[#2e3045] bg-[#12131c] text-mlh-muted hover:text-white"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>No</span>
                  </button>
                </div>
              </div>

              {/* Ask Next Suggestion Chips */}
              {activeConv?.suggestedQuestions && activeConv.suggestedQuestions.length > 0 && (
                <div className="pt-4 border-t border-[#252637] space-y-3">
                  <div className="text-xs font-mono text-mlh-muted uppercase tracking-wider">
                    Ask next
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeConv.suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendFollowUp(q)}
                        className="p-3 rounded-xl border border-[#252637] bg-[#1a1b26]/70 hover:bg-[#252737] hover:border-mlh-plum/50 text-left transition-all cursor-pointer group flex items-center justify-between gap-2"
                      >
                        <span className="text-xs sm:text-[13px] text-white/85 group-hover:text-white font-medium">
                          {q}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-mlh-plum-300 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </motion.div>
      </div>

      {/* Floating Sticky Bottom Follow-Up Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 p-4 bg-gradient-to-t from-[#0c070a] via-[#0c070a]/95 to-transparent pointer-events-none flex justify-center">
        <div className="w-full max-w-[760px] pointer-events-auto space-y-2">
          <div className="rounded-2xl border border-[#2e3045] bg-[#12131c]/95 backdrop-blur-xl p-3 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.8)] space-y-2.5 hover:border-mlh-plum/50 focus-within:border-mlh-plum transition-all">
            <div className="flex items-start gap-2.5">
              <span className={`mt-1 select-none ${isVaani ? "text-amber-400" : "text-blue-400"}`}>
                {isVaani ? "✦" : "📖"}
              </span>
              <Textarea
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isVaani
                    ? "Ask a follow-up: a date you are weighing, a decision, a what-if…"
                    : "Ask an encyclopedia follow-up: planetary aspects, Sanskrit yogas, remedies…"
                }
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-white placeholder:text-mlh-muted text-xs sm:text-sm resize-none min-h-[46px] p-0 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#252637]/60">
              {/* Question Balance Indicator / Free Knowledge Badge */}
              {isVaani ? (
                <div
                  className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-xs transition-all shadow-xs ${
                    questionQuota > 0
                      ? "bg-[#18101e]/90 border border-[#3d2449]"
                      : "bg-[#231206]/90 border border-amber-900/60"
                  }`}
                >
                  <span
                    className={`text-xs font-sans tracking-wide ${
                      questionQuota > 0 ? "text-neutral-300" : "text-amber-200/90"
                    }`}
                  >
                    <strong
                      className={`font-mono font-semibold ${
                        questionQuota > 0 ? "text-white" : "text-amber-300"
                      }`}
                    >
                      {questionQuota}
                    </strong>{" "}
                    {questionQuota === 1 ? "question" : "questions"} left
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenBuyModal &&
                      onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
                    }
                    className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer shadow-xs active:scale-95 ${
                      questionQuota > 0
                        ? "bg-[#82184d] hover:bg-[#9d1c5d] text-white border border-[#c43282]/30 hover:border-[#e04599]/50 shadow-[0_2px_8px_rgba(130,24,77,0.35)]"
                        : "bg-gradient-to-r from-[#92400e] to-[#b45309] hover:from-[#a14710] hover:to-[#c65d0b] text-amber-100 border border-amber-500/30 shadow-[0_2px_8px_rgba(180,83,9,0.35)]"
                    }`}
                  >
                    Buy more
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
                  <BookOpen className="w-3 h-3 text-blue-400" />
                  <span>Free knowledge · Unlimited</span>
                </div>
              )}

              {/* Send Button */}
              <Button
                type="button"
                size="icon"
                disabled={!followUpQuery.trim() || isGenerating}
                onClick={() => handleSendFollowUp()}
                aria-label="Send question"
                className={`w-8 h-8 rounded-full text-white shrink-0 shadow-md cursor-pointer disabled:opacity-40 transition-all ${
                  isVaani
                    ? "bg-gradient-to-br from-mlh-plum-500 to-mlh-plum hover:from-mlh-plum hover:to-mlh-plum-800"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/30"
                }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </Button>
            </div>
          </div>

          <div className="text-center text-[10.5px] font-mono text-mlh-faint">
            Enter to send · Shift + Enter for a new line
          </div>
        </div>
      </div>
    </div>
  )
}
