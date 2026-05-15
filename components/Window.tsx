"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

// Below this column count the window uses a fixed full-width layout
const SMALL_SCREEN_COLS = 24;

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
  maxColumns?: number;
  maxRows?: number;
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

interface DragState {
  colSpan: number;
  rowSpan: number;
  gridLeft: number;
  gridTop: number;
  gridCols: number;
  gridRows: number;
  offsetX: number;
  offsetY: number;
}

const Window = ({
  rowStart: initialRowStart,
  rowEnd: initialRowEnd,
  columnStart: initialColumnStart,
  columnEnd: initialColumnEnd,
  headerRows = 1,
  cellSize = 25,
  color = "var(--brand-primary)",
  title,
  children,
  className,
  maxColumns,
  id,
  isOpen = true,
  onClose,
}: WindowProps) => {

  const [pos, setPos] = useState({
    rowStart: initialRowStart,
    rowEnd: initialRowEnd,
    columnStart: initialColumnStart,
    columnEnd: initialColumnEnd,
  });

  const dragState = useRef<DragState | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const headerHeight = headerRows * cellSize;

  const isSmallScreen = maxColumns !== undefined && maxColumns < SMALL_SCREEN_COLS;

  const rowSpan = pos.rowEnd - pos.rowStart;
  const effectivePos = isSmallScreen && maxColumns
    ? { columnStart: 2, columnEnd: maxColumns, rowStart: 2, rowEnd: 2 + rowSpan }
    : pos;

  const handleClose = () => {
    onClose?.();
  };

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSmallScreen || !windowRef.current) return;

    const grid = windowRef.current.closest("[data-grid]") as HTMLElement | null;
    if (!grid) return;

    const gridRect = grid.getBoundingClientRect();
    const windowRect = windowRef.current.getBoundingClientRect();

    dragState.current = {
      colSpan: pos.columnEnd - pos.columnStart,
      rowSpan: pos.rowEnd - pos.rowStart,
      gridLeft: gridRect.left,
      gridTop: gridRect.top,
      gridCols: Math.round(gridRect.width / cellSize),
      gridRows: Math.round(gridRect.height / cellSize),
      offsetX: e.clientX - windowRect.left,
      offsetY: e.clientY - windowRect.top,
    };

    e.preventDefault();

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const { colSpan, rowSpan, gridLeft, gridTop, gridCols, gridRows, offsetX, offsetY } =
        dragState.current;

      const relX = ev.clientX - offsetX - gridLeft;
      const relY = ev.clientY - offsetY - gridTop;

      let newColStart = Math.round(relX / cellSize) + 1;
      let newRowStart = Math.round(relY / cellSize) + 1;

      newColStart = Math.max(1, Math.min(newColStart, gridCols - colSpan + 1));
      newRowStart = Math.max(1, Math.min(newRowStart, gridRows - rowSpan + 1));

      setPos({
        columnStart: newColStart,
        columnEnd: newColStart + colSpan,
        rowStart: newRowStart,
        rowEnd: newRowStart + rowSpan,
      });
    };

    const onMouseUp = () => {
      dragState.current = null;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={cn("relative z-10 flex flex-col", className)}
      style={{
        gridColumn: `${effectivePos.columnStart} / ${effectivePos.columnEnd}`,
        gridRow: `${effectivePos.rowStart} / ${effectivePos.rowEnd}`,
        ["--window-color" as string]: color,
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center px-3 shrink-0 select-none",
          !isSmallScreen && "cursor-grab active:cursor-grabbing"
        )}
        style={{
          height: headerHeight,
          backgroundColor: "var(--window-color)",
          backgroundImage: "url('/noise-light.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
        onMouseDown={handleHeaderMouseDown}
      >
        {title && (
          <span className="text-xs font-mono font-medium text-white">{title}</span>
        )}
        {(id || onClose) && (
          <button
            className="ml-auto flex items-center justify-center w-4 h-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleClose}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-auto bg-background"
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "var(--window-color)",
          borderTopWidth: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Window;
