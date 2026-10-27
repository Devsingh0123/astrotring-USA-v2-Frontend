import { useState, useEffect, useRef } from "react"
import { Outlet, ScrollRestoration, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Sidebar from "@/components/layout/Sidebar"
import MobileHeader from "@/components/layout/MobileHeader"
import AuthModal from "@/features/auth/AuthModal"
import QuestionPacksModal from "@/components/common/QuestionPacksModal"
import MyBirthDetailsModal from "@/features/user/components/MyBirthDetailsModal"
import { openAuthModal, closeAuthModal, fetchUserProfile, logout } from "@/features/auth/authSlice"
import { getStoredAccessToken, AUTH_CHANNEL_NAME } from "@/lib/api-client"

export default function RootLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [buyModalOptions, setBuyModalOptions] = useState(null)
  const [isBirthDetailsModalOpen, setIsBirthDetailsModalOpen] = useState(false)
  const pendingActionRef = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, isAuthModalOpen } = useSelector((state) => state.auth || {})

  const handleOpenBuyModal = (options) => {
    setBuyModalOptions(options || null)
    setIsBuyModalOpen(true)
  }

  // App load: Fetch user profile (/auth/me) if access token exists in storage
  useEffect(() => {
    const token = getStoredAccessToken()
    if (token) {
      dispatch(fetchUserProfile())
    }
  }, [dispatch])

  // Force onboarding route if user is authenticated but onboarding is incomplete
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.onboardingCompleted === false) {
        if (location.pathname !== "/onboarding") {
          navigate("/onboarding", { replace: true })
        }
      } else if (user.onboardingCompleted === true && location.pathname === "/onboarding") {
        navigate("/", { replace: true })
      }
    } else if (!isAuthenticated && location.pathname === "/onboarding") {
      // Unauthenticated users attempting to access /onboarding are routed home with auth modal
      navigate("/", { replace: true })
      dispatch(openAuthModal())
    }
  }, [isAuthenticated, user, user?.onboardingCompleted, location.pathname, navigate, dispatch])

  const handleOpenAuth = (actionCallback) => {
    if (isAuthenticated) {
      if (typeof actionCallback === "function") {
        actionCallback()
      }
      return
    }
    if (typeof actionCallback === "function") {
      pendingActionRef.current = actionCallback
    }
    dispatch(openAuthModal())
  }

  // When user completes login, execute any queued action
  useEffect(() => {
    if (isAuthenticated && pendingActionRef.current) {
      const action = pendingActionRef.current
      pendingActionRef.current = null
      action()
    }
  }, [isAuthenticated])

  // Listen for cross-tab auth state changes via Broadcast Channel API
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
      return
    }

    const channel = new BroadcastChannel(AUTH_CHANNEL_NAME)

    channel.onmessage = (event) => {
      const data = event.data
      if (!data) return

      if (data.type === "UNAUTHORIZED" || data.type === "LOGOUT") {
        dispatch(logout())
      } else if (data.type === "LOGIN") {
        dispatch(fetchUserProfile())
      }
    }

    return () => {
      channel.close()
    }
  }, [dispatch])

  return (
    <div className="h-screen w-full overflow-hidden bg-[#031d2e] text-foreground flex flex-col md:flex-row font-sans selection:bg-mlh-plum/30 selection:text-white">
      <ScrollRestoration />

      {/* Desktop Collapsible Left Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onOpenBindModal={handleOpenAuth}
          onOpenBirthDetailsModal={() => setIsBirthDetailsModalOpen(true)}
          onOpenBuyQuestionsModal={() => handleOpenBuyModal()}
          onOpenBuyReportsModal={() => navigate("/reports")}
        />
      </div>

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#031d2e] relative">
        {/* Mobile Top Header */}
        <MobileHeader onOpenBindModal={handleOpenAuth} />

        {/* Dynamic Page Outlet */}
        <main className="flex-1 flex flex-col min-h-0 relative overflow-y-auto">
          <Outlet
            context={{
              onOpenBindModal: handleOpenAuth,
              onOpenAuthModal: handleOpenAuth,
              onOpenBuyModal: handleOpenBuyModal,
              onOpenBirthDetailsModal: () => setIsBirthDetailsModalOpen(true),
            }}
          />
        </main>
      </div>

      {/* Global Onboarding & Chart Binding Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => dispatch(closeAuthModal())}
      />

      {/* Global Question Packs 2-Step Purchase Modal (Melooha Ref 10 & 16 + Razorpay) */}
      <QuestionPacksModal
        isOpen={isBuyModalOpen}
        onClose={() => {
          setIsBuyModalOpen(false)
          setBuyModalOptions(null)
        }}
        onOpenAuth={handleOpenAuth}
        initialPromoCode={buyModalOptions?.promoCode}
        initialPackId={buyModalOptions?.packId}
        currency={buyModalOptions?.currency || user?.currency || "INR"}
      />

      {/* My Birth Details Edit Modal (Melooha Ref 09) */}
      <MyBirthDetailsModal
        isOpen={isBirthDetailsModalOpen}
        onClose={() => setIsBirthDetailsModalOpen(false)}
      />
    </div>
  )
}

