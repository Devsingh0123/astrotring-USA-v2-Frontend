import React from "react";
import { Link } from "react-router-dom";

export const ALL_CALCULATORS = [
  {
    id: "free-kundli-maker",
    title: "Free Kundli Maker",
    desc: "Full janam kundli: planets, houses, yogas and the Dasha tree, from a single moment.",
    tag: "Birth chart",
    path: "/calculators/free-kundli-maker",
    image: "/calculators/free-kundli-maker.png",
  },
  {
    id: "shani-sade-sati",
    title: "Shani Sade Sati Calculator",
    desc: "Whether Saturn is crossing your Moon, which of the three phases you are in, and when it lifts.",
    tag: "Dasha & transit",
    path: "/calculators/shani-sade-sati",
    image: "/calculators/shani-sade-sati.png",
  },
  {
    id: "kundli-milan",
    title: "Kundli Milan (Matchmaking)",
    desc: "Ashtakoot Guna Milan out of 36, with Nadi, Bhakoot and Mangal read separately.",
    tag: "Compatibility",
    path: "/calculators/kundli-milan",
    image: "/calculators/kundli-milan.png",
  },
  {
    id: "mangal-dosha",
    title: "Mangal Dosha Calculator",
    desc: "Manglik status from the Lagna, Moon and Venus, plus every classical cancellation.",
    tag: "Doshas",
    path: "/calculators/mangal-dosha",
    image: "/calculators/mangal-dosha.png",
  },
  {
    id: "vimshottari-dasha",
    title: "Vimshottari Dasha Calculator",
    desc: "The full 120-year cycle with Maha, Antar and Pratyantar periods, dated to the day.",
    tag: "Dasha & transit",
    path: "/calculators/vimshottari-dasha",
    image: "/calculators/vimshottari-dasha.png",
  },
  {
    id: "ascendant-calculator",
    title: "Ascendant (Lagna) Calculator",
    desc: "Your rising sign to the degree: the frame every house in the chart hangs from.",
    tag: "Birth chart",
    path: "/calculators/ascendant-calculator",
    image: "/calculators/ascendant-calculator.png",
  },
  {
    id: "nakshatra-finder",
    title: "Nakshatra Finder",
    desc: "Birth star, Pada, ruling planet and Gana: the lunar mansion behind your instincts.",
    tag: "Birth chart",
    path: "/calculators/nakshatra-finder",
    image: "/calculators/nakshatra-finder.png",
  },
  {
    id: "moon-sign-calculator",
    title: "Moon Sign (Rashi) Calculator",
    desc: "Your Vedic Rashi, which every daily prediction and Sade Sati calculation is measured from.",
    tag: "Birth chart",
    path: "/calculators/moon-sign-calculator",
    image: "/calculators/moon-sign-calculator.png",
  },
  {
    id: "kaal-sarp-dosha",
    title: "Kaal Sarp Dosha Calculator",
    desc: "Whether all seven planets fall between Rahu and Ketu, which of the twelve types, and its span.",
    tag: "Doshas",
    path: "/calculators/kaal-sarp-dosha",
    image: "/calculators/kaal-sarp-dosha.png",
  },
  {
    id: "numerology-calculator",
    title: "Numerology Calculator",
    desc: "Life Path, Destiny and Name numbers from your birth date and the name you go by.",
    tag: "Numerology",
    path: "/calculators/numerology-calculator",
    image: "/calculators/numerology-calculator.png",
  },
  {
    id: "ashtakavarga-calculator",
    title: "Ashtakavarga Calculator",
    desc: "Bindu counts per house and per planet: the numeric layer behind transit judgement.",
    tag: "Dasha & transit",
    path: "/calculators/ashtakavarga-calculator",
    image: "/calculators/ashtakavarga-calculator.png",
  },
  {
    id: "gemstone-advisor",
    title: "Gemstone Advisor",
    desc: "Which stone your chart supports for love, career and wealth, and how long the recommendation holds.",
    tag: "Remedies",
    path: "/calculators/gemstone-advisor",
    image: "/calculators/gemstone-advisor.png",
  },
];

export function CalculatorCard({ item }) {
  return (
    <Link
      to={item.path}
      className="group border border-border/80 glass-card hover:border-primary/50 relative flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-2xl p-4 text-left transition duration-200 ease-out hover:-translate-y-[3px] hover:shadow-lg sm:p-[18px]"
    >
      {/* Top Section: Plate Icon + Title */}
      <span className="mb-3.5 flex items-start gap-3.5">
        <span className="border border-border/80 group-hover:border-primary/50 relative grid h-[42px] w-[42px] flex-none place-items-center overflow-hidden rounded-[12px] transition duration-200 bg-accent/40">
          <img
            alt={item.title}
            src={item.image}
            width="34"
            height="34"
            className="pointer-events-none object-contain select-none transition duration-200 ease-out group-hover:scale-110"
          />
        </span>
        <span className="line-clamp-2 min-w-0 flex-1 font-serif text-[19px] leading-[1.25] text-foreground sm:text-[20px] group-hover:text-primary transition-colors">
          {item.title}
        </span>
      </span>

      {/* Bottom Section: Swap between Pill Tag and Hover Description */}
      <span className="border-border/60 group-hover:border-border mt-auto block border-t pt-3 transition-colors duration-200">
        <span className="block relative min-h-[36px]">
          {/* Rest State: Tag + OPEN → */}
          <span className="flex group-hover:hidden items-center justify-between gap-2.5 py-1">
            <span className="border border-border/80 bg-accent/40 text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[9px] leading-none tracking-[0.12em]">
              <span className="bg-primary h-1 w-1 rounded-full" />
              {item.tag}
            </span>
            <span className="text-primary font-mono text-[9px] tracking-[0.18em] font-semibold">
              OPEN →
            </span>
          </span>

          {/* Hover State: Description */}
          <span className="hidden group-hover:block text-muted-foreground line-clamp-2 text-[13px] leading-[18px]">
            {item.desc}
          </span>
        </span>
      </span>
    </Link>
  );
}

export default function RelatedCalculatorsGrid({ currentToolId = "" }) {
  const filtered = ALL_CALCULATORS.filter((c) => c.id !== currentToolId);

  return (
    <div className="space-y-6 my-12">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-heading font-medium text-foreground">
          Related Astrology Calculators
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.slice(0, 6).map((item) => (
          <CalculatorCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
