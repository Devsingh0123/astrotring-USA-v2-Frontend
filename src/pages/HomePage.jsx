import { useOutletContext } from "react-router-dom"
import { useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import ZodiacWheelBackground from "@/components/sections/ZodiacWheelBackground"
import HeroChatInput from "@/components/sections/HeroChatInput"
import DashboardKundliCard from "@/components/sections/DashboardKundliCard"
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
      className={`flex-1 flex flex-col relative w-full ${
        hasActiveConversation ? "h-full min-h-0 overflow-hidden" : "min-h-full justify-between"
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
            className="flex-1 w-full min-h-full flex flex-col justify-between"
          >
            {/* Hero Section with Cosmic Wheel & Input */}
            <div className="relative flex flex-1 items-center justify-center px-4 sm:px-8 py-10 sm:py-16 overflow-hidden min-h-[calc(100vh-4rem)]">
              {/* Background Concentric Dial */}
              <ZodiacWheelBackground />

              {/* Bound Kundli Quick Glance for Logged-In User (Temporarily commented out per user request) */}
              {/* <DashboardKundliCard /> */}

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


