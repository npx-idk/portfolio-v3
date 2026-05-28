"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "Hello!",
  "I am Hari",
  "Developer",
  "Artist",
];

const TYPE_SPEED = 85;
const DELETE_SPEED = 45;
const HOLD_MS = 1400;

function commonPrefixLen(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

type Phase = "typing" | "holding" | "deleting";

export default function HelloWindow() {
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const target = PHRASES[phraseIdx];

    if (phase === "typing") {
      if (displayed.length < target.length) {
        const t = setTimeout(
          () => setDisplayed(target.slice(0, displayed.length + 1)),
          TYPE_SPEED
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("holding"), HOLD_MS);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      setPhase("deleting");
      return;
    }

    if (phase === "deleting") {
      const nextIdx = (phraseIdx + 1) % PHRASES.length;
      const keepLen = commonPrefixLen(target, PHRASES[nextIdx]);

      if (displayed.length > keepLen) {
        const t = setTimeout(
          () => setDisplayed(displayed.slice(0, -1)),
          DELETE_SPEED
        );
        return () => clearTimeout(t);
      }
      setPhraseIdx(nextIdx);
      setPhase("typing");
    }
  }, [displayed, phase, phraseIdx]);

  return (
    <div className="flex items-center justify-center h-full select-none">
      {/* SVG filter for rough/hand-drawn edges */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="rough-edges">
            <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="4" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div className="relative inline-block">
        {/* border */}
        <p
          className="text-6xl font-bold tracking-tight px-4 py-2"
          style={{
            fontFamily: "var(--font-caslon)",
            color: "var(--brand-primary)",
            filter: "url(#rough-edges)",
            border: "1.5px solid var(--brand-primary)",
          }}
        >
          {displayed}
          <span className="cursor-blink" style={{ color: "var(--brand-primary)" }}>|</span>
        </p>

        {/* selection handles — 4 corners + 4 midpoints */}
        {([
          { top: -3,    left: -3                                              }, // top-left
          { top: -3,    left: "50%", transform: "translateX(-50%)"           }, // top-mid
          { top: -3,    right: -3                                             }, // top-right
          { top: "50%", right: -3,   transform: "translateY(-50%)"           }, // mid-right
          { bottom: -3, right: -3                                             }, // bottom-right
          { bottom: -3, left: "50%", transform: "translateX(-50%)"           }, // bottom-mid
          { bottom: -3, left: -3                                              }, // bottom-left
          { top: "50%", left: -3,    transform: "translateY(-50%)"           }, // mid-left
        ] as React.CSSProperties[]).map((style, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              width: 6,
              height: 6,
              backgroundColor: "var(--background)",
              border: "1.5px solid var(--brand-primary)",
              ...style,
            }}
          />
        ))}
      </div>
    </div>
  );
}
