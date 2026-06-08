"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import { playClose, playMinimize, playMaximize } from "@/lib/sounds";

const SMALL_SCREEN_COLS = 24;
const MIN_COLS = 10;
const MIN_ROWS = 6;
const HANDLE_EDGE = 6;   // px — edge hit area
const HANDLE_CORNER = 14; // px — corner hit area

const RESIZE_HANDLES: { dir: string; cursor: string; style: React.CSSProperties }[] = [
  { dir: "e",  cursor: "ew-resize",   style: { top: 0, right: 0, bottom: 0, width: HANDLE_EDGE } },
  { dir: "w",  cursor: "ew-resize",   style: { top: 0, left: 0, bottom: 0, width: HANDLE_EDGE } },
  { dir: "s",  cursor: "ns-resize",   style: { bottom: 0, left: 0, right: 0, height: HANDLE_EDGE } },
  { dir: "se", cursor: "nwse-resize", style: { bottom: 0, right: 0, width: HANDLE_CORNER, height: HANDLE_CORNER } },
  { dir: "sw", cursor: "nesw-resize", style: { bottom: 0, left: 0, width: HANDLE_CORNER, height: HANDLE_CORNER } },
];

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
  isMinimized?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  gridPad?: number;
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
  color = "var(--brand-light)",
  title,
  children,
  className,
  maxColumns,
  maxRows,
  id,
  isOpen = true,
  isMinimized = false,
  onClose,
  onMinimize,
  gridPad = 0,
}: WindowProps) => {

  const [pos, setPos] = useState({
    rowStart: initialRowStart,
    rowEnd: initialRowEnd,
    columnStart: initialColumnStart,
    columnEnd: initialColumnEnd,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dragState = useRef<DragState | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const headerHeight = headerRows * cellSize;

  const isSmallScreen = maxColumns !== undefined && maxColumns < SMALL_SCREEN_COLS;

  const rowSpan = pos.rowEnd - pos.rowStart;
  const effectivePos = isFullscreen && maxColumns && maxRows
    ? { columnStart: 1, columnEnd: maxColumns + 1, rowStart: 1, rowEnd: maxRows + 1 }
    : isSmallScreen && maxColumns
    ? { columnStart: 2, columnEnd: maxColumns, rowStart: 2, rowEnd: 2 + rowSpan }
    : pos;

  const handleClose = () => {
    playClose();
    onClose?.();
  };

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSmallScreen || isFullscreen || !windowRef.current) return;

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

  const handleResizeStart = (e: React.MouseEvent, dir: string, cursor: string) => {
    if (isFullscreen || isSmallScreen || !windowRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    const grid = windowRef.current.closest("[data-grid]") as HTMLElement | null;
    if (!grid) return;

    const gridRect = grid.getBoundingClientRect();
    const gridCols = Math.round(gridRect.width / cellSize);
    const gridRows = Math.round(gridRect.height / cellSize);

    document.body.style.cursor = cursor;
    document.body.style.userSelect = "none";

    const onMouseMove = (ev: MouseEvent) => {
      const snapCol = Math.round((ev.clientX - gridRect.left) / cellSize) + 1;
      const snapRow = Math.round((ev.clientY - gridRect.top) / cellSize) + 1;

      setPos((prev) => {
        const next = { ...prev };
        if (dir.includes("e")) next.columnEnd   = Math.max(prev.columnStart + MIN_COLS, Math.min(gridCols + 1, snapCol));
        if (dir.includes("w")) next.columnStart = Math.min(prev.columnEnd   - MIN_COLS, Math.max(1, snapCol));
        if (dir.includes("s")) next.rowEnd      = Math.max(prev.rowStart    + MIN_ROWS, Math.min(gridRows + 1, snapRow));
        return next;
      });
    };

    const onMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
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
      className={cn("relative flex flex-col", isFullscreen ? "z-[60]" : "z-10", className)}
      style={isFullscreen ? {
        position: "fixed",
        inset: gridPad,
        ["--window-color" as string]: color,
      } : {
        gridColumn: `${effectivePos.columnStart} / ${effectivePos.columnEnd}`,
        gridRow: `${effectivePos.rowStart} / ${effectivePos.rowEnd}`,
        ["--window-color" as string]: color,
        display: isMinimized ? "none" : undefined,
      }}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center px-3 shrink-0 select-none rounded-t-lg",
          !isSmallScreen && !isFullscreen && "cursor-grab active:cursor-grabbing"
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
        <div className="ml-auto flex items-center gap-1">
          {onMinimize && (
            <button
              className="flex items-center justify-center w-4 h-4 text-white/60 hover:text-white transition-colors cursor-pointer"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => { playMinimize(); onMinimize?.(); }}
              title="Minimize"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <line x1="1" y1="5" x2="7" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <button
            className="flex items-center justify-center w-4 h-4 text-white/60 hover:text-white transition-colors cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { playMaximize(isFullscreen); setIsFullscreen((f) => !f); }}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M3 1v2H1M5 3V1h2M5 7v-2h2M3 5v2H1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 3V1h2M5 1h2v2M7 5v2H5M3 7H1V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          {(id || onClose) && (
            <button
              className="flex items-center justify-center w-4 h-4 text-white/60 hover:text-white transition-colors cursor-pointer"
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

      {/* Resize handles — hidden interaction zones, cursor changes signal resize */}
      {!isFullscreen && !isSmallScreen && RESIZE_HANDLES.map(({ dir, cursor, style }) => (
        <div
          key={dir}
          className="absolute z-20"
          style={{ ...style, cursor }}
          onMouseDown={(e) => handleResizeStart(e, dir, cursor)}
        />
      ))}
    </div>
  );
};

export default Window;
