import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Sparkles, BookOpen, ArrowUp, Lock } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { openAuthModal } from "@/store/slices/authSlice"
import { startGenerating, addConversation } from "@/store/slices/vaaniSlice"
import { generateAstrologyResponse } from "@/features/vaani/utils/astrologyEngine"
import { toast } from "sonner"

// Exact Melooha 4 Prompts for Personal Vaani (Ref 07-authenticated-dashboard-clean.yml)
const VAANI_PROMPTS = [
  "What does my chart say about higher studies?",
  "What is my lagna and what does it say about me?",
  "What does my chart say about my career direction?",
  "Is this a good year for me to buy property?",
]

// Authentic Vedic Encyclopedia Prompts for Astropedia
const ASTROPEDIA_PROMPTS = [
  "What is the difference between Lagna and Moon Sign?",
  "How does Sade Sati affect a person's life?",
  "What causes Mangal Dosha and its cancellations?",
  "How do Vimshottari Mahadasha cycles work?",
]

export default function HeroChatInput({ onOpenBindModal, onOpenBuyModal }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const engineParam = searchParams.get("engine")
  const queryParam = searchParams.get("q")

  const [query, setQuery] = useState(queryParam || "")
  const [engine, setEngine] = useState(
    engineParam === "astropedia" ? "astropedia" : "vaani"
  )
  const dispatch = useDispatch()
  const { isAuthenticated, user, birthDetails } = useSelector((state) => state.auth || {})
  const { questionQuota = 0, isGenerating } = useSelector((state) => state.vaani || {})

  // Keep engine state and query state in sync if URL query param changes
  useEffect(() => {
    if (engineParam === "astropedia" || engineParam === "vaani") {
      setEngine(engineParam)
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

    // VAANI: Chart-bound personalized reading requires authentication & question quota
    if (engine === "vaani") {
      if (!isAuthenticated) {
        if (typeof onOpenBindModal === "function") {
          onOpenBindModal(() => executeQuestion(text))
        } else {
          dispatch(openAuthModal())
        }
        return
      }

      if (questionQuota <= 0) {
        toast.error("Your question quota is empty. Top up with Gold Pack to consult Vaani.")
        if (onOpenBuyModal) {
          onOpenBuyModal({ promoCode: "QUICKGOLD", packId: "pack_gold_12" })
        }
        return
      }

      dispatch(startGenerating("Reading your birth chart..."))
      setTimeout(() => {
        dispatch(startGenerating("Synthesizing your lagna and planetary strength..."))
      }, 1200)
    } else {
      // ASTROPEDIA: Universal Vedic Encyclopedia is 100% Free & Unlimited
      dispatch(startGenerating("Consulting classical Vedic texts..."))
      setTimeout(() => {
        dispatch(startGenerating("Searching Brihat Parasara Hora Sastra repository..."))
      }, 1200)
    }

    setTimeout(() => {
      const generated = generateAstrologyResponse({
        question: text,
        engine,
        user,
        birthDetails,
      })

      const newConversationItem = {
        id: `reading-${Date.now()}`,
        engine,
        question: text,
        createdAt: new Date().toISOString(),
        openingThought: generated.openingThought,
        thinkingSteps: generated.thinkingSteps,
        paragraphs: generated.paragraphs,
        astrologyBehind: generated.astrologyBehind,
        suggestedQuestions: generated.suggestedQuestions,
        offer: generated.offer,
        feedback: null,
      }

      dispatch(addConversation(newConversationItem))
    }, 2400)
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

  const activePrompts = engine === "astropedia" ? ASTROPEDIA_PROMPTS : VAANI_PROMPTS
  const inputPlaceholder =
    engine === "astropedia"
      ? "Ask any question about Vedic astrology, planetary yogas, doshas, or rituals…"
      : "Ask about your career, marriage, or the timing of a decision…"

  return (
    <div className="w-full flex flex-col items-center justify-center relative z-10 px-4 py-8 sm:py-16">
      {/* Central Heading matching Melooha */}
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="font-serif font-normal text-white text-[25px] sm:text-[31px] lg:text-[36px] tracking-[-0.015em] leading-[1.1] text-center mb-8"
      >
        What do you want to know?
      </motion.h1>

      {/* Main Glassmorphic Chat Input Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className={`w-full max-w-[700px] rounded-2xl border bg-[#12131c]/92 backdrop-blur-md p-4 sm:p-5 shadow-[0_22px_60px_rgba(0,0,0,0.55)] space-y-4 transition-all ${
          engine === "astropedia"
            ? "border-blue-500/40 focus-within:border-blue-400 shadow-[0_0_48px_rgba(24,119,252,0.25)]"
            : "border-[#2e3045] focus-within:border-mlh-plum shadow-[0_0_48px_rgba(129,23,86,0.35)]"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#252637]/60">
          {/* Engine Selector Segmented Pill (radiogroup "Answer source" in Melooha) */}
          <div
            role="radiogroup"
            aria-label="Answer source"
            className="inline-flex items-center rounded-full border border-[#2e3045] bg-[#0c070a] p-1 self-start sm:self-auto"
          >
            <button
              type="button"
              role="radio"
              aria-checked={engine === "vaani"}
              onClick={() => handleSelectEngine("vaani")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                engine === "vaani"
                  ? "bg-gradient-to-r from-mlh-plum-500 to-mlh-plum text-white shadow-xs"
                  : "text-mlh-muted hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Vaani</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={engine === "astropedia"}
              onClick={() => handleSelectEngine("astropedia")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                engine === "astropedia"
                  ? "bg-[#1877fc] text-white shadow-xs"
                  : "text-mlh-muted hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Astropedia</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
            {engine === "vaani" ? (
              isAuthenticated ? (
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
                    onClick={handleBuyQuestions}
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
                <button
                  type="button"
                  onClick={handleBuyQuestions}
                  className="px-3.5 py-1.5 rounded-full bg-[#4d0e34] hover:bg-[#6b1449] border border-mlh-plum-400/25 text-[10.5px] font-mono font-semibold tracking-wider text-mlh-plum-100 transition-colors uppercase cursor-pointer"
                >
                  BUY QUESTIONS
                </button>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>Free knowledge · Unlimited</span>
              </div>
            )}

            <Button
              type="button"
              size="icon"
              disabled={!query.trim() || isGenerating}
              onClick={() => executeQuestion(query)}
              aria-label="Send question"
              className={`w-10 h-10 rounded-full text-white shrink-0 shadow-md cursor-pointer disabled:opacity-40 transition-all ${
                engine === "astropedia"
                  ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/30"
                  : "bg-gradient-to-br from-mlh-plum-500 to-mlh-plum hover:from-mlh-plum hover:to-mlh-plum-800 shadow-[0_0_24px_rgba(129,23,86,0.6)]"
              }`}
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4 Example Prompt Cards */}
      <div className="w-full max-w-[700px] grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {activePrompts.map((question, idx) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            onClick={() => handlePromptClick(question)}
            className="p-4 sm:p-5 rounded-2xl border border-[#252637] bg-[#12131c]/85 hover:bg-[#1c1d29] hover:border-white/30 transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-3"
          >
            <p className="text-xs sm:text-[13.5px] font-sans font-medium text-white/90 group-hover:text-white leading-relaxed">
              {question}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
