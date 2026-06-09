import React from "react";
import HelloWindow from "@/components/HelloWindow";
import AboutWindow from "@/components/AboutWindow";
import WorkWindow from "@/components/WorkWindow";
import ContactWindow from "@/components/ContactWindow";
import ProjectWindow from "@/components/ProjectWindow";
import projects from "@/content/projects.json";
import ArtGalleryWindow from "@/components/ArtGalleryWindow";
import MusicPlayerWindow from "@/components/MusicPlayerWindow";
import DoNotOpenWindow from "@/components/DoNotOpenWindow";
import RickRollWindow from "@/components/RickRollWindow";
import NoteWindow from "@/components/NoteWindow";
import TodoWindow from "@/components/TodoWindow";
import MarkdownWindow from "@/components/MarkdownWindow";
// TerminalWindow is rendered dynamically in page.tsx (needs onOpen prop)

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
      window: { rowStart: 2, rowEnd: 9, columnStart: 18, columnEnd: 38, headerRows: 2 },
    },
  },
  {
    rowStart: 8,
    columnStart: 2,
    item: {
      type: "icon",
      id: "about",
      title: "about.txt",
      content: <AboutWindow />,
      window: { rowStart: 4, rowEnd: 22, columnStart: 40, columnEnd: 60, headerRows: 2 },
    },
  },
  {
    rowStart: 14,
    columnStart: 2,
    item: {
      type: "icon",
      id: "work",
      title: "work.txt",
      content: <WorkWindow />,
      window: { rowStart: 12, rowEnd: 32, columnStart: 18, columnEnd: 40, headerRows: 2 },
    },
  },
  {
    rowStart: 20,
    columnStart: 2,
    item: {
      type: "icon",
      id: "contact",
      title: "contact.txt",
      content: <ContactWindow />,
      window: { rowStart: 6, rowEnd: 20, columnStart: 62, columnEnd: 80, headerRows: 2 },
    },
  },
  {
    rowStart: 26,
    columnStart: 2,
    item: {
      type: "folder",
      id: "projects",
      title: "projects",
      window: { rowStart: 14, rowEnd: 28, columnStart: 42, columnEnd: 62, headerRows: 2 },
      children: projects.map((p, i) => ({
        type: "icon" as const,
        id: p.id,
        title: p.title,
        href: p.href,
        content: <ProjectWindow project={p} />,
        window: {
          rowStart: 8 + i * 2,
          rowEnd: 24 + i * 2,
          columnStart: 44 + i * 2,
          columnEnd: 64 + i * 2,
          headerRows: 2,
        },
      })),
    },
  },
  {
    rowStart: 32,
    columnStart: 2,
    item: {
      type: "icon",
      id: "art",
      title: "art",
      color: "oklch(0.60 0.20 300)",
      content: <ArtGalleryWindow />,
      window: { rowStart: 4, rowEnd: 28, columnStart: 20, columnEnd: 50, headerRows: 2 },
    },
  },
  {
    rowStart: 38,
    columnStart: 2,
    item: {
      type: "icon",
      id: "terminal",
      title: "terminal",
      color: "oklch(0.45 0.18 200)",
      content: null,
      window: { rowStart: 6, rowEnd: 28, columnStart: 55, columnEnd: 85, headerRows: 2 },
    },
  },
  {
    rowStart: 44,
    columnStart: 2,
    item: {
      type: "icon",
      id: "music",
      title: "music",
      color: "oklch(0.68 0.18 50)",
      content: <MusicPlayerWindow />,
      window: { rowStart: 6, rowEnd: 18, columnStart: 60, columnEnd: 82, headerRows: 2 },
    },
  },
  {
    rowStart: 56,
    columnStart: 2,
    item: {
      type: "icon",
      id: "todo",
      title: "todo.txt",
      content: <TodoWindow />,
      window: { rowStart: 4, rowEnd: 24, columnStart: 28, columnEnd: 48, headerRows: 2 },
    },
  },
  {
    rowStart: 56,
    columnStart: 2,
    item: {
      type: "folder",
      id: "stars-inside-tears",
      title: "stars inside tears",
      color: "oklch(0.62 0.15 355)",
      window: { rowStart: 5, rowEnd: 22, columnStart: 22, columnEnd: 46, headerRows: 2 },
      children: [
        {
          type: "icon",
          id: "story-the-last-frequency",
          title: "the last frequency.md",
          color: "oklch(0.62 0.15 355)",
          content: <MarkdownWindow src="/stories/the-last-frequency.md" />,
          window: { rowStart: 4, rowEnd: 30, columnStart: 20, columnEnd: 55, headerRows: 2 },
        },
        // Add more stories here:
        // {
        //   type: "icon",
        //   id: "story-your-slug",
        //   title: "your-title.md",
        //   color: "oklch(0.62 0.15 355)",
        //   content: <MarkdownWindow src="/stories/your-file.md" />,
        //   window: { rowStart: 4, rowEnd: 30, columnStart: 20, columnEnd: 55, headerRows: 2 },
        // },
      ],
    },
  },
  {
    rowStart: 62,
    columnStart: 2,
    item: {
      type: "folder",
      id: "blogs",
      title: "blogs",
      color: "oklch(0.55 0.18 220)",
      window: { rowStart: 5, rowEnd: 22, columnStart: 22, columnEnd: 46, headerRows: 2 },
      children: [
        {
          type: "icon",
          id: "blog-on-building-things-alone",
          title: "on building things alone.md",
          color: "oklch(0.55 0.18 220)",
          content: <MarkdownWindow src="/blogs/on-building-things-alone.md" />,
          window: { rowStart: 4, rowEnd: 30, columnStart: 20, columnEnd: 55, headerRows: 2 },
        },
        // Add more blog posts here:
        // {
        //   type: "icon",
        //   id: "blog-your-slug",
        //   title: "your-title.md",
        //   color: "oklch(0.55 0.18 220)",
        //   content: <MarkdownWindow src="/blogs/your-file.md" />,
        //   window: { rowStart: 4, rowEnd: 30, columnStart: 20, columnEnd: 55, headerRows: 2 },
        // },
      ],
    },
  },
  {
    rowStart: 68,
    columnStart: 2,
    item: {
      type: "folder",
      id: "do-not-open",
      title: "don't open",
      color: "oklch(0.577 0.245 27.325)",
      window: { rowStart: 8, rowEnd: 22, columnStart: 30, columnEnd: 50, headerRows: 2 },
      children: [
        {
          type: "folder",
          id: "do-not-open-2",
          title: "don't open",
          color: "oklch(0.577 0.245 27.325)",
          window: { rowStart: 10, rowEnd: 24, columnStart: 34, columnEnd: 54, headerRows: 2 },
          children: [
            {
              type: "icon",
              id: "do-not-open-txt",
              title: "don't open.txt",
              color: "oklch(0.577 0.245 27.325)",
              content: <DoNotOpenWindow />,
              window: { rowStart: 5, rowEnd: 30, columnStart: 38, columnEnd: 65, headerRows: 2 },
            },
            {
              type: "icon",
              id: "do-not-watch-mp4",
              title: "don't watch.mp4",
              color: "oklch(0.577 0.245 27.325)",
              content: <RickRollWindow />,
              window: { rowStart: 4, rowEnd: 28, columnStart: 20, columnEnd: 55, headerRows: 2 },
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
