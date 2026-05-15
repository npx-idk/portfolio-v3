"use client";
import React from "react";

interface GridProps {
  rows: number;
  columns: number;
  children?: React.ReactNode;
}

const Grid = ({ rows, columns, children }: GridProps) => {
  const columnWidth = `calc((100vw - 4rem - 1px) / ${columns})`;
  const rowHeight = columnWidth;

  return (
    <div
      className="relative border border-neutral-200 dark:border-neutral-800"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, ${columnWidth})`,
        gridTemplateRows: `repeat(${rows}, ${rowHeight})`,
        width: `calc(100vw - 4rem - 1px)`,
      }}
    >
      {/* Guide cells — draw the grid lines */}
      {Array.from({ length: rows * columns }, (_, index) => {
        const x = (index % columns) + 1;
        const y = Math.floor(index / columns) + 1;
        return (
          <div
            key={index}
            className="border-r border-b border-neutral-200 dark:border-neutral-800"
            style={{
              gridColumn: `${x} / span 1`,
              gridRow: `${y} / span 1`,
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
