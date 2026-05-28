interface ArtPieceData {
  title: string;
  medium: string;
  year: string;
  placeholder?: string;
}

export default function ArtPieceWindow({ piece }: { piece: ArtPieceData }) {
  return (
    <div className="h-full flex flex-col">
      <div
        className="flex-1 flex items-center justify-center m-4"
        style={{
          backgroundColor: "var(--brand-primary)",
          opacity: 0.08,
          borderRadius: 2,
          minHeight: 180,
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{ opacity: 1 }}
        >
          <span
            className="font-mono text-xs text-center px-4"
            style={{ color: "var(--brand-primary)", opacity: 0.4 }}
          >
            {piece.placeholder ?? "[ image coming soon ]"}
          </span>
        </div>
      </div>
      <div className="px-5 pb-5 flex flex-col gap-1">
        <p
          className="font-bold text-lg leading-tight tracking-tight"
          style={{ fontFamily: "var(--font-caslon)", color: "var(--brand-primary)" }}
        >
          {piece.title}
        </p>
        <p className="font-mono text-xs text-foreground/40">
          {piece.medium} · {piece.year}
        </p>
      </div>
    </div>
  );
}
