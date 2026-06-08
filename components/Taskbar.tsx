"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { playMaximize } from "@/lib/sounds";

function Clock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[10px] tabular-nums" style={{ color: "var(--brand-primary)", opacity: 0.5 }}>
      {time}
    </span>
  );
}

interface TaskbarItem {
  id: string;
  title: string;
  color: string;
}

interface TaskbarProps {
  items: TaskbarItem[];
  onRestore: (id: string) => void;
  rows: number;
  columns: number;
  cellSize: number;
}

const TASKBAR_ROWS = 2;

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 border transition-opacity hover:opacity-100"
      style={{ color: "var(--brand-primary)", borderColor: "var(--brand-primary)", opacity: 0.6 }}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
      {isDark ? "light" : "dark"}
    </button>
  );
}

export default function Taskbar({ items, onRestore, rows, columns, cellSize }: TaskbarProps) {
  return (
    <div
      className="z-40 flex items-center gap-1.5 px-3"
      style={{
        gridColumn: `1 / ${columns + 1}`,
        gridRow: `${rows - TASKBAR_ROWS + 1} / ${rows + 1}`,
        height: cellSize * TASKBAR_ROWS,
        backgroundColor: "var(--background)",
      }}
    >
      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => { playMaximize(false); onRestore(item.id); }}
            className="shrink-0 flex items-center gap-1.5 font-mono text-[10px] px-2.5 py-1 border transition-opacity hover:opacity-100"
            style={{ color: item.color, borderColor: item.color, opacity: 0.6 }}
          >
            <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
              <rect x="0.75" y="0.75" width="4.5" height="4.5" stroke="currentColor" strokeWidth="1.25" />
            </svg>
            {item.title}
          </button>
        ))}
      </div>
      <ThemeToggle />
      <Clock />
    </div>
  );
}
