"use client";

import { useEffect, useState } from "react";

const C = "var(--brand-primary)";

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

    if (t.startsWith("### "))      { closePara(); out.push(`<h3>${renderInline(t.slice(4))}</h3>`); }
    else if (t.startsWith("## "))  { closePara(); out.push(`<h2>${renderInline(t.slice(3))}</h2>`); }
    else if (t.startsWith("# "))   { closePara(); out.push(`<h1>${renderInline(t.slice(2))}</h1>`); }
    else if (/^[-*_]{3,}$/.test(t)) { closePara(); out.push("<hr>"); }
    else if (t.startsWith("> "))   { closePara(); out.push(`<blockquote>${renderInline(t.slice(2))}</blockquote>`); }
    else {
      if (!inParagraph) { out.push("<p>"); inParagraph = true; } else { out.push("<br>"); }
      out.push(renderInline(t));
    }
  }
  closePara();
  return out.join("");
}

export default function MarkdownWindow({ src }: { src: string }) {
  const [html, setHtml]       = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then((text) => { setHtml(renderMarkdown(text)); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [src]);

  return (
    <div className="h-full overflow-y-auto px-5 py-5 bg-background" style={{ color: C }}>
      {loading && (
        <p className="font-mono text-[11px]" style={{ opacity: 0.35 }}>loading...</p>
      )}
      {error && (
        <p className="font-mono text-[11px]" style={{ opacity: 0.35 }}>could not load file.</p>
      )}
      {!loading && !error && (
        // safe: content is from developer-controlled .md files, not user input
        <div
          className="prose-md font-mono text-[11px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
