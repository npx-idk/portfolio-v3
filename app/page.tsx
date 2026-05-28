"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import Grid from "@/components/Grid/Grid";
import Window from "@/components/Window";
import DesktopItem from "@/components/DesktopItem";
import FolderContents from "@/components/FolderContents";
import Bin from "@/components/Bin";
import BinContents from "@/components/BinContents";
import Taskbar from "@/components/Taskbar";
import { DESKTOP, findItem, type WindowConfig } from "@/lib/desktop-config";
import TerminalWindow from "@/components/TerminalWindow";

const CELL_SIZE = 20;
const OPEN_KEY = "desktop-open-items";
const TRASH_KEY = "desktop-trashed-items";
const TASKBAR_ROWS = 2;

function clampWindow(
  win: WindowConfig,
  rows: number,
  columns: number,
): WindowConfig {
  const maxRow = rows - TASKBAR_ROWS;
  const winRows = win.rowEnd - win.rowStart;
  const winCols = win.columnEnd - win.columnStart;

  const rowStart    = Math.max(1, Math.min(win.rowStart,    maxRow - winRows));
  const columnStart = Math.max(1, Math.min(win.columnStart, columns - winCols));
  const rowEnd      = Math.min(rowStart + winRows,    maxRow);
  const columnEnd   = Math.min(columnStart + winCols, columns);

  return { ...win, rowStart, rowEnd, columnStart, columnEnd };
}

const DEFAULT_WINDOW: WindowConfig = {
  rowStart: 3,
  rowEnd: 18,
  columnStart: 5,
  columnEnd: 25,
  headerRows: 2,
};

function loadSet(key: string): Set<string> {
  try {
    const v = localStorage.getItem(key);
    return v ? new Set(JSON.parse(v)) : new Set();
  } catch { return new Set(); }
}

function saveSet(key: string, s: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...s]));
}

function initialTrashedSet(): Set<string> {
  const stored = typeof window === "undefined" ? new Set<string>() : loadSet(TRASH_KEY);
  stored.add("do-not-open");
  stored.add("stars-inside-tears");
  return stored;
}

export default function Page() {
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set(["hello", "music"]);
    const stored = loadSet(OPEN_KEY);
    stored.add("hello");
    stored.add("music");
    return stored;
  });
  const [trashedItems, setTrashedItems] = useState<Set<string>>(initialTrashedSet);
  const [minimizedItems, setMinimizedItems] = useState<Set<string>>(new Set());

  // Tracks the visual order of desktop icons. Items are removed when trashed and
  // appended when restored, so restored items land at the end (next free slot)
  // without displacing any currently visible icons.
  const [desktopOrder, setDesktopOrder] = useState<string[]>(() =>
    DESKTOP
      .filter((r) => !initialTrashedSet().has(r.item.id))
      .map((r) => r.item.id),
  );

  useLayoutEffect(() => {
    const handleResize = () => {
      setRows(Math.floor(window.innerHeight / CELL_SIZE));
      setColumns(Math.floor(window.innerWidth / CELL_SIZE));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpen = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set([...prev, id]);
      saveSet(OPEN_KEY, next);
      return next;
    });
    // unminimize if it was minimized — double-clicking a minimized item must restore it
    setMinimizedItems((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleClose = useCallback((id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(OPEN_KEY, next);
      return next;
    });
  }, []);

  const handleTrash = useCallback((id: string) => {
    handleClose(id);
    setDesktopOrder((prev) => prev.filter((x) => x !== id));
    setTrashedItems((prev) => {
      const next = new Set([...prev, id]);
      saveSet(TRASH_KEY, next);
      return next;
    });
  }, [handleClose]);

  const handleRestore = useCallback((id: string) => {
    // Append to the end so the restored item takes the next free slot
    // without shifting any currently visible icon.
    setDesktopOrder((prev) => [...prev.filter((x) => x !== id), id]);
    setTrashedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSet(TRASH_KEY, next);
      return next;
    });
  }, []);

  const handleEmptyBin = useCallback(() => {
    setTrashedItems(new Set());
    localStorage.removeItem(TRASH_KEY);
  }, []);

  const handleMinimize = useCallback((id: string) => {
    setMinimizedItems((prev) => new Set([...prev, id]));
  }, []);

  const handleUnminimize = useCallback((id: string) => {
    setMinimizedItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  if (!columns || !rows) return null;

  const activeDesktop = DESKTOP.filter(({ item }) => !trashedItems.has(item.id));
  const trashedDesktopItems = [...trashedItems]
    .map((id) => findItem(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof findItem>>[];

  const taskbarItems = [...minimizedItems].map((id) => {
    if (id === "__bin__") return { id, title: "bin", color: "oklch(0.577 0.245 27.325)" };
    const item = findItem(id);
    return item ? { id, title: item.title, color: item.color ?? "var(--brand-primary)" } : null;
  }).filter(Boolean) as { id: string; title: string; color: string }[];

  // distribute icons above the taskbar, wrapping to a second column when needed
  const ICON_ROW_SPAN = 5;
  const ICON_COL_SPAN = 4;
  const availableRows = rows - TASKBAR_ROWS - 2;
  const iconsPerCol  = Math.max(1, Math.floor(availableRows / ICON_ROW_SPAN));

  // Sort active items by desktopOrder so restored items land at the end
  // without displacing items that are already on screen.
  const orderedDesktop = [...activeDesktop].sort((a, b) => {
    const ai = desktopOrder.indexOf(a.item.id);
    const bi = desktopOrder.indexOf(b.item.id);
    return (ai === -1 ? Infinity : ai) - (bi === -1 ? Infinity : bi);
  });

  return (
    <div className="fixed inset-0 overflow-hidden flex items-start justify-center">
      <Grid rows={rows} columns={columns} cellSize={CELL_SIZE}>
        {/* Root desktop items — ordered so restored items append at the end */}
        {orderedDesktop.map(({ item }, index) => (
          <DesktopItem
            key={item.id}
            item={item}
            rowStart={item.id === "do-not-open"
              ? Math.floor(rows / 2) - 2
              : 2 + (index % iconsPerCol) * ICON_ROW_SPAN}
            columnStart={item.id === "do-not-open"
              ? Math.floor(columns / 2) - 2
              : 2 + Math.floor(index / iconsPerCol) * (ICON_COL_SPAN + 1)}
            cellSize={CELL_SIZE}
            onOpen={() => handleOpen(item.id)}
            onDropToBin={() => handleTrash(item.id)}
          />
        ))}

        {/* Bin */}
        <Bin
          rowStart={Math.min(2, rows - TASKBAR_ROWS - 5)}
          columnStart={Math.max(1, columns - 5)}
          cellSize={CELL_SIZE}
          isEmpty={trashedItems.size === 0}
          count={trashedItems.size}
          onOpen={() => handleOpen("__bin__")}
          onEmpty={handleEmptyBin}
        />

        {/* Open windows */}
        {[...openItems].map((id) => {
          if (id === "__bin__") {
            const binWin = clampWindow(
              { rowStart: 3, rowEnd: 18, columnStart: Math.max(1, columns - 26), columnEnd: Math.max(1, columns - 6) },
              rows, columns,
            );
            return (
              <Window
                key="__bin__"
                id="__bin__"
                isOpen
                isMinimized={minimizedItems.has("__bin__")}
                rowStart={binWin.rowStart}
                rowEnd={binWin.rowEnd}
                columnStart={binWin.columnStart}
                columnEnd={binWin.columnEnd}
                headerRows={2}
                cellSize={CELL_SIZE}
                title="bin"
                color="oklch(0.577 0.245 27.325)"
                maxColumns={columns}
                maxRows={rows}
                onMinimize={() => handleMinimize("__bin__")}
                onClose={() => handleClose("__bin__")}
              >
                <BinContents
                  items={trashedDesktopItems}
                  onRestore={handleRestore}
                  onEmpty={handleEmptyBin}
                />
              </Window>
            );
          }

          const item = findItem(id);
          if (!item) return null;
          const win = clampWindow(item.window ?? DEFAULT_WINDOW, rows, columns);
          return (
            <Window
              key={id}
              id={id}
              isOpen
              isMinimized={minimizedItems.has(id)}
              rowStart={win.rowStart}
              rowEnd={win.rowEnd}
              columnStart={win.columnStart}
              columnEnd={win.columnEnd}
              headerRows={win.headerRows}
              cellSize={CELL_SIZE}
              title={item.title}
              color={item.color}
              maxColumns={columns}
              maxRows={rows}
              onMinimize={() => handleMinimize(id)}
              onClose={() => handleClose(id)}
            >
              {item.type === "icon" ? (
                item.id === "terminal"
                  ? <TerminalWindow onOpen={handleOpen} />
                  : item.content
              ) : (
                <FolderContents
                  folder={item}
                  onOpen={handleOpen}
                  onTrash={handleTrash}
                  trashedItems={trashedItems}
                />
              )}
            </Window>
          );
        })}
        <Taskbar
          items={taskbarItems}
          onRestore={handleUnminimize}
          rows={rows}
          columns={columns}
          cellSize={CELL_SIZE}
        />
      </Grid>
    </div>
  );
}
