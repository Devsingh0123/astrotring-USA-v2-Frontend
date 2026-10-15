import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_PROMPTS = [
  "When will my next major career breakthrough occur based on this chart?",
  "Analyze my 7th and 11th houses for marriage timing and partnerships.",
  "What planetary remedies should I follow for my current running Dasha?",
  "Explain my Gajakesari Yoga and its manifestation in my life.",
];

export default function AskVaaniPromptCard({
  chartSummary = {},
  onSelectPrompt,
}) {
  const ascendant = chartSummary?.ascendantSign || "your Lagna";
  const moonSign = chartSummary?.moonSign || "your Moon sign";

  return (
    <div className="relative rounded-2xl border border-mlh-plum/40 bg-gradient-to-br from-mlh-surface via-mlh-surface to-mlh-plum-800/20 p-5 sm:p-7 shadow-2xl shadow-mlh-plum/10 overflow-hidden">
      {/* Decorative celestial background glow */}
      <div className="absolute -right-16 -top-16 w-52 h-52 bg-mlh-amber/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-mlh-amber/30 bg-mlh-amber/10 text-mlh-amber text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI VEDIC ASTROLOGER</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-heading font-medium text-mlh-text-hi">
            Have questions about your {ascendant} Ascendant?
          </h3>

          <p className="text-xs sm:text-sm text-mlh-muted leading-relaxed">
            Vaani synthesizes your planetary degrees, active Dasha periods, and 12 Bhavas to deliver hyper-personalized Vedic guidance in seconds. First question is free.
          </p>
        </div>

        <Link to="/?engine=vaani">
          <Button className="h-11 px-6 bg-gradient-to-r from-mlh-amber to-amber-600 hover:from-amber-500 hover:to-amber-600 text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-mlh-amber/20 hover:shadow-mlh-amber/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer">
            <MessageSquare className="w-4 h-4 text-black" />
            <span>Consult Vaani</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </Button>
        </Link>
      </div>

      {/* Starter Question Chips */}
      <div className="mt-6 pt-5 border-t border-mlh-border/50">
        <div className="text-[11px] font-mono uppercase tracking-wider text-mlh-muted mb-3">
          Popular Questions For This Chart:
        </div>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_PROMPTS.map((prompt, idx) => (
            <Link
              key={idx}
              to={`/?engine=vaani&q=${encodeURIComponent(prompt)}`}
              className="px-3 py-1.5 rounded-lg border border-mlh-border/80 bg-mlh-bg/60 hover:bg-mlh-surface hover:border-mlh-amber/50 text-xs text-mlh-text hover:text-mlh-text-hi transition-all text-left flex items-center gap-2 group cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-mlh-amber/60 group-hover:text-mlh-amber shrink-0" />
              <span>{prompt}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
