import { useState, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Sparkles, BookOpen, ArrowUp, ChevronDown, ThumbsUp, ThumbsDown, Plus } from "lucide-react"
import {
  addConversation,
  clearActiveConversation,
  updateConversationFeedback,
  startGenerating,
  setThinkingStep,
  stopGenerating,
} from "../vaaniSlice"
import { streamChatTurn, submitMessageFeedback } from "../vaaniApi"
import { toast } from "sonner"

// Formats seconds into MM:SS left
function formatCountdown(secs) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s} left`
}

// Renders markdown bolding and bullet points faithfully
function renderParagraph(text, isVaani) {
  if (!text) return null
  const lines = text.split("\n")
  return (
    <div className="space-y-2">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim()
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          const bulletContent = trimmed.replace(/^[•\-]\s*/, "")
          const match = bulletContent.match(/^\*\*(.*?)\*\*(.*)/)
          if (match) {
            return (
              <div key={lIdx} className="flex items-start gap-2 pl-1">
                <span className={`text-[13px] pt-1 leading-none ${isVaani ? "text-mlh-plum-300" : "text-amber-400"}`}>
                  •
                </span>
                <p className="flex-1">
                  <span className={`font-semibold ${isVaani ? "text-mlh-plum-100" : "text-amber-200"}`}>
                    {match[1]}
                  </span>
                  <span className="text-white/85">{match[2]}</span>
                </p>
              </div>
            )
          }
          return (
            <div key={lIdx} className="flex items-start gap-2 pl-1">
              <span className={`text-[13px] pt-1 leading-none ${isVaani ? "text-mlh-plum-300" : "text-amber-400"}`}>
                •
              </span>
              <p className="flex-1 text-white/85">{bulletContent}</p>
            </div>
          )
        }

        const parts = line.split(/(\*\*.*?\*\*)/g)
        return (
          <p key={lIdx}>
            {parts.map((part, pIdx) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pIdx} className="font-semibold text-white">
                    {part.slice(2, -2)}
                  </strong>
                )
              }
              return part
            })}
          </p>
        )
      })}
    </div>
  )
}

export default function VaaniChatConversation({ onOpenBuyModal }) {
  const dispatch = useDispatch()
  const {
    conversations = [],
    activeConversationId,
    activeThreadId,
    isGenerating,
    thinkingStep,
    thinkingSteps = [],
    pendingQuestion,
    pendingEngine,
    questionQuota,
  } = useSelector((state) => state.vaani || {})
  const { user, birthDetails } = useSelector((state) => state.auth || {})

  const activeQuestionQuota =
    typeof questionQuota === "number"
      ? questionQuota
      : typeof user?.creditBalance === "number"
      ? user.creditBalance
      : typeof user?.credit_balance === "number"
      ? user.credit_balance
      : 0

  // 1. Identify the current active thread ID
  const currentThreadId =
    activeThreadId ||
    (activeConversationId
      ? conversations.find(
          (c) => c.id === activeConversationId || c.threadId === activeConversationId
        )?.threadId || activeConversationId
      : null)

  // 2. Filter readings that belong to this thread or active conversation
  const threadReadings = currentThreadId
    ? conversations.filter(
        (c) => c.threadId === currentThreadId || c.id === currentThreadId
      )
    : conversations.filter((c) => c.id === activeConversationId)

  // 3. Sort chronologically (oldest first) so user reads downwards naturally
  const displayReadings = [...threadReadings].sort((a, b) => {
    const timeA = new Date(a.createdAt || 0).getTime()
    const timeB = new Date(b.createdAt || 0).getTime()
    return timeA - timeB
  })

  // 4. Latest reading in the active thread
  const latestReading =
    displayReadings.length > 0 ? displayReadings[displayReadings.length - 1] : null

  const isVaani = (latestReading?.engine || pendingEngine || "vaani") === "vaani"

  const [followUpQuery, setFollowUpQuery] = useState("")
  const [inFlightQuery, setInFlightQuery] = useState("")
  const [expandedAstrologyMap, setExpandedAstrologyMap] = useState({})
  const [countdownSeconds, setCountdownSeconds] = useState(582)
  const scrollAreaRef = useRef(null)

  const toggleExpandedAstrology = (id) => {
    setExpandedAstrologyMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Countdown timer for promotional offer banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll inside message list when readings update or generator thinking step changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [displayReadings.length, isGenerating, thinkingStep, thinkingSteps])

  const handleSendFollowUp = (queryToSend) => {
    const text = (queryToSend || followUpQuery).trim()
    if (!text || isGenerating) return

    const currentEngine = latestReading?.engine || pendingEngine || "vaani"

    if (currentEngine === "vaani") {
      if (activeQuestionQuota <= 0) {
        toast.error("Your question balance is empty. Top up to consult Vaani.")
        if (onOpenBuyModal) {
          onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
        }
        return
      }
    }

    setInFlightQuery(text)
    setFollowUpQuery("")

    const initialStep =
      currentEngine === "vaani"
        ? "Reviewing your core birth profile and selecting chart tools..."
        : "Searching Brihat Parashara Hora Shastra & classical treatises..."

    dispatch(
      startGenerating({
        step: initialStep,
        query: text,
        engine: currentEngine,
      })
    )

    // Call real backend SSE streaming endpoint
    streamChatTurn({
      engine: currentEngine,
      query: text,
      threadId: currentThreadId || latestReading?.threadId,
      chartId: birthDetails?.chartId,
      onThinking: (step) => {
        dispatch(setThinkingStep(step))
      },
      onDone: (data) => {
        setInFlightQuery("")
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
        setInFlightQuery("")
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

  const handleFeedback = (readingId, feedbackType) => {
    if (readingId) {
      dispatch(updateConversationFeedback({ id: readingId, feedback: feedbackType }))
      dispatch(submitMessageFeedback({ messageId: readingId, feedback: feedbackType }))
    }
  }

  // If there are no readings in this thread and nothing in progress, return null so home page shows hero input
  if (displayReadings.length === 0 && !isGenerating && !inFlightQuery && !pendingQuestion) {
    return null
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden px-4 sm:px-8 lg:px-10">
      {/* Melooha Monospace Breadcrumb Header */}
      <div className="text-white/40 mlh-in relative z-10 flex flex-none items-center justify-between pt-4 font-mono text-[9px] sm:text-[10px] tracking-[0.22em] uppercase">
        <div className="flex items-center gap-1.5">
          <span>AstroTring</span>
          <span>/</span>
          <span className={isVaani ? "text-mlh-plum-300/85" : "text-amber-400/90"}>
            {isVaani ? "Ask Vaani" : "Ask Astropedia"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearActiveConversation())}
          className="flex items-center gap-1 text-[9px] font-mono tracking-wider text-mlh-muted hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>New Reading</span>
        </button>
      </div>

      {/* Main Conversation Container (Scrollable message area) */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center pt-3.5">
        <div
          ref={scrollAreaRef}
          className="flex w-full max-w-[900px] flex-1 flex-col gap-[30px] overflow-x-hidden overflow-y-auto pr-1 pb-2 mlh-thin-scroll"
        >
          {/* Render All Completed Turns for this Thread */}
          {displayReadings.map((reading, rIdx) => {
            const isLastReading = rIdx === displayReadings.length - 1
            const readingIsVaani = (reading.engine || "vaani") === "vaani"
            const isExpanded = Boolean(expandedAstrologyMap[reading.id || rIdx])

            return (
              <div key={reading.id || rIdx} className="flex flex-col gap-[30px]">
                {/* User Question Speech Bubble (Aligned to the Right) */}
                {reading.question && (
                  <div className="animate-mlh-rise flex max-w-[700px] flex-col items-end self-end">
                    <span className="text-white/35 mb-2.5 font-mono text-[9.5px] tracking-[0.2em] uppercase">
                      You
                    </span>
                    <div
                      className={`rounded-[18px_18px_4px_18px] border px-[18px] py-3 font-sans text-[15.5px] sm:text-[18px] leading-[1.4] text-pretty shadow-[0_10px_30px_rgba(0,0,0,.35)] ${
                        readingIsVaani
                          ? "border-mlh-plum-400/32 bg-gradient-to-br from-[#811756]/25 to-[#4d0e34]/15 text-white/95"
                          : "border-amber-500/35 bg-gradient-to-br from-[#df8107]/25 to-[#92400e]/15 text-white/95"
                      }`}
                    >
                      {reading.question}
                    </div>
                  </div>
                )}

                {/* Engine Reading Bubble (Open consult scroll with Left Accent Border) */}
                <div
                  className={`animate-mlh-rise max-w-[840px] border-l pl-4 sm:pl-[22px] ${
                    readingIsVaani ? "border-mlh-plum-400/28" : "border-amber-500/30"
                  }`}
                >
                  {/* Engine Header */}
                  <div className="mb-2.5 flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`relative grid h-[26px] w-[26px] flex-none place-items-center rounded-[9px] border ${
                        readingIsVaani
                          ? "border-mlh-plum-400/45 text-mlh-plum-300 shadow-[0_0_14px_rgba(154,69,120,.3)] bg-[radial-gradient(circle_at_35%_28%,rgba(154,69,120,0.42),rgba(154,69,120,0.08))]"
                          : "border-amber-500/45 text-amber-300 shadow-[0_0_14px_rgba(223,129,7,.3)] bg-[radial-gradient(circle_at_35%_28%,rgba(223,129,7,0.42),rgba(223,129,7,0.08))]"
                      }`}
                    >
                      {readingIsVaani ? (
                        <Sparkles className="w-3.5 h-3.5 text-mlh-plum-300" />
                      ) : (
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      )}
                    </span>
                    <span
                      className={`font-mono text-[9px] tracking-[0.2em] uppercase sm:text-[9.5px] ${
                        readingIsVaani ? "text-mlh-plum-300/85" : "text-amber-400/90"
                      }`}
                    >
                      {readingIsVaani
                        ? "Vaani · reading from your birth chart"
                        : "Vaani · Astropedia"}
                    </span>
                  </div>

                  {/* Content Body */}
                  <div className="min-w-0 flex-1">
                    {/* Consulted Vedic Tools Badges */}
                    {reading.thinkingSteps && reading.thinkingSteps.length > 0 && (
                      <div className="mb-3.5 flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                          Tools Consulted:
                        </span>
                        {reading.thinkingSteps.map((toolBadge, tbIdx) => (
                          <span
                            key={tbIdx}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-wide ${
                              readingIsVaani
                                ? "border-mlh-plum-400/25 bg-mlh-plum-500/8 text-mlh-plum-200/90"
                                : "border-amber-500/25 bg-amber-500/8 text-amber-200/90"
                            }`}
                          >
                            <span className="text-emerald-400/90 text-[9px]">✦</span>
                            <span>{toolBadge}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Opening Thought Note */}
                    {reading.openingThought && (
                      <p className="mb-4 text-white/86 font-sans text-[17px] leading-[1.6] sm:text-[20px]">
                        {reading.openingThought}
                      </p>
                    )}

                    {/* Reading Paragraphs */}
                    <div className="text-white/86 font-sans text-[17px] leading-[1.6] text-pretty sm:text-[20px]">
                      {reading.paragraphs?.map((p, idx) => (
                        <div key={idx} className="mb-4 last:mb-0">
                          {renderParagraph(p, readingIsVaani)}
                        </div>
                      ))}
                    </div>

                    {/* Promotional Offer Banner (Melooha Ref 15 exact structure, shown on latest reading) */}
                    {readingIsVaani && isLastReading && (reading.offer || activeQuestionQuota <= 0) && (
                      <div className="border-amber-500/20 bg-gradient-to-b from-[#24131b]/60 to-[#120a10]/80 relative mt-4 overflow-hidden rounded-[16px] border p-4 sm:p-5 shadow-lg">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                          <div className="text-amber-300/85 flex items-center gap-2 font-mono text-[9px] tracking-[0.22em] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Offer
                          </div>
                          <span className="border-amber-500/35 bg-amber-500/12 text-amber-300 rounded-md border px-2 py-[2px] font-mono text-[9px] tracking-[0.14em] whitespace-nowrap uppercase">
                            {countdownSeconds > 0 ? formatCountdown(countdownSeconds) : "Offer ended"}
                          </span>
                        </div>

                        <h3 className="text-white mt-2.5 font-serif text-[21px] leading-[1.15] sm:text-[24px]">
                          {reading.offer?.title || "Special Offer: 12 Questions Pack"}
                        </h3>
                        <p className="text-white/70 mt-1.5 max-w-[62ch] text-[13px] leading-snug sm:text-[13.5px]">
                          {reading.offer?.description ||
                            "Your question balance is ZERO. Top up with Gold Pack using promo code: QUICKGOLD"}
                        </p>

                        <div className="border-amber-500/15 mt-3.5 border-t pt-3.5">
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 justify-between">
                            <div className="text-white/40 font-mono text-[9px] tracking-[0.16em] uppercase">
                              Code {reading.offer?.promoCode || "QUICKGOLD"}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                onOpenBuyModal &&
                                onOpenBuyModal({
                                  promoCode: reading.offer?.promoCode || "QUICKGOLD",
                                  packId: "pack_gold_12",
                                })
                              }
                              className="from-[#feb371] to-[#df8107] text-[#0f090c] shrink-0 rounded-full bg-gradient-to-b px-5 py-2.5 text-[13.5px] font-semibold shadow-[0_0_26px_rgba(223,129,7,.26)] transition-all duration-200 hover:shadow-[0_0_34px_rgba(223,129,7,.42)] hover:brightness-110 cursor-pointer"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* The Astrology Behind This (Collapsible Citations Drawer) */}
                    {reading.astrologyBehind && reading.astrologyBehind.length > 0 && (
                      <div className="mt-4">
                        <div className="flex flex-wrap gap-2.5">
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            onClick={() => toggleExpandedAstrology(reading.id || rIdx)}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2 font-sans text-[15px] sm:text-[16px] transition-[color,background-color,border-color] duration-200 ${
                              readingIsVaani
                                ? "border-mlh-plum-400/28 bg-mlh-plum-500/8 text-white/75 hover:border-mlh-plum-400/52 hover:text-white"
                                : "border-amber-500/28 bg-amber-500/8 text-white/75 hover:border-amber-500/52 hover:text-white"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`text-[12px] leading-none ${
                                readingIsVaani ? "text-mlh-plum-300" : "text-amber-400"
                              }`}
                            >
                              ✦
                            </span>
                            <span>
                              {readingIsVaani ? "The astrology behind this" : "Classical references & citations"}
                            </span>
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        </div>

                        {isExpanded && (
                          <div
                            className={`mt-3 overflow-hidden rounded-2xl border p-5 sm:px-[22px] ${
                              readingIsVaani
                                ? "border-mlh-plum-400/22 bg-mlh-plum-500/6"
                                : "border-amber-500/22 bg-amber-500/6"
                            }`}
                          >
                            <div
                              className={`font-mono text-[9.5px] tracking-[0.22em] uppercase ${
                                readingIsVaani ? "text-mlh-plum-300/85" : "text-amber-400/85"
                              }`}
                            >
                              {readingIsVaani ? "What I read from your chart" : "Citations & Classical Treatises"}
                            </div>
                            <div className="mt-3.5 space-y-2.5 font-sans text-[15px] sm:text-[16px] leading-relaxed">
                              {reading.astrologyBehind.map((item, aIdx) => {
                                const match = item.match(/^(\d+\)\s*[^:]+:)(.*)$/)
                                if (match) {
                                  return (
                                    <div key={aIdx} className="flex items-start gap-2 text-white/85">
                                      <span className={`font-semibold shrink-0 ${readingIsVaani ? "text-mlh-plum-200" : "text-amber-200"}`}>
                                        {match[1]}
                                      </span>
                                      <span className="text-white/75">{match[2]}</span>
                                    </div>
                                  )
                                }
                                return (
                                  <div key={aIdx} className="text-white/80">
                                    {item}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Feedback Buttons */}
                    <div className="mt-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-white/45 mr-1 font-mono text-[9px] tracking-[0.2em] uppercase">
                          Was this useful
                        </span>
                        <button
                          type="button"
                          aria-label="Yes"
                          onClick={() => handleFeedback(reading.id, "yes")}
                          className={`grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border transition-colors ${
                            reading.feedback === "yes"
                              ? "border-emerald-500/80 bg-emerald-500/20 text-emerald-300"
                              : readingIsVaani
                              ? "border-mlh-plum-400/40 bg-mlh-plum-500/8 text-white/65 hover:border-mlh-plum-400/70 hover:text-white"
                              : "border-amber-500/40 bg-amber-500/8 text-white/65 hover:border-amber-500/70 hover:text-white"
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          aria-label="No"
                          onClick={() => handleFeedback(reading.id, "no")}
                          className={`grid h-[30px] w-[30px] cursor-pointer place-items-center rounded-lg border transition-colors ${
                            reading.feedback === "no"
                              ? "border-rose-500/80 bg-rose-500/20 text-rose-300"
                              : readingIsVaani
                              ? "border-mlh-plum-400/40 bg-mlh-plum-500/8 text-white/65 hover:border-mlh-plum-400/70 hover:text-white"
                              : "border-amber-500/40 bg-amber-500/8 text-white/65 hover:border-amber-500/70 hover:text-white"
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Suggested Questions Grid (shown on latest reading) */}
                    {isLastReading && reading.suggestedQuestions && reading.suggestedQuestions.length > 0 && (
                      <div
                        className={`mt-[22px] border-t pt-[18px] ${
                          readingIsVaani ? "border-mlh-plum-400/18" : "border-amber-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`font-mono text-[9.5px] tracking-[0.22em] uppercase ${
                              readingIsVaani ? "text-mlh-plum-300/85" : "text-amber-400/85"
                            }`}
                          >
                            {readingIsVaani ? "Suggested Follow-ups & Questions" : "Keep exploring"}
                          </div>
                          <span className="font-mono text-[9px] text-white/35 uppercase tracking-wider hidden sm:inline">
                            Click to ask instantly
                          </span>
                        </div>
                        <div className="mt-3.5 grid gap-2.5 sm:grid-cols-2">
                          {reading.suggestedQuestions.map((q, qIdx) => (
                            <button
                              key={qIdx}
                              type="button"
                              onClick={() => handleSendFollowUp(q)}
                              className={`group flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 text-left font-sans text-[15px] sm:text-[16px] transition-[color,background-color,border-color,transform,box-shadow] duration-200 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(0,0,0,.35)] ${
                                readingIsVaani
                                  ? "border-white/15 bg-mlh-plum-500/[.05] text-white/75 hover:border-mlh-plum-400/60 hover:bg-mlh-plum-500/14 hover:text-white"
                                  : "border-white/15 bg-amber-500/[.05] text-white/75 hover:border-amber-500/60 hover:bg-amber-500/14 hover:text-white"
                              }`}
                            >
                              <span className="flex-1">{q}</span>
                              <span
                                aria-hidden="true"
                                className={`ml-auto pl-1 font-mono text-[11px] transition-transform duration-200 group-hover:translate-x-0.5 ${
                                  readingIsVaani ? "text-mlh-plum-300/70" : "text-amber-300/70"
                                }`}
                              >
                                →
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* Active Generating Turn (if isGenerating) */}
          {isGenerating && (
            <div className="flex flex-col gap-[30px]">
              {(inFlightQuery || pendingQuestion) && (
                <div className="animate-mlh-rise flex max-w-[700px] flex-col items-end self-end">
                  <span className="text-white/35 mb-2.5 font-mono text-[9.5px] tracking-[0.2em] uppercase">
                    You
                  </span>
                  <div
                    className={`rounded-[18px_18px_4px_18px] border px-[18px] py-3 font-sans text-[15.5px] sm:text-[18px] leading-[1.4] text-pretty shadow-[0_10px_30px_rgba(0,0,0,.35)] ${
                      isVaani
                        ? "border-mlh-plum-400/32 bg-gradient-to-br from-[#811756]/25 to-[#4d0e34]/15 text-white/95"
                        : "border-amber-500/35 bg-gradient-to-br from-[#df8107]/25 to-[#92400e]/15 text-white/95"
                    }`}
                  >
                    {inFlightQuery || pendingQuestion}
                  </div>
                </div>
              )}

              <div
                className={`animate-mlh-rise max-w-[840px] border-l pl-4 sm:pl-[22px] ${
                  isVaani ? "border-mlh-plum-400/28" : "border-amber-500/30"
                }`}
              >
                <div className="mb-2.5 flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className={`relative grid h-[26px] w-[26px] flex-none place-items-center rounded-[9px] border ${
                      isVaani
                        ? "border-mlh-plum-400/45 text-mlh-plum-300 shadow-[0_0_14px_rgba(154,69,120,.3)] bg-[radial-gradient(circle_at_35%_28%,rgba(154,69,120,0.42),rgba(154,69,120,0.08))]"
                        : "border-amber-500/45 text-amber-300 shadow-[0_0_14px_rgba(223,129,7,.3)] bg-[radial-gradient(circle_at_35%_28%,rgba(223,129,7,0.42),rgba(223,129,7,0.08))]"
                    }`}
                  >
                    {isVaani ? (
                      <Sparkles className="w-3.5 h-3.5 text-mlh-plum-300" />
                    ) : (
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    )}
                  </span>
                  <span
                    className={`font-mono text-[9px] tracking-[0.2em] uppercase sm:text-[9.5px] ${
                      isVaani ? "text-mlh-plum-300/85" : "text-amber-400/90"
                    }`}
                  >
                    {isVaani
                      ? "Vaani · reading from your birth chart"
                      : "Vaani · Astropedia"}
                  </span>
                </div>

                <div className="min-w-0 flex-1 py-3 space-y-3">
                  <div className="flex flex-col gap-2">
                    {thinkingSteps && thinkingSteps.length > 0 ? (
                      thinkingSteps.map((step, sIdx) => {
                        const isLatest = sIdx === thinkingSteps.length - 1
                        return (
                          <div
                            key={sIdx}
                            className={`flex items-center gap-2.5 rounded-full px-3.5 py-1.5 font-mono text-xs sm:text-[12.5px] tracking-wide transition-all ${
                              isLatest
                                ? isVaani
                                  ? "border border-mlh-plum-400/50 bg-mlh-plum-500/15 text-mlh-plum-200 shadow-[0_0_16px_rgba(154,69,120,0.25)] animate-pulse"
                                  : "border border-amber-500/50 bg-amber-500/15 text-amber-200 shadow-[0_0_16px_rgba(223,129,7,0.25)] animate-pulse"
                                : "border border-white/10 bg-white/[0.03] text-white/50"
                            }`}
                          >
                            {isLatest ? (
                              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300 shrink-0" />
                            ) : (
                              <span className="text-emerald-400 text-[11px] font-bold shrink-0">✓</span>
                            )}
                            <span className="truncate">{step}</span>
                          </div>
                        )
                      })
                    ) : (
                      <div
                        className={`flex items-center gap-2.5 font-mono text-xs sm:text-[13px] tracking-wide animate-pulse ${
                          isVaani ? "text-mlh-plum-200" : "text-amber-200"
                        }`}
                      >
                        <Sparkles className="w-4 h-4 animate-spin text-amber-300 shrink-0" />
                        <span>
                          {thinkingStep ||
                            (isVaani
                              ? "Reading your birth chart..."
                              : "Consulting classical Vedic texts...")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pinned Bottom Follow-Up Composer (Melooha exact structure) */}
        <div className="w-full max-w-[900px] flex-none pt-4 pb-4 sm:pb-5">
          <div>
            <div
              className={`relative overflow-hidden rounded-[22px] border transition-[border-color,box-shadow] duration-300 ${
                isVaani
                  ? "border-mlh-plum-400/40 focus-within:border-mlh-plum-400/80 shadow-[0_22px_60px_rgba(0,0,0,.65),0_0_34px_rgba(129,23,86,.32),inset_0_1px_0_rgba(255,255,255,.05)] focus-within:shadow-[0_22px_60px_rgba(0,0,0,.65),0_0_44px_rgba(129,23,86,.5),inset_0_1px_0_rgba(255,255,255,.06)] bg-[linear-gradient(rgba(129,23,86,0.1),rgba(15,9,12,0.94))]"
                  : "border-amber-500/40 focus-within:border-amber-500/80 shadow-[0_22px_60px_rgba(0,0,0,.65),0_0_34px_rgba(223,129,7,.24),inset_0_1px_0_rgba(255,255,255,.05)] focus-within:shadow-[0_22px_60px_rgba(0,0,0,.65),0_0_44px_rgba(223,129,7,.45),inset_0_1px_0_rgba(255,255,255,.06)] bg-[linear-gradient(rgba(223,129,7,0.1),rgba(15,9,12,0.94))]"
              }`}
            >
              <div className="relative flex gap-3.5 px-4 pt-4 sm:px-5 sm:pt-[18px]">
                <span
                  aria-hidden="true"
                  className={`shrink-0 pt-1 text-[16px] leading-none ${
                    isVaani ? "text-mlh-plum-300/85 animate-pulse" : "text-amber-400/85 animate-pulse"
                  }`}
                >
                  ✦
                </span>
                <textarea
                  rows={2}
                  value={followUpQuery}
                  onChange={(e) => setFollowUpQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isVaani
                      ? "Ask a follow-up: a date you are weighing, a decision, a what-if…"
                      : "Search another topic: a term, a yoga, a doṣa…"
                  }
                  className="text-white placeholder:text-white/45 min-h-[60px] min-w-0 flex-1 resize-none bg-transparent font-sans text-[17px] leading-[1.5] outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-[20px] caret-amber-400"
                  style={{ height: "60px" }}
                />
              </div>

              <div className="relative flex flex-wrap items-center gap-3 px-3 pt-3 pb-3 sm:gap-3.5 sm:px-3.5 sm:pt-3 sm:pb-3.5 sm:pl-5">
                <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
                  {isVaani && (
                    <div className="flex items-stretch overflow-hidden rounded-full border font-mono text-[10.5px] font-medium tracking-[0.14em] whitespace-nowrap uppercase border-amber-500/50 bg-amber-500/12 text-amber-300">
                      <span className="px-3.5 py-[7px]">
                        <span>{activeQuestionQuota}</span> {activeQuestionQuota === 1 ? "question" : "questions"} left
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onOpenBuyModal &&
                          onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
                        }
                        className="cursor-pointer border-l px-3.5 py-[7px] transition-colors duration-200 border-amber-500/40 bg-amber-500/20 text-amber-200 hover:bg-amber-500/32"
                      >
                        Buy more
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!followUpQuery.trim() || isGenerating}
                    onClick={() => handleSendFollowUp()}
                    aria-label="Send question"
                    className={`grid h-11 w-11 flex-none place-items-center rounded-full transition-all duration-200 sm:h-[46px] sm:w-[46px] cursor-pointer disabled:opacity-40 ${
                      isVaani
                        ? "text-white bg-[linear-gradient(160deg,#9a4578,#811756_62%,#6b0f47)] shadow-[0_0_24px_rgba(129,23,86,.6)] hover:shadow-[0_0_40px_rgba(129,23,86,1)] hover:-translate-y-0.5"
                        : "text-[#0f090c] bg-[linear-gradient(160deg,#feb371,#df8107_62%,#b45309)] shadow-[0_0_24px_rgba(223,129,7,.6)] hover:shadow-[0_0_40px_rgba(223,129,7,1)] hover:-translate-y-0.5"
                    }`}
                  >
                    <ArrowUp className="w-[19px] h-[19px] stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            <div className="text-white/25 mt-2.5 text-center font-mono text-[9px] tracking-[0.18em] uppercase">
              Enter to send · Shift + Enter for a new line
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
