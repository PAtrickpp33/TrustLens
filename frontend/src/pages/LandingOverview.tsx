import React, { useMemo, useState } from "react";

/**
 * TrustLens Overview — Dark Blue theme (no Tailwind)
 * - drop-in replacement for your current LandingOverview
 */

type Daily = { date: string; scans: number; detected: number; category?: "Phishing"|"Impersonation"|"Malware" };
type CaseRow = { id: string; date: string; type: "Phishing"|"Impersonation"|"Malware"; status: "Flagged"|"Blocked" };

/* ---------------- THEME (Dark Blue) ---------------- */
const THEME = {
  // surfaces
  bg: "linear-gradient(180deg,#0b1f3a 0%,#0e2747 60%,#0b1f3a 100%)",
  cardBg: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.14)",

  // text
  text: "#eaf0ff",
  textMuted: "#c9d6f6",
  heading: "#ffffff",
  axisText: "#9fb3d8",

  // accents
  primary: "#38bdf8",
  primaryDark: "#0ea5e9",
  primarySoft: "rgba(56,189,248,0.22)",
  primaryInk: "#05293d",

  secondary: "#a78bfa",
  secondarySoft: "rgba(167,139,250,0.22)",
  secondaryInk: "#2d1b69",

  success: "#22c55e",
  successSoft: "rgba(34,197,94,0.18)",
  successInk: "#0b3d22",

  orange: "#f59e0b",
  red: "#ef4444",

  // charts
  lineA: "#38bdf8", // scans
  lineB: "#f59e0b", // detected
  donut: ["#a78bfa","#38bdf8","#22c55e","#f59e0b","#ef4444","#60a5fa"],
};

/* ---------------- Mock data ---------------- */
const MOCK_DAYS = 90;
const start = new Date(); start.setDate(start.getDate() - (MOCK_DAYS-1));
const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
const cats: Array<Daily["category"]> = ["Phishing","Impersonation","Malware"];

const daily: Daily[] = Array.from({length: MOCK_DAYS}).map((_,i)=>{
  const d = new Date(start); d.setDate(start.getDate()+i);
  const scansBase = 80 + Math.sin(i/7)*18 + Math.cos(i/11)*12;
  const scans = Math.max(25, Math.round(scansBase + rand(-18, 18)));
  const detected = Math.max(5, Math.round(scans * (0.12 + 0.03*Math.sin(i/9)) + rand(-6,6)));
  return { date: fmtDate(d), scans, detected, category: cats[rand(0,2)] };
});

const recentCases: CaseRow[] = Array.from({length: 6}).map((_,i)=>{
  const d = new Date(); d.setDate(d.getDate() - i);
  const type = cats[rand(0,2)]!;
  const status: CaseRow["status"] = Math.random()>0.5? "Flagged":"Blocked";
  return { id: `CASE-${rand(100000,999999)}`, date: fmtDate(d), type, status };
});

/* ---------------- Component ---------------- */
export default function LandingOverview() {
  const [range, setRange] = useState<7|30|90>(30);
  const slice = useMemo(()=> daily.slice(-range), [range]);

  // KPIs
  const totalScans = slice.reduce((s,d)=>s+d.scans,0);
  const totalDetected = slice.reduce((s,d)=>s+d.detected,0);
  const detectionRate = totalScans? (totalDetected/totalScans)*100 : 0;

  // Aggregations
  const share = useMemo(()=>{
    const map = new Map<string, number>();
    slice.forEach(d => map.set(d.category || "Other", (map.get(d.category || "Other")||0)+d.detected));
    return Array.from(map.entries()).map(([k,v])=>({label:k, value:v})).sort((a,b)=>b.value-a.value);
  }, [slice]);

  const weekly = useMemo(()=>{
    const buckets = [0,0,0,0];
    for (let i=0;i<slice.length;i++){
      const w = 3 - Math.min(3, Math.floor((slice.length-1-i)/7));
      buckets[w] += slice[i].detected;
    }
    return buckets;
  }, [slice]);

  return (
    <section
      style={{
        padding: "1.5rem",
        maxWidth: 1200,
        margin: "0 auto",
        color: THEME.text,
        background: THEME.bg,
        borderRadius: 20,
        boxShadow: "0 22px 60px rgba(2,6,23,.45)",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1
          style={{
            fontSize: "2.1rem",
            fontWeight: 800,
            margin: 0,
            backgroundImage: `linear-gradient(90deg, ${THEME.primaryDark}, ${THEME.primary}, ${THEME.secondary})`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          TrustLens Insights
        </h1>
        <p style={{ margin: "6px 0 10px", color: THEME.textMuted, fontSize: 12 }}>
          Key statistics and trends at a glance—scans, detections, risk distribution, and recent cases.
        </p>

        {/* Range switches */}
        <div style={{ display: "inline-flex", gap: 8 }}>
          {[7, 30, 90].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as 7 | 30 | 90)}
              style={{
                border: `1px solid ${THEME.border}`,
                borderRadius: 12,
                padding: "6px 10px",
                fontSize: 12,
                cursor: "pointer",
                background:
                  r === range
                    ? `linear-gradient(135deg, ${THEME.primarySoft}, ${THEME.secondarySoft})`
                    : "rgba(255,255,255,0.06)",
                color: r === range ? THEME.text : THEME.textMuted,
              }}
            >
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 12,
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        <Kpi
          title="Total Scans"
          value={totalScans.toLocaleString()}
          note={`${range} days`}
          gradient={`linear-gradient(135deg, ${THEME.primarySoft}, ${THEME.primary})`}
          fg={THEME.text}
        />
        <Kpi
          title="Detection Rate"
          value={`${detectionRate.toFixed(1)}%`}
          note="Detected / Scans"
          gradient={`linear-gradient(135deg, ${THEME.secondarySoft}, ${THEME.secondary})`}
          fg={THEME.text}
        />
        <Kpi
          title="Detected Scams"
          value={totalDetected.toLocaleString()}
          note="Flagged/Blocked"
          gradient={`linear-gradient(135deg, ${THEME.successSoft}, ${THEME.success})`}
          fg={THEME.text}
        />
      </div>

      {/* Top charts grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
        <Card id="trend" title="Trend: Scans vs Detected" subtitle="Daily counts for the selected period.">
          <LineDual data={slice} />
        </Card>

        <Card id="detection-share" title="Detection Share" subtitle="Share of detected by category">
          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center" }}>
            <Donut data={share} colors={THEME.donut} />
            <div style={{ fontSize: 12, color: THEME.axisText, paddingLeft: 10 }}>
              {share.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: getColor(i, THEME.donut) }} />
                  <span>{s.label}</span>
                  <span style={{ marginLeft: "auto", color: THEME.textMuted }}>
                    ({s.value.toLocaleString()}, {percent(s.value, totalDetected)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <Card title="Weekly Buckets (Detected)" subtitle="Grouped by week for the selected period">
          <BarsHorizontal labels={["Wk-4", "Wk-3", "Wk-2", "This"]} values={weekly} />
        </Card>

        <Card title="Recent Cases" subtitle="Latest flagged or blocked items">
          <CasesTable rows={recentCases} />
        </Card>
      </div>
    </section>
  );
}

/* ---------------- UI primitives ---------------- */
function Kpi({
  title,
  value,
  note,
  gradient,
}: {
  title: string;
  value: string;
  note?: string;
  gradient: string;
}) {
  return (
    <div
      style={{
        background: gradient,
        color: THEME.text,
        borderRadius: 14,
        padding: "14px 12px",
        textAlign: "center",
        boxShadow: "0 12px 28px rgba(2,6,23,.35)",
        border: `1px solid ${THEME.border}`,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.95 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 800, margin: "6px 0", color: THEME.heading }}>{value}</div>
      {note && <div style={{ fontSize: 11, color: THEME.textMuted }}>{note}</div>}
    </div>
  );
}

function Card({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      style={{
        background: THEME.cardBg,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 18px 44px rgba(2,6,23,.35)",
        backdropFilter: "blur(6px)",
      }}
    >
      <h3 style={{ margin: 0, color: THEME.heading }}>{title}</h3>
      {subtitle && (
        <p style={{ margin: "4px 0 8px", color: THEME.textMuted, fontSize: 12 }}>{subtitle}</p>
      )}
      {children}
    </div>
  );
}

/* ---------------- Charts (SVG) ---------------- */
function LineDual({ data }: { data: Daily[] }) {
  const W = 680, H = 260, pad = 36;
  const maxY = Math.max(1, ...data.map((d) => Math.max(d.scans, d.detected)));
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
  const y = (v: number) => H - pad - (v / maxY) * (H - pad * 2);

  const path = (key: "scans" | "detected", smooth = false) => {
    const pts = data.map((d, i) => [pad + i * stepX, y(d[key])]);
    if (!smooth) return "M " + pts.map((p) => `${p[0]} ${p[1]}`).join(" L ");
    let d = "M " + pts[0][0] + " " + pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      const [x, yv] = pts[i]; const [px, py] = pts[i - 1];
      const cx = (px + x) / 2; d += ` Q ${cx} ${py} ${x} ${yv}`;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 260 }}>
      {/* grid + y labels */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad + (1 - t) * (H - pad * 2);
        const gv = Math.round(maxY * t);
        return (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke={THEME.border} />
            <text x={8} y={gy + 4} fontSize="11" fill={THEME.axisText}>
              {gv}
            </text>
          </g>
        );
      })}
      {/* x labels */}
      {data.map(
        (d, i) =>
          i % Math.ceil(data.length / 7) === 0 && (
            <text
              key={i}
              x={pad + i * stepX}
              y={H - 8}
              fontSize="10"
              textAnchor="middle"
              fill={THEME.textMuted}
            >
              {d.date.slice(5)}
            </text>
          )
      )}
      <path d={path("scans", true)} fill="none" stroke={THEME.lineA} strokeWidth={2.6} />
      <path d={path("detected", true)} fill="none" stroke={THEME.lineB} strokeWidth={2.4} />
      {/* legend */}
      <g>
        <circle cx={pad} cy={16} r={4} fill={THEME.lineA} />
        <text x={pad + 10} y={20} fontSize="11" fill={THEME.axisText}>
          Scans
        </text>
        <circle cx={pad + 70} cy={16} r={4} fill={THEME.lineB} />
        <text x={pad + 80} y={20} fontSize="11" fill={THEME.axisText}>
          Detected
        </text>
      </g>
    </svg>
  );
}

function Donut({ data, colors }: { data: { label: string; value: number }[]; colors: string[] }) {
  const W = 160, H = 160, cx = W / 2, cy = H / 2, r = 56, inner = 36;
  const total = Math.max(1, data.reduce((s, d) => s + d.value, 0));
  let start = -Math.PI / 2;
  const arcs = data.map((d, i) => {
    const a = (d.value / total) * Math.PI * 2;
    const end = start + a;
    const p = donutArc(cx, cy, r, inner, start, end);
    start = end; return { p, color: getColor(i, colors) };
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: 160, height: 160 }}>
      {arcs.map((a, i) => (
        <path key={i} d={a.p} fill={a.color} stroke="#0b1f3a" strokeWidth={2} />
      ))}
      <circle cx={cx} cy={cy} r={inner} fill="transparent" />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill={THEME.textMuted}>
        {total.toLocaleString()}
      </text>
    </svg>
  );
}

function BarsHorizontal({ labels, values }: { labels: string[]; values: number[] }) {
  const W = 560, H = 200, pad = 36, gap = 10;
  const max = Math.max(1, ...values);
  const barW = (W - pad * 2 - gap * (values.length - 1)) / values.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 200 }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad + (1 - t) * (H - pad * 2);
        const gv = Math.round(max * t);
        return (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke={THEME.border} />
            <text x={8} y={gy + 4} fontSize="11" fill={THEME.axisText}>
              {gv}
            </text>
          </g>
        );
      })}
      {values.map((v, i) => {
        const h = (v / max) * (H - pad * 2);
        const x = pad + i * (barW + gap);
        const y = H - pad - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={6} fill={THEME.secondary} />
            <text
              x={x + barW / 2}
              y={H - 8}
              fontSize="10"
              textAnchor="middle"
              fill={THEME.textMuted}
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CasesTable({ rows }: { rows: CaseRow[] }) {
  return (
    <div style={{ overflowX: "auto", fontSize: 12 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(255,255,255,0.04)" }}>
            <Th>ID</Th>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${THEME.border}` }}>
              <Td>{r.id}</Td>
              <Td>{r.date}</Td>
              <Td>{r.type}</Td>
              <Td>
                <StatusBadge status={r.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: CaseRow["status"] }) {
  const isFlagged = status === "Flagged";
  const color = isFlagged ? "#7dd3fc" : "#fca5a5";
  const bg = isFlagged ? "rgba(56,189,248,0.12)" : "rgba(239,68,68,0.12)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: 999,
        border: `1px solid ${color}`,
        background: bg,
        color,
      }}
    >
      {status}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: "8px", color: THEME.textMuted, fontWeight: 700 }}>
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "8px", color: THEME.text }}>{children}</td>;
}

/* ---------------- utils ---------------- */
function percent(val: number, total: number) {
  return total ? ((val / total) * 100).toFixed(1) : "0.0";
}
function donutArc(cx: number, cy: number, r: number, r0: number, start: number, end: number) {
  const large = end - start > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.cos(start),
    y0 = cy + r * Math.sin(start);
  const x1 = cx + r * Math.cos(end),
    y1 = cy + r * Math.sin(end);
  const x2 = cx + r0 * Math.cos(end),
    y2 = cy + r0 * Math.sin(end);
  const x3 = cx + r0 * Math.cos(start),
    y3 = cy + r0 * Math.sin(start);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}
function getColor(i: number, palette?: string[]) {
  const P = palette || THEME.donut;
  return P[i % P.length];
}
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
