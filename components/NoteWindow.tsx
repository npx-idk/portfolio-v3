"use client";

import { useEffect, useRef, useState } from "react";
import type { Note } from "@/app/api/notes/route";

const C    = "oklch(0.45 0.12 85)";
const CDIM = "oklch(0.45 0.12 85 / 0.5)";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NoteWindow() {
  const [notes, setNotes]   = useState<Note[]>([]);
  const [name, setName]     = useState("");
  const [msg, setMsg]       = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notes")
      .then(r => r.json())
      .then(setNotes)
      .catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || "anonymous", message: msg.trim() }),
      });
      if (!res.ok) throw new Error();
      const note: Note = await res.json();
      setNotes(prev => [note, ...prev]);
      setMsg("");
      setStatus("done");
      setTimeout(() => setStatus("idle"), 2000);
      listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background font-mono text-[11px]" style={{ color: C }}>

      {/* Notes list */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {notes.length === 0 && (
          <p style={{ color: CDIM }} className="mt-2">no notes yet. be the first.</p>
        )}
        {notes.map(note => (
          <div key={note.id} className="flex flex-col gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold truncate">{note.name}</span>
              <span className="text-[9px] shrink-0" style={{ color: CDIM }}>{timeAgo(note.timestamp)}</span>
            </div>
            <p className="leading-relaxed break-words" style={{ color: C, opacity: 0.8 }}>
              {note.message}
            </p>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: C, opacity: 0.12 }} />

      {/* Compose */}
      <form onSubmit={submit} className="flex flex-col gap-2 p-3 shrink-0">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="your name (optional)"
          maxLength={40}
          className="bg-transparent outline-none border-b text-[10px] pb-0.5 placeholder:opacity-30"
          style={{ borderColor: `oklch(0.45 0.12 85 / 0.3)`, color: C }}
        />
        <textarea
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="leave a note..."
          maxLength={280}
          rows={2}
          className="bg-transparent outline-none resize-none text-[11px] placeholder:opacity-30 leading-relaxed"
          style={{ color: C }}
        />
        <div className="flex items-center justify-between">
          <span className="text-[9px]" style={{ color: CDIM }}>
            {status === "done"  && "note left ✓"}
            {status === "error" && "something went wrong"}
            {status === "idle" || status === "sending" ? `${msg.length}/280` : ""}
          </span>
          <button
            type="submit"
            disabled={!msg.trim() || status === "sending"}
            className="text-[10px] px-3 py-1 transition-opacity disabled:opacity-30"
            style={{ backgroundColor: C, color: "var(--background)" }}
          >
            {status === "sending" ? "..." : "send"}
          </button>
        </div>
      </form>
    </div>
  );
}
