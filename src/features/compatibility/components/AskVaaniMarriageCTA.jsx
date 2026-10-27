import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, MessageCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MARRIAGE_QUESTIONS = [
  "When is our most auspicious wedding window according to our current Mahadashas?",
  "How can we balance our planetary temperaments for greater emotional peace?",
  "What specific remedies does our chart suggest for long-term domestic prosperity?",
  "How will our joint financial karma unfold after marriage?",
];

export default function AskVaaniMarriageCTA({
  boyName = "Partner 1",
  girlName = "Partner 2",
}) {
  const navigate = useNavigate();

  const handleAskQuestion = (question) => {
    // Navigate to Vaani chat with preloaded question query
    const encoded = encodeURIComponent(
      `Based on our Kundli Milan between ${boyName} and ${girlName}: ${question}`
    );
    navigate(`/?engine=vaani&q=${encoded}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ask Vaani AI Box */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-[#1b1424] to-[#120f1a] p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Consult Vaani AI</span>
          </div>
          <h4 className="text-base font-semibold text-white">
            Ask specific follow-up questions
          </h4>
          <p className="text-xs text-mlh-muted leading-relaxed">
            Take these matching parameters directly to Vaani for timing insights, Dasha compatibility, and personalized remedies.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {MARRIAGE_QUESTIONS.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskQuestion(q)}
              className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-400/30 text-white/80 hover:text-white text-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{q}</span>
              <MessageCircle className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Marriage Deep Report Upsell */}
      <div className="rounded-3xl border border-mlh-plum-500/30 bg-gradient-to-br from-[#1f101d] to-[#130f1c] p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-mlh-plum-300 font-mono text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4 text-mlh-plum-400" />
            <span>10-Page Vedic Reading</span>
          </div>
          <h4 className="text-base font-semibold text-white">
            Marriage & Harmony Deep Report
          </h4>
          <p className="text-xs text-mlh-muted leading-relaxed">
            Unlock comprehensive Navamsa (D-9) analysis, 7th house lord strength, timing of union, and generational harmony.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => navigate("/reports/marriage")}
            className="w-full py-5 rounded-2xl bg-mlh-plum hover:bg-mlh-plum-400 text-white font-medium text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>Read Marriage Report Preview</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
