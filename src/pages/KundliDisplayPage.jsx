import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  RefreshCw,
  Printer,
  ChevronRight,
  ShieldCheck,
  User,
  AlertCircle,
  Share2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import NorthIndianChart from "@/features/calculators/components/NorthIndianChart";
import PlanetaryTable from "@/features/calculators/components/PlanetaryTable";
import HouseAnalysis from "@/features/calculators/components/HouseAnalysis";
import DashaTimeline from "@/features/calculators/components/DashaTimeline";
import AskVaaniPromptCard from "@/features/calculators/components/AskVaaniPromptCard";

import { fetchUserChart } from "@/features/calculators";
import { openAuthModal } from "@/features/auth";

// Sanskrit & elemental lookup for 12 Signs
const ZODIAC_METADATA = {
  aries: { sanskrit: "Mesha", lord: "Mars", element: "Fire" },
  taurus: { sanskrit: "Vrishabha", lord: "Venus", element: "Earth" },
  gemini: { sanskrit: "Mithuna", lord: "Mercury", element: "Air" },
  cancer: { sanskrit: "Karka", lord: "Moon", element: "Water" },
  leo: { sanskrit: "Simha", lord: "Sun", element: "Fire" },
  virgo: { sanskrit: "Kanya", lord: "Mercury", element: "Earth" },
  libra: { sanskrit: "Tula", lord: "Venus", element: "Air" },
  scorpio: { sanskrit: "Vrischika", lord: "Mars", element: "Water" },
  sagittarius: { sanskrit: "Dhanu", lord: "Jupiter", element: "Fire" },
  capricorn: { sanskrit: "Makara", lord: "Saturn", element: "Earth" },
  aquarius: { sanskrit: "Kumbha", lord: "Saturn", element: "Air" },
  pisces: { sanskrit: "Meena", lord: "Jupiter", element: "Water" },
};

function formatDegree(deg) {
  if (deg === undefined || deg === null) return "0° 00'";
  const degInSign = deg % 30;
  const d = Math.floor(degInSign);
  const m = Math.floor((degInSign - d) * 60);
  return `${d}° ${String(m).padStart(2, "0")}'`;
}

export default function KundliDisplayPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user, birthDetails } = useSelector(
    (state) => state.auth || {}
  );
  const { userKundli, userKundliStatus, userKundliError } = useSelector(
    (state) => state.calculators || {}
  );

  const [activeVarga, setActiveVarga] = useState("d1"); // "d1" | "d9" | "d10"
  const [activeTab, setActiveTab] = useState("chart"); // "chart" | "bhavas" | "dashas"

  const isLoading = userKundliStatus === "loading";
  const hasFailed = userKundliStatus === "failed";

  // Load authentic user chart upon mount or when birthDetails become available
  useEffect(() => {
    if (!birthDetails) {
      navigate("/onboarding", { replace: true });
      return;
    }
    if (!userKundli && userKundliStatus !== "loading") {
      dispatch(
        fetchUserChart({
          chartId: birthDetails.chartId,
          birthDetails: birthDetails,
        })
      );
    }
  }, [dispatch, userKundli, userKundliStatus, birthDetails, navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = () => {
    if (!birthDetails) return;
    dispatch(
      fetchUserChart({
        chartId: birthDetails.chartId,
        birthDetails: birthDetails,
      })
    );
  };

  // Derive active chart data based on divisional selection
  const getActiveChart = () => {
    if (!userKundli) return {};
    if (activeVarga === "d9") {
      return (
        userKundli.navamsaChart ||
        userKundli.horoscope?.divisional_charts?.["D-9_navamsa"] ||
        userKundli.raw?.allDivisionalCharts?.["D-9_navamsa"] ||
        {}
      );
    }
    if (activeVarga === "d10") {
      return (
        userKundli.dasamsaChart ||
        userKundli.horoscope?.divisional_charts?.["D-10_dasamsa"] ||
        userKundli.raw?.allDivisionalCharts?.["D-10_dasamsa"] ||
        {}
      );
    }
    return (
      userKundli.rasiChart ||
      userKundli.horoscope?.divisional_charts?.["D-1_rasi"] ||
      userKundli.raw?.rasiChart ||
      userKundli.raw?.allDivisionalCharts?.["D-1_rasi"] ||
      {}
    );
  };

  const activeChartData = getActiveChart();
  const summary = userKundli?.summary || birthDetails?.chartSummary || {};

  const ascSign = summary.ascendantSign || "—";
  const moonSign = summary.moonSign || "—";
  const sunSign = summary.sunSign || "—";
  const nakshatra = summary.nakshatra || "—";
  const pada = summary.pada || "—";

  const ascMeta = ZODIAC_METADATA[ascSign?.toLowerCase()] || {
    sanskrit: "—",
    lord: "—",
    element: "—",
  };
  const moonMeta = ZODIAC_METADATA[moonSign?.toLowerCase()] || {
    sanskrit: "—",
    lord: "—",
    element: "—",
  };
  const sunMeta = ZODIAC_METADATA[sunSign?.toLowerCase()] || {
    sanskrit: "—",
    lord: "—",
    element: "—",
  };

  // Person details from real birthDetails or chart
  const displayName =
    birthDetails?.fullName ||
    userKundli?.name ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";
  const displayDob =
    birthDetails?.dateOfBirth || userKundli?.dob || "—";
  const displayTob = birthDetails?.isTimeUnknown
    ? "Time Unknown"
    : (birthDetails?.timeOfBirth || userKundli?.tob || "—");
  const displayCity =
    birthDetails?.birthCity ||
    userKundli?.city ||
    "—";

  return (
    <div className="min-h-screen bg-mlh-bg text-mlh-text pb-28">
      <Helmet>
        <title>{displayName}'s Janam Kundli | AstroTring Vedic Astrology</title>
        <meta
          name="description"
          content={`Explore the authentic Vedic birth chart (Janam Kundli) for ${displayName}. Discover your Lagna in ${ascSign}, Moon in ${moonSign}, Nakshatra ${nakshatra}, 12 Bhavas, and planetary alignments.`}
        />
      </Helmet>

      {/* Main Container */}
      <div className="relative px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-8 max-w-[1440px] mx-auto space-y-8">
        {/* ================= 1. BREADCRUMBS & TOP BAR ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-mlh-border/50 pb-5">
          <nav className="flex items-center gap-2 text-xs font-mono text-mlh-muted uppercase tracking-wider">
            <Link
              to="/"
              className="hover:text-mlh-text-hi transition-colors flex items-center gap-1"
            >
              <span>Dashboard</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-mlh-faint" />
            <span className="text-mlh-amber font-medium">My Janam Kundli</span>
          </nav>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-9 px-3.5 rounded-xl border-mlh-border/80 bg-mlh-surface/60 hover:bg-mlh-surface text-xs font-mono text-mlh-text hover:text-white flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-mlh-amber" : ""}`}
              />
              <span className="hidden sm:inline">Refresh Chart</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="h-9 px-3.5 rounded-xl border-mlh-border/80 bg-mlh-surface/60 hover:bg-mlh-surface text-xs font-mono text-mlh-text hover:text-white flex items-center gap-2 cursor-pointer print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </Button>

            <Link to="/?engine=vaani">
              <Button
                size="sm"
                className="h-9 px-4 rounded-xl bg-gradient-to-r from-mlh-amber to-amber-600 hover:from-amber-500 hover:to-amber-600 text-black font-semibold text-xs font-mono tracking-wider flex items-center gap-2 shadow-lg shadow-mlh-amber/20 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Vaani</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ================= 2. PROFILE & CALCULATION HEADER ================= */}
        <div className="relative rounded-3xl border border-mlh-border/80 bg-gradient-to-br from-mlh-surface via-[#18121f] to-[#120a16] p-6 sm:p-8 shadow-2xl shadow-black/40 overflow-hidden">
          {/* Subtle celestial background orb */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-mlh-plum-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-mlh-amber/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mlh-amber/30 bg-mlh-amber/10 text-mlh-amber text-[11px] font-mono tracking-wider uppercase">
                <Compass className="w-3.5 h-3.5 text-mlh-amber" />
                <span>Authentic Vedic Janam Kundli</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-white tracking-tight">
                {displayName}'s Birth Chart
              </h1>

              {/* Birth coordinates metadata row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-mlh-muted font-sans">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Calendar className="w-4 h-4 text-mlh-amber" />
                  <span>{displayDob}</span>
                </span>

                <span className="flex items-center gap-1.5 text-white/90">
                  <Clock className="w-4 h-4 text-mlh-amber" />
                  <span>{displayTob}</span>
                </span>

                <span className="flex items-center gap-1.5 text-white/90">
                  <MapPin className="w-4 h-4 text-mlh-amber" />
                  <span>{displayCity}</span>
                </span>
              </div>
            </div>

            {/* Ephemeris & System Badges */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 shrink-0 pt-2 lg:pt-0">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/80">
                  Ayanamsha: <strong className="text-mlh-amber">Lahiri (Chitra Paksha)</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[11px] font-mono text-white/80">
                  Engine: <strong className="text-emerald-400">Swiss Ephemeris</strong>
                </span>
              </div>

              <div className="text-[11px] font-mono text-mlh-faint flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Nirayana Planetary Longitudes</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. FOUR CELESTIAL PILLARS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pillar 1: Lagna (Ascendant) */}
          <div className="relative rounded-2xl border border-mlh-plum/40 bg-gradient-to-br from-mlh-surface via-[#1b101f] to-mlh-surface p-5 shadow-xl shadow-mlh-plum/5 hover:border-mlh-plum/70 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mlh-plum-300">
                Ascendant (Lagna)
              </span>
              <span className="text-sm font-serif text-mlh-plum-200">✦</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-heading font-medium text-white">
                {ascSign}
              </h2>
              <span className="text-xs font-mono text-mlh-muted">
                ({ascMeta.sanskrit})
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-mlh-muted">Degree: {formatDegree(summary.ascendantDegree)}</span>
              <span className="text-mlh-amber">Lord: {ascMeta.lord}</span>
            </div>
            <div className="mt-1 text-[11px] text-mlh-faint">
              House 1 · Dharma Trikona ({ascMeta.element} Element)
            </div>
          </div>

          {/* Pillar 2: Moon Sign (Chandra Rashi) */}
          <div className="relative rounded-2xl border border-mlh-border/80 bg-gradient-to-br from-mlh-surface via-[#131522] to-mlh-surface p-5 shadow-xl shadow-black/20 hover:border-mlh-amber/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mlh-amber">
                Moon Sign (Janma Rashi)
              </span>
              <span className="text-base text-mlh-amber">☽</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-heading font-medium text-white">
                {moonSign}
              </h2>
              <span className="text-xs font-mono text-mlh-muted">
                ({moonMeta.sanskrit})
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-mlh-muted">Degree: {formatDegree(summary.moonDegree)}</span>
              <span className="text-mlh-amber">Lord: {moonMeta.lord}</span>
            </div>
            <div className="mt-1 text-[11px] text-mlh-faint">
              Governs Emotions, Mind & Intuition
            </div>
          </div>

          {/* Pillar 3: Nakshatra & Pada */}
          <div className="relative rounded-2xl border border-mlh-border/80 bg-gradient-to-br from-mlh-surface via-[#131522] to-mlh-surface p-5 shadow-xl shadow-black/20 hover:border-mlh-amber/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mlh-muted">
                Birth Star (Nakshatra)
              </span>
              <span className="text-sm font-serif text-mlh-amber">✧</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-heading font-medium text-white truncate">
                {nakshatra}
              </h2>
              <Badge
                variant="outline"
                className="border-mlh-amber/40 text-mlh-amber text-[10px] font-mono"
              >
                Pada {pada}
              </Badge>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-mlh-muted">Lord: {summary.nakshatraLord || "Moon"}</span>
              <span className="text-emerald-400">Vimsottari Ruler</span>
            </div>
            <div className="mt-1 text-[11px] text-mlh-faint">
              Lunar Constellation of Soul Receptivity
            </div>
          </div>

          {/* Pillar 4: Sun Sign (Surya Rashi) */}
          <div className="relative rounded-2xl border border-mlh-border/80 bg-gradient-to-br from-mlh-surface via-[#131522] to-mlh-surface p-5 shadow-xl shadow-black/20 hover:border-mlh-amber/40 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-mlh-muted">
                Sun Sign (Surya Rashi)
              </span>
              <span className="text-base text-amber-400">☉</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-heading font-medium text-white">
                {sunSign}
              </h2>
              <span className="text-xs font-mono text-mlh-muted">
                ({sunMeta.sanskrit})
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-mlh-muted">System: Nirayana</span>
              <span className="text-mlh-amber">Lord: {sunMeta.lord}</span>
            </div>
            <div className="mt-1 text-[11px] text-mlh-faint">
              Core Vitality, Dharma & Soul Purpose
            </div>
          </div>
        </div>

        {/* ================= 4. LOADING SKELETON ================= */}
        {(isLoading || (!userKundli && !hasFailed)) && (
          <div className="p-8 rounded-3xl border border-mlh-border/60 bg-mlh-surface/40 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-mlh-amber border-t-transparent rounded-full animate-spin" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-48 bg-mlh-surface-hi rounded-md" />
                <p className="text-xs text-mlh-muted font-mono">
                  Calculating planetary positions via Swiss Ephemeris...
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center justify-center">
              <Skeleton className="h-[420px] w-full max-w-[460px] mx-auto rounded-3xl bg-mlh-surface-hi" />
              <Skeleton className="h-[420px] w-full rounded-2xl bg-mlh-surface-hi" />
            </div>
          </div>
        )}

        {/* ================= ERROR STATE ================= */}
        {hasFailed && !userKundli && !isLoading && (
          <div className="p-8 sm:p-12 rounded-3xl border border-rose-500/30 bg-rose-950/10 backdrop-blur-xl text-center space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-xl font-heading font-medium text-white">
                Unable to Calculate Kundli
              </h3>
              <p className="text-xs sm:text-sm text-mlh-muted font-sans">
                {userKundliError ||
                  "We encountered an issue calculating your high-precision Vedic birth chart. Please verify your birth details or try refreshing."}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                onClick={handleRefresh}
                className="h-10 px-5 rounded-xl bg-mlh-amber hover:bg-amber-500 text-black font-semibold text-xs font-mono tracking-wider flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Calculation</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/onboarding")}
                className="h-10 px-5 rounded-xl border-mlh-border bg-mlh-surface/60 hover:bg-mlh-surface text-xs font-mono text-mlh-text hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-mlh-amber" />
                <span>Update Birth Details</span>
              </Button>
            </div>
          </div>
        )}

        {/* ================= 5. CHART VISUALIZATION & DATA SECTION ================= */}
        {!isLoading && userKundli && (
          <div className="space-y-8">
            {/* Varga Divisional Selector Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-mlh-border/80 bg-mlh-surface/80 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-mlh-muted mr-1 hidden sm:inline">
                  Divisional Chart:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveVarga("d1")}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                      activeVarga === "d1"
                        ? "border-mlh-amber bg-mlh-amber/15 text-mlh-amber font-semibold shadow-sm shadow-mlh-amber/20"
                        : "border-mlh-border text-mlh-muted hover:border-mlh-border/80 hover:text-white"
                    }`}
                  >
                    D-1 Rashi (Natal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVarga("d9")}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                      activeVarga === "d9"
                        ? "border-mlh-amber bg-mlh-amber/15 text-mlh-amber font-semibold shadow-sm shadow-mlh-amber/20"
                        : "border-mlh-border text-mlh-muted hover:border-mlh-border/80 hover:text-white"
                    }`}
                  >
                    D-9 Navamsha
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveVarga("d10")}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-xl border transition-all cursor-pointer ${
                      activeVarga === "d10"
                        ? "border-mlh-amber bg-mlh-amber/15 text-mlh-amber font-semibold shadow-sm shadow-mlh-amber/20"
                        : "border-mlh-border text-mlh-muted hover:border-mlh-border/80 hover:text-white"
                    }`}
                  >
                    D-10 Dashamsha
                  </button>
                </div>
              </div>

              {/* View Switcher Tabs (Chart Grid vs Detailed Bhavas vs Dashas) */}
              <div className="flex items-center gap-1 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("chart")}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    activeTab === "chart"
                      ? "bg-white/10 text-white font-medium"
                      : "text-mlh-faint hover:text-white"
                  }`}
                >
                  Kundli & Planets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("bhavas")}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    activeTab === "bhavas"
                      ? "bg-white/10 text-white font-medium"
                      : "text-mlh-faint hover:text-white"
                  }`}
                >
                  12 Bhavas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("dashas")}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                    activeTab === "dashas"
                      ? "bg-white/10 text-white font-medium"
                      : "text-mlh-faint hover:text-white"
                  }`}
                >
                  Dasha Timeline
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: Primary North Indian Diamond Chart + Planetary Table */}
            {activeTab === "chart" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 12-Box North Indian Diamond Chart (5 cols on desktop) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[460px] p-5 sm:p-6 rounded-3xl border border-mlh-border/80 bg-mlh-surface/90 backdrop-blur-xl shadow-2xl shadow-black/40">
                    <NorthIndianChart
                      chartData={activeChartData}
                      summary={summary}
                      title={
                        activeVarga === "d9"
                          ? "D-9 Navamsha Chart"
                          : activeVarga === "d10"
                          ? "D-10 Dashamsha Chart"
                          : "D-1 Rashi Janam Kundli"
                      }
                    />

                    {/* Chart Legend */}
                    <div className="mt-4 pt-3 border-t border-mlh-border/50 flex flex-wrap items-center justify-between text-[11px] font-mono text-mlh-muted">
                      <span>• Roman numerals: Signs</span>
                      <span>• (R): Retrograde</span>
                      <span className="text-mlh-amber">Asc: Ascendant</span>
                    </div>
                  </div>
                </div>

                {/* Planetary Positions Table (Graha Sphutas) (7 cols on desktop) */}
                <div className="lg:col-span-7">
                  <PlanetaryTable
                    chartData={
                      userKundli?.rasiChart ||
                      activeChartData ||
                      {}
                    }
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: 12 Bhavas Breakdown */}
            {activeTab === "bhavas" && (
              <div className="animate-in fade-in duration-300">
                <HouseAnalysis
                  chartData={userKundli?.rasiChart || activeChartData}
                  summary={summary}
                />
              </div>
            )}

            {/* TAB CONTENT 3: Vimshottari Dasha Periods */}
            {activeTab === "dashas" && (
              <div className="animate-in fade-in duration-300">
                <DashaTimeline
                  dashas={userKundli?.dashas || userKundli?.raw?.dashas}
                  summary={summary}
                />
              </div>
            )}

            {/* ================= 6. ASK VAANI CARD ================= */}
            <div className="pt-4">
              <AskVaaniPromptCard chartSummary={summary} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
