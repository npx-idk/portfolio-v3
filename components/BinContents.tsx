"use client";

import type { DesktopItem } from "@/lib/desktop-config";

interface BinContentsProps {
  items: DesktopItem[];
  onRestore: (id: string) => void;
  onEmpty: () => void;
}

const BinContents = ({ items, onRestore, onEmpty }: BinContentsProps) => {
  if (items.length === 0) {
    return <p className="p-4 text-xs font-mono text-muted-foreground">Bin is empty.</p>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto">
        {items.map((item) => {
          const color = item.color ?? "var(--brand-primary)";
          return (
            <div
              key={item.id}
              className="flex items-center gap-3 px-3 py-2 border-b border-border/40 last:border-0"
            >
              {/* Mini icon */}
              {item.type === "folder" ? (
                <div
                  style={{
                    width: 20,
                    height: 16,
                    flexShrink: 0,
                    backgroundColor: color,
                    backgroundImage: "url('/noise-light.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "220px 220px",
                    clipPath: "polygon(0% 20%, 0% 100%, 100% 100%, 100% 20%, 45% 20%, 38% 0%, 0% 0%)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 16,
                    height: 20,
                    flexShrink: 0,
                    backgroundColor: color,
                    backgroundImage: "url('/noise-light.png')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "220px 220px",
                    clipPath: "polygon(0% 0%, 70% 0%, 100% 30%, 100% 100%, 0% 100%)",
                  }}
                />
              )}
              <span className="text-xs font-mono flex-1 truncate">{item.title}</span>
              <button
                className="text-[10px] font-mono px-2 py-0.5 border border-current opacity-60 hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                style={{ color }}
                onClick={() => onRestore(item.id)}
              >
                restore
              </button>
            </div>
          );
        })}
      </div>
      <div className="p-2 border-t border-border/40 flex justify-end">
        <button
          className="text-[10px] font-mono px-2 py-1 border border-destructive text-destructive opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          onClick={onEmpty}
        >
          empty bin
        </button>
      </div>
    </div>
  );
};

export default BinContents;
