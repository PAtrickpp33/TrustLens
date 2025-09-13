import React, { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

/**
 * TrustLens Scam Dashboard — Final (color fix)
 * - می‌خواند از public/scam_data.csv
 * - رنگ KPI ها با inline style (hex) ست می‌شود تا بدون Tailwind هم رنگی باشند
 */

type Row = {
  Month: string;
  Year: string;
  Category?: string;
  Reports: number;
  LossMillions: number;
};

type Point = { label: string; reports: number; loss: number };

const COLORS = {
  kpiBlue: "#3B82F6",   // آبی
  kpiGreen: "#10B981",  // سبز
  kpiRed: "#F43F5E",    // قرمز رز
  line: "#2563EB",
  bar: "#F97316",
};

export default function LandingDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);

  // load CSV
  useEffect(() => {
    Papa.parse<Row>("/scam_data.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (res) => {
        const data = (res.data as Row[]).filter(
          (r) => r.Month && r.Year && !Number.isNaN(r.Reports) && !Number.isNaN(r.LossMillions)
        );
        setRows(data);
      },
      error: (err) => setError(err.message || "CSV parse error"),
    });
  }, []);

  const series: Point[] = useMemo(() => {
    if (!rows.length) return [];
    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const key = (m: string, y: string|number) => `${String(y).padStart(4,"0")}-${String(monthOrder.indexOf(m)).padStart(2,"0")}`;
    const map = new Map<string, Point>();
    rows.forEach((r) => {
      const k = `${r.Year}-${r.Month}`;
      const label = `${r.Month} ${r.Year}`;
      if (!map.has(k)) map.set(k, { label, reports: 0, loss: 0 });
      const p = map.get(k)!;
      p.reports += Number(r.Reports || 0);
      p.loss += Number(r.LossMillions || 0);
    });
    return Array.from(map.values()).sort((a, b) => key(a.label.split(" ")[0], a.label.split(" ")[1])
      .localeCompare(key(b.label.split(" ")[0], b.label.split(" ")[1])));
  }, [rows]);

  const totalReports = series.reduce((s, p) => s + p.reports, 0);
  const totalLoss = series.reduce((s, p) => s + p.loss, 0);
  const avgLoss = totalReports ? totalLoss / totalReports : 0;

  if (error) {
    return (
      <div style={{maxWidth: '900px', margin: '2rem auto', border:'1px solid #FCD34D', background:'#FFFBEB', padding:'1rem', borderRadius:12, color:'#92400E'}}>
        خطا در خواندن <code>/scam_data.csv</code>: {error}
      </div>
    );
  }
  if (!series.length) {
    return <div style={{padding:'2rem', textAlign:'center', color:'#4B5563'}}>در حال بارگذاری داده‌ها…</div>;
  }

  return (
    <section style={{padding:'2.5rem 1.5rem', maxWidth: 1100, margin: '0 auto'}}>
      {/* Header */}
      <div style={{textAlign:'center', marginBottom: '1.5rem'}}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          backgroundImage: 'linear-gradient(90deg, #1d4ed8, #06b6d4, #3b82f6)',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
          margin: 0
        }}>
          TrustLens Scam Dashboard
        </h1>
        <p style={{color:'#4B5563', marginTop: 6}}>
          Based on NASC/Scamwatch (Targeting Scams 2024) — locally served CSV.
        </p>
      </div>

      {/* KPIs (سه باکس رنگی) */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '28px'
      }}>
        <Kpi title="Total Reports" value={totalReports.toLocaleString()} note="Reports with loss" color={COLORS.kpiBlue} />
        <Kpi title="Total Loss" value={`$${totalLoss.toFixed(1)}m`} note="Financial losses" color={COLORS.kpiGreen} />
        <Kpi title="Avg Loss / Report" value={`$${avgLoss.toFixed(3)}m`} note="Loss ÷ Reports" color={COLORS.kpiRed} />
      </div>

      {/* Charts */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '18px'
      }}>
        <Card title="Financial loss ($m)" subtitle="Monthly trend">
          <LossLine data={series} />
        </Card>
        <Card title="Reports with loss" subtitle="Monthly counts">
          <ReportsBars data={series} />
        </Card>
      </div>
    </section>
  );
}

/* ---------- UI ---------- */
function Kpi({ title, value, note, color }: { title: string; value: string; note?: string; color: string }) {
  return (
    <div style={{
      backgroundColor: color,
      color: 'white',
      borderRadius: 14,
      padding: '18px 16px',
      textAlign: 'center',
      boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
    }}>
      <div style={{fontSize: 13, opacity: 0.95}}>{title}</div>
      <div style={{fontSize: 24, fontWeight: 800, lineHeight: 1.1, margin: '6px 0'}}>{value}</div>
      {note && <div style={{fontSize: 12, opacity: 0.95}}>{note}</div>}
    </div>
  );
}

function Card({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div style={{
      background: 'white',
      border: '1px solid #E5E7EB',
      borderRadius: 16,
      padding: 16,
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{margin: 0, color:'#1E3A8A', fontWeight: 700}}>{title}</h3>
      {subtitle && <p style={{margin: '4px 0 10px', color:'#6B7280', fontSize: 13}}>{subtitle}</p>}
      {children}
    </div>
  );
}

/* ---------- Simple SVG Charts (no external lib needed) ---------- */
function LossLine({ data }: { data: Point[] }) {
  const W = 600, H = 260, pad = 36;
  const maxY = Math.max(1, ...data.map((d) => d.loss));
  const stepX = (W - pad * 2) / Math.max(1, data.length - 1);
  const y = (v: number) => H - pad - (v / maxY) * (H - pad * 2);
  const pts = data.map((d, i) => [pad + i * stepX, y(d.loss)]);
  const dPath = "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height: 260}}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad + (1 - t) * (H - pad * 2);
        const gv = (maxY * t).toFixed(0);
        return (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke="#E5E7EB" />
            <text x={8} y={gy + 4} fontSize="11" fill="#374151">{gv}</text>
          </g>
        );
      })}
      <path d={dPath} fill="none" stroke={COLORS.line} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ReportsBars({ data }: { data: Point[] }) {
  const W = 600, H = 260, pad = 36, gap = 6;
  const maxY = Math.max(1, ...data.map((d) => d.reports));
  const barW = (W - pad * 2 - gap * (data.length - 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height: 260}}>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const gy = pad + (1 - t) * (H - pad * 2);
        const gv = Math.round(maxY * t);
        return (
          <g key={i}>
            <line x1={pad} x2={W - pad} y1={gy} y2={gy} stroke="#E5E7EB" />
            <text x={8} y={gy + 4} fontSize="11" fill="#374151">{gv}</text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const h = (d.reports / maxY) * (H - pad * 2);
        const x = pad + i * (barW + gap);
        const y = H - pad - h;
        return <rect key={i} x={x} y={y} width={barW} height={h} rx={4} fill={COLORS.bar} />;
      })}
    </svg>
  );
}
