export default function DoNotOpenWindow() {
  const RED = "oklch(0.577 0.245 27.325)";

  const eggs = [
    ["hack",         "initiate a breach"],
    ["matrix",       "follow the white rabbit"],
    ["42",           "the answer to everything"],
    ["git log",      "commit history (honest edition)"],
    ["git blame",    "it was definitely someone else"],
    ["npm install",  "count the packages"],
    ["sudo",         "nice try"],
    ["rm -rf /",     "please don't"],
    ["vim",          "escape challenge"],
    ["exit",         "you can't leave"],
    ["coffee",       "☕ ASCII art"],
    ["ping",         "fake network test"],
    ["curl",         "bangalore weather report"],
    ["top",          "system processes"],
    ["man hari",     "the manual page"],
    ["which love",   "philosophy"],
    ["uptime",       "how long has this been running?"],
    ["ls -la",       "find the hidden files"],
    ["cat .secrets", "classified"],
    ["cat .dreams",  "aspirations"],
    ["python",       "you're trapped now"],
    ["ssh",          "permission denied"],
    ["hi",           "just say hello"],
  ];

  return (
    <div className="h-full overflow-auto p-5 font-mono text-[11px] leading-relaxed bg-background">
      <p style={{ color: RED, opacity: 0.6, marginBottom: 16 }}>
        ⚠ you were warned.
      </p>

      <p style={{ color: RED, marginBottom: 20, lineHeight: 1.7 }}>
        these are things you can try in the terminal.<br />
        open the terminal icon on the desktop and type them.
      </p>

      <div
        style={{
          borderTop: `1px solid ${RED}`,
          opacity: 0.15,
          marginBottom: 16,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {eggs.map(([cmd, desc]) => (
          <div key={cmd} style={{ display: "flex", gap: 0 }}>
            <span
              style={{
                color: RED,
                width: 140,
                flexShrink: 0,
                opacity: 0.9,
              }}
            >
              {cmd}
            </span>
            <span style={{ color: "var(--brand-primary)", opacity: 0.45 }}>
              {desc}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: `1px solid ${RED}`,
          opacity: 0.15,
          marginTop: 20,
          marginBottom: 14,
        }}
      />

      <p style={{ color: RED, opacity: 0.35, fontSize: 10 }}>
        this file was not supposed to exist.
      </p>
    </div>
  );
}
