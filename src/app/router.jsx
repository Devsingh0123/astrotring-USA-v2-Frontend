import { createBrowserRouter, Navigate, useLocation } from "react-router-dom"
import RootLayout from "@/components/layout/RootLayout"
import HomePage from "@/pages/HomePage"
import HoroscopesListingPage from "@/pages/HoroscopesListingPage"
import DailyHoroscopePage from "@/pages/DailyHoroscopePage"
import CalculatorsListingPage from "@/pages/CalculatorsListingPage"
import FreeKundliPage from "@/pages/FreeKundliPage"
import KundliDisplayPage from "@/pages/KundliDisplayPage"
import OnboardingPage from "@/pages/OnboardingPage"
import ReportsListingPage from "@/pages/ReportsListingPage"
import ReportDetailPage from "@/pages/ReportDetailPage"
import InvoicesPage from "@/pages/InvoicesPage"
import ProtectedRoute from "@/components/common/ProtectedRoute"
import PlaceholderPage from "@/pages/PlaceholderPage"
import NotFoundPage from "@/pages/NotFoundPage"

function VaaniRedirect() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  if (!searchParams.get("engine")) {
    searchParams.set("engine", "vaani")
  }
  return <Navigate to={`/?${searchParams.toString()}`} replace />
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "onboarding",
        element: <OnboardingPage />,
      },
      {
        path: "kundli",
        element: (
          <ProtectedRoute>
            <KundliDisplayPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "chart",
        element: (
          <ProtectedRoute>
            <KundliDisplayPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: <VaaniRedirect />,
      },
      {
        path: "vaani",
        element: <VaaniRedirect />,
      },
      {
        path: "calculators",
        element: <CalculatorsListingPage />,
      },
      {
        path: "calculators/free-kundli-maker",
        element: <FreeKundliPage />,
      },
      {
        path: "calculators/kundli",
        element: <FreeKundliPage />,
      },
      {
        path: "calculators/:toolName",
        element: <FreeKundliPage />,
      },
      {
        path: "reports",
        element: <ReportsListingPage />,
      },
      {
        path: "reports/:slug",
        element: <ReportDetailPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "horoscope",
        element: <HoroscopesListingPage />,
      },
      {
        path: "horoscopes",
        element: <HoroscopesListingPage />,
      },
      {
        path: "horoscopes/:sign/daily",
        element: <DailyHoroscopePage />,
      },
      {
        path: "horoscope/:sign/daily",
        element: <DailyHoroscopePage />,
      },
      {
        path: "horoscopes/:sign",
        element: <DailyHoroscopePage />,
      },
      {
        path: "horoscope/:sign",
        element: <DailyHoroscopePage />,
      },
      {
        path: "compatibility",
        element: <PlaceholderPage title="Kundli Milan Compatibility" />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
