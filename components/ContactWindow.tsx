"use client";

import { useState } from "react";
import contact from "@/content/contact.json";

export default function ContactWindow() {
  const [copied, setCopied] = useState(false);

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6">
      <div>
        <h1
          className="text-5xl font-bold leading-none tracking-tight"
          style={{ fontFamily: "var(--font-caslon)", color: "var(--brand-primary)" }}
        >
          Contact
        </h1>
        <div
          className="mt-3 h-px w-full"
          style={{ backgroundColor: "var(--brand-primary)", opacity: 0.25 }}
        />
        <p className="mt-2 font-mono text-sm text-foreground/50">
          {contact.tagline}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {contact.links.map((link) => (
          <div key={link.href} className="flex items-center gap-2 group">
            <a
              href={link.href}
              target={link.href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="font-mono text-sm transition-opacity hover:opacity-100"
              style={{ color: "var(--brand-primary)", opacity: 0.7 }}
            >
              ↗ {link.label}
            </a>
            {link.copyValue && (
              <button
                onClick={() => handleCopy(link.copyValue!)}
                className="font-mono text-[10px] opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity"
                style={{ color: "var(--brand-primary)" }}
              >
                {copied ? "copied!" : "copy"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div
        className="mt-auto pt-4 border-t font-mono text-xs text-foreground/30"
        style={{ borderColor: "oklch(0.388506 0.260338 264.1546 / 0.1)" }}
      >
        {contact.location}
      </div>
    </div>
  );
}
