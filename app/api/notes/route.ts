import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const KEY      = "portfolio:notes";
const MAX      = 100;
const MAX_LEN  = 280;
const NAME_LEN = 40;

export interface Note {
  id: string;
  name: string;
  message: string;
  timestamp: string;
}

const DEV_FILE = path.join(process.cwd(), ".notes.json");

function readDevStore(): Note[] {
  try { return JSON.parse(fs.readFileSync(DEV_FILE, "utf-8")); } catch { return []; }
}

function writeDevStore(notes: Note[]) {
  fs.writeFileSync(DEV_FILE, JSON.stringify(notes));
}

async function getStore() {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import("@vercel/kv");
    return kv;
  }
  return null;
}

export async function GET() {
  const kv = await getStore();
  if (kv) {
    const notes = await kv.lrange<Note>(KEY, 0, MAX - 1);
    return NextResponse.json(notes);
  }
  return NextResponse.json(readDevStore().slice(0, MAX));
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "invalid body" }, { status: 400 });

  const name    = String(body.name    ?? "anonymous").trim().slice(0, NAME_LEN) || "anonymous";
  const message = String(body.message ?? "").trim().slice(0, MAX_LEN);
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const note: Note = {
    id: crypto.randomUUID(),
    name,
    message,
    timestamp: new Date().toISOString(),
  };

  const kv = await getStore();
  if (kv) {
    await kv.lpush(KEY, note);
    await kv.ltrim(KEY, 0, MAX - 1);
  } else {
    const notes = readDevStore();
    notes.unshift(note);
    if (notes.length > MAX) notes.splice(MAX);
    writeDevStore(notes);
  }

  return NextResponse.json(note, { status: 201 });
}
