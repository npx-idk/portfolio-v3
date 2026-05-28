import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

const ALLOWED = new Set(["stories", "blogs"]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ type: string; slug: string }> },
) {
  const { type, slug } = await params;

  if (!ALLOWED.has(type)) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!slug || slug.includes("..") || slug.includes("/"))
    return NextResponse.json({ error: "invalid" }, { status: 400 });

  const filePath = join(process.cwd(), "content", type, `${slug}.md`);
  try {
    const content = await readFile(filePath, "utf-8");
    return new NextResponse(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
