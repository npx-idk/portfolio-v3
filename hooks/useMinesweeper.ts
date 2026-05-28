"use client";

import { useCallback, useState } from "react";

export type MineStatus = "idle" | "playing" | "won" | "lost";

export interface CellState {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  adjacentMines: number;
}

const DENSITY = 0.15;

function buildGrid(rows: number, cols: number): CellState[] {
  return Array.from({ length: rows * cols }, () => ({
    isMine: false, isRevealed: false, isFlagged: false, adjacentMines: 0,
  }));
}

function placeMines(base: CellState[], rows: number, cols: number, sr: number, sc: number): CellState[] {
  const count = Math.floor(rows * cols * DENSITY);
  const cells = base.map(c => ({ ...c }));
  const candidates: number[] = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (Math.abs(r - sr) > 1 || Math.abs(c - sc) > 1) candidates.push(r * cols + c);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (let i = 0; i < Math.min(count, candidates.length); i++) cells[candidates[i]].isMine = true;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (cells[r * cols + c].isMine) continue;
      let adj = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && cells[nr * cols + nc].isMine) adj++;
        }
      cells[r * cols + c].adjacentMines = adj;
    }
  return cells;
}

function floodReveal(cells: CellState[], idx: number, rows: number, cols: number): CellState[] {
  const next = cells.slice();
  const queue = [idx];
  const visited = new Set<number>();
  while (queue.length) {
    const i = queue.shift()!;
    if (visited.has(i)) continue;
    visited.add(i);
    if (next[i].isRevealed || next[i].isFlagged || next[i].isMine) continue;
    next[i] = { ...next[i], isRevealed: true };
    if (next[i].adjacentMines === 0) {
      const r = Math.floor(i / cols), c = i % cols;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) queue.push(nr * cols + nc);
        }
    }
  }
  return next;
}

export function useMinesweeper(rows: number, cols: number) {
  const [cells, setCells] = useState<CellState[]>(() => buildGrid(rows, cols));
  const [status, setStatus] = useState<MineStatus>("idle");

  const reset = useCallback(() => {
    setCells(buildGrid(rows, cols));
    setStatus("idle");
  }, [rows, cols]);

  const reveal = useCallback((row: number, col: number) => {
    if (status === "won" || status === "lost") { reset(); return; }
    setCells(prev => {
      const idx = row * cols + col;
      if (prev[idx].isRevealed || prev[idx].isFlagged) return prev;
      let current = prev;
      if (status === "idle") { current = placeMines(prev, rows, cols, row, col); setStatus("playing"); }
      if (current[idx].isMine) {
        const next = current.map(c => c.isMine ? { ...c, isRevealed: true } : c);
        setStatus("lost");
        return next;
      }
      const next = floodReveal(current, idx, rows, cols);
      if (next.every(c => c.isMine || c.isRevealed)) setStatus("won");
      return next;
    });
  }, [rows, cols, status, reset]);

  const flag = useCallback((row: number, col: number) => {
    if (status === "idle" || status === "won" || status === "lost") return;
    setCells(prev => {
      const idx = row * cols + col;
      if (prev[idx].isRevealed) return prev;
      const next = prev.slice();
      next[idx] = { ...next[idx], isFlagged: !next[idx].isFlagged };
      return next;
    });
  }, [cols, status]);

  return { cells, status, reveal, flag, reset };
}
