"use client";

import { useEffect, useState } from "react";
import type { PostMeta } from "@/app/api/content/[type]/route";

// ── inline markdown renderer ──────────────────────────────────────────────────

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function renderMarkdown(raw: string): string {
  // strip frontmatter
  const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "").trim();
  const lines = body.split(/\r?\n/);
  const out: string[] = [];
  let inParagraph = false;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const closePara = () => {
    if (inParagraph) { out.push("</p>"); inParagraph = false; }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        closePara();
        inCodeBlock = true;
        codeLines = [];
      } else {
        out.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCodeBlock = false;
      }
      continue;
    }

    if (inCodeBlock) { codeLines.push(line); continue; }

    const t = line.trim();

    if (!t) { closePara(); continue; }

    if (t.startsWith("### ")) {
      closePara(); out.push(`<h3>${renderInline(t.slice(4))}</h3>`);
    } else if (t.startsWith("## ")) {
      closePara(); out.push(`<h2>${renderInline(t.slice(3))}</h2>`);
    } else if (t.startsWith("# ")) {
      closePara(); out.push(`<h1>${renderInline(t.slice(2))}</h1>`);
    } else if (t === "---" || t === "***" || t === "___") {
      closePara(); out.push("<hr>");
    } else if (t.startsWith("> ")) {
      closePara(); out.push(`<blockquote>${renderInline(t.slice(2))}</blockquote>`);
    } else {
      if (!inParagraph) { out.push("<p>"); inParagraph = true; } else { out.push("<br>"); }
      out.push(renderInline(t));
    }
  }
  closePara();
  return out.join("");
}

// ── component ─────────────────────────────────────────────────────────────────

const C    = "var(--brand-primary)";
const CDIM = "var(--brand-primary)";

interface Props {
  type: "stories" | "blogs";
  label?: string;
}

export default function MarkdownReaderWindow({ type, label }: Props) {
  const [posts, setPosts]       = useState<PostMeta[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [html, setHtml]         = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    fetch(`/api/content/${type}`)
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => {});
  }, [type]);

  const openPost = async (slug: string) => {
    setSelected(slug);
    setHtml("");
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${type}/${slug}`);
      const text = await res.text();
      setHtml(renderMarkdown(text));
    } catch {
      setHtml("<p>could not load.</p>");
    }
    setLoading(false);
  };

  // ── reader view ──
  if (selected) {
    const meta = posts.find((p) => p.slug === selected);
    return (
      <div className="h-full flex flex-col bg-background" style={{ color: C }}>
        <div
          className="flex items-center gap-3 px-4 shrink-0 font-mono text-[10px]"
          style={{ height: 36, borderBottom: `1px solid ${C}20` }}
        >
          <button
            onClick={() => setSelected(null)}
            className="transition-opacity hover:opacity-100"
            style={{ opacity: 0.45 }}
          >
            ← back
          </button>
          {meta && (
            <>
              <span className="font-semibold truncate">{meta.title}</span>
              {meta.date && (
                <span style={{ opacity: 0.35 }}>{meta.date}</span>
              )}
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <p className="font-mono text-[11px]" style={{ opacity: 0.4 }}>loading...</p>
          ) : (
            <div
              className="prose-md font-mono text-[11px] leading-relaxed"
              style={{ color: C }}
              // safe: content is from developer-controlled .md files, not user input
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    );
  }

  // ── list view ──
  return (
    <div className="h-full flex flex-col bg-background font-mono" style={{ color: C }}>
      <div
        className="px-4 shrink-0 flex items-center"
        style={{ height: 36, borderBottom: `1px solid ${C}20` }}
      >
        <span className="text-[10px] font-semibold" style={{ opacity: 0.45 }}>
          {label ?? type}
        </span>
        <span className="text-[9px] ml-2" style={{ opacity: 0.25 }}>
          {posts.length} {posts.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {posts.length === 0 ? (
          <p className="p-4 text-[11px]" style={{ opacity: 0.3 }}>
            nothing here yet.
          </p>
        ) : (
          <div className="flex flex-col">
            {posts.map((post, i) => (
              <button
                key={post.slug}
                onClick={() => openPost(post.slug)}
                className="flex items-baseline justify-between px-4 py-2.5 text-left transition-opacity hover:opacity-70"
                style={{
                  borderBottom: i < posts.length - 1 ? `1px solid ${C}12` : undefined,
                  color: C,
                }}
              >
                <span className="text-[11px] font-medium truncate mr-3">{post.title}</span>
                {post.date && (
                  <span className="text-[9px] shrink-0" style={{ opacity: 0.3 }}>
                    {post.date}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
