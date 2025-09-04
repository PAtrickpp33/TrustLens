import React, { useMemo, useState } from "react";
import { QUIZ } from "./data/quiz";

/* helpers */
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
  const newOptions = pairs.map(p => p.text);
  const newCorrectIndex = pairs.findIndex(p => p.i === correctIndex);
  return { newOptions, newCorrectIndex };
}
type Phase = "intro" | "quiz" | "result";

const Quiz: React.FC = () => {
  /* prepare 10 questions with shuffled options */
  const prepared = useMemo(() => {
    const chosen = pickRandom(QUIZ, Math.min(10, QUIZ.length));
    return chosen.map(q => {
      const { newOptions, newCorrectIndex } = shuffleWithCorrect(q.options, q.correctIndex);
      return { ...q, options: newOptions, correctIndex: newCorrectIndex };
    });
  }, []);

  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const total = prepared.length;
  const q = prepared[idx];

  /* styles that will not be overridden */
  const wrap: React.CSSProperties = { maxWidth: 880, margin: "2rem auto", padding: "0 1rem" };
  const card: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 16, padding: 20, background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,.05)" };
  const btnBase: React.CSSProperties = { width: "100%", textAlign: "left", border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start", background: "#fff", cursor: "pointer" };
  const badgeBase: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", height: 26, minWidth: 26, padding: "0 8px", borderRadius: 999, fontSize: 12, fontWeight: 600 };
  const pill: React.CSSProperties = { display: "inline-flex", alignItems: "center", border: "1px solid #e5e7eb", padding: "4px 10px", borderRadius: 999, fontWeight: 600, fontSize: 13 };

  const start = () => {
    setPhase("quiz");
    setIdx(0);
    setSelected(null);
    setScore(0);
  };

  const choose = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === q.correctIndex) setScore(s => s + 1);
  };

  const next = () => {
    if (idx + 1 >= total) {
      setPhase("result");
    } else {
      setIdx(k => k + 1);
      setSelected(null);
    }
  };

  /* intro */
  if (phase === "intro") {
    return (
      <main style={wrap}>
        <section style={{ ...card, textAlign: "center" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Check your scam knowledge</h1>
          <p style={{ color: "#4b5563" }}>Ten quick questions, each with an explanation and trusted sources</p>
          <button onClick={start} style={{ marginTop: 16, border: "1px solid #111827", background: "#111827", color: "#fff", padding: "10px 16px", borderRadius: 10 }}>Start Quiz</button>
        </section>
      </main>
    );
  }

  /* result */
  if (phase === "result") {
    const msg = score <= 3
      ? "Needs improvement, read our red flags section"
      : score <= 7
      ? "Good awareness, keep practicing and stay alert"
      : "Excellent scam protection knowledge";
    return (
      <main style={wrap}>
        <section style={{ ...card, textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Your results</h2>
          <div style={{ marginBottom: 8 }}><span style={pill}>Score {score} / {total}</span></div>
          <p style={{ marginBottom: 16 }}>{msg}</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <a href="/features" style={{ border: "1px solid #e5e7eb", padding: "8px 14px", borderRadius: 10, textDecoration: "none" }}>Back to ScamCheck</a>
            <button onClick={start} style={{ border: "1px solid #e5e7eb", padding: "8px 14px", borderRadius: 10 }}>Try again</button>
          </div>
        </section>
      </main>
    );
  }

  /* guard if no questions */
  if (!total) {
    return (
      <main style={wrap}>
        <section style={card}>
          <h2>No questions found</h2>
        </section>
      </main>
    );
  }

  /* quiz screen */
  return (
    <main style={wrap}>
      {/* header row */}
      <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#6b7280", fontSize: 14 }}>
        <div>Question {idx + 1} of {total}</div>
        <span style={pill}>Score {score}</span>
      </div>

      {/* progress */}
      <div style={{ height: 8, borderRadius: 999, background: "#e5e7eb", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ height: "100%", width: `${Math.round(((idx + (selected !== null ? 1 : 0)) / total) * 100)}%`, background: "#111827", transition: "width .25s ease" }} />
      </div>

      {/* card */}
      <section style={card}>
        <h2 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.35, marginBottom: 16 }}>{q.question}</h2>

        <div style={{ display: "grid", gap: 12 }}>
          {q.options.map((opt: string, i: number) => {
            const isAnswered = selected !== null;
            const isCorrect = isAnswered && i === q.correctIndex;
            const isChosenWrong = isAnswered && i === selected && i !== q.correctIndex;

            const style: React.CSSProperties = { ...btnBase };
            if (!isAnswered) {
              style.background = "#fff";
            }
            if (isCorrect) {
              style.background = "#ecfdf5";
              style.border = "1px solid #10b981";
              style.boxShadow = "0 0 0 2px rgba(16,185,129,.15)";
              style.color = "#065f46";
            } else if (isChosenWrong) {
              style.background = "#fef2f2";
              style.border = "1px solid #ef4444";
              style.boxShadow = "0 0 0 2px rgba(239,68,68,.15)";
              style.color = "#7f1d1d";
            } else if (isAnswered) {
              style.opacity = .65;
              style.cursor = "default";
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={isAnswered}
                style={style}
              >
                <span
                  style={{
                    ...badgeBase,
                    width: 26,
                    background: isCorrect ? "#059669" : isChosenWrong ? "#dc2626" : "#f3f4f6",
                    color: isCorrect || isChosenWrong ? "#fff" : "#374151"
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {isAnswered && (
                  <span
                    style={{
                      ...badgeBase,
                      background: isCorrect ? "#d1fae5" : isChosenWrong ? "#fee2e2" : "transparent",
                      color: isCorrect ? "#065f46" : isChosenWrong ? "#991b1b" : "transparent"
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
          <div style={{ marginTop: 16, border: "1px solid #e5e7eb", background: "#fafafa", borderRadius: 12, padding: 16 }}>
            <p style={{ marginBottom: 8 }}>
              <strong>Why</strong> {q.rationale}
            </p>
            {!!q.sources?.length && (
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                Sources{" "}
                {q.sources.map((s: any, j: number) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noreferrer" style={{ textDecoration: "underline", marginRight: 8 }}>
                    {s.label}{j < q.sources.length - 1 ? "," : ""}
                  </a>
                ))}
              </p>
            )}
            <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={next} style={{ border: "1px solid #e5e7eb", background: "#f3f4f6", padding: "8px 14px", borderRadius: 10 }}>
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