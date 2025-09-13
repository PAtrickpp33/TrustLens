import React from "react"; //last version

const AboutUs: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      {/* HERO (refined, with proper spacing) */}
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-blue-50 via-white to-white p-12 dark:from-blue-900/20 dark:via-neutral-950 dark:to-neutral-950">
        {/* soft blobs */}
        <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-700/20" />
        <div className="absolute -bottom-24 -left-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-600/20" />

        <div className="relative text-center">
          {/* Tagline badge (not empty) */}
          <span className="inline-block mb-4 text-[11px] font-semibold tracking-wide rounded-full px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-darkblue shadow">
            Safer clicks. Smarter decisions.
          </span>

          {/* Gradient title */}
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
            About TrustLens
          </h1>

          {/* Mission sentence */}
          <p className="mx-auto max-w-3xl text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            TrustLens helps people recognise scams, understand online risks, and act with confidence —
            using clear explanations, practical education, and transparent checks.
          </p>

          {/* Subtle divider */}
          <div className="mt-6 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
        </div>
      </div>

      {/* WHAT WE DO – Cards */}
      <h2 className="mt-20 text-center text-2xl font-semibold">What We Do</h2>
      <div className="mt-6 mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          gradient="from-blue-600 to-cyan-500"
          icon="🛡️"
          title="Risk Checks"
          body="Quick checks for URLs, emails, and phone numbers with plain-language explanations."
        />
        <FeatureCard
          gradient="from-blue-500 to-blue-700"
          icon="📘"
          title="Education Hub"
          body="Red flags by category and bite-size guides you can trust."
        />
        <FeatureCard
          gradient="from-sky-500 to-cyan-500"
          icon="🧾"
          title="Case Studies"
          body="Real incidents distilled into 3–5 key lessons."
        />
      </div>

      {/* MISSION + HOW – Cards */}
      <div className="mt-20 mb-16 flex flex-col md:flex-row justify-center gap-8">
        <PanelColored title="Our Mission" bar="from-blue-600 to-cyan-500">
          <p className="mb-3">
            Empower every user — regardless of technical background — to make informed, confident choices when
            facing suspicious content. We combine public data, curated heuristics, and explainable checks
            to provide guidance, not just a binary verdict.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Reduce harm from phishing, impersonation, and fraud.</li>
            <li>Transparency over black-box scoring.</li>
            <li>Build digital literacy through micro-learning.</li>
          </ul>
        </PanelColored>

        <PanelColored title="How TrustLens Works" bar="from-blue-500 to-blue-700">
          <ol className="list-decimal pl-5 space-y-2">
            <li><b>Check:</b> Parse input (URL/email/number) → enrich with open datasets → evaluate risk signals.</li>
            <li><b>Explain:</b> Show why it’s flagged, confidence hints, and next-step advice.</li>
            <li><b>Learn:</b> Short tips that build long-term judgment beyond the tool.</li>
          </ol>
        </PanelColored>
      </div>
          

      {/* GOVERNANCE – Cards with icons */}
      <h2 className="mt-20 text-2xl font-semibold text-center">Governance & Policies</h2>
      <div className="mt-6 mb-16 grid gap-6 md:grid-cols-3">
        <PolicyCard
          icon="🔒"
          gradient="from-blue-600 to-cyan-500"
          title="Privacy by Design"
          bullets={[
            "Minimal data collection; no selling of personal data.",
            "Client-side redaction for emails/IDs where feasible.",
            "Limited retention strictly for security/quality."
          ]}
        />
        <PolicyCard
          icon="💾"
          gradient="from-blue-500 to-blue-700"
          title="Data Handling & Storage"
          bullets={[
            "TLS in transit; encryption at rest.",
            "Least-privilege access controls.",
            "Audit trails for admin and system changes."
          ]}
        />
        <PolicyCard
          icon="📊"
          gradient="from-sky-500 to-cyan-500"
          title="Model & Heuristics Transparency"
          bullets={[
            "Explainable rules alongside ML/LMM components.",
            "Versioned checks + release notes for material changes.",
            "Human-review loop for contested results."
          ]}
        />
      </div>

      {/* ACCORDION – centered & prettier */}
      <div className="mt-20 w-full max-w-4xl mx-auto">
        <Accordion title="Compliance & Legal Notes (AU-focused)">
          <p className="mb-2">Our AU deployment is designed to align with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Privacy Act 1988 (Cth) & Australian Privacy Principles (APPs).</li>
            <li>Spam Act 2003 (Cth) on unsolicited electronic messages.</li>
            <li>Australian Consumer Law — fair, accurate, non-misleading representations.</li>
            <li>Terms/licensing of referenced datasets and APIs.</li>
          </ul>
          <p className="mt-2 text-xs text-neutral-500">Informational only — not legal advice.</p>
        </Accordion>

        <Accordion title="Scope, Limitations & Fair-Use">
          <ul className="list-disc pl-5 space-y-1">
            <li>Guidance only — not legal/financial advice.</li>
            <li>Signals change quickly; verify via official channels.</li>
            <li>Automated checks may have false positives/negatives; we disclose confidence & assumptions.</li>
            <li>Use responsibly; do not harass or dox individuals.</li>
          </ul>
        </Accordion>

        <Accordion title="Reporting & Harm-Reduction">
          <ul className="list-disc pl-5 space-y-1">
            <li>Links to official reporting (e.g., Scamwatch, bank fraud teams).</li>
            <li>Post-incident checklist: block, reset passwords, enable 2FA, contact provider.</li>
            <li>Accessibility-first: plain language, clear actions, large touch targets.</li>
          </ul>
        </Accordion>
      </div>

      {/* FOOTER */}
      <div className="mt-16 pt-6 text-center text-sm text-neutral-500">
        <div className="mx-auto mb-3 h-1 w-24 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
        © {year} <span className="font-medium">TrustLens</span> — Educational use only • hello@trustlens.app
      </div>
    </section>
  );
};

/* ---------------- components ---------------- */

function FeatureCard({
  gradient,
  icon,
  title,
  body,
}: {
  gradient: string;
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-2xl border bg-white/80 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${gradient} text-white shadow`}>
        <span className="text-3xl" aria-hidden>{icon}</span>
      </div>
      <h3 className="text-center font-semibold text-blue-700 text-lg">{title}</h3>
      <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-300">{body}</p>
    </div>
  );
}


function PolicyCard({
  icon,
  gradient,
  title,
  bullets,
}: {
  icon: string;
  gradient: string;
  title: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-2xl border p-6 shadow-sm bg-white/80">
      <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${gradient} text-white shadow`}>
        <span className="text-xl" aria-hidden>{icon}</span>
      </div>
      <h3 className="mb-2 text-center font-semibold text-blue-800">{title}</h3>
      <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
        {bullets.map((b) => <li key={b}>{b}</li>)}
      </ul>
    </div>
  );
}

/* centered, prettier accordion */
function Accordion({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <details className="group mx-auto mt-6 w-full max-w-3xl overflow-hidden rounded-2xl border bg-white/90 shadow-sm transition-all open:shadow-md">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-lg font-semibold text-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100">
        {title}
        <span className="ml-2 text-sm text-blue-600 transition-transform group-open:rotate-180">▼</span>
      </summary>
      <div className="border-t px-6 py-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 bg-gradient-to-b from-white to-blue-50/40">
        {children}
      </div>
    </details>
  );
}

function PanelColored({
  title,
  bar,
  children,
}: React.PropsWithChildren<{ title: string; bar: string }>) {
  return (
    <div className="relative max-w-lg flex-1 rounded-2xl border bg-blue-50 dark:bg-blue-900/20 p-6 shadow-sm mx-auto">
      <div className={`absolute left-0 top-0 h-1 w-full rounded-t-2xl bg-gradient-to-r ${bar}`} />
      <h3 className="mb-3 font-semibold text-blue-800">{title}</h3>
      <div className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">{children}</div>
    </div>
  );
}

export default AboutUs;
