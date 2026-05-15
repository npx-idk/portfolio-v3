import React from "react";
import HelloWindow from "@/components/HelloWindow";

export interface WindowConfig {
  rowStart: number;
  rowEnd: number;
  columnStart: number;
  columnEnd: number;
  headerRows?: number;
}

export interface IconItem {
  type: "icon";
  id: string;
  title: string;
  color?: string;
  href?: string;
  content: React.ReactNode;
  window?: WindowConfig;
}

export interface FolderItem {
  type: "folder";
  id: string;
  title: string;
  color?: string;
  href?: string;
  children: DesktopItem[];
  window?: WindowConfig;
}

export type DesktopItem = IconItem | FolderItem;

export interface RootItem {
  item: DesktopItem;
  rowStart: number;
  columnStart: number;
}

export const DESKTOP: RootItem[] = [
  {
    rowStart: 2,
    columnStart: 2,
    item: {
      type: "icon",
      id: "hello",
      title: "hello.txt",
      content: <HelloWindow />,
      window: { rowStart: 2, rowEnd: 10, columnStart: 20, columnEnd: 40, headerRows: 2 },
    },
  },
  {
    rowStart: 8,
    columnStart: 2,
    item: {
      type: "folder",
      id: "projects",
      title: "projects",
      window: { rowStart: 5, rowEnd: 22, columnStart: 5, columnEnd: 28, headerRows: 2 },
      children: [
        {
          type: "icon",
          id: "project-1",
          title: "project-1.txt",
          content: <p className="p-3 text-sm font-mono">Project 1 content.</p>,
          window: { rowStart: 8, rowEnd: 20, columnStart: 8, columnEnd: 28, headerRows: 2 },
        },
        {
          type: "folder",
          id: "archived",
          title: "archived",
          window: { rowStart: 10, rowEnd: 24, columnStart: 10, columnEnd: 30, headerRows: 2 },
          children: [
            {
              type: "icon",
              id: "old-project",
              title: "old.txt",
              content: <p className="p-3 text-sm font-mono">Old project content.</p>,
              window: { rowStart: 12, rowEnd: 22, columnStart: 12, columnEnd: 30, headerRows: 2 },
            },
          ],
        },
      ],
    },
  },
];

export function findItem(id: string): DesktopItem | null {
  function search(items: DesktopItem[]): DesktopItem | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.type === "folder") {
        const found = search(item.children);
        if (found) return found;
      }
    }
    return null;
  }
  return search(DESKTOP.map((r) => r.item));
}
