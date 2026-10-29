import { AlertTriangle, CheckCircle2, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ManglikDoshaCard({ summary, partners }) {
  if (!summary || !partners) return null;

  const { isBoyManglik, isGirlManglik, manglikCancellation } = summary;
  const bothManglik = isBoyManglik && isGirlManglik;
  const oneManglik = (isBoyManglik && !isGirlManglik) || (!isBoyManglik && isGirlManglik);
  const noneManglik = !isBoyManglik && !isGirlManglik;

  return (
    <div className="rounded-3xl border border-border/80 glass-card bg-card/85 dark:bg-card/75 backdrop-blur-xl p-5 sm:p-7 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground font-serif">
              Mangal Dosha (Manglik) Evaluation
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mars position in houses 1, 2, 4, 7, 8, 12 and classical mutual cancellation.
            </p>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`self-start sm:self-auto px-3 py-1 text-xs font-mono tracking-wider uppercase rounded-full ${
            noneManglik
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : manglikCancellation
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {noneManglik
            ? "Dosha Free"
            : manglikCancellation
            ? "Dosha Neutralized"
            : "Active Mangal Dosha"}
        </Badge>
      </div>

      {/* Side by side status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Partner 1 */}
        <div className="p-4 rounded-2xl bg-accent/30 dark:bg-accent/20 border border-border/60 space-y-1.5">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">
            {partners.boy.name} (Groom)
          </div>
          <div className="flex items-center gap-2">
            {isBoyManglik ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Mangal Dosha Present
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  No Mangal Dosha
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isBoyManglik
              ? "Mars occupies a sensitive house from Lagna or Moon."
              : "Mars is comfortably placed outside marital conflict houses."}
          </p>
        </div>

        {/* Partner 2 */}
        <div className="p-4 rounded-2xl bg-accent/30 dark:bg-accent/20 border border-border/60 space-y-1.5">
          <div className="text-[11px] font-mono text-muted-foreground uppercase">
            {partners.girl.name} (Bride)
          </div>
          <div className="flex items-center gap-2">
            {isGirlManglik ? (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Mangal Dosha Present
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  No Mangal Dosha
                </span>
              </>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isGirlManglik
              ? "Mars occupies a sensitive house from Lagna or Moon."
              : "Mars is comfortably placed outside marital conflict houses."}
          </p>
        </div>
      </div>

      {/* Cancellation Verdict & Remedies */}
      <div className="p-4 rounded-2xl border border-border/70 glass-card bg-accent/20 text-xs text-foreground/90 space-y-1.5">
        <span className="font-semibold text-foreground block">
          Classical Astrological Guidance:
        </span>
        {noneManglik && (
          <p className="text-emerald-600 dark:text-emerald-400 leading-relaxed">
            Neither chart exhibits Mangal Dosha. No special Manglik remedies or rituals are necessary for this union.
          </p>
        )}
        {bothManglik && (
          <p className="text-amber-600 dark:text-amber-400 leading-relaxed">
            Both partners possess Mangal Dosha. According to classical Vedic texts (Brihat Parashara Hora Shastra), when both the groom and bride are Manglik, their planetary energies mutually cancel each other out, establishing karmic equilibrium.
          </p>
        )}
        {oneManglik && !manglikCancellation && (
          <div className="space-y-1 text-destructive/90 leading-relaxed">
            <p>
              One partner is Manglik while the other is not. While Ashtakoota score remains the primary measure of union harmony, Vedic tradition recommends:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-muted-foreground pl-1 pt-1">
              <li>Reciting the Hanuman Chalisa or Mangal Gayatri Mantra on Tuesdays.</li>
              <li>Performing a traditional Kumbh Vivah or Vishnu Vivah prior to wedding rites.</li>
              <li>Maintaining clear, respectful communication during Mars transits.</li>
            </ul>
          </div>
        )}
        {oneManglik && manglikCancellation && (
          <p className="text-amber-600 dark:text-amber-400 leading-relaxed">
            Although one partner has Mars in a traditional Manglik house, specific classical cancellation rules (such as Mars in its own sign, exalted, or favorably aspected by Jupiter) render the dosha neutralized.
          </p>
        )}
      </div>
    </div>
  );
}
