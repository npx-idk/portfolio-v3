const EXPERIENCE = [
  {
    role: "Senior Software Engineer II",
    company: "GeekyAnts",
    period: "Dec 2024 — Present",
    stack: ["Next.js", "React", "React Native", "TypeScript", "Figma API"],
    highlights: [
      "Boosted conversion 15% with Gemini Live voice assistant + AI Virtual Try-On.",
      "Architected a Design System of 40+ components, cutting UI dev time 30%.",
      "Figma-to-Code plugin reduced handoff time 50%.",
      "Optimized Next.js app to 95+ Lighthouse score, 60% faster load.",
      "Led dual-app healthcare ecosystem (React Native & Expo).",
      'Awarded "GeekWiz" 3× for high-impact delivery.',
    ],
  },
  {
    role: "Backend Engineer",
    company: "Thoughtseed Labs",
    period: "Aug 2024 — Dec 2024",
    stack: ["Node.js", "NestJS", "PostgreSQL"],
    highlights: [
      "Built high-concurrency influencer marketplace with complex campaign workflows.",
      "Matching engine improved brand-to-influencer discovery 40%.",
      "Designed secure payment & escrow system for multi-stage disbursements.",
      "PostgreSQL optimization reduced API latency 25%.",
    ],
  },
  {
    role: "FullStack Engineer",
    company: "Zerozilla Technologies",
    period: "Jul 2022 — Apr 2024",
    stack: ["Next.js", "NestJS", "PostgreSQL", "Redis", "GraphQL"],
    highlights: [
      "Automated 60% of operations payouts via Perfios integration.",
      "Improved search performance 10× with Redis caching.",
      "Built Zilla eSign — a DocuSign-like digital signature MVP.",
      "98% automation in loan processing via Zeebe workflows.",
      "Load time improved 40% through code splitting and lazy loading.",
    ],
  },
  {
    role: "FullStack Engineer",
    company: "Codeberry",
    period: "Dec 2021 — Apr 2022",
    stack: ["Node.js", "Express", "React", "MongoDB"],
    highlights: [
      "Built REST APIs integrating 10+ email service providers.",
      "Reduced bundle size 15% through webpack optimizations.",
    ],
  },
  {
    role: "Backend Engineer",
    company: "Infrrd",
    period: "Sep 2020 — Aug 2021",
    stack: ["Java", "Spring Boot", "Elasticsearch", "React"],
    highlights: [
      "Crafted Spring Boot API endpoints for Java backend services.",
      "Increased code coverage to 95% across backend services.",
      "Built an OCR product PoC in React.",
    ],
  },
];

export default function WorkWindow() {
  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-8">
      <div>
        <h1
          className="text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: "var(--font-caslon)", color: "var(--brand-primary)" }}
        >
          Experience
        </h1>
        <div
          className="mt-3 h-px w-full"
          style={{ backgroundColor: "var(--brand-primary)", opacity: 0.25 }}
        />
      </div>

      <div className="flex flex-col gap-8">
        {EXPERIENCE.map((job, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <div>
                <span
                  className="font-mono text-sm font-semibold"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {job.role}
                </span>
                <span className="font-mono text-sm text-foreground/50"> @ {job.company}</span>
              </div>
              <span className="font-mono text-xs text-foreground/40 shrink-0">{job.period}</span>
            </div>

            <ul className="flex flex-col gap-1">
              {job.highlights.map((h, j) => (
                <li key={j} className="flex gap-2 font-mono text-xs text-foreground/65">
                  <span style={{ color: "var(--brand-primary)", opacity: 0.4 }}>—</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-1 mt-1">
              {job.stack.map((s) => (
                <span
                  key={s}
                  className="font-mono text-[10px] px-1.5 py-0.5 border"
                  style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)", opacity: 0.6 }}
                >
                  {s}
                </span>
              ))}
            </div>

            {i < EXPERIENCE.length - 1 && (
              <div
                className="mt-4 h-px w-full"
                style={{ backgroundColor: "var(--brand-primary)", opacity: 0.1 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
