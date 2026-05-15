"use client";

import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

export type ContextMenuEntry = ContextMenuItem | "separator";

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuEntry[];
  onClose: () => void;
}

const noiseStyle = {
  backgroundImage: "url('/noise-light.png')",
  backgroundRepeat: "repeat" as const,
  backgroundSize: "220px 220px",
};

const ContextMenu = ({ x, y, items, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const estimatedH = items.length * 28 + 8;
  const estimatedW = 180;
  const left = typeof window !== "undefined" ? Math.min(x, window.innerWidth - estimatedW - 8) : x;
  const top = typeof window !== "undefined" ? Math.min(y, window.innerHeight - estimatedH - 8) : y;

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[160px] border bg-background shadow-md"
      style={{ left, top, borderColor: "var(--brand-primary)" }}
    >
      {items.map((entry, i) =>
        entry === "separator" ? (
          <div key={i} className="my-0.5 border-t border-border/40" />
        ) : (
          <button
            key={i}
            disabled={entry.disabled}
            className={cn(
              "relative overflow-hidden w-full text-left text-xs font-mono",
              "disabled:opacity-30 disabled:cursor-not-allowed group/item",
              entry.danger ? "text-destructive" : ""
            )}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => { entry.onClick(); onClose(); }}
          >
            {/* Noise hover background — same technique as window headers */}
            <span
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none"
              style={{
                backgroundColor: entry.danger ? "var(--destructive)" : "var(--brand-primary)",
                ...noiseStyle,
              }}
            />
            <span className="relative z-10 block px-3 py-1.5 group-hover/item:text-white transition-colors">
              {entry.label}
            </span>
          </button>
        )
      )}
    </div>,
    document.body
  );
};

export default ContextMenu;
