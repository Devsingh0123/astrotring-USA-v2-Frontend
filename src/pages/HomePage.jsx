import { useOutletContext } from "react-router-dom"
import ZodiacWheelBackground from "@/components/sections/ZodiacWheelBackground"
import HeroChatInput from "@/components/sections/HeroChatInput"
import DashboardKundliCard from "@/components/sections/DashboardKundliCard"
import Footer from "@/components/layout/Footer"

export default function HomePage() {
  const context = useOutletContext() || {}
  const onOpenBindModal = context.onOpenBindModal || (() => {})
  const onOpenBuyModal = context.onOpenBuyModal || (() => {})

  return (
    <div className="flex-1 flex flex-col justify-between relative min-h-screen">
      {/* Centered Hero Stage with Astrological Background */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden px-4 pt-4 sm:pt-8">
        {/* Background Concentric Dial */}
        <ZodiacWheelBackground />

        {/* Bound Kundli Quick Glance for Logged-In User */}
        <DashboardKundliCard />

        {/* Hero Form & 4 Example Cards */}
        <HeroChatInput
          onOpenBindModal={onOpenBindModal}
          onOpenBuyModal={onOpenBuyModal}
        />
      </div>

      {/* Melooha Complete Footer */}
      <Footer />
    </div>
  )
}
