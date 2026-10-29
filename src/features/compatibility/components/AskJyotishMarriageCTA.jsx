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

export default function AskJyotishMarriageCTA({
  boyName = "Partner 1",
  girlName = "Partner 2",
}) {
  const navigate = useNavigate();

  const handleAskQuestion = (question) => {
    // Navigate to Jyotish chat with preloaded question query
    const encoded = encodeURIComponent(
      `Based on our Kundli Milan between ${boyName} and ${girlName}: ${question}`
    );
    navigate(`/?engine=jyotish&q=${encoded}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Ask Jyotish AI Box */}
      <div className="rounded-3xl border border-primary/30 glass-card bg-card/85 dark:bg-card/75 p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-mono text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Consult Jyotish AI</span>
          </div>
          <h4 className="text-base font-semibold text-foreground font-serif">
            Ask specific follow-up questions
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Take these matching parameters directly to Jyotish for timing insights, Dasha compatibility, and personalized remedies.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          {MARRIAGE_QUESTIONS.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleAskQuestion(q)}
              className="w-full text-left p-3 rounded-xl border border-border/70 glass-card bg-accent/30 hover:bg-accent/60 text-foreground text-xs transition-all flex items-center justify-between group cursor-pointer"
            >
              <span className="truncate pr-2">{q}</span>
              <MessageCircle className="w-3.5 h-3.5 text-primary shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Marriage Deep Report Upsell */}
      <div className="rounded-3xl border border-amber-500/30 glass-card bg-card/85 dark:bg-card/75 p-6 space-y-4 shadow-xl flex flex-col justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4 text-amber-500" />
            <span>10-Page Vedic Reading</span>
          </div>
          <h4 className="text-base font-semibold text-foreground font-serif">
            Marriage & Harmony Deep Report
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Unlock comprehensive Navamsa (D-9) analysis, 7th house lord strength, timing of union, and generational harmony.
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={() => navigate("/reports/marriage")}
            className="w-full py-4 h-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/25 transition-all"
          >
            <span>Read Marriage Report Preview</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
