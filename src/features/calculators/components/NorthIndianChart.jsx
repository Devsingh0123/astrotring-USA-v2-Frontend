import React from "react";

export const ZODIAC_SIGNS = {
  1: { name: "Aries", sanskrit: "Mesha", element: "Fire" },
  2: { name: "Taurus", sanskrit: "Vrishabha", element: "Earth" },
  3: { name: "Gemini", sanskrit: "Mithuna", element: "Air" },
  4: { name: "Cancer", sanskrit: "Karka", element: "Water" },
  5: { name: "Leo", sanskrit: "Simha", element: "Fire" },
  6: { name: "Virgo", sanskrit: "Kanya", element: "Earth" },
  7: { name: "Libra", sanskrit: "Tula", element: "Air" },
  8: { name: "Scorpio", sanskrit: "Vrischika", element: "Water" },
  9: { name: "Sagittarius", sanskrit: "Dhanu", element: "Fire" },
  10: { name: "Capricorn", sanskrit: "Makara", element: "Earth" },
  11: { name: "Aquarius", sanskrit: "Kumbha", element: "Air" },
  12: { name: "Pisces", sanskrit: "Meena", element: "Water" },
};

export const SIGN_NAMES_TO_NUM = {
  aries: 1,
  taurus: 2,
  gemini: 3,
  cancer: 4,
  leo: 5,
  virgo: 6,
  libra: 7,
  scorpio: 8,
  sagittarius: 9,
  capricorn: 10,
  aquarius: 11,
  pisces: 12,
};

const HOUSE_POSITIONS = {
  1: { signX: 200, signY: 130, planetX: 200, planetY: 75 },
  2: { signX: 90, signY: 55, planetX: 115, planetY: 30 },
  3: { signX: 55, signY: 90, planetX: 30, planetY: 115 },
  4: { signX: 130, signY: 200, planetX: 75, planetY: 200 },
  5: { signX: 55, signY: 310, planetX: 30, planetY: 285 },
  6: { signX: 90, signY: 345, planetX: 115, planetY: 370 },
  7: { signX: 200, signY: 270, planetX: 200, planetY: 325 },
  8: { signX: 310, signY: 345, planetX: 285, planetY: 370 },
  9: { signX: 345, signY: 310, planetX: 370, planetY: 285 },
  10: { signX: 270, signY: 200, planetX: 325, planetY: 200 },
  11: { signX: 345, signY: 90, planetX: 370, planetY: 115 },
  12: { signX: 310, signY: 55, planetX: 285, planetY: 30 },
};

export default function NorthIndianChart({
  chartData = {},
  summary = {},
  title = "D-1 Rashi Janam Kundli",
}) {
  const ascendantSignStr =
    summary?.ascendantSign ||
    chartData?.Ascendant?.sign ||
    chartData?.ascendant?.sign ||
    "Aries";

  const lagnaNum = SIGN_NAMES_TO_NUM[ascendantSignStr.toLowerCase()] || 1;

  const planetsByHouse = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
    7: [], 8: [], 9: [], 10: [], 11: [], 12: [],
  };

  const planetKeys = [
    "Ascendant",
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
    "Rahu",
    "Ketu",
  ];

  planetKeys.forEach((key) => {
    const pData = chartData[key] || chartData[key.toLowerCase()];
    if (!pData) return;

    let houseNum = pData.house;
    if (!houseNum && pData.sign) {
      const pSignNum = SIGN_NAMES_TO_NUM[pData.sign.toLowerCase()] || 1;
      houseNum = ((pSignNum - lagnaNum + 12) % 12) + 1;
    }

    if (houseNum && houseNum >= 1 && houseNum <= 12) {
      const isAsc = key === "Ascendant";
      const shortName = isAsc ? "Asc" : key.slice(0, 2);
      const isRetrograde = Boolean(pData.retrograde);
      planetsByHouse[houseNum].push({
        name: key,
        abbr: isRetrograde ? `${shortName}(R)` : shortName,
        isAsc,
        isRetrograde,
      });
    }
  });

  return (
    <div className="rounded-2xl border border-mlh-plum-500/25 bg-mlh-surface/60 backdrop-blur-md p-5 sm:p-6 shadow-xl shadow-black/20 text-left">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-mlh-border/50">
        <div>
          <h3 className="font-serif text-[18px] sm:text-[20px] text-white font-medium">
            {title}
          </h3>
          <p className="text-xs text-mlh-muted font-mono mt-0.5">
            Ascendant:{" "}
            <span className="text-mlh-plum-300 font-semibold">
              {ZODIAC_SIGNS[lagnaNum]?.name} ({lagnaNum})
            </span>
          </p>
        </div>
        <span className="text-[9.5px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full border border-mlh-plum-400/30 bg-mlh-plum-500/10 text-mlh-plum-300">
          NORTH INDIAN FORMAT
        </span>
      </div>

      {/* SVG North Indian Grid */}
      <div className="mx-auto w-full max-w-[420px] aspect-square select-none my-2">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-md"
        >
          {/* Outer Boundary Square */}
          <rect
            x="4"
            y="4"
            width="392"
            height="392"
            fill="var(--mlh-bg)"
            stroke="var(--mlh-border-hi)"
            strokeWidth="1.5"
            rx="8"
          />

          {/* Diagonals */}
          <line
            x1="4"
            y1="4"
            x2="396"
            y2="396"
            stroke="var(--mlh-border)"
            strokeWidth="1.2"
          />
          <line
            x1="4"
            y1="396"
            x2="396"
            y2="4"
            stroke="var(--mlh-border)"
            strokeWidth="1.2"
          />

          {/* Inner Diamond (Kendra Boundary) */}
          <polygon
            points="200,4 396,200 200,396 4,200"
            fill="none"
            stroke="var(--mlh-border-hi)"
            strokeWidth="1.5"
          />

          {/* House 1 highlight (Lagna) */}
          <polygon
            points="200,4 300,100 200,200 100,100"
            fill="var(--mlh-plum-500)"
            fillOpacity="0.08"
          />

          {/* Render House Signs and Planets */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((houseIndex) => {
            const pos = HOUSE_POSITIONS[houseIndex];
            const signNumber = ((lagnaNum - 1 + (houseIndex - 1)) % 12) + 1;
            const planets = planetsByHouse[houseIndex] || [];

            return (
              <g key={houseIndex}>
                {/* Sign Number */}
                <text
                  x={pos.signX}
                  y={pos.signY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-mlh-muted/60 text-[11px] font-mono font-medium pointer-events-none"
                >
                  {signNumber}
                </text>

                {/* Planets Situated in this House */}
                {planets.length > 0 && (
                  <g>
                    {planets.map((planet, pIdx) => {
                      const offsetStep = 13;
                      const startY =
                        pos.planetY - ((planets.length - 1) * offsetStep) / 2;
                      const yPos = startY + pIdx * offsetStep;

                      return (
                        <text
                          key={pIdx}
                          x={pos.planetX}
                          y={yPos}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className={`text-[11px] font-mono tracking-tight font-semibold ${
                            planet.isAsc
                              ? "fill-mlh-plum-300"
                              : planet.isRetrograde
                              ? "fill-amber-400"
                              : "fill-white"
                          }`}
                        >
                          {planet.abbr}
                        </text>
                      );
                    })}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="pt-3 border-t border-mlh-border/50 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-mlh-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mlh-plum-400" />
            <span>Asc = Lagna</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-amber-400 font-semibold">(R)</span>
            <span>= Retrograde</span>
          </span>
        </div>
        <span className="text-mlh-faint">Numbers indicate Rashi (1-12)</span>
      </div>
    </div>
  );
}
