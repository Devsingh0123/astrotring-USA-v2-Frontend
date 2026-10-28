import RashiCard from "./RashiCard"

export default function ElementGroupSection({ group, timeframe }) {
  if (!group || !group.signsList || group.signsList.length === 0) {
    return null
  }

  return (
    <div className="space-y-5">
      {/* Group Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border/70 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <h2 className="font-bold text-foreground text-base font-serif tracking-wide">
            {group.name}
          </h2>
          <span className="text-muted-foreground text-xs font-serif italic">
            {group.sanskrit}
          </span>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
          {group.tagline}
        </div>
      </div>

      {/* 3 Rashi Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {group.signsList.map((sign) => (
          <RashiCard key={sign.slug || sign.id} sign={sign} timeframe={timeframe} />
        ))}
      </div>
    </div>
  )
}
