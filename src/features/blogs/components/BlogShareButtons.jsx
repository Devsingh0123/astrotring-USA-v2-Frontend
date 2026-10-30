import { useState } from "react";
import { Link2, Check, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function BlogShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Vedic Astrology Insights | Japaika";

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement("input");
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success("Article link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const shareLinks = [
    {
      name: "X (Twitter)",
      icon: "𝕏",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: "💬",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareTitle} - ${shareUrl}`)}`,
    },
    {
      name: "LinkedIn",
      icon: "in",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: "f",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mr-1">
        <Share2 className="w-3.5 h-3.5 text-primary" />
        <span>Share:</span>
      </span>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-card/80 px-2.5 py-1.5 text-xs text-foreground hover:bg-accent transition-colors cursor-pointer glass-card shadow-xs"
        title="Copy article link"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-mono text-[11px] font-semibold">Copied</span>
          </>
        ) : (
          <>
            <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-mono text-[11px] text-muted-foreground">Copy Link</span>
          </>
        )}
      </button>

      {/* Social Icons */}
      {shareLinks.map((s) => (
        <a
          key={s.name}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Share on ${s.name}`}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border/80 bg-card/80 text-xs font-mono font-bold text-muted-foreground hover:text-foreground hover:bg-accent hover:border-primary/40 transition-colors glass-card shadow-xs"
        >
          {s.icon}
        </a>
      ))}
    </div>
  );
}
