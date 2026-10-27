import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Sparkles, BookOpen, ArrowUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { openAuthModal } from "@/features/auth/authSlice"
import { startGenerating, setThinkingStep, stopGenerating, addConversation } from "@/features/jyotish/jyotishSlice"
import { streamChatTurn } from "@/features/jyotish/jyotishApi"
import { toast } from "sonner"

// Exact Melooha 4 Prompts for Personal Jyotish
const JYOTISH_PROMPTS = [
  "What is Saturn doing to my chart right now?",
  "Which gemstone suits my chart, if any?",
  "What is my lagna and what does it say about me?",
  "Which yogas are present in my chart?",
]

// Exact Melooha 4 Prompts for Shastra
const SHASTRA_PROMPTS = [
  "What is Kaal Sarp dosha and how seriously should it be taken?",
  "What does Moon in 7th house mean for marriage and public life?",
  "What is a muhurta and how is an auspicious time chosen?",
  "What does the twelfth house govern in Vedic astrology?",
]

export default function HeroChatInput({ onOpenBindModal, onOpenBuyModal }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const engineParam = searchParams.get("engine")
  const queryParam = searchParams.get("q")

  const [query, setQuery] = useState(queryParam || "")
  const [engine, setEngine] = useState(
    engineParam === "shastra" ? "shastra" : "jyotish"
  )
  const dispatch = useDispatch()
  const { isAuthenticated, user, birthDetails } = useSelector((state) => state.auth || {})
  const { questionQuota, isGenerating } = useSelector((state) => state.jyotish || {})

  const activeQuestionQuota =
    typeof questionQuota === "number"
      ? questionQuota
      : typeof user?.creditBalance === "number"
      ? user.creditBalance
      : typeof user?.credit_balance === "number"
      ? user.credit_balance
      : 0

  // Keep engine state and query state in sync if URL query param changes
  useEffect(() => {
    if (engineParam === "shastra" || engineParam === "jyotish") {
      setEngine(engineParam)
      setQuery("")
    }
  }, [engineParam])

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam)
    }
  }, [queryParam])

  const handleSelectEngine = (newEngine) => {
    setEngine(newEngine)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("engine", newEngine)
    setSearchParams(nextParams)
  }

  const handleBuyQuestions = () => {
    if (onOpenBuyModal) {
      onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
      return
    }

    if (!isAuthenticated) {
      if (typeof onOpenBindModal === "function") {
        onOpenBindModal()
      } else {
        dispatch(openAuthModal())
      }
    }
  }

  const executeQuestion = (textToSend) => {
    const text = (textToSend || query).trim()
    if (!text || isGenerating) return

    // JYOTISH: Chart-bound personalized reading requires authentication & question quota
    if (engine === "jyotish") {
      if (!isAuthenticated) {
        if (typeof onOpenBindModal === "function") {
          onOpenBindModal(() => executeQuestion(text))
        } else {
          dispatch(openAuthModal())
        }
        return
      }

      if (activeQuestionQuota <= 0) {
        toast.error("Your question quota is empty. Top up with Gold Pack to consult Jyotish.")
        if (onOpenBuyModal) {
          onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
        }
        return
      }

      const initialThinkingStep =
        engine === "jyotish"
          ? "Reviewing your core birth profile and selecting chart tools..."
          : "Searching Brihat Parashara Hora Shastra & classical treatises..."

      dispatch(
        startGenerating({
          step: initialThinkingStep,
          query: text,
          engine,
        })
      )
    } else {
      // SHASTRA: Universal Vedic Encyclopedia is 100% Free & Unlimited
      dispatch(
        startGenerating({
          step: "Searching Brihat Parashara Hora Shastra & classical treatises...",
          query: text,
          engine,
        })
      )
    }

    // Call real backend SSE streaming endpoint
    streamChatTurn({
      engine,
      query: text,
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
        if (err.message && err.message.includes("Birth details not found") && typeof onOpenBindModal === "function") {
          onOpenBindModal()
        }
      },
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      executeQuestion(query)
    }
  }

  const handlePromptClick = (question) => {
    setQuery(question)
    executeQuestion(question)
  }

  const activePrompts = engine === "shastra" ? SHASTRA_PROMPTS : JYOTISH_PROMPTS
  const inputPlaceholder =
    engine === "shastra"
      ? "Search any Vedic astrology topic…"
      : "Ask about your career, marriage, or the timing of a decision…"

  return (
    <div className="shrink-0 w-full max-w-[760px] flex flex-col items-center justify-center relative z-10 mx-auto">
      {/* Central Heading matching Melooha */}
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-serif font-normal text-white text-[28px] sm:text-[36px] tracking-[-0.015em] leading-[1.1] text-center mb-6 sm:mb-7"
      >
        What do you want to know?
      </motion.h1>

      {/* Main Glassmorphic Chat Input Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`w-full rounded-[22px] border bg-[#07273c]/92 backdrop-blur-[7px] p-4 sm:p-5 shadow-[0_22px_60px_rgba(0,0,0,0.55)] space-y-4 transition-all ${
          engine === "shastra"
            ? "border-amber-500/45 focus-within:border-amber-500/85 shadow-[0_22px_60px_rgba(0,0,0,.55),0_0_48px_rgba(223,129,7,.34),inset_0_1px_0_rgba(255,255,255,.08)]"
            : "border-mlh-plum-400/45 focus-within:border-mlh-plum-400/85 shadow-[0_22px_60px_rgba(0,0,0,.55),0_0_48px_rgba(255,112,16,.22),inset_0_1px_0_rgba(255,255,255,.08)]"
        }`}
      >
        {/* Multi-line Query Textarea */}
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={inputPlaceholder}
          className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-white placeholder:text-mlh-muted text-sm sm:text-base resize-none min-h-[90px] sm:min-h-[110px] p-0 leading-relaxed font-sans"
        />

        {/* Bottom Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#17384e]/60">
          {/* Engine Selector Segmented Pill (radiogroup "Answer source" in Melooha) */}
          <div
            role="radiogroup"
            aria-label="Answer source"
            className="inline-flex items-center rounded-full border border-[#17384e] bg-[#041826] p-1 self-start sm:self-auto"
          >
            <button
              type="button"
              role="radio"
              aria-checked={engine === "jyotish"}
              onClick={() => handleSelectEngine("jyotish")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                engine === "jyotish"
                  ? "bg-gradient-to-r from-mlh-plum-500 to-mlh-plum text-white shadow-xs"
                  : "text-mlh-muted hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Jyotish</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={engine === "shastra"}
              onClick={() => handleSelectEngine("shastra")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                engine === "shastra"
                  ? "bg-gradient-to-r from-[#feb371] to-[#df8107] text-[#0f090c] font-semibold shadow-xs"
                  : "text-mlh-muted hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Shastra</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
            {engine === "jyotish" ? (
              isAuthenticated ? (
                <div
                  className={`flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-xs transition-all shadow-xs ${
                    activeQuestionQuota > 0
                      ? "bg-[#041826]/90 border border-[#17384e]"
                      : "bg-[#231206]/90 border border-amber-900/60"
                  }`}
                >
                  <span
                    className={`text-xs font-sans tracking-wide ${
                      activeQuestionQuota > 0 ? "text-neutral-300" : "text-amber-200/90"
                    }`}
                  >
                    <strong
                      className={`font-mono font-semibold ${
                        activeQuestionQuota > 0 ? "text-white" : "text-amber-300"
                      }`}
                    >
                      {activeQuestionQuota}
                    </strong>{" "}
                    {activeQuestionQuota === 1 ? "question" : "questions"} left
                  </span>
                  <button
                    type="button"
                    onClick={handleBuyQuestions}
                    className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-150 cursor-pointer shadow-xs active:scale-95 ${
                      activeQuestionQuota > 0
                        ? "bg-[#82184d] hover:bg-[#9d1c5d] text-white border border-[#c43282]/30 hover:border-[#e04599]/50 shadow-[0_2px_8px_rgba(130,24,77,0.35)]"
                        : "bg-gradient-to-r from-[#92400e] to-[#b45309] hover:from-[#a14710] hover:to-[#c65d0b] text-amber-100 border border-amber-500/30 shadow-[0_2px_8px_rgba(180,83,9,0.35)]"
                    }`}
                  >
                    Buy more
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleBuyQuestions}
                  className="px-3.5 py-1.5 rounded-full bg-[#4d0e34] hover:bg-[#6b1449] border border-mlh-plum-400/25 text-[10.5px] font-mono font-semibold tracking-wider text-mlh-plum-100 transition-colors uppercase cursor-pointer"
                >
                  BUY QUESTIONS
                </button>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Free knowledge · Unlimited</span>
              </div>
            )}

            <Button
              type="button"
              size="icon"
              disabled={!query.trim() || isGenerating}
              onClick={() => executeQuestion(query)}
              aria-label="Send question"
              className={`w-10 h-10 rounded-full shrink-0 shadow-md cursor-pointer disabled:opacity-40 transition-all ${
                engine === "shastra"
                  ? "bg-[linear-gradient(160deg,#feb371,#df8107_62%,#b45309)] text-[#0f090c] hover:brightness-110 shadow-[0_0_24px_rgba(223,129,7,0.6)]"
                  : "bg-gradient-to-br from-mlh-plum-500 to-mlh-plum hover:from-mlh-plum hover:to-mlh-plum-800 text-white shadow-[0_0_24px_rgba(129,23,86,0.6)]"
              }`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4 Example Prompt Cards */}
      <div className="w-full max-w-[760px] grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5 sm:mt-6">
        {activePrompts.map((question, idx) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            onClick={() => handlePromptClick(question)}
            className={`p-3.5 sm:p-4 rounded-[14px] border text-left backdrop-blur-[3px] transition-all cursor-pointer group shadow-[0_4px_16px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3 ${
              engine === "shastra"
                ? "border-amber-500/25 bg-amber-500/[.03] hover:border-amber-500/50 hover:bg-amber-500/[.08]"
                : "border-white/12 bg-white/[.02] hover:border-mlh-plum-400/50 hover:bg-mlh-plum-500/[.08]"
            }`}
          >
            <p className="text-[13px] sm:text-[14.5px] font-sans font-medium text-white/85 group-hover:text-white leading-snug">
              {question}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
