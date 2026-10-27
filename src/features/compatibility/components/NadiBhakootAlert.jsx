import React from "react";
import { AlertCircle, ShieldAlert, HeartHandshake } from "lucide-react";

export default function NadiBhakootAlert({ summary }) {
  if (!summary) return null;

  const { hasNadiDosha, hasBhakootDosha } = summary;

  if (!hasNadiDosha && !hasBhakootDosha) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-xl p-5 sm:p-7 space-y-4">
      <div className="flex items-center gap-2.5 text-amber-300">
        <ShieldAlert className="w-5 h-5 shrink-0" />
        <h4 className="text-base font-semibold">
          High-Weight Koota Observations & Remedies
        </h4>
      </div>

      <div className="space-y-3 text-xs text-white/80 leading-relaxed">
        {hasNadiDosha && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="font-semibold text-amber-300 block">
              Nadi Dosha Observed (0 / 8 Points):
            </span>
            <p className="text-white/70">
              Both partners share the same physiological Nadi (Vata, Pitta, or Kapha). In classical texts, this is examined for biological synergy and progeny.
            </p>
            <p className="text-white/60 text-[11.5px] pt-1">
              <strong>Classical Exceptions & Remedies:</strong> Nadi Dosha is naturally cancelled if the couple has different Nakshatras with the same Rashi, or the same Nakshatra with different Padas. Traditional remedies include reciting the Maha Mrityunjaya Mantra and donating grains or gold to charity.
            </p>
          </div>
        )}

        {hasBhakootDosha && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
            <span className="font-semibold text-amber-300 block">
              Bhakoot Dosha Observed (0 / 7 Points):
            </span>
            <p className="text-white/70">
              The relative Moon placement between the charts forms a 6/8 (Shadashtaka), 9/5 (Navapancham), or 2/12 (Dvidvadasha) relationship.
            </p>
            <p className="text-white/60 text-[11.5px] pt-1">
              <strong>Classical Exceptions & Remedies:</strong> If the Moon sign lords are friendly (e.g. Mars and Jupiter) or the same planet rules both signs, Bhakoot dosha is widely recognized as neutralized. Spiritual pilgrimage together or joint charitable acts reinforce bonding.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
