import React from "react";

/**
 * About – Dark Blue (full-bleed background + optional image overlay)
 * Pure React + inline styles (no external CSS)
 */

const COLORS = {
  // page background (dark gradients)
  pageBg:
    "radial-gradient(1200px 600px at -10% -10%, rgba(96,165,250,.10), transparent 60%),\
     radial-gradient(1200px 600px at 110% -20%, rgba(167,139,250,.10), transparent 60%),\
     linear-gradient(135deg, #0a1830 0%, #0c213c 45%, #0a1e34 100%)",
  text: "#EAF2FF",
  sub: "#BFD3F6",
  heading: "#EAF2FF",
  border: "rgba(255,255,255,0.10)",
  cardShadow: "0 18px 40px rgba(2,6,23,0.45)",
  softShadow: "0 10px 26px rgba(2,6,23,0.35)",
  gBlueCyan: "linear-gradient(90deg, #93C5FD, #67E8F9, #60A5FA)",
  gHeroAccent: "linear-gradient(90deg, #60A5FA, #A78BFA)",
};

const GRADS = {
  blueCyan: "linear-gradient(135deg, #1E40AF, #06B6D4)",
  indigoBlue: "linear-gradient(135deg, #4F46E5, #2563EB)",
  skyCyan: "linear-gradient(135deg, #0EA5E9, #22D3EE)",
  panelDark: "linear-gradient(180deg, #132A46, #0F223B)",
};

export default function AboutUs() {
  const year = new Date().getFullYear();

  // Full-bleed page background (gradient + optional image)
  const pageWrapStyle: React.CSSProperties = {
    minHeight: "100vh",
    // Order: subtle glows → dark overlay → image
    background:
      `${COLORS.pageBg}, 
       linear-gradient(180deg, rgba(8,18,30,.88), rgba(8,18,30,.78)),
       url('/bg/hero-network-2.webp') center/cover no-repeat fixed`,
    color: COLORS.text,
    padding: "2.5rem 0 3rem",
  };

  // Inner content container (keeps your 1100px layout)
  const containerStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 1.5rem",
  };

  return (
    <main style={pageWrapStyle} role="main" aria-label="About Dodgy Detector">
      <section style={containerStyle}>
        {/* HERO */}
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 28,
            border: `1px solid ${COLORS.border}`,
            padding: "3rem 1.5rem",
            background: "transparent",
            boxShadow: COLORS.cardShadow,
          }}
        >
          {/* soft blobs */}
          <div style={blob(-120, -150, "#93C5FD33")} />
          <div style={blob(120, 150, "#A78BFA33")} />

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
                backgroundImage: COLORS.gHeroAccent,
                color: "#0b1220",
                boxShadow: COLORS.softShadow,
              }}
            >
              Safer clicks. Smarter decisions.
            </span>

            <h1
              style={{
                fontSize: "2.4rem",
                fontWeight: 900,
                margin: "0 0 8px",
                backgroundImage: COLORS.gBlueCyan,
                WebkitBackgroundClip: "text",
                color: "transparent",
                textShadow: "0 1px 0 rgba(0,0,0,.3)",
              }}
            >
              About Dodgy Detector
            </h1>

            <p
              style={{
                margin: "0 auto",
                maxWidth: 760,
                color: COLORS.sub,
                lineHeight: 1.7,
                fontSize: 15.5,
                textShadow: "0 1px 0 rgba(0,0,0,.35)",
              }}
            >
              Dodgy Detector helps people recognise scams, understand online risks, and act with confidence —
              using clear explanations, practical education, and transparent checks.
            </p>

            {/* accent bar */}
            <div
              style={{
                margin: "16px auto 0",
                height: 5,
                width: 140,
                borderRadius: 999,
                backgroundImage: COLORS.gHeroAccent,
                boxShadow: "0 8px 26px rgba(96,165,250,.35)",
              }}
            />
          </div>
        </div>

        {/* WHAT WE DO */}
        <h2 style={h2Style}>What We Do</h2>

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
            title="ScamHub"
            body="Explore real trends."
          />
          <GradientCard
            gradient={GRADS.skyCyan}
            icon="🧾"
            title="ScamSmart Quiz"
            body="Learn and practice spotting scams"
          />
        </div>

        {/* MISSION + HOW */}
        <h2 style={h2Style}>Governance & Policies</h2>

        <div style={grid(18, 320, "2.25rem")}>
          <PanelColored title="Our Mission" bar={COLORS.gHeroAccent}>
            <p style={{ marginTop: 0, marginBottom: 12, color: COLORS.text }}>
              Empower every user — regardless of technical background — to make informed, confident choices when
              facing suspicious content. We combine public data, curated heuristics, and explainable checks
              to provide guidance, not just a binary verdict.
            </p>
            <ul style={ul(COLORS.sub)}>
              <li>Reduce harm from phishing, impersonation, and fraud.</li>
              <li>Transparency over black-box scoring.</li>
              <li>Build digital literacy through micro-learning.</li>
            </ul>
          </PanelColored>

          <PanelColored title="How Dodgy Detector Works" bar={GRADS.indigoBlue}>
            <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7, color: COLORS.sub }}>
              <li><b>Check:</b> Parse input (URL/email/number) → enrich with open datasets → evaluate risk signals.</li>
              <li><b>Explain:</b> Show why it’s flagged, confidence hints, and next-step advice.</li>
              <li><b>Learn:</b> Short tips that build long-term judgment beyond the tool.</li>
            </ol>
          </PanelColored>
        </div>

        {/* ACCORDIONS */}
        <div style={{ maxWidth: 820, margin: "16px auto 0" }}>
          <Accordion title="Compliance & Legal Notes (AU-focused)">
            <p style={{ marginTop: 0, color: COLORS.sub }}>Our AU deployment is designed to align with:</p>
            <ul style={ul(COLORS.sub)}>
              <li>Privacy Act 1988 (Cth) & Australian Privacy Principles (APPs).</li>
              <li>Spam Act 2003 (Cth) on unsolicited electronic messages.</li>
              <li>Australian Consumer Law — fair, accurate, non-misleading representations.</li>
              <li>Terms/licensing of referenced datasets and APIs.</li>
            </ul>
            <p style={{ fontSize: 12, color: COLORS.sub, marginBottom: 0 }}>Informational only — not legal advice.</p>
          </Accordion>

          <Accordion title="Scope, Limitations & Fair-Use">
            <ul style={ul(COLORS.sub)}>
              <li>Guidance only — not legal/financial advice.</li>
              <li>Signals change quickly; verify via official channels.</li>
              <li>Automated checks may have false positives/negatives; we disclose confidence & assumptions.</li>
              <li>Use responsibly; do not harass or dox individuals.</li>
            </ul>
          </Accordion>

          <Accordion title="Reporting & Harm-Reduction">
            <ul style={ul(COLORS.sub)}>
              <li>Links to official reporting (e.g., Scamwatch, bank fraud teams).</li>
              <li>Post-incident checklist: block, reset passwords, enable 2FA, contact provider.</li>
              <li>Accessibility-first: plain language, clear actions, large touch targets.</li>
            </ul>
          </Accordion>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 28, paddingTop: 12, textAlign: "center", fontSize: 13, color: COLORS.sub }}>
          <div
            style={{
              margin: "0 auto 10px",
              height: 4,
              width: 120,
              borderRadius: 999,
              backgroundImage: COLORS.gHeroAccent,
            }}
          />
          © {year} <span style={{ fontWeight: 700, color: "#C7D2FE" }}>Dodgy Detector</span> — Educational use only •
          hello@trustlens.app
        </div>
      </section>
    </main>
  );
}

/* ---------- small helpers ---------- */

const h2Style: React.CSSProperties = {
  textAlign: "center",
  fontSize: "1.6rem",
  fontWeight: 800,
  margin: "2rem 0 0.75rem",
  color: COLORS.heading,
};

function grid(gap = 16, min = 320, mt = "1rem"): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
    gap,
    marginTop: mt,
    marginBottom: "1.25rem",
  };
}
function ul(color = "#BFD3F6"): React.CSSProperties {
  return { margin: 0, paddingLeft: 18, lineHeight: 1.7, color };
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

/* ---------- building blocks ---------- */

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
        position: "relative",
        backgroundImage: gradient,
        borderRadius: 18,
        padding: 18,
        color: "#fff",
        boxShadow: COLORS.cardShadow,
        border: "1px solid rgba(255,255,255,0.22)",
        minHeight: 170,
      }}
    >
      {/* glass inner layer */}
      <div
        style={{
          position: "absolute",
          inset: 1,
          borderRadius: 16,
          background: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02))",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.12)",
        }}
      />
      <div
        style={{
          position: "relative",
          margin: "0 auto 10px",
          height: 64,
          width: 64,
          borderRadius: 16,
          background: "rgba(255,255,255,0.18)",
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
      <h3 style={{ position: "relative", textAlign: "center", margin: 0, fontWeight: 800 }}>{title}</h3>
      <div style={{ position: "relative", marginTop: 8, textAlign: "center", fontSize: 14, opacity: 0.96 }}>
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
        background: GRADS.panelDark,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 18,
        padding: 16,
        boxShadow: COLORS.cardShadow,
        color: COLORS.text,
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
      <h3 style={{ margin: "0 0 10px", color: COLORS.heading, fontWeight: 800 }}>{title}</h3>
      <div style={{ fontSize: 14, color: COLORS.sub, lineHeight: 1.7 }}>{children}</div>
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
        background: "#0f223b",
        boxShadow: "0 10px 28px rgba(2,6,23,.35)",
        color: COLORS.text,
      }}
    >
      <summary
        style={{
          padding: "12px 16px",
          cursor: "pointer",
          fontWeight: 800,
          color: COLORS.heading,
          background: "linear-gradient(90deg, rgba(96,165,250,.12), rgba(167,139,250,.10))",
          listStyle: "none",
        }}
      >
        {title}
        <span style={{ float: "right", color: "#C7D2FE" }}>▼</span>
      </summary>
      <div
        style={{
          borderTop: `1px solid ${COLORS.border}`,
          padding: 16,
          fontSize: 14,
          lineHeight: 1.7,
          color: COLORS.sub,
          background: "#0b1b31",
        }}
      >
        {children}
      </div>
    </details>
  );
}
