import about from "@/content/about.json";

const LINK_RE = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;

function renderBio(text: string) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:opacity-100 transition-opacity"
        style={{ opacity: 0.7 }}
      >
        {match[1]}
      </a>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function AboutWindow() {
  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6">
      <div>
        <h1
          className="text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: "var(--font-caslon)", color: "var(--brand-primary)" }}
        >
          Hari Dalavai
        </h1>
        <div
          className="mt-3 h-px w-full"
          style={{ backgroundColor: "var(--brand-primary)", opacity: 0.25 }}
        />
        <p className="mt-2 text-sm font-mono" style={{ color: "var(--brand-primary)" }}>
          {about.tagline}
        </p>
      </div>

      <div className="font-mono text-sm leading-relaxed text-foreground/80 flex flex-col gap-3">
        {about.bio.map((para, i) => (
          <p key={i}>{renderBio(para)}</p>
        ))}
      </div>

      <div>
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "var(--brand-primary)", opacity: 0.6 }}
        >
          {about.goalsLabel ?? `Goals for ${about.goalsYear}`}
        </p>
        <ul className="font-mono text-sm text-foreground/70 flex flex-col gap-2">
          {about.goals.map((goal) => (
            <li key={goal} className="flex gap-2">
              <span style={{ color: "var(--brand-primary)", opacity: 0.5 }}>—</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="mt-auto pt-4 border-t font-mono text-xs text-foreground/30"
        style={{ borderColor: "oklch(0.388506 0.260338 264.1546 / 0.1)" }}
      >
        Based in {about.location}. {about.ctaText}
      </div>
    </div>
  );
}
