// src/pages/ScamHub.tsx
import React, { useMemo, useState } from "react";
import { QUIZ } from "./data/quiz";

type Q = (typeof QUIZ)[number];

function pickRandom(arr: Q[], n: number): Q[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

const InlineQuiz: React.FC = () => {
  // choose 10 random questions once
  const questions = useMemo(() => pickRandom(QUIZ, Math.min(10, QUIZ.length)), []);
  const [i, setI] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const total = questions.length;
  const q = questions[i];

  const handleSelect = (idx: number) => {
    if (selected !== null) return; // lock once answered
    setSelected(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setI((k) => k + 1);
  };

  // Finished screen
  if (i >= total) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-2">Nice work! ✅</h2>
        <p className="text-lg mb-6">
          You scored <span className="font-semibold">{score}</span> / {total}
        </p>
        <a href="/features" className="inline-block px-4 py-2 border rounded-md hover:bg-gray-50">
          Back to Quiz
        </a>
      </div>
    );
  }

  // Progress
  const progressPct = Math.round(((i + (selected !== null ? 1 : 0)) / total) * 100);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-3 text-sm text-gray-500 flex items-center justify-between">
        <span>
          Question {i + 1} of {total}
        </span>
        <span>{progressPct}%</span>
      </div>
      <div className="h-2 w-full bg-gray-200 rounded mb-6 overflow-hidden">
        <div className="h-full bg-black/80" style={{ width: `${progressPct}%` }} />
      </div>

      <h3 className="text-xl font-semibold mb-5">{q.question}</h3>

      <div className="grid gap-3">
        {q.options.map((opt: string, idx: number) => {
          const isCorrect = selected !== null && idx === q.correctIndex;
          const isSelectedWrong = selected === idx && idx !== q.correctIndex;

          const base =
            "w-full text-left p-4 rounded-md border transition focus:outline-none disabled:opacity-100";
          const state =
            selected === null
              ? "hover:bg-gray-50"
              : isCorrect
              ? "border-green-600 bg-green-50"
              : isSelectedWrong
              ? "border-red-600 bg-red-50"
              : "opacity-60";

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={`${base} ${state}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="mt-6 p-4 bg-gray-50 border rounded-md">
          {/* Show rationale for learning */}
          <p className="mb-2">
            <span className="font-semibold">Why: </span>
            {q.rationale}
          </p>

          {/* If user got it wrong, show the correct answer explicitly */}
          {selected !== q.correctIndex && (
            <p className="text-sm">
              <span className="font-semibold">Correct answer: </span>
              {q.options[q.correctIndex]}
            </p>
          )}

          {/* Optional sources */}
          {q.sources?.length ? (
            <div className="text-sm text-gray-600 mt-2">
              Sources:{" "}
              {q.sources.map((s, idx) => (
                <a
                  key={s.url}
                  className="underline mr-2"
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {s.label}
                  {idx < q.sources.length - 1 ? "," : ""}
                </a>
              ))}
            </div>
          ) : null}

          <button
            onClick={next}
            className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-100"
          >
            {i === total - 1 ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
};

const ScamHub: React.FC = () => {
  return (
    <main className="container mx-auto px-6 py-10">
      <header className="text-center mb-8">
        <span className="inline-block text-xs px-2 py-1 rounded-full border mb-3">
          Quick check • Learn fast
        </span>
        <h1 className="text-3xl font-bold">Quiz</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
          Test your scam-awareness. Pick the best answer; you’ll immediately see if it’s
          right or wrong, with a short explanation and sources.
        </p>
      </header>

      <section>
        <InlineQuiz />
      </section>
    </main>
  );
};

export default ScamHub;