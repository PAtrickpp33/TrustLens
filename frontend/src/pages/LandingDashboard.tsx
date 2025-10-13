import React, { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";

/**
 * Dodgy Detector Scam Dashboard — Responsive SVG (no libs)
 * - Reads /scam_data.csv from /public
 * - Normalizes columns (Category/Reports/Loss)
 */

type Row = {
  Month: string;          // Jan..Dec
  Year: string | number;  // 2023/2024/...
  Category?: string;      // Investment, Phishing, Romance, ...
  Reports: number;
  LossMillions: number;
};

type Point = { label: string; month: string; year: string; reports: number; loss: number };

const COLORS = {
  kpiBlue: "#3B82F6",
  kpiGreen: "#10B981",
  kpiRed: "#F43F5E",
  kpiIndigo: "#4F46E5",
  line: "#2563EB",
  bar: "#F97316",
  text: "#111827",
  subtext: "#6B7280",
  border: "#E5E7EB",
  grid: "#E5E7EB",
};

const PALETTE = [
  "#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4",
  "#84CC16","#F97316","#EC4899","#14B8A6","#A855F7","#D946EF"
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monthIndex = (m: string) => Math.max(0, MONTHS.indexOf(m));
const monthKey = (m: string, y: string|number) =>
  `${String(y).padStart(4,"0")}-${String(monthIndex(m)+1).padStart(2,"0")}`;

/* --------------------------- Responsive hook --------------------------- */
function useContainerWidth<T extends HTMLElement>(min = 320): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState<number>(min);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const cw = Math.max(min, Math.floor(entry.contentRect.width));
      setW(cw);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, [min]);
  return [ref, w];
}

/* ============================ MAIN COMPONENT ============================ */
export default function LandingDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [year, setYear] = useState<string>("All");
  const [category, setCategory] = useState<string>("All");
  const [topN, setTopN] = useState<number>(5);

  // load CSV + normalize columns
  useEffect(() => {
    Papa.parse<any>("/scam_data.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (res) => {
        const raw = (res.data as any[]).map((r) => {
          const Month = String(r.Month ?? r.month ?? r.MonthName ?? "").trim();
          const Year  = r.Year ?? r.year ?? r.YEAR;
          const Category = String(r.Category ?? r.category ?? r.Type ?? r.type ?? "").trim();
          const Reports  = Number(r.Reports ?? r.reports ?? r.Count ?? r.count ?? 0);
          const LossMillions = Number(
            r.LossMillions ?? r.loss_m ?? r.Loss ?? r.loss ?? r["Loss ($m)"] ?? 0
          );
          return { Month, Year, Category, Reports, LossMillions } as Row;
        });

        const data = raw.filter(
          (r) =>
            r.Month &&
            MONTHS.includes(String(r.Month)) &&
            r.Year !== undefined &&
            !Number.isNaN(r.Reports) &&
            !Number.isNaN(r.LossMillions)
        );

        setRows(data);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message || "CSV parse error");
        setLoading(false);
      },
    });
  }, []);

  // lists for filters
  const years = useMemo(() => {
    const ys = Array.from(new Set(rows.map((r) => String(r.Year)))).sort();
    return ["All", ...ys];
  }, [rows]);

  const categories = useMemo(() => {
    const cs = Array.from(
      new Set(rows.map((r) => (r.Category || "").trim()).filter(Boolean))
    ).sort();
    return ["All", ...cs];
  }, [rows]);

  // apply filters
  const filtered = useMemo(() => {
    return rows.filter(
      (r) =>
        (year === "All" || String(r.Year) === year) &&
        (category === "All" || (r.Category || "") === category)
    );
  }, [rows, year, category]);

  // monthly series
  const series: Point[] = useMemo(() => {
    if (!filtered.length) return [];
    const m = new Map<string, Point>();
    filtered.forEach((r) => {
      const k = `${r.Year}-${r.Month}`;
      if (!m.has(k)) {
        m.set(k, {
          label: `${r.Month} ${r.Year}`,
          month: String(r.Month),
          year: String(r.Year),
          reports: 0,
          loss: 0,
        });
      }
      const p = m.get(k)!;
      p.reports += Number(r.Reports || 0);
      p.loss += Number(r.LossMillions || 0);
    });
    return Array.from(m.values()).sort((a, b) =>
      monthKey(a.month, a.year).localeCompare(monthKey(b.month, b.year))
    );
  }, [filtered]);

  // totals
  const totalReports = series.reduce((s, p) => s + p.reports, 0);
  const totalLoss = series.reduce((s, p) => s + p.loss, 0);
  const avgLoss = totalReports ? totalLoss / totalReports : 0;

  // extra KPIs
  const monthRanks = useMemo(() => {
    const byLoss = [...series].sort((a, b) => b.loss - a.loss);
    const byReports = [...series].sort((a, b) => b.reports - a.reports);
    return {
      maxLoss: byLoss[0]?.label,
      minLoss: byLoss[byLoss.length - 1]?.label,
      maxReports: byReports[0]?.label,
    };
  }, [series]);

  const lastChange = useMemo(() => {
    if (series.length < 2) return null;
    const prev = series[series.length - 2];
    const curr = series[series.length - 1];
    const diffLoss = curr.loss - prev.loss;
    const pctLoss = prev.loss ? (diffLoss / prev.loss) * 100 : 0;
    const diffRep = curr.reports - prev.reports;
    const pctRep = prev.reports ? (diffRep / prev.reports) * 100 : 0;
    return { month: curr.label, diffLoss, pctLoss, diffRep, pctRep };
  }, [series]);

  // aggregation by category (for Pie/Bar/Table)
  const byCategory = useMemo(() => {
    const m = new Map<string, { loss: number; reports: number }>();
    filtered.forEach((r) => {
      const k = (r.Category || "Unspecified").trim() || "Unspecified";
      const v = m.get(k) || { loss: 0, reports: 0 };
      v.loss += Number(r.LossMillions || 0);
      v.reports += Number(r.Reports || 0);
      m.set(k, v);
    });
    const arr = Array.from(m.entries()).map(([name, v]) => ({ name, ...v }));
    arr.sort((a, b) => b.loss - a.loss);
    return arr;
  }, [filtered]);

  if (error) {
    return (
      <div style={{maxWidth: 900, margin: "2rem auto", border:"1px solid #FCD34D", background:"#FFFBEB", padding:"1rem", borderRadius:12, color:"#92400E"}}>
        Error reading data <code>/scam_data.csv</code>: {error}
      </div>
    );
  }
  if (loading) {
    return <div style={{padding:"2rem", textAlign:"center", color:"#4B5563"}}>Loading data…</div>;
  }
  if (!rows.length) {
    return <div style={{padding:"2rem", textAlign:"center", color:"#4B5563"}}>No data found in <code>/scam_data.csv</code>.</div>;
  }

  return (
    <section style={{ padding: "2.5rem 1.5rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h1 style={{
          fontSize: "2rem", fontWeight: 800,
          backgroundImage: "linear-gradient(90deg, #1d4ed8, #06b6d4, #3b82f6)",
          WebkitBackgroundClip: "text", color: "transparent", margin: 0
        }}>
          Dodgy Detector Scam Dashboard
        </h1>
        <p style={{ color: COLORS.subtext, marginTop: 6 }}>
          Based on NASC/Scamwatch (Targeting Scams 2024) — locally served CSV.
        </p>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
        <Select label="Year" value={year} onChange={setYear} options={years} />
        {categories.length > 1 && <Select label="Category" value={category} onChange={setCategory} options={categories} />}
        <Select label="Top N (table/pie)" value={String(topN)} onChange={(v)=>setTopN(Number(v))} options={["3","5","8","10"]} />
        {(year!=="All" || category!=="All") && (<ResetBtn onClick={()=>{ setYear("All"); setCategory("All"); }} />)}
      </div>

      {/* Debug chip */}
      <div style={{ textAlign:"center", marginBottom: 8 }}>
        <small style={{ background:"#EEF2FF", border:`1px solid ${COLORS.border}`, padding:"4px 8px", borderRadius:999 }}>
          rows: {rows.length}, filtered: {filtered.length}, series: {series.length}, categories: {byCategory.length}
        </small>
      </div>

      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:16 }}>
        <Kpi title="Total Reports" value={totalReports.toLocaleString()} note="Reports with loss" color={COLORS.kpiBlue} />
        <Kpi title="Total Loss" value={`$${totalLoss.toFixed(1)}m`} note="Financial losses" color={COLORS.kpiGreen} />
        <Kpi title="Avg Loss / Report" value={`$${avgLoss.toFixed(3)}m`} note="Loss ÷ Reports" color={COLORS.kpiRed} />
        {monthRanks.maxLoss && (<Kpi title="Peak Loss Month" value={monthRanks.maxLoss} note="Highest monthly loss" color={COLORS.kpiIndigo} />)}
      </div>

      {/* Change chip */}
      {lastChange && (
        <div style={{ textAlign:"center", marginBottom:18, color:COLORS.text }}>
          <small style={{ background:"#F3F4F6", padding:"6px 10px", borderRadius:999, border:`1px solid ${COLORS.border}` }}>
            Last month ({lastChange.month}): Loss {fmtDelta(lastChange.diffLoss)}m ({lastChange.pctLoss.toFixed(1)}%), Reports {fmtDelta(lastChange.diffRep)} ({lastChange.pctRep.toFixed(1)}%)
          </small>
        </div>
      )}

      {/* Charts row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:18, marginBottom:18 }}>
        <Card title="Financial loss ($m)" subtitle="Monthly trend">
          <ResponsiveChart>{(w) => <LossLine data={series} width={w} height={260} />}</ResponsiveChart>
        </Card>
        <Card title="Reports with loss" subtitle="Monthly counts">
          <ResponsiveChart>{(w) => <ReportsBars data={series} width={w} height={260} />}</ResponsiveChart>
        </Card>
      </div>

      {/* Charts row 2 — Category views: ALWAYS rendered; show message if empty */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:18, marginBottom:18 }}>
        <Card title="Loss by Category (share)" subtitle={`Top ${topN} categories`}>
          {byCategory.length ? (
            <>
              <ResponsiveChart minWidth={320}>
                {(w) => <CategoryPie data={byCategory.slice(0, topN)} width={w} height={260} />}
              </ResponsiveChart>
              <Legend items={byCategory.slice(0, topN).map((c, i)=>({label:c.name, color:PALETTE[i%PALETTE.length]}))} />
            </>
          ) : (
            <p style={{ color: COLORS.subtext }}>No category data found.</p>
          )}
        </Card>

        <Card title="Loss by Category ($m)" subtitle={`Top ${topN} categories`}>
          {byCategory.length ? (
            <ResponsiveChart>{(w) => <CategoryBars data={byCategory.slice(0, topN)} width={w} height={260} />}</ResponsiveChart>
          ) : (
            <p style={{ color: COLORS.subtext }}>No category data found.</p>
          )}
        </Card>
      </div>

      {/* Table */}
      <Card title={`Top ${topN} Categories`} subtitle="Sorted by loss ($m)">
        {byCategory.length ? (
          <CategoryTable rows={byCategory.slice(0, topN)} totalLoss={totalLoss} />
        ) : (
          <p style={{ color: COLORS.subtext }}>No category data found.</p>
        )}
      </Card>
    </section>
  );
}

/* ------------------------------- UI basics ------------------------------ */
function Kpi({ title, value, note, color }: { title: string; value: string; note?: string; color: string }) {
  return (
    <div style={{ backgroundColor: color, color: "white", borderRadius: 14, padding: "18px 16px", textAlign: "center", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }} aria-label={`${title}: ${value}${note ? ` (${note})` : ""}`}>
      <div style={{ fontSize: 13, opacity: 0.95 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1, margin: "6px 0" }}>{value}</div>
      {note && <div style={{ fontSize: 12, opacity: 0.95 }}>{note}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div style={{ background:"white", border:`1px solid ${COLORS.border}`, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }} role="region" aria-label={title}>
      <h3 style={{margin:0, color:"#1E3A8A", fontWeight:700}}>{title}</h3>
      {subtitle && <p style={{margin:"4px 0 10px", color:COLORS.subtext, fontSize:13}}>{subtitle}</p>}
      {children}
    </div>
  );
}

/* UPDATED: White & bold filter labels */
function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        color: "#FFFFFF",   // white label text
        fontWeight: 700,    // bold label text
        fontSize: 13,
      }}
    >
      <span>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: `1px solid ${COLORS.border}`,
          borderRadius: 10,
          padding: "6px 10px",
          background: "white",
          color: COLORS.text, // keep select text dark for readability
        }}
      >
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResetBtn({ onClick }: { onClick: ()=>void }) {
  return (
    <button onClick={onClick} style={{ border:`1px solid ${COLORS.border}`, background:"#FFFFFF", borderRadius:999, padding:"6px 12px", cursor:"pointer", fontSize:13 }} aria-label="Reset filters">
      Reset filters
    </button>
  );
}

/* --------------------------- Responsive wrapper -------------------------- */
function ResponsiveChart({ children, minWidth = 360 }: { children: (width: number) => React.ReactNode; minWidth?: number; }) {
  const [ref, width] = useContainerWidth<HTMLDivElement>(minWidth);
  return <div ref={ref} style={{ width: "100%" }}>{children(width)}</div>;
}

/* --------------------------------- Charts -------------------------------- */
function LossLine({ data, width, height }: { data: Point[]; width: number; height: number }) {
  const pad = 36;
  const W = Math.max(360, width);
  const H = height;
  const maxY = Math.max(1, ...data.map((d) => d.loss));
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
  const y = (v: number) => H - pad - (v / maxY) * (H - pad * 2);
  const pts = data.map((d, i) => [pad + i * stepX, y(d.loss)]);
  const dPath = "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad + (1 - t) * (H - pad * 2);
        const gv = (maxY * t).toFixed(0);
        return (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke={COLORS.grid} />
            <text x={8} y={gy + 4} fontSize="11" fill="#374151">{gv}</text>
          </g>
        );
      })}
      {data.map((d, i) => (
        <text key={i} x={pad + i * stepX} y={H - 8} fontSize="10" fill={COLORS.subtext} textAnchor="middle">{d.month}</text>
      ))}
      <path d={dPath} fill="none" stroke={COLORS.line} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ReportsBars({ data, width, height }: { data: Point[]; width: number; height: number }) {
  const pad = 36;
  const W = Math.max(360, width);
  const H = height;
  const gap = 6;
  const maxY = Math.max(1, ...data.map((d) => d.reports));
  const barW = (W - pad * 2 - gap * (data.length - 1)) / Math.max(1, data.length);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad + (1 - t) * (H - pad * 2);
        const gv = Math.round(maxY * t);
        return (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke={COLORS.grid} />
            <text x={8} y={gy + 4} fontSize="11" fill="#374151">{gv}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.reports / maxY) * (H - pad * 2);
        const x = pad + i * (barW + gap);
        const y = H - pad - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={h} rx={4} fill={COLORS.bar} />
            <text x={x + barW / 2} y={H - 8} fontSize="10" fill={COLORS.subtext} textAnchor="middle">{d.month}</text>
          </g>
        );
      })}
    </svg>
  );
}

function CategoryPie({ data, width, height }: { data: { name: string; loss: number }[]; width: number; height: number; }) {
  const W = Math.max(320, width);
  const H = height;
  const cx = W / 2, cy = H / 2 + 6, r = Math.min(120, Math.floor(W / 4)), inner = Math.max(40, Math.floor(r * 0.55));
  const total = Math.max(1, data.reduce((s, d) => s + d.loss, 0));

  let start = -Math.PI / 2;
  const arcs = data.map((d, idx) => {
    const angle = (d.loss / total) * Math.PI * 2;
    const end = start + angle;
    const path = donutArc(cx, cy, r, inner, start, end);
    start = end;
    return { path, color: PALETTE[idx % PALETTE.length], name: d.name, value: d.loss };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {arcs.map((a, i) => <path key={i} d={a.path} fill={a.color} stroke="white" strokeWidth={1} />)}
      <text x={cx} y={cy - 4} fontSize="16" fontWeight={700} textAnchor="middle" fill={COLORS.text}>${total.toFixed(0)}m</text>
      <text x={cx} y={cy + 14} fontSize="11" textAnchor="middle" fill={COLORS.subtext}>total loss</text>
    </svg>
  );
}

function donutArc(cx: number, cy: number, r: number, r0: number, start: number, end: number) {
  const large = end - start > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.cos(start), y0 = cy + r * Math.sin(start);
  const x1 = cx + r * Math.cos(end),   y1 = cy + r * Math.sin(end);
  const x2 = cx + r0 * Math.cos(end),  y2 = cy + r0 * Math.sin(end);
  const x3 = cx + r0 * Math.cos(start),y3 = cy + r0 * Math.sin(start);
  return [`M ${x0} ${y0}`, `A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`, `L ${x2} ${y2}`, `A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3}`, "Z"].join(" ");
}

function CategoryBars({ data, width, height }: { data: { name: string; loss: number }[]; width: number; height: number; }) {
  const pad = 36;
  const W = Math.max(360, width);
  const H = height;
  const gap = 8;
  const max = Math.max(1, ...data.map((d) => d.loss));
  const barH = (H - pad * 2 - gap * (data.length - 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H }}>
      {data.map((d, i) => {
        const w = (d.loss / max) * (W - pad * 2);
        const y = pad + i * (barH + gap);
        return (
          <g key={i}>
            <rect x={pad} y={y} width={w} height={barH} rx={6} fill={PALETTE[i % PALETTE.length]} />
            <text x={pad - 8} y={y + barH / 2 + 4} fontSize="12" fill={COLORS.text} textAnchor="end">{d.name}</text>
            <text x={pad + w + 6} y={y + barH / 2 + 4} fontSize="12" fill={COLORS.subtext}>${d.loss.toFixed(1)}m</text>
          </g>
        );
      })}
    </svg>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
      {items.map((it, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.text }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function CategoryTable({ rows, totalLoss }: { rows: { name: string; loss: number; reports: number }[]; totalLoss: number }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#F9FAFB" }}>
            <Th>Category</Th>
            <Th align="right">Reports</Th>
            <Th align="right">Loss ($m)</Th>
            <Th align="right">% of Total Loss</Th>
            <Th align="right">Avg Loss / Report ($m)</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <Td>{r.name}</Td>
              <Td align="right">{r.reports.toLocaleString()}</Td>
              <Td align="right">{r.loss.toFixed(2)}</Td>
              <Td align="right">{totalLoss ? ((r.loss / totalLoss) * 100).toFixed(1) : "0.0"}%</Td>
              <Td align="right">{r.reports ? (r.loss / r.reports).toFixed(3) : "0.000"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, align = "left" }: React.PropsWithChildren<{ align?: "left" | "right" }>) {
  return <th style={{ textAlign: align, color: COLORS.subtext, fontWeight: 600, fontSize: 12, padding: "10px 8px" }}>{children}</th>;
}
function Td({ children, align = "left" }: React.PropsWithChildren<{ align?: "left" | "right" }>) {
  return <td style={{ textAlign: align, color: COLORS.text, fontSize: 13, padding: "10px 8px" }}>{children}</td>;
}

/* -------------------------------- Helpers ------------------------------- */
function fmtDelta(v: number) {
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}`;
}
