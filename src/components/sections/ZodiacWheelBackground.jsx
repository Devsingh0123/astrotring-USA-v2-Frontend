export default function ZodiacWheelBackground() {
  const signs = [
    { glyph: "♈", num: "I", deg: 0 },
    { glyph: "♉", num: "II", deg: 30 },
    { glyph: "♊", num: "III", deg: 60 },
    { glyph: "♋", num: "IV", deg: 90 },
    { glyph: "♌", num: "V", deg: 120 },
    { glyph: "♍", num: "VI", deg: 150 },
    { glyph: "♎", num: "VII", deg: 180 },
    { glyph: "♏", num: "VIII", deg: 210 },
    { glyph: "♐", num: "IX", deg: 240 },
    { glyph: "♑", num: "X", deg: 270 },
    { glyph: "♒", num: "XI", deg: 300 },
    { glyph: "♓", num: "XII", deg: 330 },
  ]

  return (
    <div
      aria-hidden="true"
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] pointer-events-none select-none opacity-30 dark:opacity-20 z-0 transition-opacity"
    >
      {/* Concentric Celestial Rings */}
      <div className="absolute inset-0 rounded-full border border-primary/20 dark:border-primary/25" />
      <div className="absolute inset-[60px] rounded-full border border-dashed border-amber-500/25 dark:border-amber-400/25" />
      <div className="absolute inset-[130px] rounded-full border border-primary/15 dark:border-primary/20" />
      <div className="absolute inset-[200px] rounded-full border border-dotted border-border" />

      {/* Radiant Glows */}
      <div className="absolute inset-1/4 rounded-full bg-primary/10 dark:bg-primary/15 blur-3xl" />

      {/* 12 House Nodes around the perimeter */}
      {signs.map((sign) => {
        const radius = 320 // radius in px from center
        const rad = (sign.deg - 90) * (Math.PI / 180)
        const x = 360 + radius * Math.cos(rad)
        const y = 360 + radius * Math.sin(rad)

        return (
          <div
            key={sign.glyph}
            style={{ left: `${x}px`, top: `${y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center font-serif"
          >
            <span className="text-xl sm:text-2xl text-primary/80 dark:text-primary-foreground/80 font-bold leading-none">
              {sign.glyph}
            </span>
            <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
              {sign.num}
            </span>
          </div>
        )
      })}
    </div>
  )
}
