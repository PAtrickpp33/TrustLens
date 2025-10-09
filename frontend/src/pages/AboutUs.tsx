import React from "react";

/**
 * About – Standalone (no Tailwind, no external CSS)
 * - Pure React + inline styles (same approach as your dashboard)
 * - Colorful gradient hero, cards, and panels
 */

const COLORS = {
  text: "#111827",
  sub: "#6B7280",
  border: "#E5E7EB",
  cardShadow: "0 12px 24px rgba(0,0,0,0.10)",
  softShadow: "0 6px 16px rgba(0,0,0,0.12)",
  // gradients
  gBlueCyan: "linear-gradient(90deg, #1d4ed8, #06b6d4, #3b82f6)",
  gHero: "linear-gradient(135deg, #EFF6FF 0%, #FFFFFF 45%, #ECFEFF 100%)",
  gHeroDark: "linear-gradient(135deg, #0b1534 0%, #070a16 45%, #08121a 100%)",
};

const GRADS = {
  blueCyan: "linear-gradient(135deg, #2563EB, #06B6D4)",
  indigoBlue: "linear-gradient(135deg, #4F46E5, #2563EB)",
  skyCyan: "linear-gradient(135deg, #0EA5E9, #22D3EE)",
};

export default function AboutUs() {
  const year = new Date().getFullYear();

  return (
    <section
      style={{
        padding: "2.5rem 1.5rem",
        maxWidth: 1100,
        margin: "0 auto",
        color: COLORS.text,
      }}
    >
      {/* HERO */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 28,
          border: `1px solid ${COLORS.border}`,
          padding: "3rem 1.5rem",
          backgroundImage: COLORS.gHero,
          boxShadow: COLORS.cardShadow,
        }}
      >
        {/* soft blobs */}
        <div style={blob(-120, -150, "#93C5FD66")} />
        <div style={blob(120, 150, "#67E8F966")} />

        <div style={{ position: "relative", textAlign: "center" }}>
          <span
            style={{
              display: "inline-block",
              marginBottom: 12,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              borderRadius: 999,
              padding: "6px 14px",
              backgroundImage: GRADS.blueCyan,
              color: "#fff",
              boxShadow: COLORS.softShadow,
            }}
          >
            Safer clicks. Smarter decisions.
          </span>

          <h1
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              margin: "0 0 8px",
              backgroundImage: COLORS.gBlueCyan,
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            About TrustLens
          </h1>

          <p
            style={{
              margin: "0 auto",
              maxWidth: 760,
              color: COLORS.sub,
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            TrustLens helps people recognise scams, understand online risks, and act with
            confidence — using clear explanations, practical education, and transparent checks.
          </p>

          <div
            style={{
              margin: "16px auto 0",
              height: 4,
              width: 120,
              borderRadius: 999,
              backgroundImage: GRADS.blueCyan,
              boxShadow: COLORS.softShadow,
            }}
          />
        </div>
      </div>

      {/* WHAT WE DO */}
      <h2
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 700,
          margin: "2rem 0 0.75rem",
          color: "#1E3A8A",
        }}
      >
        What We Do
      </h2>

      <div style={grid(18, 280)}>
        <GradientCard
          gradient={GRADS.blueCyan}
          icon="🛡️"
          title="Risk Checks"
          body="Quick checks for URLs, emails, and phone numbers with plain-language explanations."
        />
        <GradientCard
          gradient={GRADS.indigoBlue}
          icon="📘"
          title="Education Hub"
          body="Red flags by category and bite-size guides you can trust."
        />
        <GradientCard
          gradient={GRADS.skyCyan}
          icon="🧾"
          title="Case Studies"
          body="Real incidents distilled into 3–5 key lessons."
        />
      </div>

      {/* MISSION + HOW */}
      <div style={grid(18, 320, "2.25rem")}>
        <PanelColored title="Our Mission" bar={GRADS.blueCyan}>
          <p style={{ marginTop: 0, marginBottom: 12 }}>
            Empower every user — regardless of technical background — to make informed, confident
            choices when facing suspicious content. We combine public data, curated heuristics, and
            explainable checks to provide guidance, not just a binary verdict.
          </p>
          <ul style={ul()}>
            <li>Reduce harm from phishing, impersonation, and fraud.</li>
            <li>Transparency over black-box scoring.</li>
            <li>Build digital literacy through micro-learning.</li>
          </ul>
        </PanelColored>

        <PanelColored title="How TrustLens Works" bar={GRADS.indigoBlue}>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
            <li>
              <b>Check:</b> Parse input (URL/email/number) → enrich with open datasets → evaluate
              risk signals.
            </li>
            <li>
              <b>Explain:</b> Show why it’s flagged, confidence hints, and next-step advice.
            </li>
            <li>
              <b>Learn:</b> Short tips that build long-term judgment beyond the tool.
            </li>
          </ol>
        </PanelColored>
      </div>

      {/* GOVERNANCE */}
      <h2
        id="governance-policy"          // ← anchor target for /about#governance-policy
        tabIndex={-1}                   // ← allows focus after scroll (a11y)
        style={{
          scrollMarginTop: 80,          // ← offset for sticky header (adjust as needed)
          textAlign: "center",
          fontSize: "1.5rem",
          fontWeight: 700,
          margin: "1.5rem 0 0.75rem",
          color: "#1E3A8A",
        }}
      >
        Governance & Policies
      </h2>

      <div style={grid(18, 280)}>
        <GradientCard
          gradient={GRADS.blueCyan}
          icon="🔒"
          title="Privacy by Design"
          body={
            <ul style={ul()}>
              <li>Minimal data collection; no selling of personal data.</li>
              <li>Client-side redaction for emails/IDs where feasible.</li>
              <li>Limited retention strictly for security/quality.</li>
            </ul>
          }
        />

        <GradientCard
          gradient={GRADS.indigoBlue}
          icon="💾"
          title="Data Handling & Storage"
          body={
            <ul style={ul()}>
              <li>TLS in transit; encryption at rest.</li>
              <li>Least-privilege access controls.</li>
              <li>Audit trails for admin and system changes.</li>
            </ul>
          }
        />

        <GradientCard
          gradient={GRADS.skyCyan}
          icon="📊"
          title="Model & Heuristics Transparency"
          body={
            <ul style={ul()}>
              <li>Explainable rules alongside ML/LMM components.</li>
              <li>Versioned checks + release notes for material changes.</li>
              <li>Human-review loop for contested results.</li>
            </ul>
          }
        />
      </div>

      {/* ACCORDIONS */}
      <div style={{ maxWidth: 820, margin: "16px auto 0" }}>
        <Accordion title="Compliance & Legal Notes (AU-focused)">
          <p style={{ marginTop: 0 }}>Our AU deployment is designed to align with:</p>
          <ul style={ul()}>
            <li>Privacy Act 1988 (Cth) & Australian Privacy Principles (APPs).</li>
            <li>Spam Act 2003 (Cth) on unsolicited electronic messages.</li>
            <li>Australian Consumer Law — fair, accurate, non-misleading representations.</li>
            <li>Terms/licensing of referenced datasets and APIs.</li>
          </ul>
          <p style={{ fontSize: 12, color: COLORS.sub, marginBottom: 0 }}>
            Informational only — not legal advice.
          </p>
        </Accordion>

        <Accordion title="Scope, Limitations & Fair-Use">
          <ul style={ul()}>
            <li>Guidance only — not legal/financial advice.</li>
            <li>Signals change quickly; verify via official channels.</li>
            <li>Automated checks may have false positives/negatives; we disclose confidence & assumptions.</li>
            <li>Use responsibly; do not harass or dox individuals.</li>
          </ul>
        </Accordion>

        <Accordion title="Reporting & Harm-Reduction">
          <ul style={ul()}>
            <li>Links to official reporting (e.g., Scamwatch, bank fraud teams).</li>
            <li>Post-incident checklist: block, reset passwords, enable 2FA, contact provider.</li>
            <li>Accessibility-first: plain language, clear actions, large touch targets.</li>
          </ul>
        </Accordion>
      </div>

      {/* FOOTER */}
      <div
        style={{
          marginTop: 28,
          paddingTop: 12,
          textAlign: "center",
          fontSize: 13,
          color: COLORS.sub,
        }}
      >
        <div
          style={{
            margin: "0 auto 10px",
            height: 4,
            width: 120,
            borderRadius: 999,
            backgroundImage: GRADS.blueCyan,
          }}
        />
        © {year} <span style={{ fontWeight: 600, color: "#1E3A8A" }}>TrustLens</span> — Educational
        use only • hello@trustlens.app
      </div>
    </section>
  );
}

/* ---------------- helper components (inline styles) ---------------- */

function GradientCard({
  gradient,
  icon,
  title,
  body,
}: {
  gradient: string;
  icon: string;
  title: string;
  body: React.ReactNode | string;
}) {
  return (
    <div
      style={{
        backgroundImage: gradient,
        borderRadius: 18,
        padding: 18,
        color: "#fff",
        boxShadow: COLORS.cardShadow,
        border: "1px solid rgba(255,255,255,0.28)",
        minHeight: 170,
      }}
    >
      <div
        style={{
          margin: "0 auto 10px",
          height: 64,
          width: 64,
          borderRadius: 16,
          background: "rgba(255,255,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)",
        }}
      >
        <span style={{ fontSize: 28 }} aria-hidden>
          {icon}
        </span>
      </div>
      <h3 style={{ textAlign: "center", margin: 0, fontWeight: 700 }}>{title}</h3>
      <div style={{ marginTop: 8, textAlign: "center", fontSize: 14, opacity: 0.95 }}>
        {typeof body === "string" ? <p style={{ margin: 0 }}>{body}</p> : body}
      </div>
    </div>
  );
}

function PanelColored({
  title,
  bar,
  children,
}: React.PropsWithChildren<{ title: string; bar: string }>) {
  return (
    <div
      style={{
        position: "relative",
        background: "linear-gradient(180deg, #FFFFFF, #F0F9FF)",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: COLORS.cardShadow,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: 4,
          width: "100%",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          backgroundImage: bar,
        }}
      />
      <h3 style={{ margin: "0 0 10px", color: "#1E3A8A", fontWeight: 700 }}>{title}</h3>
      <div style={{ fontSize: 14, color: COLORS.text, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

function Accordion({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <details
      style={{
        marginTop: 12,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 16,
        overflow: "hidden",
        background: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }}
    >
      <summary
        style={{
          padding: "12px 16px",
          cursor: "pointer",
          fontWeight: 700,
          color: "#1E3A8A",
          background: "linear-gradient(90deg, #EFF6FF, #ECFEFF)",
          listStyle: "none",
        }}
      >
        {title}
        <span style={{ float: "right", color: "#2563EB" }}>▼</span>
      </summary>
      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: 16,
          fontSize: 14,
          lineHeight: 1.7,
          color: COLORS.text,
        }}
      >
        {children}
      </div>
    </details>
  );
}

/* ---------------- small style helpers ---------------- */
function grid(gap = 16, min = 320, mt = "1rem"): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
    gap,
    marginTop: mt,
    marginBottom: "1.25rem",
  };
}

function ul(): React.CSSProperties {
  return { margin: 0, paddingLeft: 18, lineHeight: 1.7 };
}

function blob(x: number, y: number, color: string): React.CSSProperties {
  return {
    position: "absolute",
    top: y,
    right: x,
    height: 320,
    width: 320,
    borderRadius: "50%",
    background: color,
    filter: "blur(48px)",
  };
}
