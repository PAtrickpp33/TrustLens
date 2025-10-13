import React, { useCallback, useEffect, useMemo, useState } from "react";
import { QUIZ } from "./data/quiz";

/* ---------------------------- Types & helpers --------------------------- */
type QuizItem = typeof QUIZ[number];
type Phase = "intro" | "quiz" | "result";

// Extract leading [Tag] from a question, e.g. "[Job] ..."
const getTag = (q: string) => {
  const m = q.match(/^\s*\[([^\]]+)\]\s*/);
  return m ? m[1] : "General";
};

function pickRandom<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
function shuffleWithCorrect(options: string[], correctIndex: number) {
  const pairs = options.map((text, i) => ({ text, i }));
  for (let k = pairs.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [pairs[k], pairs[j]] = [pairs[j], pairs[k]];
  }
  const newOptions = pairs.map((p) => p.text);
  const newCorrectIndex = pairs.findIndex((p) => p.i === correctIndex);
  return { newOptions, newCorrectIndex };
}

/* ------------------------------- Styles -------------------------------- */
const C = {
  border: "#E5E7EB",
  text: "#0F172A",
  sub: "#475569",
  grad: "linear-gradient(90deg,#2563eb,#06b6d4)",
  ok: "#10B981",
  okBg: "#ECFDF5",
  okText: "#065F46",
  bad: "#EF4444",
  badBg: "#FEF2F2",
  badText: "#7F1D1D",
  soft: "#F8FAFC",
};

const wrap: React.CSSProperties = { maxWidth: 980, margin: "24px auto 48px", padding: "0 16px", color: C.text };
const card: React.CSSProperties = { background: "#fff", border: `1px solid ${C.border}`, borderRadius: 18, padding: 18, boxShadow: "0 8px 24px rgba(0,0,0,.05)" };
const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", border: `1px solid ${C.border}`, background: C.soft, padding: "6px 12px", borderRadius: 999, fontWeight: 700, fontSize: 13 };
const btnBase: React.CSSProperties = { borderRadius: 12, padding: "10px 14px", cursor: "pointer", border: `1px solid ${C.border}`, background: "#F3F4F6" };

/* --------------------------- Donut score ring --------------------------- */
function ScoreRing({ pct, size = 140 }: { pct: number; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const CIRC = 2 * Math.PI * r;
  const dash = (pct / 100) * CIRC;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#EEF2FF" strokeWidth={stroke} fill="none" />
      <defs>
        <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke="url(#ring)"
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${dash} ${CIRC - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={{ fontWeight: 800, fontSize: 18, fill: C.text }}>
        {pct}%
      </text>
    </svg>
  );
}

/* ------------------------- Big category cards UI ------------------------ */
type CatCard = { title: string; tags: string[]; desc: string; emoji: string; accent: string };

const CATEGORY_CARDS: CatCard[] = [
  { title: "Job Scams",        tags: ["Job"],         desc: "Too-good-to-be-true offers, fees, identity grabs.", emoji: "💼", accent: "#0EA5E9" },
  { title: "Email Scams",      tags: ["Email"],       desc: "Typosquatting, urgent requests, attachments.",     emoji: "📧", accent: "#6366F1" },
  { title: "SMS/Message",      tags: ["SMS"],         desc: "Short links, impersonation, payment nudges.",      emoji: "📱", accent: "#F59E0B" },
  { title: "URL / Websites",   tags: ["URL"],         desc: "Look-alike domains, fake portals, malware.",       emoji: "🔗", accent: "#10B981" },
  { title: "Marketplace",      tags: ["Marketplace"], desc: "Fake listings, deposits, courier tricks.",         emoji: "🛒", accent: "#F97316" },
  { title: "Investment",       tags: ["Investment"],  desc: "Guaranteed returns, crypto ‘managers’.",           emoji: "📈", accent: "#EF4444" },
  { title: "Delivery",         tags: ["Delivery"],    desc: "Missed parcel, fee payments, track-now links.",    emoji: "📦", accent: "#14B8A6" },
  { title: "All Topics",       tags: ["All"],         desc: "Mix of all categories. Good general practice.",     emoji: "🌐", accent: "#64748B" },
];

function BigCard({ item, onStart }: { item: CatCard; onStart: (tags: string[]) => void }) {
  return (
    <button
      onClick={() => onStart(item.tags)}
      style={{
        textAlign: "left",
        border: "1px solid #E5E7EB",
        background: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(0,0,0,.05)",
        transition: "transform .08s ease, box-shadow .15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 16px 28px rgba(0,0,0,.08)`)}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 10px 24px rgba(0,0,0,.05)`)}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span
          aria-hidden
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: 40,
            height: 40,
            borderRadius: 12,
            background: item.accent,
            color: "white",
            fontSize: 20,
          }}
        >
          {item.emoji}
        </span>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{item.title}</h3>
      </div>
      <p style={{ margin: 0, color: C.sub, fontSize: 14 }}>{item.desc}</p>
    </button>
  );
}

/* -------------------------------- Component ----------------------------- */
const Quiz: React.FC = () => {
  // quiz state
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);

  // logging for review
  const [log, setLog] = useState<
    { question: string; options: string[]; correctIndex: number; chosenIndex: number; sources?: any[] }[]
  >([]);

  // randomization seed to force reshuffle on retry
  const [seed, setSeed] = useState(0);

  // selected category tags (supports All or specific tags)
  const [selectedTags, setSelectedTags] = useState<string[]>(["All"]);

  // build question set when seed or tags change
  const prepared: QuizItem[] = useMemo(() => {
    const bank =
      selectedTags.includes("All")
        ? QUIZ
        : QUIZ.filter((q) => selectedTags.includes(getTag(q.question)));

    const chosen = pickRandom(bank, Math.min(10, bank.length || 0));
    return chosen.map((q) => {
      const { newOptions, newCorrectIndex } = shuffleWithCorrect(q.options, q.correctIndex);
      return { ...q, options: newOptions, correctIndex: newCorrectIndex };
    });
  }, [seed, selectedTags]);

  const total = prepared.length;
  const q = prepared[idx];

  // start flow with tags
  const startWithTags = (tags: string[]) => {
    setSelectedTags(tags);
    setSeed((s) => s + 1); // new pick
    setPhase("quiz");
    setIdx(0);
    setSelected(null);
    setScore(0);
    setLog([]);
    setShowReview(false);
  };

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore((s) => s + 1);
  };

  const pushLog = () => {
    if (selected === null) return;
    setLog((L) => [
      ...L,
      {
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        chosenIndex: selected,
        sources: (q as any).sources,
      },
    ]);
  };

  const next = () => {
    pushLog();
    if (idx + 1 >= total) {
      setPhase("result");
    } else {
      setIdx((k) => k + 1);
      setSelected(null);
    }
  };

  // keyboard shortcuts
  const keyHandler = useCallback(
    (e: KeyboardEvent) => {
      if (phase !== "quiz") return;
      const map: Record<string, number> = { "1": 0, "2": 1, "3": 2, "4": 3, a: 0, b: 1, c: 2, d: 3 };
      const k = e.key.toLowerCase();
      if (k in map) choose(map[k]);
      if (k === "enter" && selected !== null) next();
    },
    [phase, selected, q]
  );
  useEffect(() => {
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [keyHandler]);

  /* ------------------------------ Intro view ----------------------------- */
  if (phase === "intro") {
    return (
      <main style={wrap}>
        <section
          style={{
            ...card,
            textAlign: "center",
            backgroundImage: "linear-gradient(135deg,#EFF6FF 0%,#FFFFFF 45%,#ECFEFF 100%)",
          }}
        >
          <h1
            style={{
              margin: "0 0 6px",
              fontSize: 36,
              fontWeight: 900,
              backgroundImage: C.grad,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Check your scam knowledge
          </h1>
          <p style={{ color: C.sub, margin: 0 }}>Pick a category to begin. You’ll get instant feedback and sources.</p>
        </section>

        {/* Category grid */}
        <section style={{ marginTop: 18 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 14,
            }}
          >
            {CATEGORY_CARDS.map((it) => (
              <BigCard key={it.title} item={it} onStart={startWithTags} />
            ))}
          </div>
        </section>

        {/* Back link to dashboard if you want it */}
        <div style={{ marginTop: 14 }}>
          <a href="/scamhub" style={{ textDecoration: "none", color: "#1D4ED8", fontWeight: 700 }}>
            ← Back to ScamHub
          </a>
        </div>
      </main>
    );
  }

  /* ----------------------------- Result view ----------------------------- */
  if (phase === "result") {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const msg =
      score <= Math.floor(total * 0.3)
        ? "Needs improvement — practice spotting the common tricks."
        : score <= Math.floor(total * 0.7)
        ? "Good awareness — keep practicing."
        : "Excellent scam-savvy!";

    const tryAgain = () => {
      setSeed((s) => s + 1); // reshuffle with same category
      setPhase("quiz");
      setIdx(0);
      setSelected(null);
      setScore(0);
      setLog([]);
      setShowReview(false);
    };

    return (
      <main style={wrap}>
        <section style={{ ...card, padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "16px 18px",
              background: C.soft,
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Your results</h2>
            <span style={{ ...pill, background: "#fff" }}>
              Score {score} / {total} • {pct}%
            </span>
          </div>

          <div style={{ padding: 18, display: "grid", gridTemplateColumns: "160px 1fr", gap: 16, alignItems: "center" }}>
            <div style={{ placeSelf: "center" }}>
              <ScoreRing pct={pct} />
            </div>

            <div>
              <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800, color: C.text }}>{msg}</h3>
              <p style={{ margin: "0 0 10px", color: C.sub, fontSize: 14 }}>
                Review each question, then retry to improve your score.
              </p>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {/* Back to the main quiz menu (intro) */}
                <button onClick={() => setPhase("intro")} style={{ ...btnBase, background: "#fff" }}>
                  Back to Quiz Menu
                </button>
                <button onClick={tryAgain} style={{ ...btnBase, backgroundImage: C.grad, color: "#fff", border: "1px solid transparent" }}>
                  Try again
                </button>
                <button onClick={() => setShowReview((v) => !v)} style={{ ...btnBase }}>
                  {showReview ? "Hide review" : "Review answers"}
                </button>
              </div>
            </div>
          </div>

          {showReview && (
            <div style={{ borderTop: `1px solid ${C.border}`, padding: 16 }}>
              {log.map((r, i) => {
                const ok = r.chosenIndex === r.correctIndex;
                const sources = r.sources ?? [];
                return (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      border: `1px solid ${ok ? "#DCFCE7" : "#FEE2E2"}`,
                      background: ok ? C.okBg : C.badBg,
                      borderRadius: 12,
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          display: "inline-grid",
                          placeItems: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          color: "#fff",
                          background: ok ? C.ok : C.bad,
                        }}
                        aria-hidden
                      >
                        {ok ? "✓" : "✕"}
                      </span>
                      <strong style={{ fontSize: 15 }}>{i + 1}. {r.question}</strong>
                    </div>
                    <div style={{ paddingLeft: 30, fontSize: 14 }}>
                      <div style={{ marginBottom: 2 }}>
                        <b>Correct:</b> {r.options[r.correctIndex]}
                      </div>
                      <div style={{ marginBottom: 6 }}>
                        <b>Your answer:</b> {r.options[r.chosenIndex]}
                      </div>
                      {sources.length > 0 && (
                        <div style={{ fontSize: 12, color: C.sub }}>
                          Sources:
                          {sources.map((s: any, j: number) => (
                            <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{ marginLeft: 6, textDecoration: "underline", color: "#1D4ED8" }}>
                              {s.label}{j < sources.length - 1 ? "," : ""}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    );
  }

  /* ------------------------------ Guard rails ---------------------------- */
  if (!total) {
    return (
      <main style={wrap}>
        <section style={card}>
          <h2>No questions found for this category.</h2>
          <div style={{ marginTop: 12 }}>
            <button onClick={() => setPhase("intro")} style={{ ...btnBase }}>Choose another category</button>
          </div>
        </section>
      </main>
    );
  }

  /* ----------------------------- Quiz view ------------------------------- */
  const progressNow = Math.round(((idx + (selected !== null ? 1 : 0)) / total) * 100);

  return (
    <main style={wrap}>
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#334155", fontSize: 13 }}>
        <div style={pill}>Question {idx + 1} of {total}</div>
        <div style={pill}>Score {score}</div>
      </div>

      <div style={{ height: 10, borderRadius: 999, background: "#EEF2FF", overflow: "hidden", border: `1px solid ${C.border}`, marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${progressNow}%`, backgroundImage: C.grad, transition: "width .3s ease" }} />
      </div>

      <section style={card}>
        <h2 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.35, margin: "2px 8px 12px" }}>{q.question}</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {q.options.map((opt: string, i: number) => {
            const answered = selected !== null;
            const isCorrect = answered && i === q.correctIndex;
            const isChosenWrong = answered && i === selected && i !== q.correctIndex;

            const style: React.CSSProperties = {
              width: "100%",
              textAlign: "left",
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: "16px 14px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
              background: "#fff",
              cursor: answered ? "default" : "pointer",
              transition: "transform .05s ease, background .18s ease, border-color .18s ease",
            };
            if (isCorrect) {
              style.background = C.okBg;
              style.border = `1px solid ${C.ok}`;
              style.boxShadow = "0 0 0 2px rgba(16,185,129,.15)";
              style.color = C.okText;
            } else if (isChosenWrong) {
              style.background = C.badBg;
              style.border = `1px solid ${C.bad}`;
              style.boxShadow = "0 0 0 2px rgba(239,68,68,.15)";
              style.color = C.badText;
            } else if (answered) {
              style.opacity = 0.65;
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={answered}
                style={style}
                aria-pressed={selected === i}
                aria-label={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
              >
                <span
                  aria-hidden
                  style={{
                    display: "inline-grid",
                    placeItems: "center",
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 800,
                    background: isCorrect ? C.ok : isChosenWrong ? C.bad : "#F3F4F6",
                    color: isCorrect || isChosenWrong ? "#fff" : "#374151",
                    border: `1px solid ${answered ? "transparent" : C.border}`,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {answered && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "0 8px",
                      height: 28,
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 700,
                      background: isCorrect ? "#D1FAE5" : isChosenWrong ? "#FEE2E2" : "transparent",
                      color: isCorrect ? C.okText : isChosenWrong ? C.badText : "transparent",
                    }}
                  >
                    {isCorrect ? "Correct" : isChosenWrong ? "Incorrect" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div style={{ marginTop: 16, border: `1px solid ${C.border}`, background: "#FAFAFA", borderRadius: 14, padding: 16 }}>
            <p style={{ margin: "0 0 8px" }}>
              <strong>Why</strong> {(q as any).rationale}
            </p>
            {!!(q as any).sources?.length && (
              <p style={{ fontSize: 13, color: C.sub, margin: 0 }}>
                Sources{" "}
                {(q as any).sources.map((s: any, j: number) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", marginLeft: 6, color: "#1D4ED8" }}>
                    {s.label}
                    {j < (q as any).sources.length - 1 ? "," : ""}
                  </a>
                ))}
              </p>
            )}
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={next} style={{ ...btnBase, backgroundImage: C.grad, color: "#fff", border: "1px solid transparent" }}>
                {idx === total - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Quiz;