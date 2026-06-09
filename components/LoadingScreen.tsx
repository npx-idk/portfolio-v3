"use client"

import { useEffect, useRef, useState } from "react"

const MIN_MS = 600 // always show for at least this long so it doesn't flash

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const targetRef = useRef(0)
  const rafRef = useRef<number>(0)
  const startRef = useRef(Date.now())
  const doneRef = useRef(false)

  useEffect(() => {
    // Smoothly animate progress towards a target value
    const animateTo = (next: number) => {
      targetRef.current = Math.max(targetRef.current, next)
      cancelAnimationFrame(rafRef.current)
      const step = () => {
        setProgress(prev => {
          const diff = targetRef.current - prev
          if (diff < 0.5) return targetRef.current
          rafRef.current = requestAnimationFrame(step)
          return prev + diff * 0.12
        })
      }
      rafRef.current = requestAnimationFrame(step)
    }

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      const elapsed = Date.now() - startRef.current
      const wait = Math.max(0, MIN_MS - elapsed)
      setTimeout(() => {
        animateTo(100)
        setTimeout(() => setVisible(false), 350)
        setTimeout(onDone, 850)
      }, wait)
    }

    // JS is running — meaningful first milestone
    animateTo(20)

    // DOM parsed
    if (document.readyState === "loading") {
      document.addEventListener("readystatechange", () => {
        if (document.readyState === "interactive") animateTo(50)
      }, { once: true })
    } else {
      animateTo(50)
    }

    // Fonts ready
    document.fonts.ready.then(() => animateTo(75))

    // Everything loaded (images, fonts, scripts)
    if (document.readyState === "complete") {
      document.fonts.ready.then(finish)
    } else {
      window.addEventListener("load", () => document.fonts.ready.then(finish), { once: true })
    }

    // Safety net — never hang forever
    const fallback = setTimeout(finish, 8000)
    return () => {
      clearTimeout(fallback)
      cancelAnimationFrame(rafRef.current)
    }
  }, [onDone])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "var(--brand-primary)",
        backgroundImage: "url('/noise-light.png'), url('/noise-light.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "220px 220px",
        backgroundPosition: "0 0, 110px 110px",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
        pointerEvents: visible ? "all" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          animation: "loading-logo-in 0.5s ease forwards",
          width: 160,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">
          <rect x="1.5" y="1.5" width="29" height="29" rx="6" fill="white" stroke="white" strokeWidth="1.5" />
          <text
            x="50%"
            y="52%"
            dominantBaseline="central"
            textAnchor="middle"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="20"
            fontWeight="700"
            fill="var(--brand-primary)"
          >H</text>
        </svg>

        <span
          className="font-mono text-xs tracking-[0.2em] uppercase"
          style={{ color: "white", opacity: 0.6 }}
        >
          Hari Dalavai
        </span>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              width: "100%",
              height: 2,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "white",
                borderRadius: 999,
              }}
            />
          </div>
          <span
            className="font-mono"
            style={{ fontSize: 10, color: "white", opacity: 0.4, textAlign: "right" }}
          >
            {Math.floor(progress)}%
          </span>
        </div>
      </div>
    </div>
  )
}
