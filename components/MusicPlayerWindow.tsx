"use client";

import { useEffect, useRef, useState } from "react";

const C    = "var(--brand-primary)";
const BLUE = "oklch(0.388506 0.260338 264.1546";

function fmt(sec: number) {
  if (!isFinite(sec) || isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const TRACKS = [
  { name: "Rain, Rain, Rain", artist: "Konstantin Pazuzu Studio", file: "/music/rain-thunder-piano.mp3", license: "Pixabay License" },
  { name: "Quiet Rain",       artist: "Konstantin Pazuzu Studio", file: "/music/quiet-rain-piano.mp3",  license: "Pixabay License" },
  { name: "Sleepy Rain",      artist: "Lorenzo Buczek",           file: "/music/sleepy-rain.mp3",       license: "Pixabay License" },
  { name: "Tokyo Cafe",       artist: "Tvari",                    file: "/music/tokyo-cafe.mp3",        license: "Pixabay License" },
  { name: "Wallpaper",        artist: "Kevin MacLeod",            file: "/music/wallpaper.mp3",         license: "CC BY 4.0" },
  { name: "Chill",            artist: "Kevin MacLeod",            file: "/music/chill.mp3",             license: "CC BY 4.0" },
  { name: "Chill Wave",       artist: "Kevin MacLeod",            file: "/music/chill-wave.mp3",        license: "CC BY 4.0" },
];

let gAC:      AudioContext | null = null;
let gAnalyser: AnalyserNode | null = null;

function bootAC() {
  if (gAC && gAC.state !== "closed") return;
  gAC       = new AudioContext();
  gAnalyser = gAC.createAnalyser();
  gAnalyser.fftSize = 256;
  gAnalyser.connect(gAC.destination);
}

export default function MusicPlayerWindow() {
  const [playing, setPlaying]   = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef   = useRef<HTMLAudioElement | null>(null);
  const sourceRef  = useRef<MediaElementAudioSourceNode | null>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef(0);
  const playingRef = useRef(false);

  useEffect(() => {
    const audio = new Audio(TRACKS[0].file);
    audio.loop = true;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audio.src = "";
      audioRef.current = null;
      sourceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (playingRef.current) setProgress(audio.currentTime);
      if (isFinite(audio.duration) && audio.duration > 0)
        setDuration(d => d !== audio.duration ? audio.duration : d);
    }, 200);
    return () => clearInterval(id);
  }, []);

  // square waveform visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, 56, 56);

      if (gAnalyser && playingRef.current) {
        const data = new Uint8Array(gAnalyser.frequencyBinCount);
        gAnalyser.getByteTimeDomainData(data);
        ctx.beginPath();
        ctx.strokeStyle = "oklch(0.388506 0.260338 264.1546)";
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.9;
        const step = data.length / 56;
        for (let x = 0; x < 56; x++) {
          const v = (data[Math.floor(x * step)] / 128) - 1;
          const y = 28 + v * 22;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = "oklch(0.388506 0.260338 264.1546)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 28);
        ctx.lineTo(56, 28);
        ctx.stroke();
      }
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const connectSource = () => {
    const audio = audioRef.current;
    if (!audio || !gAC || sourceRef.current) return;
    const src = gAC.createMediaElementSource(audio);
    src.connect(gAnalyser!);
    sourceRef.current = src;
  };

  const play = () => {
    const audio = audioRef.current;
    if (!audio) return;
    bootAC();
    connectSource();
    gAC?.resume();
    audio.play();
    setPlaying(true);
    playingRef.current = true;
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
    playingRef.current = false;
  };

  const changeTrack = (idx: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const wasPlaying = playingRef.current;
    audio.pause();
    audio.src = TRACKS[idx].file;
    audio.load();
    setTrackIdx(idx);
    setProgress(0);
    setDuration(0);
    if (wasPlaying) {
      audio.addEventListener("canplay", () => audio.play(), { once: true });
      setPlaying(true);
      playingRef.current = true;
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const track = TRACKS[trackIdx];
  const pct   = duration > 0 ? Math.min(progress / duration, 1) : 0;

  return (
    <div
      className="h-full flex flex-col items-center justify-center bg-background select-none p-4 gap-4"
      style={{ color: C }}
    >
      {/* Viz + track info */}
      <div className="flex gap-3 items-center w-full">
        <div
          style={{
            width: 56, height: 56, flexShrink: 0,
            backgroundColor: `${BLUE} / 0.05)`,
            border: `1px solid ${BLUE} / 0.15)`,
            overflow: "hidden",
          }}
        >
          <canvas ref={canvasRef} width={56} height={56} style={{ display: "block" }} />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="font-mono text-[11px] font-semibold leading-snug truncate" style={{ color: C }}>
            {track.name}
          </p>
          <p className="font-mono text-[9px] leading-snug truncate" style={{ color: C, opacity: 0.4 }}>
            {track.artist}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1 w-full">
        <div
          className="h-[2px] cursor-pointer w-full"
          style={{ backgroundColor: `${BLUE} / 0.12)` }}
          onClick={seek}
        >
          <div
            style={{
              height: "100%",
              width: `${pct * 100}%`,
              backgroundColor: C,
              transition: "width 0.2s linear",
            }}
          />
        </div>
        <div className="flex justify-between font-mono text-[9px]" style={{ opacity: 0.3 }}>
          <span>{fmt(progress)}</span>
          <span>{fmt(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-5 w-full">
        <button
          onClick={() => changeTrack((trackIdx + TRACKS.length - 1) % TRACKS.length)}
          className="transition-opacity hover:opacity-100"
          style={{ opacity: 0.45, color: C }}
          title="Previous"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/>
          </svg>
        </button>

        <button
          onClick={playing ? pause : play}
          className="flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ width: 32, height: 32, backgroundColor: C, color: "var(--background)", flexShrink: 0 }}
          title={playing ? "Pause" : "Play"}
        >
          {!playing ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          )}
        </button>

        <button
          onClick={() => changeTrack((trackIdx + 1) % TRACKS.length)}
          className="transition-opacity hover:opacity-100"
          style={{ opacity: 0.45, color: C }}
          title="Next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6h2v12h-2z"/>
          </svg>
        </button>
      </div>

      {/* Attribution */}
      <p className="font-mono text-[8px]" style={{ color: C, opacity: 0.22 }}>
        {track.artist} · {track.license}
      </p>
    </div>
  );
}
