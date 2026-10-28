import { Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashaTimeline({ dashas = {}, summary = {} }) {
  // If backend returns graha_dashas / vimsottari
  const majorDasha = dashas?.current_mahadasha || dashas?.major || "—";
  const subDasha = dashas?.current_antardasha || dashas?.sub || "—";
  const pratyantar = dashas?.current_pratyantar || dashas?.sub_sub || "—";

  const nakshatra = summary?.nakshatra || "—";
  const nakshatraLord = summary?.nakshatraLord || "—";
  const balanceAtBirth = dashas?.balance_at_birth || (summary?.nakshatraLord ? `${summary.nakshatraLord} Dasha` : "—");

  return (
    <div className="glass-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/60">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span>Vimshottari Dasha Periods</span>
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            120-year planetary cycle calculated from Moon Nakshatra ({nakshatra})
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-primary/30 text-primary bg-primary/10 font-mono text-[10px] font-medium"
        >
          ACTIVE CYCLE
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Mahadasha */}
        <div className="p-4 rounded-xl border border-primary/40 bg-primary/10 relative overflow-hidden shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1 font-semibold">
            Running Mahadasha
          </div>
          <div className="text-xl sm:text-2xl font-serif font-medium text-foreground flex items-center gap-2">
            <span>{majorDasha}</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Primary overarching planetary influence governing life focus, karma, and temperament.
          </p>
        </div>

        {/* Current Antardasha */}
        <div className="p-4 rounded-xl border border-border/70 glass-card shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 font-medium">
            Active Antardasha (Bhukti)
          </div>
          <div className="text-xl sm:text-2xl font-serif font-medium text-foreground">
            {subDasha}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Secondary sub-period modulating opportunities, relationship dynamics, and career shifts.
          </p>
        </div>

        {/* Current Pratyantardasha */}
        <div className="p-4 rounded-xl border border-border/70 glass-card shadow-sm">
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1 font-medium">
            Pratyantardasha (Micro Period)
          </div>
          <div className="text-xl sm:text-2xl font-serif font-medium text-foreground">
            {pratyantar}
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Short-term energetic trigger for immediate events, decisions, and weekly transit activations.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-mlh-border/40 flex items-center justify-between text-xs font-mono text-mlh-muted">
        <span>Balance of Dasha at Birth: <strong className="text-mlh-text-hi">{balanceAtBirth}</strong></span>
        <span className="hidden sm:inline text-mlh-faint">Lord of Moon Nakshatra: {nakshatraLord}</span>
      </div>
    </div>
  );
}
