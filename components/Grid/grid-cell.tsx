import { cn } from "@/lib/utils";
import React from "react";

interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  rowStart?: number;
  rowEnd?: number;
  columnStart?: number;
  columnEnd?: number;
  className?: string;
}

const GridCell = ({
  children,
  rowStart,
  rowEnd,
  columnStart,
  columnEnd,
  className,
  ...props
}: GridCellProps) => {
  return (
    <div
      className={cn(
        "bg-background border-r border-b border-t-0 border-l-0",
        "flex items-center justify-center",
        "z-10 relative",
        className
      )}
      style={{
        gridColumn: `${columnStart} / ${columnEnd}`,
        gridRow: `${rowStart} / ${rowEnd}`,
        borderColor: "var(--grid-border)",
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default GridCell;
