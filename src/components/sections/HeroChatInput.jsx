import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Sparkles, BookOpen, ArrowUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { openAuthModal } from "@/store/slices/authSlice"

const promptQuestions = [
  "What does my chart flag about my health?",
  "What is my running mahadasha bringing over the next year?",
  "What does my chart say about my career direction?",
  "What is Saturn doing to my chart right now?",
]

export default function HeroChatInput({ onOpenBindModal, onOpenBuyModal }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const engineParam = searchParams.get("engine")
  const queryParam = searchParams.get("q")

  const [query, setQuery] = useState(queryParam || "")
  const [engine, setEngine] = useState(
    engineParam === "astropedia" ? "astropedia" : "vaani"
  )
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state) => state.auth || {})

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
      onOpenBuyModal()
      return
    }

    const proceedWithBuy = () => {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set("action", "buy")
      nextParams.set("engine", engine)
      setSearchParams(nextParams)
    }

    if (isAuthenticated) {
      // If logged in → proceed directly
      proceedWithBuy()
    } else {
      // If not logged in → only then open the login modal
      if (typeof onOpenBindModal === "function") {
        onOpenBindModal(proceedWithBuy)
      } else {
        dispatch(openAuthModal())
      }
    }
  }

  const handleSend = () => {
    if (!query.trim()) return
    if (!isAuthenticated) {
      if (typeof onOpenBindModal === "function") {
        onOpenBindModal()
      } else {
        dispatch(openAuthModal())
      }
      return
    }
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("engine", engine)
    nextParams.set("q", query.trim())
    setSearchParams(nextParams)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePromptClick = (question) => {
    setQuery(question)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("engine", engine)
    nextParams.set("q", question)
    setSearchParams(nextParams)
  }

  return (
    <div className="w-full flex flex-col items-center justify-center relative z-10 px-4 py-8 sm:py-16">
      {/* Central Heading */}
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
        className="w-full max-w-[700px] rounded-2xl border border-[#2e3045] bg-[#12131c]/92 backdrop-blur-md p-4 sm:p-5 shadow-[0_22px_60px_rgba(0,0,0,0.55),0_0_48px_rgba(129,23,86,0.35)] space-y-4 hover:border-mlh-plum/50 focus-within:border-mlh-plum transition-all"
      >
        {/* Multi-line Query Textarea */}
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your career, marriage, or the timing of a decision…"
          className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-white placeholder:text-mlh-muted text-sm sm:text-base resize-none min-h-[90px] sm:min-h-[110px] p-0 leading-relaxed font-sans"
        />

        {/* Bottom Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[#252637]/60">
          {/* Engine Selector Segmented Pill */}
          <div className="inline-flex items-center rounded-full border border-[#2e3045] bg-[#0c070a] p-1 self-start sm:self-auto">
            <button
              type="button"
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
              onClick={() => handleSelectEngine("astropedia")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                engine === "astropedia"
                  ? "bg-mlh-iris text-white shadow-xs"
                  : "text-mlh-muted hover:text-white"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Astropedia</span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={handleBuyQuestions}
              className="px-3.5 py-1.5 rounded-full bg-[#4d0e34] hover:bg-[#6b1449] border border-mlh-plum-400/25 text-[10.5px] font-mono font-semibold tracking-wider text-mlh-plum-100 transition-colors uppercase cursor-pointer"
            >
              BUY QUESTIONS
            </button>

            <Button
              type="button"
              size="icon"
              onClick={handleSend}
              aria-label="Send question"
              className="w-10 h-10 rounded-full bg-gradient-to-br from-mlh-plum-500 to-mlh-plum hover:from-mlh-plum hover:to-mlh-plum-800 text-white shrink-0 shadow-[0_0_24px_rgba(129,23,86,0.6)] cursor-pointer"
            >
              <ArrowUp className="w-5 h-5 stroke-[2.5]" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 4 Example Prompt Cards */}
      <div className="w-full max-w-[700px] grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {promptQuestions.map((question, idx) => (
          <motion.div
            key={question}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -2 }}
            onClick={() => handlePromptClick(question)}
            className="p-4 sm:p-5 rounded-2xl border border-[#252637] bg-[#12131c]/85 hover:bg-[#1c1d29] hover:border-mlh-plum/50 transition-all cursor-pointer group shadow-sm flex items-center justify-between gap-3"
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
