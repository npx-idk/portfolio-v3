"use client";

import { useRef, useState } from "react";
import ContextMenu, { type ContextMenuEntry } from "@/components/ContextMenu";

const COL_SPAN = 4;
const ROW_SPAN = 5;

interface BinProps {
  rowStart: number;
  columnStart: number;
  cellSize?: number;
  isEmpty: boolean;
  onOpen: () => void;
  onEmpty: () => void;
}

const Bin = ({
  rowStart: initialRowStart,
  columnStart: initialColumnStart,
  cellSize = 20,
  isEmpty,
  onOpen,
  onEmpty,
}: BinProps) => {
  const iconSize = cellSize * 3;
  const binRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [pos, setPos] = useState({ rowStart: initialRowStart, columnStart: initialColumnStart });
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // left-click only
    if (!binRef.current) return;
    const grid = binRef.current.closest("[data-grid]") as HTMLElement | null;
    if (!grid) return;

    isDragging.current = false;

    const gridRect = grid.getBoundingClientRect();
    const itemRect = binRef.current.getBoundingClientRect();
    const offsetX = e.clientX - itemRect.left;
    const offsetY = e.clientY - itemRect.top;
    const gridCols = Math.round(gridRect.width / cellSize);
    const gridRows = Math.round(gridRect.height / cellSize);

    e.preventDefault();

    const onMouseMove = (ev: MouseEvent) => {
      isDragging.current = true;
      const relX = ev.clientX - offsetX - gridRect.left;
      const relY = ev.clientY - offsetY - gridRect.top;

      let newColStart = Math.round(relX / cellSize) + 1;
      let newRowStart = Math.round(relY / cellSize) + 1;

      newColStart = Math.max(1, Math.min(newColStart, gridCols - COL_SPAN + 1));
      newRowStart = Math.max(1, Math.min(newRowStart, gridRows - ROW_SPAN + 1));

      setPos({ columnStart: newColStart, rowStart: newRowStart });
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const menuItems: ContextMenuEntry[] = [
    { label: "open", onClick: onOpen },
    "separator",
    { label: "empty bin", onClick: onEmpty, danger: true, disabled: isEmpty },
  ];

  const color = "var(--brand-primary)";
  const noiseStyle = {
    backgroundColor: color,
    backgroundImage: "url('/noise-light.png')",
    backgroundRepeat: "repeat" as const,
    backgroundSize: "220px 220px",
  };

  return (
    <>
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
      )}
      <div
        ref={binRef}
        data-bin
        className="relative z-10 flex flex-col items-center gap-1 select-none group cursor-grab active:cursor-grabbing"
        style={{
          gridColumn: `${pos.columnStart} / span ${COL_SPAN}`,
          gridRow: `${pos.rowStart} / span ${ROW_SPAN}`,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => { if (!isDragging.current) onOpen(); }}
        onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); }}
        title="Right-click for options"
      >
        <div className="flex flex-col items-center transition-opacity group-hover:opacity-80 group-active:opacity-60">
          <div style={{ width: iconSize * 0.28, height: iconSize * 0.1, borderRadius: "2px 2px 0 0", ...noiseStyle }} />
          <div style={{ width: iconSize * 0.88, height: iconSize * 0.1, ...noiseStyle }} />
          <div
            style={{
              width: iconSize * 0.76,
              height: iconSize * 0.66,
              opacity: isEmpty ? 0.5 : 1,
              clipPath: "polygon(6% 0%, 94% 0%, 86% 100%, 14% 100%)",
              ...noiseStyle,
            }}
          />
        </div>
        <span className="text-[10px] font-mono font-medium text-center leading-tight" style={{ color }}>
          bin
        </span>
      </div>
    </>
  );
};

export default Bin;
