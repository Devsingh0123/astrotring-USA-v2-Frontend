import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { openAuthModal } from "@/features/auth";

/**
 * Route Guard for Authenticated & Onboarded Users
 * - If not authenticated: opens AuthModal and redirects to Home
 * - If authenticated but onboarding incomplete: redirects to /onboarding
 * - If authenticated & onboarded: renders protected route children
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, birthDetails } = useSelector(
    (state) => state.auth || {}
  );
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal());
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  if (user?.onboardingCompleted === false || (!birthDetails && !user?.hasBirthDetails)) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  return children;
}
