import { cn } from "@/lib/utils";

interface WindowProps {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
  headerRows?: number;
  cellSize?: number;
  color?: string;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const Window = ({
  rowStart,
  rowEnd,
  columnStart,
  columnEnd,
  headerRows = 1,
  cellSize = 25,
  color = "var(--primary)",
  title,
  children,
  className,
}: WindowProps) => {
  const headerHeight = headerRows * cellSize;

  return (
    <div
      className={cn("relative z-10 flex flex-col", className)}
      style={{
        gridColumn: `${columnStart} / ${columnEnd}`,
        gridRow: `${rowStart} / ${rowEnd}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center px-3 shrink-0"
        style={{
          height: headerHeight,
          backgroundColor: color,
        }}
      >
        {title && (
          <span className="text-xs font-mono font-medium text-white">{title}</span>
        )}
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-auto bg-background"
        style={{
          border: `1px solid ${color}`,
          borderTop: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Window;
