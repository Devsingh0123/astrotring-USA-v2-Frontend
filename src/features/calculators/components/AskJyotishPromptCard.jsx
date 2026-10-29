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

export default function AskJyotishPromptCard({
  chartSummary = {},
  prompts = DEFAULT_PROMPTS,
  title,
}) {
  const displayTitle =
    title ||
    (chartSummary?.ascendantSign
      ? `Have questions about your ${chartSummary.ascendantSign} Ascendant?`
      : "Have questions about your Vedic Chart?");

  const activePrompts = Array.isArray(prompts) && prompts.length > 0 ? prompts : DEFAULT_PROMPTS;

  return (
    <div className="relative rounded-2xl border border-primary/30 glass-card p-5 sm:p-7 shadow-xl overflow-hidden">
      {/* Decorative celestial background glow */}
      <div className="absolute -right-16 -top-16 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI VEDIC ASTROLOGER</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-medium text-foreground">
            {displayTitle}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Jyotish synthesizes your planetary degrees, active Dasha periods, and 12 Bhavas to deliver hyper-personalized Vedic guidance in seconds. First question is free.
          </p>
        </div>

        <Link to="/?engine=jyotish">
          <Button className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center gap-2 shrink-0 cursor-pointer">
            <MessageSquare className="w-4 h-4" />
            <span>Consult Jyotish</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Starter Question Chips */}
      <div className="mt-6 pt-5 border-t border-border/50">
        <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
          Popular Questions For This Chart:
        </div>
        <div className="flex flex-wrap gap-2">
          {activePrompts.map((prompt, idx) => (
            <Link
              key={idx}
              to={`/?engine=jyotish&q=${encodeURIComponent(prompt)}`}
              className="px-3 py-1.5 rounded-lg border border-border/80 glass-card hover:border-primary/50 text-xs text-foreground transition-all text-left flex items-center gap-2 group cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-primary/60 group-hover:text-primary shrink-0" />
              <span>{prompt}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
