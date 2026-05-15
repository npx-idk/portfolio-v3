"use client";

import { useState } from "react";
import type { FolderItem, DesktopItem } from "@/lib/desktop-config";
import ContextMenu, { type ContextMenuEntry } from "@/components/ContextMenu";

const itemColor = (item: DesktopItem) => item.color ?? "var(--brand-primary)";

const noiseStyle = {
  backgroundImage: "url('/noise-light.png')",
  backgroundRepeat: "repeat" as const,
  backgroundSize: "220px 220px",
};

const ItemTile = ({
  item,
  onOpen,
  onTrash,
}: {
  item: DesktopItem;
  onOpen: () => void;
  onTrash?: () => void;
}) => {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const color = itemColor(item);

  const menuItems: ContextMenuEntry[] = [
    { label: "open", onClick: onOpen },
    {
      label: "open in new window",
      onClick: () => window.open(item.href, "_blank"),
      disabled: !item.href,
    },
    "separator",
    { label: "delete", onClick: () => onTrash?.(), danger: true, disabled: !onTrash },
  ];

  return (
    <>
      {menu && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
      )}
      <div
        className="flex flex-col items-center gap-1 cursor-pointer select-none group p-2 rounded"
        onDoubleClick={onOpen}
        onContextMenu={(e) => { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }); }}
        title={`Double-click to open ${item.title}`}
      >
        {item.type === "folder" ? (
          <div
            className="transition-opacity group-hover:opacity-80 group-active:opacity-60"
            style={{ width: 36, height: 29, backgroundColor: color, clipPath: "polygon(0% 20%, 0% 100%, 100% 100%, 100% 20%, 45% 20%, 38% 0%, 0% 0%)", ...noiseStyle }}
          />
        ) : (
          <div
            className="transition-opacity group-hover:opacity-80 group-active:opacity-60"
            style={{ width: 29, height: 36, backgroundColor: color, clipPath: "polygon(0% 0%, 70% 0%, 100% 30%, 100% 100%, 0% 100%)", ...noiseStyle }}
          />
        )}
        <span className="text-[10px] font-mono font-medium text-center leading-tight w-14 truncate" style={{ color }}>
          {item.title}
        </span>
      </div>
    </>
  );
};

interface FolderContentsProps {
  folder: FolderItem;
  onOpen: (id: string) => void;
  onTrash?: (id: string) => void;
  trashedItems?: Set<string>;
}

const FolderContents = ({ folder, onOpen, onTrash, trashedItems }: FolderContentsProps) => {
  const visible = trashedItems
    ? folder.children.filter((c) => !trashedItems.has(c.id))
    : folder.children;

  if (visible.length === 0) {
    return <p className="p-4 text-xs font-mono text-muted-foreground">Empty folder</p>;
  }

  return (
    <div className="flex flex-wrap gap-1 p-3">
      {visible.map((child) => (
        <ItemTile
          key={child.id}
          item={child}
          onOpen={() => onOpen(child.id)}
          onTrash={onTrash ? () => onTrash(child.id) : undefined}
        />
      ))}
    </div>
  );
};

export default FolderContents;
