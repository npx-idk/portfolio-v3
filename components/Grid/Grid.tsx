"use client";
import React, { memo, useEffect, useRef } from "react";
import { useMinesweeper, type CellState, type MineStatus } from "@/hooks/useMinesweeper";
import { playReveal, playFlag, playExplosion, playWin } from "@/lib/sounds";

const NUM_COLORS = ["", "#3b82f6", "#16a34a", "#dc2626", "#7c3aed", "#b45309", "#0891b2", "#374151", "#6b7280"];

const MineCell = memo(({
  cell, row, col, onReveal, onFlag, cellSize,
}: {
  cell: CellState; row: number; col: number;
  onReveal: (r: number, c: number) => void;
  onFlag: (r: number, c: number) => void;
  cellSize: number;
}) => {
  let bg = "transparent";
  let content: React.ReactNode = null;

  if (cell.isRevealed) {
    bg = cell.isMine
      ? "oklch(0.577 0.245 27.325 / 0.15)"
      : "oklch(0.388506 0.260338 264.1546 / 0.04)";
    if (cell.isMine)
      content = <span style={{ fontSize: cellSize * 0.4, color: "oklch(0.577 0.245 27.325)" }}>●</span>;
    else if (cell.adjacentMines > 0)
      content = (
        <span style={{ fontSize: cellSize * 0.45, fontFamily: "monospace", fontWeight: 600, color: NUM_COLORS[cell.adjacentMines], opacity: 0.85 }}>
          {cell.adjacentMines}
        </span>
      );
  } else if (cell.isFlagged) {
    content = <span style={{ fontSize: cellSize * 0.4, color: "oklch(0.577 0.245 27.325)", opacity: 0.8 }}>⚑</span>;
  }

  return (
    <div
      onClick={() => onReveal(row, col)}
      onContextMenu={e => { e.preventDefault(); onFlag(row, col); }}
      style={{
        gridColumn: `${col + 1} / span 1`,
        gridRow: `${row + 1} / span 1`,
        borderRight: "1px solid var(--grid-border)",
        borderBottom: "1px solid var(--grid-border)",
        backgroundColor: bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", userSelect: "none",
        transition: "background-color 0.08s",
      }}
    >
      {content}
    </div>
  );
});
MineCell.displayName = "MineCell";

function MineBanner({ status, onReset }: { status: MineStatus; onReset: () => void }) {
  if (status !== "won" && status !== "lost") return null;
  return (
    <div style={{
      position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
      zIndex: 30, pointerEvents: "auto", backgroundColor: "var(--background)",
      border: "1px solid var(--grid-border)", padding: "8px 16px",
      fontFamily: "monospace", fontSize: 11, color: "var(--brand-primary)",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span>{status === "won" ? "you won." : "boom."}</span>
      <button onClick={onReset} style={{ fontFamily: "monospace", fontSize: 11, color: "var(--brand-primary)", opacity: 0.6, cursor: "pointer", background: "none", border: "none", padding: 0, textDecoration: "underline" }}>
        play again
      </button>
    </div>
  );
}

interface GridProps {
  rows: number;
  columns: number;
  cellSize: number;
  children?: React.ReactNode;
}

const Grid = ({ rows, columns, cellSize, children }: GridProps) => {
  const mine = useMinesweeper(rows, columns);

  const prevDims = useRef({ rows, columns });
  useEffect(() => {
    if (prevDims.current.rows !== rows || prevDims.current.columns !== columns) {
      prevDims.current = { rows, columns };
      mine.reset();
    }
  }, [rows, columns, mine.reset]);

  const prevStatus = useRef(mine.status);
  useEffect(() => {
    if (mine.status === "lost" && prevStatus.current !== "lost") playExplosion();
    if (mine.status === "won"  && prevStatus.current !== "won")  playWin();
    prevStatus.current = mine.status;
  }, [mine.status]);

  const handleReveal = (row: number, col: number) => {
    const cell = mine.cells[row * columns + col];
    if (!cell.isRevealed && !cell.isFlagged) playReveal();
    mine.reveal(row, col);
  };

  const handleFlag = (row: number, col: number) => {
    const cell = mine.cells[row * columns + col];
    if (!cell.isRevealed) playFlag();
    mine.flag(row, col);
  };

  return (
    <div
      data-grid
      className="relative border"
      style={{
        borderColor: "var(--grid-border)",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        width: `${columns * cellSize}px`,
      }}
    >
      {mine.cells.map((cell, idx) => (
        <MineCell
          key={idx}
          cell={cell}
          row={Math.floor(idx / columns)}
          col={idx % columns}
          onReveal={handleReveal}
          onFlag={handleFlag}
          cellSize={cellSize}
        />
      ))}

      <MineBanner status={mine.status} onReset={mine.reset} />

      {children}
    </div>
  );
};

export default Grid;
