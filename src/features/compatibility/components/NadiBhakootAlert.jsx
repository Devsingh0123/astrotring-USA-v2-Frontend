import { ShieldAlert } from "lucide-react";

export default function NadiBhakootAlert({ summary }) {
  if (!summary) return null;

  const { hasNadiDosha, hasBhakootDosha } = summary;

  if (!hasNadiDosha && !hasBhakootDosha) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-amber-500/40 glass-card bg-amber-500/10 dark:bg-amber-950/20 backdrop-blur-xl p-5 sm:p-7 space-y-4 shadow-lg">
      <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <h4 className="text-base font-semibold font-serif text-foreground">
          High-Weight Koota Observations & Remedies
        </h4>
      </div>

      <div className="space-y-3 text-xs text-foreground/90 leading-relaxed">
        {hasNadiDosha && (
          <div className="p-3.5 rounded-2xl bg-card/80 dark:bg-card/60 border border-border/70 space-y-1 shadow-xs">
            <span className="font-semibold text-amber-600 dark:text-amber-400 block">
              Nadi Dosha Observed (0 / 8 Points):
            </span>
            <p className="text-muted-foreground">
              Both partners share the same physiological Nadi (Vata, Pitta, or Kapha). In classical texts, this is examined for biological synergy and progeny.
            </p>
            <p className="text-muted-foreground/90 text-[11.5px] pt-1">
              <strong className="text-foreground font-semibold">Classical Exceptions & Remedies:</strong> Nadi Dosha is naturally cancelled if the couple has different Nakshatras with the same Rashi, or the same Nakshatra with different Padas. Traditional remedies include reciting the Maha Mrityunjaya Mantra and donating grains or gold to charity.
            </p>
          </div>
        )}

        {hasBhakootDosha && (
          <div className="p-3.5 rounded-2xl bg-card/80 dark:bg-card/60 border border-border/70 space-y-1 shadow-xs">
            <span className="font-semibold text-amber-600 dark:text-amber-400 block">
              Bhakoot Dosha Observed (0 / 7 Points):
            </span>
            <p className="text-muted-foreground">
              The relative Moon placement between the charts forms a 6/8 (Shadashtaka), 9/5 (Navapancham), or 2/12 (Dvidvadasha) relationship.
            </p>
            <p className="text-muted-foreground/90 text-[11.5px] pt-1">
              <strong className="text-foreground font-semibold">Classical Exceptions & Remedies:</strong> If the Moon sign lords are friendly (e.g. Mars and Jupiter) or the same planet rules both signs, Bhakoot dosha is widely recognized as neutralized. Spiritual pilgrimage together or joint charitable acts reinforce bonding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
