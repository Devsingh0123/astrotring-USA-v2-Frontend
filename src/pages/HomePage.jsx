import { useOutletContext } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import ZodiacWheelBackground from "@/components/sections/ZodiacWheelBackground"
import HeroChatInput from "@/components/sections/HeroChatInput"
import DashboardKundliCard from "@/components/sections/DashboardKundliCard"
import DailyForecastWidget from "@/components/sections/DailyForecastWidget"
import VaaniChatConversation from "@/features/vaani/components/VaaniChatConversation"
import Footer from "@/components/layout/Footer"

export default function HomePage() {
  const context = useOutletContext() || {}
  const onOpenBindModal = context.onOpenBindModal || (() => {})
  const onOpenBuyModal = context.onOpenBuyModal || (() => {})
  const { activeConversationId, activeThreadId, isGenerating } = useSelector((state) => state.vaani || {})

  const hasActiveConversation = Boolean(activeConversationId || activeThreadId || isGenerating)

  return (
    <div
      className={`relative w-full flex flex-col ${
        hasActiveConversation ? "h-full min-h-0 overflow-hidden flex-1" : "min-h-full"
      }`}
    >
      <AnimatePresence mode="wait">
        {hasActiveConversation ? (
          <motion.div
            key="chat-conversation-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-h-0 h-full w-full flex flex-col overflow-hidden"
          >
            <VaaniChatConversation onOpenBuyModal={onOpenBuyModal} />
          </motion.div>
        ) : (
          <motion.div
            key="landing-hero-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex flex-col"
          >
            {/* Hero Section with Cosmic Wheel & Input */}
            <div className="relative flex flex-col items-center justify-start px-4 sm:px-8 pt-8 sm:pt-12 pb-16 w-full">
              {/* Background Concentric Dial */}
              <ZodiacWheelBackground />

              {/* Personalized Daily Moon Sign Dashboard Widget for Logged-In User */}
              <DailyForecastWidget onOpenBindModal={onOpenBindModal} />

              {/* Hero Form & 4 Example Cards */}
              <HeroChatInput
                onOpenBindModal={onOpenBindModal}
                onOpenBuyModal={onOpenBuyModal}
              />
            </div>

            {/* Seamless Landing Footer */}
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


