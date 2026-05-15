"use client";
import React from "react";

interface GridProps {
  rows: number;
  columns: number;
  cellSize: number;
  children?: React.ReactNode;
}

const Grid = ({ rows, columns, cellSize, children }: GridProps) => {
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
      {/* Guide cells — draw the grid lines */}
      {Array.from({ length: rows * columns }, (_, index) => {
        const x = (index % columns) + 1;
        const y = Math.floor(index / columns) + 1;
        return (
          <div
            key={index}
            style={{
              gridColumn: `${x} / span 1`,
              gridRow: `${y} / span 1`,
              borderRight: "1px solid var(--grid-border)",
              borderBottom: "1px solid var(--grid-border)",
            }}
          />
        );
      })}

      {/* Content cells render on top via z-index */}
      {children}
    </div>
  );
};

export default Grid;
