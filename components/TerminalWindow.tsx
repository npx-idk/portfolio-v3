"use client";

import { useEffect, useRef, useState } from "react";

const PROMPT = "hari@portfolio:~$ ";

const FILE_MAP: Record<string, string> = {
  "hello.txt": "hello",
  "about.txt": "about",
  "work.txt": "work",
  "contact.txt": "contact",
  "projects": "projects",
  "art": "art",
};

interface Line {
  type: "input" | "output" | "error";
  content: string;
}

function processCommand(
  raw: string,
  onOpen?: (id: string) => void
): { lines: string[]; isError?: boolean; clear?: boolean } {
  const parts = raw.trim().split(/\s+/);
  const cmd = parts[0]?.toLowerCase() ?? "";
  const args = parts.slice(1);
  const arg = args.join(" ");

  switch (cmd) {
    case "":
      return { lines: [] };

    case "help":
      return {
        lines: [
          "available commands:",
          "",
          "  help        show this message",
          "  whoami      who am i?",
          "  ls          list files",
          "  open        open a file (e.g. open about.txt)",
          "  cat         read a file",
          "  pwd         current directory",
          "  date        current date & time",
          "  echo        echo text",
          "  clear       clear terminal",
          "  history     command history",
          "",
          "there may be other commands worth trying.",
        ],
      };

    case "whoami":
      return {
        lines: [
          "hari dalavai",
          "developer & artist",
          "building things that feel good to use",
        ],
      };

    case "ls":
      if (args[0] === "-la" || args[0] === "-al") {
        return {
          lines: [
            "total 9",
            "-rw-r--r--  hari  staff   hello.txt",
            "-rw-r--r--  hari  staff   about.txt",
            "-rw-r--r--  hari  staff   work.txt",
            "-rw-r--r--  hari  staff   contact.txt",
            "drwxr-xr-x  hari  staff   projects/",
            "-rw-r--r--  hari  staff   art",
            "-rw-------  hari  staff   .secrets",
            "-rw-------  hari  staff   .dreams",
            "-rw-------  hari  staff   .coffee_count",
          ],
        };
      }
      return { lines: ["hello.txt  about.txt  work.txt  contact.txt  projects/  art"] };

    case "open": {
      if (!arg) return { lines: ["usage: open <filename>"], isError: true };
      const id = FILE_MAP[arg];
      if (!id) return { lines: [`open: ${arg}: no such file`], isError: true };
      if (arg === "terminal") return { lines: ["you're already in it."] };
      onOpen?.(id);
      return { lines: [`opening ${arg}...`] };
    }

    case "cat": {
      const f = arg.toLowerCase();
      if (f === "hello.txt") return { lines: ["hello! double-click the icons to explore."] };
      if (f === "about.txt") return { lines: ["open about.txt to read the full story."] };
      if (f === "work.txt")  return { lines: ["open work.txt for the full timeline."] };
      if (f === "contact.txt") return { lines: ["open contact.txt to get in touch."] };
      if (f === ".secrets") return { lines: ["these aren't the droids you're looking for."] };
      if (f === ".dreams")  return { lines: ["ship something beautiful every day."] };
      if (f === ".coffee_count") return { lines: [`${Math.floor(Math.random() * 300) + 200}`] };
      if (!f) return { lines: ["usage: cat <filename>"], isError: true };
      return { lines: [`cat: ${arg}: no such file or directory`], isError: true };
    }

    case "pwd":
      return { lines: ["/home/hari/portfolio"] };

    case "date":
      return { lines: [new Date().toString()] };

    case "echo":
      return { lines: [arg || ""] };

    case "clear":
      return { lines: [], clear: true };

    case "history":
      return { lines: ["(use ↑ ↓ to navigate history)"] };

    case "uname":
      return { lines: ["HariOS 1.0.0 — darwin, probably", "powered by caffeine and curiosity"] };

    case "uptime":
      return { lines: ["up 26 years, 3 months, running low on sleep"] };

    case "top": {
      return {
        lines: [
          "PID   COMMAND              %CPU   MEM",
          "001   haris_brain          99.9   high",
          "002   coffee_daemon         0.1   critical (low)",
          "003   imposter_syndrome     2.3   stable",
          "004   side_project_ideas   47.0   leaking",
          "005   context_switch        8.8   always",
          "(press q to quit — just kidding, you can't)",
        ],
      };
    }

    case "man":
      if (args[0] === "hari") {
        return {
          lines: [
            "HARI(1)                  Developer Manual                 HARI(1)",
            "",
            "NAME",
            "     hari — developer, artist, problem solver",
            "",
            "SYNOPSIS",
            "     hari [--work] [--create] [--debug] [--coffee]",
            "",
            "DESCRIPTION",
            "     A full-stack developer and artist. Builds products",
            "     that feel good. Occasionally ships on time.",
            "",
            "OPTIONS",
            "     --work      engage professional mode",
            "     --create    activate art brain",
            "     --debug     warning: infinite loop possible",
            "     --coffee    required flag for all operations",
            "",
            "BUGS",
            "     overengineers things sometimes.",
            "",
            "SEE ALSO",
            "     about.txt, work.txt, contact.txt",
          ],
        };
      }
      return { lines: [`no manual entry for ${args[0] ?? "..."}`], isError: true };

    case "git":
      if (args[0] === "log") {
        return {
          lines: [
            "commit f3a1b9c  feat: add more coffee",
            "commit 2d8e6f1  fix: remove all bugs (lied)",
            "commit a7c4d2e  chore: pretend to understand css",
            "commit 9b5e3a7  feat: it works on my machine",
            "commit 1c8f6b4  refactor: move things around confidently",
            "commit 0d2e9a3  initial commit — (with working code somehow)",
          ],
        };
      }
      if (args[0] === "blame") return { lines: ["it was definitely someone else."] };
      if (args[0] === "push") return { lines: ["everything is fine. (please review your changes first)"] };
      return { lines: [`git: '${args[0]}' — try 'git log'`], isError: true };

    case "npm":
      if (args[0] === "install") {
        return {
          lines: [
            "added 847 packages in 0.3s",
            "73 packages are looking for funding",
            "  run 'npm fund' to figure out what that means",
          ],
        };
      }
      return { lines: [`npm: unknown command '${args[0]}'`], isError: true };

    case "sudo":
      return { lines: ["nice try.", "this incident will be reported."] };

    case "rm":
      if (arg.includes("-rf") || arg.includes("-r")) {
        return { lines: ["whoa.", "thought about it.", "decided not to.", "you're welcome."] };
      }
      return { lines: [`rm: ${arg}: operation not permitted`], isError: true };

    case "vim":
    case "vi":
    case "nano":
      return {
        lines: [
          `you opened ${cmd}.`,
          "you are now trapped.",
          "hint: :q!",
          "(this message will self-destruct. just kidding.)",
        ],
      };

    case "python":
    case "python3":
      return { lines: ["Python 3.x.x", ">>> ", "(you're on your own in here)"] };

    case "exit":
    case "quit":
    case "logout":
      return { lines: ["there is no escape.", "you are part of the portfolio now. 👋"] };

    case "shutdown":
      return { lines: ["shutting down...", "...", "just kidding. i need the traffic."] };

    case "hack":
      return {
        lines: [
          "initializing heuristic breach protocol...",
          "bypassing authentication layer [████████░░] 80%...",
          "bypassing authentication layer [██████████] 100%",
          "accessing mainframe...",
          "decrypting files...",
          "downloading the internet...",
          "",
          "hack complete.",
          "you found: absolutely nothing.",
          "(this is a portfolio, not a bank.)",
        ],
      };

    case "matrix":
      return {
        lines: [
          "Wake up, Neo...",
          "The Matrix has you...",
          "Follow the white rabbit.",
          "",
          "...unfortunately this terminal isn't running neo4j.",
        ],
      };

    case "42":
      return { lines: ["the answer to life, the universe, and everything."] };

    case "ping":
      return {
        lines: [
          `PING ${args[0] || "localhost"} 56 data bytes`,
          `64 bytes from ${args[0] || "localhost"}: icmp_seq=0 ttl=64 time=0.042 ms`,
          `64 bytes from ${args[0] || "localhost"}: icmp_seq=1 ttl=64 time=0.039 ms`,
          `^C`,
          `2 packets transmitted, 2 received, 0% packet loss`,
        ],
      };

    case "coffee":
    case "brew":
      return {
        lines: [
          "   ( (  ",
          "    ) ) ",
          "  .....",
          "  |   |]",
          "  \\   / ",
          "   `---' ",
          "",
          "brewing... ☕ done.",
        ],
      };

    case "curl":
      return {
        lines: [
          "Bangalore, India",
          "⛅ Partly Cloudy  28°C",
          "Humidity: 74%  Wind: 12 km/h",
          "Forecast: debugging weather ahead",
        ],
      };

    case "which":
      if (args[0] === "hari") return { lines: ["/usr/local/bin/hari"] };
      if (args[0] === "love") return { lines: ["/usr/local/bin/love (passion installed, version ∞)"] };
      if (args[0] === "coffee") return { lines: ["/usr/bin/coffee (required dependency)"] };
      return { lines: [`${args[0]} not found`], isError: true };

    case "ssh":
      return { lines: ["ssh: connect to host production port 22: Permission denied (are you sure about this?)"] };

    case "hello":
    case "hi":
      return { lines: ["hey there 👋"] };

    default:
      return {
        lines: [`command not found: ${cmd}`, "try 'help' for available commands"],
        isError: true,
      };
  }
}

interface TerminalWindowProps {
  onOpen?: (id: string) => void;
}

export default function TerminalWindow({ onOpen }: TerminalWindowProps) {
  const [lines, setLines] = useState<Line[]>([
    { type: "output", content: "HariOS Terminal v1.0.0" },
    { type: "output", content: "type 'help' for available commands." },
    { type: "output", content: "" },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim();

    const { lines: output, isError, clear } = processCommand(cmd, onOpen);

    if (clear) {
      setLines([]);
    } else {
      setLines(prev => [
        ...prev,
        { type: "input", content: PROMPT + cmd },
        ...output.map(content => ({ type: isError ? "error" : "output" as Line["type"], content })),
        { type: "output", content: "" },
      ]);
    }

    if (cmd) setCmdHistory(h => [cmd, ...h]);
    setHistoryIdx(-1);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(historyIdx + 1, cmdHistory.length - 1);
      setHistoryIdx(idx);
      setInput(cmdHistory[idx] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(historyIdx - 1, -1);
      setHistoryIdx(idx);
      setInput(idx === -1 ? "" : (cmdHistory[idx] ?? ""));
    }
  };

  const C = {
    bg:     "oklch(0.13 0.04 264)",
    text:   "oklch(0.82 0.06 264)",
    input:  "oklch(0.96 0.01 264)",
    prompt: "var(--brand-primary)",
    error:  "oklch(0.65 0.22 27)",
    dim:    "oklch(0.50 0.04 264)",
  };

  return (
    <div
      className="h-full flex flex-col font-mono text-[11px] leading-relaxed"
      style={{ backgroundColor: C.bg, color: C.text, cursor: "text" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output area */}
      <div className="flex-1 overflow-y-auto p-3 pb-1">
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: line.type === "input" ? C.input
                   : line.type === "error"  ? C.error
                   : C.text,
              whiteSpace: "pre",
              minHeight: "1em",
            }}
          >
            {line.content || " "}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex items-center px-3 pb-3 pt-1 shrink-0">
        <span style={{ color: C.prompt, userSelect: "none" }}>{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none border-none"
          style={{ color: C.input, caretColor: C.prompt }}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
        />
      </form>
    </div>
  );
}
