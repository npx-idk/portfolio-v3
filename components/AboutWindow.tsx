export default function AboutWindow() {
  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6">
      {/* Name + rule */}
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
          Developer &amp; Artist
        </p>
      </div>

      {/* Bio */}
      <div className="font-mono text-sm leading-relaxed text-foreground/80 flex flex-col gap-3">
        <p>
          I build things for the web — interfaces that are honest about what they
          are and careful about how they feel. Most of my work lives at the edge
          between engineering and design, where the interesting problems tend to be.
        </p>
        <p>
          Outside code I make art: drawing, print, whatever medium the idea asks
          for. That practice keeps me thinking about composition, constraint, and
          why things look the way they do — which, it turns out, is useful
          everywhere.
        </p>
      </div>

      {/* Visions & Values */}
      <div>
        <p
          className="text-xs font-mono uppercase tracking-widest mb-3"
          style={{ color: "var(--brand-primary)", opacity: 0.6 }}
        >
          Visions &amp; Values
        </p>
        <ul className="font-mono text-sm text-foreground/70 flex flex-col gap-2">
          {[
            "Craft over speed — do it right the first time.",
            "Simplicity is the hardest thing to achieve.",
            "Good work is always collaborative.",
            "Beauty and function are not opposites.",
          ].map((v) => (
            <li key={v} className="flex gap-2">
              <span style={{ color: "var(--brand-primary)", opacity: 0.5 }}>—</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
