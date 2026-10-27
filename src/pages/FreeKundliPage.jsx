import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import CalculatorHeader from "@/features/calculators/components/CalculatorHeader";
import BirthDetailsForm from "@/features/calculators/components/BirthDetailsForm";
import NorthIndianChart from "@/features/calculators/components/NorthIndianChart";
import PlanetaryTable from "@/features/calculators/components/PlanetaryTable";
import HouseAnalysis from "@/features/calculators/components/HouseAnalysis";
import DashaTimeline from "@/features/calculators/components/DashaTimeline";
import CalculatorFaqSection from "@/features/calculators/components/CalculatorFaqSection";
import RelatedCalculatorsGrid from "@/features/calculators/components/RelatedCalculatorsGrid";

import { calculateKundli } from "@/features/calculators";

export default function FreeKundliPage() {
  const dispatch = useDispatch();
  const { kundliData, status, error, lastInput } = useSelector(
    (state) => state.calculators
  );

  const [vargaTab, setVargaTab] = useState("d1"); // "d1" | "d9" | "d10"
  const [detailsTab, setDetailsTab] = useState("planets"); // "planets" | "bhavas" | "dashas"

  const isLoading = status === "loading";
  const hasFailed = status === "failed";

  const handleFormSubmit = (payload) => {
    dispatch(calculateKundli(payload));
  };

  const getActiveChartData = () => {
    if (!kundliData) return {};
    if (vargaTab === "d9") {
      return (
        kundliData.navamsaChart ||
        kundliData.horoscope?.divisional_charts?.["D-9_navamsa"] ||
        kundliData.allDivisionalCharts?.["D-9_navamsa"] ||
        {}
      );
    }
    if (vargaTab === "d10") {
      return (
        kundliData.dasamsaChart ||
        kundliData.horoscope?.divisional_charts?.["D-10_dasamsa"] ||
        kundliData.allDivisionalCharts?.["D-10_dasamsa"] ||
        {}
      );
    }
    return (
      kundliData.rasiChart ||
      kundliData.horoscope?.divisional_charts?.["D-1_rasi"] ||
      kundliData.allDivisionalCharts?.["D-1_rasi"] ||
      {}
    );
  };

  const getActiveChartTitle = () => {
    if (vargaTab === "d9") return "D-9 Navamsha Chart";
    if (vargaTab === "d10") return "D-10 Dashamsha Chart";
    return "D-1 Rashi Janam Kundli";
  };

  const summary = kundliData?.summary || {};

  return (
    <div className="min-h-screen bg-mlh-bg text-mlh-text pb-24">
      <Helmet>
        <title>Free Kundli Maker & Birth Chart Calculator | AstroTring</title>
        <meta
          name="description"
          content="A Kundli, or Janam Kundali, is a birth chart mapping the position of the planets, Sun and Moon across the twelve houses at your moment of birth. AstroTring generates it free using Swiss Ephemeris data."
        />
      </Helmet>

      <div className="relative px-6 pt-9 pb-20 sm:px-10 sm:pt-11 lg:px-14 xl:px-20 max-w-[1400px] mx-auto">
        {/* Melooha Header */}
        <CalculatorHeader
          category="BIRTH CHART"
          updatedDate="21 JUL 2026"
          title="Free Kundli Maker"
          icon="/calculators/free-kundli-maker.png"
          subtitle="A Kundli, or Janam Kundali, is a birth chart mapping the position of the planets, Sun and Moon across the twelve houses at your moment of birth. AstroTring generates it free using Swiss Ephemeris data, giving you your ascendant, planetary placements, Vimshottari Dasha periods and active yogas in seconds."
          reviewerName="Dr. Vineeta Chandrashekhar Phatak"
          reviewerTitle="CHIEF ASTROLOGER · ASTROTRING"
        />

        {/* 2-Column Responsive Layout Matching Melooha */}
        <div className="mt-8 grid grid-cols-1 items-start gap-x-8 gap-y-9 lg:grid-cols-[minmax(0,1fr)_320px] xl:gap-x-10">
          {/* Main Area (Form + Results + FAQs) */}
          <div className="min-w-0 space-y-8">
            {/* Form Console */}
            <BirthDetailsForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              initialValues={lastInput}
            />

            {/* Error Notice (Matching Melooha's exact copy) */}
            {!isLoading && hasFailed && (
              <div className="p-6 rounded-2xl border border-mlh-danger/40 bg-mlh-surface/60 text-left space-y-2">
                <div className="flex items-center gap-2 text-mlh-danger font-serif text-base font-medium">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>That calculation did not come back.</span>
                </div>
                <p className="text-sm text-mlh-muted leading-relaxed">
                  Check the date, time and place, then run it again.
                </p>
                {error && (
                  <p className="text-xs font-mono text-mlh-faint mt-1">
                    Detail: {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(calculateKundli(lastInput || {}))}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-mlh-border hover:border-mlh-plum-400 text-xs font-sans text-white transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try again</span>
                </button>
              </div>
            )}

            {/* Loading Skeletons */}
            {isLoading && (
              <div className="space-y-4 p-6 rounded-2xl border border-mlh-plum-500/20 bg-mlh-surface/40">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Skeleton className="h-16 w-full bg-mlh-surface-hi rounded-xl" />
                  <Skeleton className="h-16 w-full bg-mlh-surface-hi rounded-xl" />
                  <Skeleton className="h-16 w-full bg-mlh-surface-hi rounded-xl" />
                  <Skeleton className="h-16 w-full bg-mlh-surface-hi rounded-xl" />
                </div>
                <div className="flex justify-center py-6">
                  <Skeleton className="h-[360px] w-full max-w-[400px] bg-mlh-surface-hi rounded-2xl" />
                </div>
              </div>
            )}

            {/* Calculation Result Display */}
            {!isLoading && kundliData && (
              <div className="space-y-6 pt-2">
                {/* 4 Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-mlh-plum-400/40 bg-mlh-plum-500/10">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-mlh-plum-300 block mb-0.5">
                      Ascendant (Lagna)
                    </span>
                    <span className="text-base font-serif font-semibold text-white block">
                      {summary.ascendantSign || "—"}
                    </span>
                    <span className="text-[10px] font-mono text-mlh-muted">
                      {summary.ascendantDegree !== undefined
                        ? `${Number(summary.ascendantDegree % 30).toFixed(2)}°`
                        : "—"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-mlh-border/70 bg-mlh-surface/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-mlh-muted block mb-0.5">
                      Moon Sign (Rashi)
                    </span>
                    <span className="text-base font-serif font-semibold text-white block">
                      {summary.moonSign || "—"}
                    </span>
                    <span className="text-[10px] font-mono text-mlh-muted">
                      {summary.moonDegree !== undefined
                        ? `${Number(summary.moonDegree % 30).toFixed(2)}°`
                        : "—"}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-mlh-border/70 bg-mlh-surface/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-mlh-muted block mb-0.5">
                      Nakshatra
                    </span>
                    <span className="text-base font-serif font-semibold text-white block truncate">
                      {summary.nakshatra || "—"}
                    </span>
                    <span className="text-[10px] font-mono text-mlh-plum-300">
                      {summary.pada ? `Pada ${summary.pada}` : "—"}{summary.nakshatraLord ? ` (${summary.nakshatraLord})` : ""}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-mlh-border/70 bg-mlh-surface/60">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-mlh-muted block mb-0.5">
                      Sun Sign
                    </span>
                    <span className="text-base font-serif font-semibold text-white block">
                      {summary.sunSign || "—"}
                    </span>
                    <span className="text-[10px] font-mono text-mlh-muted">
                      Nirayana Solar
                    </span>
                  </div>
                </div>

                {/* Varga Selector Pills */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVargaTab("d1")}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-full border transition-all ${
                      vargaTab === "d1"
                        ? "border-mlh-plum-400 bg-mlh-plum-500/25 text-white font-medium"
                        : "border-mlh-border text-mlh-muted hover:border-mlh-plum-400/40 hover:text-white"
                    }`}
                  >
                    D-1 Rashi
                  </button>
                  <button
                    type="button"
                    onClick={() => setVargaTab("d9")}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-full border transition-all ${
                      vargaTab === "d9"
                        ? "border-mlh-plum-400 bg-mlh-plum-500/25 text-white font-medium"
                        : "border-mlh-border text-mlh-muted hover:border-mlh-plum-400/40 hover:text-white"
                    }`}
                  >
                    D-9 Navamsha
                  </button>
                  <button
                    type="button"
                    onClick={() => setVargaTab("d10")}
                    className={`px-3.5 py-1.5 text-xs font-mono rounded-full border transition-all ${
                      vargaTab === "d10"
                        ? "border-mlh-plum-400 bg-mlh-plum-500/25 text-white font-medium"
                        : "border-mlh-border text-mlh-muted hover:border-mlh-plum-400/40 hover:text-white"
                    }`}
                  >
                    D-10 Dashamsha
                  </button>
                </div>

                {/* North Indian Diamond Kundli Chart */}
                <NorthIndianChart
                  chartData={getActiveChartData()}
                  summary={summary}
                  title={getActiveChartTitle()}
                />

                {/* Detailed Analysis Tabs */}
                <Tabs
                  value={detailsTab}
                  onValueChange={setDetailsTab}
                  className="w-full space-y-4"
                >
                  <TabsList className="w-full grid grid-cols-3 bg-mlh-surface border border-mlh-border/80 h-11 p-1 rounded-xl">
                    <TabsTrigger
                      value="planets"
                      className="text-xs font-mono uppercase data-[state=active]:bg-mlh-bg data-[state=active]:text-white"
                    >
                      Planets
                    </TabsTrigger>
                    <TabsTrigger
                      value="bhavas"
                      className="text-xs font-mono uppercase data-[state=active]:bg-mlh-bg data-[state=active]:text-white"
                    >
                      12 Bhavas
                    </TabsTrigger>
                    <TabsTrigger
                      value="dashas"
                      className="text-xs font-mono uppercase data-[state=active]:bg-mlh-bg data-[state=active]:text-white"
                    >
                      Dashas
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="planets" className="mt-0">
                    <PlanetaryTable chartData={kundliData.rasiChart || {}} />
                  </TabsContent>

                  <TabsContent value="bhavas" className="mt-0">
                    <HouseAnalysis
                      chartData={kundliData.rasiChart || {}}
                      summary={summary}
                    />
                  </TabsContent>

                  <TabsContent value="dashas" className="mt-0">
                    <DashaTimeline
                      dashas={kundliData.dashas || {}}
                      summary={summary}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* How it works */}
            <CalculatorFaqSection toolName="Free Kundli Maker" />

            {/* Related Calculators Grid */}
            <RelatedCalculatorsGrid currentToolId="free-kundli-maker" />
          </div>

          {/* Right Complementary Sidebar (320px) matching Melooha */}
          <aside className="space-y-4 lg:sticky lg:top-8">
            {/* Metric Card */}
            <div className="rounded-2xl border border-mlh-border/70 bg-mlh-surface/60 p-5 text-left">
              <div className="font-serif text-[28px] leading-tight text-white font-medium">
                12 houses
              </div>
              <p className="text-mlh-muted text-xs mt-1.5">
                mapped from your exact birth moment
              </p>
            </div>

            {/* Want it interpreted? Card */}
            <div className="rounded-2xl border border-mlh-plum-500/30 bg-gradient-to-b from-mlh-plum-500/15 to-transparent p-5 text-left space-y-3">
              <div className="flex items-center gap-3">
                <span className="grid h-[34px] w-[34px] flex-none place-items-center rounded-full bg-mlh-plum-500/20 text-mlh-plum-300 border border-mlh-plum-400/30">
                  <Sparkles className="w-4 h-4" />
                </span>
                <div className="font-serif text-lg text-white font-medium leading-snug">
                  Want it interpreted?
                </div>
              </div>

              <p className="text-xs text-mlh-muted leading-relaxed">
                Jyotish reads this result against the rest of your chart, not in isolation.
              </p>

              <Link
                to="/?engine=jyotish"
                className="block w-full text-center py-2.5 rounded-full border border-mlh-plum-400/40 text-mlh-plum-300 hover:bg-mlh-plum-500/20 font-sans text-sm font-medium transition cursor-pointer"
              >
                Ask Jyotish
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
