"use client";

import { cn } from "@/lib/utils";
import { useRef, useState } from "react";
import type { DesktopItem as DesktopItemType } from "@/lib/desktop-config";
import ContextMenu from "@/components/ContextMenu";
import { playOpen, playDelete } from "@/lib/sounds";

const COL_SPAN = 4;
const ROW_SPAN = 5;

interface DesktopItemProps {
  item: DesktopItemType;
  rowStart: number;
  columnStart: number;
  cellSize?: number;
  onOpen: () => void;
  onDropToBin?: () => void;
  className?: string;
}

function isOverBin(ev: MouseEvent): boolean {
  const binEl = document.querySelector("[data-bin]");
  if (!binEl) return false;
  const r = binEl.getBoundingClientRect();
  return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom;
}

const DesktopItem = ({
  item,
  rowStart: initialRowStart,
  columnStart: initialColumnStart,
  cellSize = 20,
  onOpen,
  onDropToBin,
  className,
}: DesktopItemProps) => {
  const iconSize = cellSize * 3;
  const itemRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const touchStart = useRef<{ x: number; y: number; t: number } | null>(null);
  const [pos, setPos] = useState({ rowStart: initialRowStart, columnStart: initialColumnStart });
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // left-click only
    if (!itemRef.current) return;
    const grid = itemRef.current.closest("[data-grid]") as HTMLElement | null;
    if (!grid) return;

    isDragging.current = false;

    const gridRect = grid.getBoundingClientRect();
    const itemRect = itemRef.current.getBoundingClientRect();
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

      const binEl = document.querySelector("[data-bin]");
      binEl?.classList.toggle("bin-drag-over", isOverBin(ev));
    };

    const onMouseUp = (ev: MouseEvent) => {
      document.querySelector("[data-bin]")?.classList.remove("bin-drag-over");
      if (isDragging.current && isOverBin(ev)) {
        onDropToBin?.();
      }
      isDragging.current = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const color = item.color ?? "var(--brand-light)";

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const handleOpen = () => { playOpen(); onOpen(); };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, t: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = Math.abs(t.clientX - touchStart.current.x);
    const dy = Math.abs(t.clientY - touchStart.current.y);
    const elapsed = Date.now() - touchStart.current.t;
    if (dx < 10 && dy < 10 && elapsed < 400) handleOpen();
    touchStart.current = null;
  };

  const menuItems = [
    { label: "open", onClick: handleOpen },
    {
      label: "open in new window",
      onClick: () => window.open(item.href, "_blank"),
      disabled: !item.href,
    },
    "separator" as const,
    { label: "delete", onClick: () => { playDelete(); onDropToBin?.(); }, danger: true, disabled: !onDropToBin },
  ];

  return (
    <>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={menuItems}
          onClose={() => setMenu(null)}
        />
      )}
      <div
        ref={itemRef}
        className={cn(
          "relative z-10 flex flex-col items-center gap-1 select-none group cursor-grab active:cursor-grabbing",
          className
        )}
        style={{
          gridColumn: `${pos.columnStart} / span ${COL_SPAN}`,
          gridRow: `${pos.rowStart} / span ${ROW_SPAN}`,
          ["--item-color" as string]: color,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={() => { if (!isDragging.current) handleOpen(); }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onContextMenu={handleContextMenu}
        title={`Double-click to open ${item.title}`}
      >
      {item.type === "folder" ? (
        <div
          className="transition-opacity group-hover:opacity-80 group-active:opacity-60"
          style={{
            width: iconSize,
            height: iconSize * 0.8,
            backgroundColor: "var(--item-color)",
            backgroundImage: "url('/noise-light.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "220px 220px",
            clipPath: "polygon(0% 20%, 0% 100%, 100% 100%, 100% 20%, 45% 20%, 38% 0%, 0% 0%)",
          }}
        />
      ) : (
        <div
          className="transition-opacity group-hover:opacity-80 group-active:opacity-60"
          style={{
            width: iconSize * 0.8,
            height: iconSize,
            backgroundColor: "var(--item-color)",
            backgroundImage: "url('/noise-light.png')",
            backgroundRepeat: "repeat",
            backgroundSize: "220px 220px",
            clipPath: "polygon(0% 0%, 70% 0%, 100% 30%, 100% 100%, 0% 100%)",
          }}
        />
      )}
      <span
        className="text-[10px] font-mono font-medium text-center leading-tight max-w-full truncate px-0.5"
        style={{ color: "var(--item-color)" }}
      >
        {item.title}
      </span>
      </div>
    </>
  );
};

export default DesktopItem;
