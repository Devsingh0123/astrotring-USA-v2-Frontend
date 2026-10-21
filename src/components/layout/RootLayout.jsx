import { useState, useEffect, useRef } from "react"
import { Outlet, ScrollRestoration, useNavigate, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import Sidebar from "@/components/layout/Sidebar"
import MobileHeader from "@/components/layout/MobileHeader"
import AuthModal from "@/features/auth/AuthModal"
import QuestionPacksModal from "@/components/common/QuestionPacksModal"
import MyBirthDetailsModal from "@/features/user/components/MyBirthDetailsModal"
import { openAuthModal, closeAuthModal, fetchUserProfile, setAccessToken } from "@/features/auth/authSlice"

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

  // App load: Fetch user profile (/auth/me) if token exists in storage
  useEffect(() => {
    const token =
      localStorage.getItem("astrotring_auth_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("astrotring_token")
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

  // Listen for global unauthorized session expiration
  useEffect(() => {
    const handleUnauthorized = () => {
      dispatch(openAuthModal())
    }
    const handleTokenRefreshed = (event) => {
      if (event.detail?.accessToken) {
        dispatch(setAccessToken(event.detail.accessToken))
      }
    }
    window.addEventListener("astrotring:unauthorized", handleUnauthorized)
    window.addEventListener("astrotring:token_refreshed", handleTokenRefreshed)
    return () => {
      window.removeEventListener("astrotring:unauthorized", handleUnauthorized)
      window.removeEventListener("astrotring:token_refreshed", handleTokenRefreshed)
    }
  }, [dispatch])

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0f090c] text-foreground flex flex-col md:flex-row font-sans selection:bg-mlh-plum/30 selection:text-white">
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
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#0f090c] relative">
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
      />

      {/* My Birth Details Edit Modal (Melooha Ref 09) */}
      <MyBirthDetailsModal
        isOpen={isBirthDetailsModalOpen}
        onClose={() => setIsBirthDetailsModalOpen(false)}
      />
    </div>
  )
}

