import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
}

const ALLOWED = new Set(["stories", "blogs"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  const { type } = await params;
  if (!ALLOWED.has(type)) return NextResponse.json([], { status: 404 });

  const dir = join(process.cwd(), "content", type);
  try {
    const files = await readdir(dir);
    const mdFiles = files.filter((f) => f.endsWith(".md"));

    const items: PostMeta[] = await Promise.all(
      mdFiles.map(async (filename) => {
        const raw = await readFile(join(dir, filename), "utf-8");
        const slug = filename.slice(0, -3);

        let title = slug.replace(/-/g, " ");
        let date = "";

        const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fm) {
          const titleMatch = fm[1].match(/^title:\s*(.+)$/m);
          const dateMatch  = fm[1].match(/^date:\s*(.+)$/m);
          if (titleMatch) title = titleMatch[1].trim();
          if (dateMatch)  date  = dateMatch[1].trim();
        }

        return { slug, title, date };
      }),
    );

    items.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
