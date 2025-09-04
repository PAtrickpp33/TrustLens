import React from "react";

/* ---------- Reusable Section ---------- */
type SectionProps = React.PropsWithChildren<{
  id?: string;
  className?: string;
  title?: string;
  subtitle?: string;
}>;

const Section: React.FC<SectionProps> = ({ id, className, title, subtitle, children }) => (
  <section id={id} className={`max-w-6xl mx-auto px-6 md:px-10 ${className || ""}`}>
    {(title || subtitle) && (
      <header className="mb-8 text-center">
        {subtitle && (
          <p className="text-xs tracking-[0.2em] uppercase text-slate-500">{subtitle}</p>
        )}
        {title && (
          <h2 className="mt-2 text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
        )}
      </header>
    )}
    {children}
  </section>
);

/* ---------- Subtitle Divider (pill between two lines) ---------- */
const SubtitleDivider: React.FC<{ text: string; className?: string }> = ({ text, className }) => (
  <div className={`relative ${className ?? "my-12"}`}>
    <hr className="border-slate-200" />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-[11px] tracking-[0.2em] uppercase text-slate-500 shadow-sm">
        {text}
      </span>
    </div>
    <div className="mt-6">
      <hr className="border-slate-200" />
    </div>
  </div>
);

const About: React.FC = () => {
  return (
    <div className="relative overflow-hidden">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-rose-200/30 blur-3xl" />

      {/* HERO */}
      <Section className="pt-12 md:pt-16 pb-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-slate-600 bg-white/60 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Safer clicks. Smarter decisions.
          </span>

          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            About{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
              TrustLens
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-700">
            We help people recognise scams, understand online risks, and act with confidence — through clear
            explanations, practical education, and transparent checks.
          </p>
          {/* hero buttons intentionally removed */}
        </div>
      </Section>

      {/* WHAT WE DO — colorful, centered, purge-safe icons */}
      <Section title="What We Do" className="pb-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 text-center">
          {[
            {
              title: "URL Risk Check",
              desc: "Instant signals on suspicious links with plain-language explanations.",
              gradient: "linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)", // pink → rose
              icon: (
                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1-7.07 7.07L9 20" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 1 0 7.07 7.07L15 18" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M9.5 7.5l1.8 1.8 3.2-3.2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              ),
            },
            {
              title: "Education Hub",
              desc: "Red flags by category, bite-size guides, and real examples you can trust.",
              gradient: "linear-gradient(135deg,#4f46e5 0%,#0ea5e9 100%)", // indigo → sky
              icon: (
                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                  <path d="M4 6l8-3 8 3v10l-8 3-8-3z" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M12 9v8" stroke="white" strokeWidth="2" />
                </svg>
              ),
            },
            {
              title: "Case Studies",
              desc: "Learn from real incidents — what happened, 3–5 red flags, and key lessons.",
              gradient: "linear-gradient(135deg,#059669 0%,#14b8a6 100%)", // emerald → teal
              icon: (
                <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                  <rect x="5" y="3" width="14" height="18" rx="2" fill="white" />
                  <path d="M8 8h8M8 12h8M8 16h6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ),
            },
          ].map((c, i) => (
            <div
              key={i}
              className="group relative rounded-2xl bg-white/90 backdrop-blur shadow-md ring-1 ring-slate-200 hover:shadow-xl transition hover:-translate-y-1"
            >
              <div className="flex justify-center pt-6">
                {/* inline gradient avoids purge issues; icon stays visible */}
                <div
                  className="h-14 w-14 rounded-2xl grid place-items-center text-white shadow-lg"
                  style={{ background: c.gradient }}
                >
                  {c.icon}
                </div>
              </div>

              <div className="pt-4 pb-6 px-6">
                <h3 className="text-xl font-bold text-slate-900">{c.title}</h3>
                <p className="mt-2 text-slate-600">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* OUR STORY — divider with extra breathing room */}
      <Section className="pt-4 pb-8">
        <SubtitleDivider text="From problem to purpose" className="my-14" />
        <h2 className="text-center text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-8">
          Our Story
        </h2>

        <div className="relative mx-auto max-w-3xl">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent md:left-1/2" />
          {[
            {
              year: "2024",
              title: "The spark",
              text:
                "We saw friends and family lose money to phishing and investment scams. We started sketching a tool to decode threats in plain language.",
            },
            {
              year: "2025",
              title: "TrustLens is born",
              text:
                "We built a transparent checker + education hub that turns signals into actionable guidance and boosts digital confidence.",
            },
            {
              year: "Future",
              title: "Open, trusted, helpful",
              text:
                "Growing community features, richer datasets, and explainable signals — aligned with UN SDG 16 for safer digital spaces.",
            },
          ].map((item, idx) => (
            <div key={idx} className="relative md:grid md:grid-cols-2 md:gap-10 mb-8">
              <div className={`md:text-right md:pr-10 ${idx % 2 ? "md:order-2 md:text-left md:pl-10" : ""}`}>
                <div className="text-sm font-semibold text-indigo-600">{item.year}</div>
                <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                <p className="mt-1 text-slate-600">{item.text}</p>
              </div>
              <div className={`hidden md:block ${idx % 2 ? "md:order-1" : ""}`}>
                <div className="mx-auto h-3 w-3 translate-x-[-1px] rounded-full bg-indigo-600 shadow ring-4 ring-white" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* STATS */}
      <Section className="pb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { k: "2k+", v: "URLs checked" },
            { k: "85%", v: "explanations understood" },
            { k: "25+", v: "case studies" },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border bg-white/80 backdrop-blur p-6 text-center">
              <div className="text-3xl font-extrabold text-slate-900">{s.k}</div>
              <div className="text-slate-600">{s.v}</div>
            </div>
          ))}
        </div>
      </Section>

      <div className="h-8" />
    </div>
  );
};

export default About;
