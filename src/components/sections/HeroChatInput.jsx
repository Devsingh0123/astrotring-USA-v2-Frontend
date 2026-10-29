import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Sparkles, BookOpen, ArrowUp } from "lucide-react"
import { openAuthModal } from "@/features/auth/authSlice"
import { startGenerating, setThinkingStep, stopGenerating, addConversation } from "@/features/jyotish/jyotishSlice"
import { streamChatTurn } from "@/features/jyotish/jyotishApi"
import { toast } from "sonner"

// Maximum words allowed in the query composer
const MAX_WORDS = 250

const countWords = (text) => {
  if (!text) return 0
  const matches = text.trim().match(/\S+/g)
  return matches ? matches.length : 0
}

const limitToMaxWords = (text, max = MAX_WORDS) => {
  if (!text) return text
  const words = text.trim().match(/\S+/g) || []
  if (words.length <= max) return text

  let count = 0
  let cutIndex = text.length
  const regex = /\S+/g
  let match
  while ((match = regex.exec(text)) !== null) {
    count++
    if (count === max) {
      cutIndex = match.index + match[0].length
      break
    }
  }
  return text.slice(0, cutIndex)
}

// 4 Prompts for Personal Jyotish
const JYOTISH_PROMPTS = [
  "What is Saturn doing to my chart right now?",
  "Which gemstone suits my chart, if any?",
  "What is my lagna and what does it say about me?",
  "Which yogas are present in my chart?",
]

// 4 Prompts for Shastra
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

  const textareaRef = useRef(null)
  const currentWordCount = countWords(query)

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

  // Automatically grow textarea to content height so it NEVER has an inner scrollbar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [query])

  const handleTextareaChange = (e) => {
    const rawVal = e.target.value
    const cappedVal = limitToMaxWords(rawVal, MAX_WORDS)
    setQuery(cappedVal)
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 120)}px`
    }
  }

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
    <div className="shrink-0 w-full max-w-[820px] flex flex-col items-center justify-center relative z-10 mx-auto">
      {/* Central Heading matching Jagannatha Hora */}
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-sans font-bold text-foreground text-[30px] sm:text-[38px] tracking-tight leading-[1.15] text-center mb-6 sm:mb-8 transition-colors"
      >
        What do you want to know?
      </motion.h1>

      {/* Main Glassmorphic Chat Input Card - Exactly matching conversation composer */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full"
      >
        <div
          className={`relative overflow-hidden rounded-3xl border glass-card transition-all duration-300 shadow-xl backdrop-blur-2xl ${engine === "shastra"
            ? "border-border/80 focus-within:border-amber-500/60 focus-within:shadow-2xl focus-within:shadow-amber-500/10"
            : "border-border/80 focus-within:border-primary/60 focus-within:shadow-2xl focus-within:shadow-primary/10"
            }`}
        >
          {/* Top input row with glowing ✦ symbol */}
          <div className="relative flex gap-3 px-4 pt-4 sm:px-5 sm:pt-4">
            <span
              aria-hidden="true"
              className={`shrink-0 pt-1 text-[16px] leading-none select-none ${engine === "shastra" ? "text-amber-500 animate-pulse" : "text-primary animate-pulse"
                }`}
            >
              ✦
            </span>
            <textarea
              ref={textareaRef}
              rows={4}
              value={query}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={inputPlaceholder}
              className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 resize-none overflow-hidden bg-transparent font-sans text-[15px] sm:text-[17px] leading-[1.5] outline-none disabled:cursor-not-allowed disabled:opacity-60 caret-primary"
              style={{ minHeight: "120px" }}
            />
          </div>

          {/* Bottom Action Controls */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 px-3 pt-2 pb-3 sm:gap-3.5 sm:px-4 sm:pt-2 sm:pb-3.5">
            {/* Engine Selector Segmented Pill */}
            <div
              role="radiogroup"
              aria-label="Answer source"
              className="inline-flex items-center rounded-full border border-border/80 bg-accent/40 p-1"
            >
              <button
                type="button"
                role="radio"
                aria-checked={engine === "jyotish"}
                onClick={() => handleSelectEngine("jyotish")}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${engine === "jyotish"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Jyotish</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={engine === "shastra"}
                onClick={() => handleSelectEngine("shastra")}
                className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${engine === "shastra"
                  ? "bg-amber-500 text-white font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Shastra</span>
              </button>
            </div>

            {/* Right Action Controls */}
            <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
              {currentWordCount > 0 && (
                <span
                  className={`font-mono text-[10.5px] tracking-wider transition-colors ${
                    currentWordCount >= MAX_WORDS
                      ? "text-amber-500 font-semibold"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {currentWordCount}/{MAX_WORDS} words
                </span>
              )}

              {engine === "jyotish" ? (
                isAuthenticated ? (
                  <div className="flex items-stretch overflow-hidden rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-[10.5px] font-medium tracking-[0.14em] whitespace-nowrap uppercase text-amber-600 dark:text-amber-300 shadow-xs">
                    <span className="px-3 py-1.5">
                      <span>{activeQuestionQuota}</span> {activeQuestionQuota === 1 ? "question left" : "questions left"}
                    </span>
                    <button
                      type="button"
                      onClick={handleBuyQuestions}
                      className="cursor-pointer border-l border-amber-500/30 px-3 py-1.5 transition-colors bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-200 font-semibold"
                    >
                      Buy more
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleBuyQuestions}
                    className="cursor-pointer flex items-center overflow-hidden rounded-full border border-amber-500/40 bg-amber-500/10 font-mono text-[10.5px] font-semibold tracking-[0.14em] whitespace-nowrap uppercase text-amber-600 dark:text-amber-300 px-3.5 py-1.5 hover:bg-amber-500/20 transition-all shadow-xs"
                  >
                    Buy questions
                  </button>
                )
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-amber-600 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full uppercase">
                  <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                  <span>Free knowledge · Unlimited</span>
                </div>
              )}

              <button
                type="button"
                disabled={!query.trim() || isGenerating}
                onClick={() => executeQuestion(query)}
                aria-label="Send question"
                className={`grid h-10 w-10 flex-none place-items-center rounded-full transition-all duration-200 cursor-pointer disabled:opacity-40 shadow-md ${engine === "shastra"
                  ? "text-white bg-amber-500 hover:bg-amber-600 hover:scale-105 shadow-amber-500/25"
                  : "text-primary-foreground bg-primary hover:bg-primary/90 hover:scale-105 shadow-primary/25"
                  }`}
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        <div className="text-muted-foreground/60 mt-2 text-center font-mono text-[9px] tracking-[0.18em] uppercase">
          Enter to send · Shift + Enter for a new line (Max 250 words)
        </div>
      </motion.div>

      {/* 4 Example Prompt Cards */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5 sm:mt-6">
        {activePrompts.map((question, idx) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            onClick={() => handlePromptClick(question)}
            className={`p-4 rounded-2xl border text-left glass-card transition-all cursor-pointer group shadow-xs flex items-center justify-between gap-3 ${engine === "shastra"
              ? "border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/[.05]"
              : "border-border/80 hover:border-primary/50 hover:bg-accent/40"
              }`}
          >
            <p className="text-sm sm:text-[14.5px] font-sans font-medium text-foreground/90 group-hover:text-foreground leading-snug">
              {question}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
