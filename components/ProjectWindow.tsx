interface ProjectData {
  name: string;
  tagline: string;
  stack: string[];
  description: string[];
  links: { label: string; url: string }[];
}

export default function ProjectWindow({ project }: { project: ProjectData }) {
  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6">
      <div>
        <h1
          className="text-4xl font-bold leading-none tracking-tight"
          style={{ fontFamily: "var(--font-caslon)", color: "var(--brand-primary)" }}
        >
          {project.name}
        </h1>
        <div
          className="mt-3 h-px w-full"
          style={{ backgroundColor: "var(--brand-primary)", opacity: 0.25 }}
        />
        <p className="mt-2 font-mono text-sm text-foreground/50">{project.tagline}</p>
      </div>

      <div className="flex flex-wrap gap-1">
        {project.stack.map((s) => (
          <span
            key={s}
            className="font-mono text-[10px] px-1.5 py-0.5 border"
            style={{ borderColor: "var(--brand-primary)", color: "var(--brand-primary)", opacity: 0.65 }}
          >
            {s}
          </span>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {project.description.map((line, i) => (
          <li key={i} className="flex gap-2 font-mono text-sm text-foreground/70">
            <span style={{ color: "var(--brand-primary)", opacity: 0.45 }}>—</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-1 mt-auto pt-4 border-t" style={{ borderColor: "var(--brand-primary)", opacity: 0.8 }}>
        {project.links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-xs hover:opacity-100 transition-opacity flex gap-2 items-center"
            style={{ color: "var(--brand-primary)", opacity: 0.6 }}
          >
            <span>↗</span>
            <span>{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
