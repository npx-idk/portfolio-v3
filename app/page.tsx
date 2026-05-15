"use client";

import { useCallback, useLayoutEffect, useState } from "react";
import Grid from "@/components/Grid/Grid";
import Window from "@/components/Window";
import DesktopItem from "@/components/DesktopItem";
import FolderContents from "@/components/FolderContents";
import Bin from "@/components/Bin";
import BinContents from "@/components/BinContents";
import { DESKTOP, findItem, type WindowConfig } from "@/lib/desktop-config";

const CELL_SIZE = 20;
const OPEN_KEY = "desktop-open-items";
const TRASH_KEY = "desktop-trashed-items";

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

export default function Page() {
  const [rows, setRows] = useState(0);
  const [columns, setColumns] = useState(0);
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set(["hello"]);
    const stored = loadSet(OPEN_KEY);
    stored.add("hello");
    return stored;
  });
  const [trashedItems, setTrashedItems] = useState<Set<string>>(() =>
    typeof window === "undefined" ? new Set() : loadSet(TRASH_KEY)
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
    setTrashedItems((prev) => {
      const next = new Set([...prev, id]);
      saveSet(TRASH_KEY, next);
      return next;
    });
  }, [handleClose]);

  const handleRestore = useCallback((id: string) => {
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

  if (!columns || !rows) return null;

  const activeDesktop = DESKTOP.filter(({ item }) => !trashedItems.has(item.id));
  const trashedDesktopItems = [...trashedItems]
    .map((id) => findItem(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof findItem>>[];

  return (
    <div className="fixed inset-0 overflow-hidden flex items-start justify-center">
      <Grid rows={rows} columns={columns} cellSize={CELL_SIZE}>
        {/* Root desktop items — auto-stacked on the left */}
        {activeDesktop.map(({ item }, index) => (
          <DesktopItem
            key={item.id}
            item={item}
            rowStart={2 + index * 6}
            columnStart={2}
            cellSize={CELL_SIZE}
            onOpen={() => handleOpen(item.id)}
            onDropToBin={() => handleTrash(item.id)}
          />
        ))}

        {/* Bin */}
        <Bin
          rowStart={2}
          columnStart={Math.max(1, columns - 5)}
          cellSize={CELL_SIZE}
          isEmpty={trashedItems.size === 0}
          onOpen={() => handleOpen("__bin__")}
          onEmpty={handleEmptyBin}
        />

        {/* Open windows */}
        {[...openItems].map((id) => {
          if (id === "__bin__") {
            return (
              <Window
                key="__bin__"
                id="__bin__"
                isOpen
                rowStart={3}
                rowEnd={18}
                columnStart={Math.max(1, columns - 26)}
                columnEnd={Math.max(1, columns - 6)}
                headerRows={2}
                cellSize={CELL_SIZE}
                title="bin"
                maxColumns={columns}
                maxRows={rows}
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
          const win = item.window ?? DEFAULT_WINDOW;
          return (
            <Window
              key={id}
              id={id}
              isOpen
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
              onClose={() => handleClose(id)}
            >
              {item.type === "icon" ? (
                item.content
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
      </Grid>
    </div>
  );
}
