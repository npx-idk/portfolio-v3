import work from "@/content/work.json";

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
        {work.map((job, i) => (
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

            {i < work.length - 1 && (
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
