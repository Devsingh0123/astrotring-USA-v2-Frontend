import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

import Footer from "@/components/layout/Footer";
import BirthDetailsForm from "@/features/calculators/components/BirthDetailsForm";
import CalculatorHeader from "@/features/calculators/components/CalculatorHeader";
import CalculatorFaqSection from "@/features/calculators/components/CalculatorFaqSection";
import RelatedCalculatorsGrid, {
  ALL_CALCULATORS,
} from "@/features/calculators/components/RelatedCalculatorsGrid";

import NorthIndianChart from "@/features/calculators/components/NorthIndianChart";
import PlanetaryTable from "@/features/calculators/components/PlanetaryTable";
import HouseAnalysis from "@/features/calculators/components/HouseAnalysis";
import DashaTimeline from "@/features/calculators/components/DashaTimeline";
import AskJyotishPromptCard from "@/features/calculators/components/AskJyotishPromptCard";

import SadeSatiView from "@/features/calculators/components/SadeSatiView";
import MangalDoshaView from "@/features/calculators/components/MangalDoshaView";
import DashaTreeView from "@/features/calculators/components/DashaTreeView";

import {
  calculateKundli,
  calculateSaturnTimeline,
} from "@/features/calculators";

export default function CalculatorRunnerPage() {
  const { toolName = "free-kundli-maker" } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // If kundli-milan is visited under calculators, redirect to /compatibility
  useEffect(() => {
    if (toolName === "kundli-milan") {
      navigate("/compatibility", { replace: true });
    }
  }, [toolName, navigate]);

  const {
    kundliData,
    status: kundliStatus,
    error: kundliError,
    saturnTimelineData,
    saturnTimelineStatus,
    saturnTimelineError,
  } = useSelector((state) => state.calculators || {});

  const currentCalc =
    ALL_CALCULATORS.find((c) => c.id === toolName) || {
      id: toolName,
      title: toolName.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      desc: "Vedic precision calculations synthesized from your birth chart.",
      tag: "Vedic Tool",
    };

  const isSadeSati = toolName === "shani-sade-sati";
  const isMangalDosha = toolName === "mangal-dosha";
  const isDasha = toolName === "vimshottari-dasha";

  const isSpecialized = isSadeSati || isMangalDosha || isDasha;
  const activeData = isSadeSati ? saturnTimelineData : kundliData;
  const isLoading = isSadeSati ? saturnTimelineStatus === "loading" : kundliStatus === "loading";
  const activeError = isSadeSati ? saturnTimelineError : kundliError;

  const [showForm, setShowForm] = useState(!activeData);

  const handleFormSubmit = async (formData) => {
    if (isSadeSati) {
      const res = await dispatch(calculateSaturnTimeline(formData));
      if (calculateSaturnTimeline.fulfilled.match(res)) {
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      const res = await dispatch(calculateKundli(formData));
      if (calculateKundli.fulfilled.match(res)) {
        setShowForm(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground flex flex-col justify-between">
      <Helmet>
        <title>{currentCalc.title} | AstroTring Vedic Calculators</title>
        <meta name="description" content={currentCalc.desc} />
        <meta property="og:title" content={`${currentCalc.title} | AstroTring`} />
        <meta property="og:description" content={currentCalc.desc} />
      </Helmet>

      <div className="w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-8 flex-1">
        {/* Header Section */}
        <CalculatorHeader
          title={currentCalc.title}
          subtitle={currentCalc.desc}
          category={currentCalc.tag}
          onReset={() => setShowForm(true)}
          hasData={Boolean(activeData && !showForm)}
        />

        {activeError && (
          <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{activeError}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showForm || !activeData ? (
            /* Birth Input Form */
            <motion.div
              key="form-view"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <BirthDetailsForm
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            </motion.div>
          ) : (
            /* Results View */
            <motion.div
              key="result-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              {/* Specialized Views */}
              {isSadeSati && (
                <SadeSatiView
                  data={saturnTimelineData}
                  onReset={() => setShowForm(true)}
                />
              )}

              {isMangalDosha && (
                <MangalDoshaView
                  kundliData={kundliData}
                  onReset={() => setShowForm(true)}
                />
              )}

              {isDasha && (
                <DashaTreeView
                  kundliData={kundliData}
                  onReset={() => setShowForm(true)}
                />
              )}

              {/* Standard Full Kundli Analysis (for free-kundli-maker and general calculators) */}
              {!isSpecialized && (
                <div className="space-y-8">
                  {/* Chart and Table side-by-side on desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-6 w-full flex justify-center">
                      <NorthIndianChart
                        rasiChart={kundliData?.rasiChart}
                        summary={kundliData?.summary}
                      />
                    </div>
                    <div className="lg:col-span-6 w-full">
                      <PlanetaryTable rasiChart={kundliData?.rasiChart} />
                    </div>
                  </div>

                  {/* House placements */}
                  <HouseAnalysis rasiChart={kundliData?.rasiChart} />

                  {/* Dasha timeline summary */}
                  <DashaTimeline
                    dashas={kundliData?.dashas}
                    summary={kundliData?.summary}
                  />

                  {/* Ask Jyotish AI CTA */}
                  <AskJyotishPromptCard />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQs */}
        <CalculatorFaqSection toolName={toolName} />

        {/* Other Calculators Carousel/Grid */}
        <RelatedCalculatorsGrid currentToolId={toolName} />
      </div>

      <Footer />
    </div>
  );
}
