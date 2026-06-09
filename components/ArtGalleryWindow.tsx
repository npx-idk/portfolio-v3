"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const PIECES = [
  { id: 0,  title: "Cassette",     medium: "Digital",  year: "2024", src: "/art/01-cassette.jpg",    w: 160, h: 200, x: 40,  y: 50,  rotate: -2.2 },
  { id: 1,  title: "Sakura",       medium: "Digital",  year: "2024", src: "/art/02-sakura.png",       w: 140, h: 190, x: 280, y: 30,  rotate:  1.8 },
  { id: 2,  title: "Photographer", medium: "Digital",  year: "2024", src: "/art/03-photographer.jpg", w: 165, h: 200, x: 500, y: 60,  rotate: -1.5 },
  { id: 3,  title: "Arcane",       medium: "Digital",  year: "2023", src: "/art/04-arcane.png",       w: 175, h: 200, x: 750, y: 40,  rotate:  2.0 },
  { id: 4,  title: "Sparkle",      medium: "Digital",  year: "2023", src: "/art/05-sparkle.jpg",      w: 145, h: 195, x: 60,  y: 310, rotate:  1.2 },
  { id: 5,  title: "Crimson",      medium: "Digital",  year: "2023", src: "/art/06-crimson.png",      w: 160, h: 205, x: 290, y: 290, rotate: -1.8 },
  { id: 6,  title: "Summer",       medium: "Digital",  year: "2023", src: "/art/07-summer.png",       w: 160, h: 200, x: 520, y: 300, rotate:  1.0 },
  { id: 7,  title: "Objects",      medium: "Digital",  year: "2022", src: "/art/08-objects.png",      w: 200, h: 155, x: 750, y: 310, rotate: -2.5 },
  { id: 8,  title: "Daydream",     medium: "Digital",  year: "2022", src: "/art/09-daydream.png",     w: 175, h: 175, x: 40,  y: 570, rotate:  2.2 },
  { id: 9,  title: "Glitch",       medium: "Digital",  year: "2022", src: "/art/10-glitch.png",       w: 145, h: 195, x: 290, y: 560, rotate: -1.2 },
  { id: 10, title: "Dock",         medium: "Digital",  year: "2022", src: "/art/11-dock.png",         w: 150, h: 205, x: 510, y: 575, rotate:  1.6 },
  { id: 11, title: "Rainy City",   medium: "Digital",  year: "2022", src: "/art/12-rainy-city.png",   w: 165, h: 200, x: 750, y: 565, rotate: -2.0 },
  { id: 12, title: "Dancer",       medium: "Digital",  year: "2021", src: "/art/13-dancer.jpg",       w: 130, h: 210, x: 60,  y: 840, rotate:  1.4 },
  { id: 13, title: "Commute",      medium: "Digital",  year: "2021", src: "/art/14-commute.jpg",      w: 155, h: 200, x: 270, y: 830, rotate: -1.6 },
  { id: 14, title: "Galaxy",       medium: "Digital",  year: "2021", src: "/art/15-galaxy.png",       w: 170, h: 200, x: 500, y: 845, rotate:  2.4 },
  { id: 15, title: "Space Dive",   medium: "Digital",  year: "2021", src: "/art/16-space-dive.png",   w: 165, h: 205, x: 750, y: 835, rotate: -1.0 },
  { id: 16, title: "Light",        medium: "Digital",  year: "2021", src: "/art/17-light.png",        w: 155, h: 205, x: 140, y: 1110, rotate:  1.8 },
  { id: 17, title: "Cafe",         medium: "Digital",  year: "2021", src: "/art/18-cafe.jpg",         w: 160, h: 210, x: 400, y: 1100, rotate: -2.2 },
];

const CLAMP_ZOOM = (z: number) => Math.min(4, Math.max(0.5, z));

export default function ArtGalleryWindow() {
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [grabbing, setGrabbing] = useState(false);

  const isPanning = useRef(false);
  const hasDragged = useRef(false);
  const origin = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  // ── canvas pan (mouse) ───────────────────────────────────────────
  const onCanvasDown = (e: React.MouseEvent) => {
    isPanning.current = true;
    hasDragged.current = false;
    origin.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
    setGrabbing(true);
  };

  const onCanvasTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    isPanning.current = true;
    hasDragged.current = false;
    origin.current = { mx: t.clientX, my: t.clientY, px: pan.x, py: pan.y };
    setGrabbing(true);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - origin.current.mx;
      const dy = e.clientY - origin.current.my;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true;
      setPan({ x: origin.current.px + dx, y: origin.current.py + dy });
    };
    const onUp = () => { isPanning.current = false; setGrabbing(false); };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPanning.current) return;
      e.preventDefault();
      const t = e.touches[0];
      setPan({ x: origin.current.px + t.clientX - origin.current.mx, y: origin.current.py + t.clientY - origin.current.my });
    };
    const onTouchEnd = () => { isPanning.current = false; setGrabbing(false); };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // ── lightbox keyboard ────────────────────────────────────────────
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setLightbox(i => i !== null ? (i - 1 + PIECES.length) % PIECES.length : null);
      if (e.key === "ArrowRight") setLightbox(i => i !== null ? (i + 1) % PIECES.length : null);
      if (e.key === "Escape")     setLightbox(null);
      if (e.key === "+" || e.key === "=") setZoom(z => CLAMP_ZOOM(z + 0.25));
      if (e.key === "-")          setZoom(z => CLAMP_ZOOM(z - 0.25));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const openPiece = (idx: number) => { setLightbox(idx); setZoom(1); };
  const goPrev = () => { setLightbox(i => i !== null ? (i - 1 + PIECES.length) % PIECES.length : null); setZoom(1); };
  const goNext = () => { setLightbox(i => i !== null ? (i + 1) % PIECES.length : null); setZoom(1); };

  return (
    <div className="relative h-full overflow-hidden select-none bg-background">

      {/* ── infinite canvas ── */}
      <div
        className="absolute inset-0"
        style={{ cursor: grabbing ? "grabbing" : "grab" }}
        onMouseDown={onCanvasDown}
        onTouchStart={onCanvasTouchStart}
      >
        <div
          style={{
            position: "absolute",
            width: 1050,
            height: 1400,
            transform: `translate(${pan.x}px, ${pan.y}px)`,
            willChange: "transform",
          }}
        >
          {PIECES.map((piece, idx) => (
            <button
              key={piece.id}
              data-piece
              onClick={() => { if (!hasDragged.current) openPiece(idx) }}
              className="absolute group focus:outline-none"
              style={{
                left: piece.x,
                top: piece.y,
                transform: `rotate(${piece.rotate}deg)`,
                cursor: "pointer",
              }}
            >
              {/* polaroid card */}
              <div
                className="flex flex-col bg-white transition-transform duration-150 group-hover:-translate-y-1"
                style={{
                  width: piece.w + 16,
                  padding: 8,
                  paddingBottom: 28,
                  boxShadow: "0 2px 12px oklch(0 0 0 / 0.18), 0 0 0 1px oklch(0 0 0 / 0.06)",
                }}
              >
                <div style={{ width: piece.w, height: piece.h, position: "relative", overflow: "hidden" }}>
                  <Image
                    src={piece.src}
                    alt={piece.title}
                    fill
                    sizes={`${piece.w}px`}
                    style={{ objectFit: "cover" }}
                    draggable={false}
                  />
                </div>
                <div className="mt-2 px-1 flex flex-col gap-0.5">
                  <p className="font-mono text-[10px] font-semibold leading-none text-neutral-800">
                    {piece.title}
                  </p>
                  <p className="font-mono text-[9px] leading-none text-neutral-400">
                    {piece.medium} · {piece.year}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* hint */}
      <p className="absolute bottom-2 right-3 font-mono text-[9px] pointer-events-none" style={{ color: "var(--brand-primary)", opacity: 0.25 }}>
        drag to pan · click to view
      </p>

      {/* ── lightbox ── */}
      {lightbox !== null && (() => {
        const piece = PIECES[lightbox];
        return (
          <div className="absolute inset-0 z-20 flex flex-col bg-background">

            {/* top bar */}
            <div
              className="flex items-center justify-between px-4 shrink-0"
              style={{ height: 40, borderBottom: "1px solid oklch(0.388506 0.260338 264.1546 / 0.15)" }}
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
                  {piece.title}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--brand-primary)", opacity: 0.4 }}>
                  {piece.medium} · {piece.year}
                </span>
                <span className="font-mono text-[10px]" style={{ color: "var(--brand-primary)", opacity: 0.3 }}>
                  {lightbox + 1} / {PIECES.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(z => CLAMP_ZOOM(z - 0.25))}
                  className="font-mono text-sm w-6 h-6 flex items-center justify-center border transition-opacity hover:opacity-100"
                  style={{ color: "var(--brand-primary)", borderColor: "oklch(0.388506 0.260338 264.1546 / 0.3)", opacity: 0.6 }}
                >−</button>
                <span className="font-mono text-[10px] w-9 text-center" style={{ color: "var(--brand-primary)", opacity: 0.5 }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => CLAMP_ZOOM(z + 0.25))}
                  className="font-mono text-sm w-6 h-6 flex items-center justify-center border transition-opacity hover:opacity-100"
                  style={{ color: "var(--brand-primary)", borderColor: "oklch(0.388506 0.260338 264.1546 / 0.3)", opacity: 0.6 }}
                >+</button>
                <div className="w-px h-4 mx-1" style={{ backgroundColor: "oklch(0.388506 0.260338 264.1546 / 0.2)" }} />
                <button
                  onClick={() => setLightbox(null)}
                  className="font-mono text-xs transition-opacity hover:opacity-100"
                  style={{ color: "var(--brand-primary)", opacity: 0.45 }}
                >✕ close</button>
              </div>
            </div>

            {/* image area */}
            <div
              className="flex-1 flex items-center justify-center overflow-hidden"
              onWheel={(e) => { e.preventDefault(); setZoom(z => CLAMP_ZOOM(z - e.deltaY * 0.001)); }}
            >
              <div
                style={{
                  position: "relative",
                  width: piece.w * 2.2,
                  height: piece.h * 2.2,
                  transform: `scale(${zoom})`,
                  transition: "transform 0.12s ease",
                }}
              >
                <Image
                  src={piece.src}
                  alt={piece.title}
                  fill
                  sizes={`${piece.w * 2.2}px`}
                  style={{ objectFit: "contain" }}
                  draggable={false}
                />
              </div>
            </div>

            {/* prev / next */}
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-lg transition-opacity hover:opacity-100"
              style={{ color: "var(--brand-primary)", opacity: 0.35, marginTop: 20 }}
            >←</button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-lg transition-opacity hover:opacity-100"
              style={{ color: "var(--brand-primary)", opacity: 0.35, marginTop: 20 }}
            >→</button>

            {/* dot navigation */}
            <div className="flex justify-center gap-1.5 pb-3 flex-wrap px-8">
              {PIECES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setLightbox(i); setZoom(1); }}
                  className="rounded-full transition-opacity"
                  style={{ width: 6, height: 6, backgroundColor: "var(--brand-primary)", opacity: i === lightbox ? 0.8 : 0.2 }}
                />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
