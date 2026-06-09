"use client";

import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "desktop-todos";
const BORDER = "1px solid oklch(0.388506 0.260338 264.1546 / 0.12)";

type Status = "todo" | "in-progress" | "done";

interface Todo {
  id: string;
  text: string;
  status: Status;
  createdAt: number;
  startedAt?: number;
  elapsed: number;
}

function migrate(raw: unknown[]): Todo[] {
  return raw.map((t: any) => ({
    id: t.id,
    text: t.text,
    status: t.status ?? (t.done ? "done" : "todo"),
    createdAt: t.createdAt,
    startedAt: t.startedAt,
    elapsed: t.elapsed ?? 0,
  }));
}

function load(): Todo[] {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v ? migrate(JSON.parse(v)) : [];
  } catch {
    return [];
  }
}

function save(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0)
    return `${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function getElapsed(todo: Todo, now: number): number {
  if (todo.status === "in-progress" && todo.startedAt != null)
    return todo.elapsed + (now - todo.startedAt);
  return todo.elapsed;
}

const NEXT: Record<Status, Status> = {
  "todo": "in-progress",
  "in-progress": "done",
  "done": "todo",
};

function GripIcon() {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" fill="currentColor">
      <circle cx="2" cy="2"  r="1.2" /><circle cx="6" cy="2"  r="1.2" />
      <circle cx="2" cy="6"  r="1.2" /><circle cx="6" cy="6"  r="1.2" />
      <circle cx="2" cy="10" r="1.2" /><circle cx="6" cy="10" r="1.2" />
    </svg>
  );
}

function StatusIcon({ status, blocked }: { status: Status; blocked?: boolean }) {
  if (status === "todo")
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity={blocked ? 0.2 : 0.5} />
        <polygon points="5.5,4.5 10.5,7 5.5,9.5" fill="currentColor" fillOpacity={blocked ? 0.15 : 0.5} />
      </svg>
    );
  if (status === "in-progress")
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect x="1.5" y="1.5" width="11" height="11" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <polygon points="5,4 10,7 5,10" fill="currentColor" />
      </svg>
    );
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="12" height="12" rx="1.5" fill="currentColor" />
      <polyline points="3.5,7 6,9.5 10.5,4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TodoWindow() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTodos(load()); }, []);

  useEffect(() => {
    const running = todos.some((t) => t.status === "in-progress");
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [todos]);

  const update = (next: Todo[]) => { setTodos(next); save(next); };

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    update([...todos, { id: crypto.randomUUID(), text, status: "todo", createdAt: Date.now(), elapsed: 0 }]);
    setInput("");
    inputRef.current?.focus();
  };

  const advance = (id: string) => {
    const t = todos.find((x) => x.id === id);
    if (!t) return;
    if (t.status === "todo" && todos.some((x) => x.status === "in-progress")) return;
    const next = NEXT[t.status];
    const n = Date.now();
    const patch: Partial<Todo> = { status: next };
    if (next === "in-progress") {
      patch.startedAt = n;
    } else if (next === "done") {
      patch.elapsed = getElapsed(t, n);
      patch.startedAt = undefined;
    } else {
      patch.elapsed = 0;
      patch.startedAt = undefined;
    }
    update(todos.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  };

  const handleDragStart = (idx: number) => {
    setDragIndex(idx);
    setDropIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDropIndex(idx);
  };

  const handleDrop = () => {
    if (dragIndex == null || dropIndex == null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }
    const arr = [...todos];
    const [item] = arr.splice(dragIndex, 1);
    arr.splice(dropIndex, 0, item);
    update(arr);
    setDragIndex(null);
    setDropIndex(null);
  };

  const remove = (id: string) => update(todos.filter((t) => t.id !== id));
  const clearDone = () => update(todos.filter((t) => t.status !== "done"));

  const hasRunning = todos.some((t) => t.status === "in-progress");
  const pending = todos.filter((t) => t.status === "todo").length;
  const hasDone = todos.some((t) => t.status === "done");

  return (
    <div className="h-full flex flex-col font-mono text-[11px]" style={{ color: "var(--brand-primary)" }}>

      {/* List */}
      <div
        className="flex-1 overflow-y-auto"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {todos.length === 0 && (
          <p className="p-4 opacity-30">nothing here yet.</p>
        )}
        {todos.map((todo, idx) => {
          const elapsed = getElapsed(todo, now);
          const isRunning = todo.status === "in-progress";
          const isDone = todo.status === "done";
          const blocked = todo.status === "todo" && hasRunning;
          const isDragging = dragIndex === idx;
          const isDropTarget = dropIndex === idx && dragIndex !== null && dragIndex !== idx;

          return (
            <div
              key={todo.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDrop}
              className="flex items-center gap-2 px-3 py-2 group transition-opacity"
              style={{
                borderBottom: BORDER,
                borderTop: isDropTarget ? "2px solid var(--brand-primary)" : undefined,
                opacity: isDragging ? 0.35 : 1,
                cursor: "default",
              }}
            >
              {/* Drag handle */}
              <span
                className="shrink-0 opacity-0 group-hover:opacity-20 hover:!opacity-50 transition-opacity cursor-grab active:cursor-grabbing"
                style={{ color: "var(--brand-primary)" }}
              >
                <GripIcon />
              </span>

              {/* Status toggle */}
              <button
                onClick={() => advance(todo.id)}
                className="shrink-0 transition-opacity"
                style={{
                  opacity: isDone ? 1 : isRunning ? 1 : blocked ? 0.2 : 0.5,
                  cursor: blocked ? "not-allowed" : "pointer",
                }}
                title={
                  blocked ? "finish the current task first" :
                  { todo: "start", "in-progress": "complete", done: "reset" }[todo.status]
                }
              >
                <StatusIcon status={todo.status} blocked={blocked} />
              </button>

              {/* Text */}
              <span
                className="flex-1 leading-relaxed break-all"
                style={{
                  opacity: isDone ? 0.35 : blocked ? 0.4 : 0.85,
                  textDecoration: isDone ? "line-through" : "none",
                }}
              >
                {todo.text}
              </span>

              {/* Timer */}
              {(isRunning || (isDone && elapsed > 0)) && (
                <span
                  className="shrink-0 text-[10px] tabular-nums"
                  style={{
                    opacity: isRunning ? 0.9 : 0.4,
                    color: isRunning ? "oklch(0.68 0.18 50)" : "var(--brand-primary)",
                  }}
                >
                  {fmt(elapsed)}
                </span>
              )}

              {/* Delete */}
              <button
                onClick={() => remove(todo.id)}
                className="shrink-0 opacity-0 group-hover:opacity-25 hover:!opacity-70 transition-opacity"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Add form */}
      <form
        onSubmit={addTodo}
        className="flex items-center gap-2 px-3 py-2.5 shrink-0"
        style={{ borderTop: BORDER }}
      >
        <span style={{ opacity: 0.35 }}>+</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="add a todo..."
          className="flex-1 bg-transparent outline-none placeholder:opacity-30"
          style={{ color: "var(--brand-primary)" }}
          autoFocus
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="text-[10px] px-2 py-0.5 disabled:opacity-20 transition-opacity"
          style={{ backgroundColor: "var(--brand-primary)", color: "var(--background)" }}
        >
          add
        </button>
      </form>

      {/* Footer */}
      {todos.length > 0 && (
        <div
          className="shrink-0 flex items-center justify-between px-3 py-2"
          style={{ borderTop: BORDER }}
        >
          <span style={{ opacity: 0.4 }}>{pending} remaining</span>
          {hasDone && (
            <button
              onClick={clearDone}
              className="transition-opacity hover:opacity-100"
              style={{ opacity: 0.35 }}
            >
              clear done
            </button>
          )}
        </div>
      )}
    </div>
  );
}
