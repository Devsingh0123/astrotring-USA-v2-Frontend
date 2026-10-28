import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PLANET_NAMES = [
  { key: "Ascendant", label: "Ascendant (Lagna)", glyph: "✦" },
  { key: "Sun", label: "Sun (Surya)", glyph: "☉" },
  { key: "Moon", label: "Moon (Chandra)", glyph: "☽" },
  { key: "Mars", label: "Mars (Mangal)", glyph: "♂" },
  { key: "Mercury", label: "Mercury (Budha)", glyph: "☿" },
  { key: "Jupiter", label: "Jupiter (Guru)", glyph: "♃" },
  { key: "Venus", label: "Venus (Shukra)", glyph: "♀" },
  { key: "Saturn", label: "Saturn (Shani)", glyph: "♄" },
  { key: "Rahu", label: "Rahu (North Node)", glyph: "☊" },
  { key: "Ketu", label: "Ketu (South Node)", glyph: "☋" },
];

function formatDegree(degree) {
  if (degree === undefined || degree === null) return "—";
  const degInSign = degree % 30;
  const d = Math.floor(degInSign);
  const m = Math.floor((degInSign - d) * 60);
  const s = Math.floor(((degInSign - d) * 60 - m) * 60);
  return `${d}° ${m}' ${s}"`;
}

export default function PlanetaryTable({ chartData = {} }) {
  return (
    <div className="glass-card rounded-2xl border border-border/70 overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
        <div>
          <h3 className="text-base font-serif font-medium text-foreground">
            Planetary Positions (Graha Sphutas)
          </h3>
          <p className="text-xs text-muted-foreground font-mono">
            Nirayana (Sidereal) Zodiac · Lahiri Ayanamsha
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-accent/30">
            <TableRow className="border-border/60 hover:bg-transparent">
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase py-3">
                Planet
              </TableHead>
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
                Sign (Rashi)
              </TableHead>
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
                Degree
              </TableHead>
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
                Nakshatra
              </TableHead>
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
                Pada
              </TableHead>
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase">
                Lord
              </TableHead>
              <TableHead className="text-[11px] font-mono tracking-wider text-muted-foreground uppercase text-right">
                Motion
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {PLANET_NAMES.map(({ key, label, glyph }) => {
              const data = chartData[key] || chartData[key.toLowerCase()];
              if (!data) return null;

              const isRetro = Boolean(data.retrograde);
              const isAsc = key === "Ascendant";

              return (
                <TableRow
                  key={key}
                  className="border-border/40 hover:bg-accent/40 transition-colors"
                >
                  <TableCell className="py-3 font-medium text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-base text-primary w-4 text-center font-serif">
                        {glyph}
                      </span>
                      <span>{label}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium text-foreground">
                    {data.sign || "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-foreground font-medium">
                    {formatDegree(data.longitude)}
                  </TableCell>
                  <TableCell className="text-xs text-foreground/80">
                    {data.nakshatra || "—"}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-primary font-semibold">
                    {data.pada || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {data.sign_lord || data.nakshatra_lord || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {isAsc ? (
                      <Badge
                        variant="outline"
                        className="border-primary/40 text-primary bg-primary/10 text-[10px] font-mono font-medium"
                      >
                        LAGNA
                      </Badge>
                    ) : isRetro ? (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px] font-mono font-medium"
                      >
                        RETRO (R)
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground text-[10px] font-mono"
                      >
                        DIRECT
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
