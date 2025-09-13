import React, { useMemo, useState } from "react";

/**
 * Landing Dashboard & Insights — polished layout
 * - Centered container (max-w-6xl)
 * - Compact time-range segmented control
 * - KPIs centered
 * - 4 equal cards grid (2×2) with consistent heights
 * - Soft cards, subtle gradient headers
 * (No external chart lib; simple SVG/CSS)
 */

type DayPoint = { date: string; scans: number; detected: number };
type RangeKey = "7d" | "30d" | "90d";

function generateMockData(totalDays: number): DayPoint[] {
  const today = new Date();
  const data: DayPoint[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const scans = 40 + Math.floor(Math.random() * 80);
    const detected = Math.max(0, Math.floor(scans * (0.12 + Math.random() * 0.08)));
    data.push({ date: d.toISOString().slice(0, 10), scans, detected });
  }
  return data;
}
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

const LandingDashboard: React.FC = () => {
  const [range, setRange] = useState<RangeKey>("30d");

  const base = useMemo(() => generateMockData(90), []);
  const slice = useMemo(() => (range === "7d" ? base.slice(-7) : range === "30d" ? base.slice(-30) : base), [base, range]);

  const totals = useMemo(() => {
    const totalScans = sum(slice.map((d) => d.scans));
    const totalDetected = sum(slice.map((d) => d.detected));
    return { totalScans, totalDetected, rate: totalScans ? totalDetected / totalScans : 0 };
  }, [slice]);

  const category = useMemo(() => {
    const phish = Math.round(totals.totalDetected * 0.46);
    const impersonation = Math.round(totals.totalDetected * 0.34);
    const malware = Math.max(0, totals.totalDetected - phish - impersonation);
    return { phish, impersonation, malware };
  }, [totals.totalDetected]);

  const recent = useMemo(
    () =>
      [...slice].slice(-6).reverse().map((d, i) => ({
        id: `CASE-${(Math.random() * 1e6) | 0}`,
        date: d.date,
        type: i % 3 === 0 ? "Phishing" : i % 3 === 1 ? "Impersonation" : "Malware",
        status: i % 2 === 0 ? "Flagged" : "Blocked",
      })),
    [slice]
  );

  return (
    <section className="px-4 py-10">
      {/* container */}
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-blue-50 via-white to-bluedark p-10">
          <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
          <div className="relative text-center">
            <span className="inline-block mb-3 text-[11px] font-semibold tracking-wide rounded-full px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow">
              Landing Dashboard & Insights
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              TrustLens Overview
            </h1>
            <p className="mx-auto max-w-2xl text-sm md:text-base leading-relaxed text-neutral-700">
              Key statistics and trends at a glance—scans, detections, risk distribution, and recent cases.
            </p>
            <div className="mt-5 h-1 w-24 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
          </div>
        </div>

        {/* Controls + KPIs */}
        <div className="mt-8 flex flex-col items-center gap-6">
          {/* compact segmented control */}
          <Segmented
            value={range}
            onChange={(v) => setRange(v as RangeKey)}
            options={[
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
              { value: "90d", label: "90d" },
            ]}
          />

          {/* KPI cards centered */}
          <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
            <Kpi title="Total Scans" value={totals.totalScans.toLocaleString()} hint={`${slice.length} days`} />
            <Kpi title="Detected Scams" value={totals.totalDetected.toLocaleString()} hint="Flagged/Blocked" />
            <Kpi title="Detection Rate" value={pct(totals.rate)} hint="Detected / Scans" />
          </div>
        </div>

        {/* Charts grid 2×2 (equal heights) */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card title="Trend: Scans vs Detected" subtitle="Daily counts for the selected period.">
            <div className="aspect-[16/10]">
              <LineChart
                data={slice}
                series={[
                  { key: "scans", label: "Scans", color: "#2563EB" },
                  { key: "detected", label: "Detected", color: "#06B6D4" },
                ]}
              />
            </div>
            <Legend items={[{ label: "Scans", color: "#2563EB" }, { label: "Detected", color: "#06B6D4" }]} />
          </Card>

          <Card title="Detection Share" subtitle="Share of detected by category">
            <div className="flex h-full items-center justify-center gap-6">
              <Donut
                values={[
                  { label: "Phishing", value: category.phish, color: "#2563EB" },
                  { label: "Impersonation", value: category.impersonation, color: "#0EA5E9" },
                  { label: "Malware", value: category.malware, color: "#06B6D4" },
                ]}
                size={180}
                thickness={28}
              />
              <div className="space-y-2 text-sm">
                <Legend
                  items={[
                    { label: `Phishing (${category.phish})`, color: "#2563EB" },
                    { label: `Impersonation (${category.impersonation})`, color: "#0EA5E9" },
                    { label: `Malware (${category.malware})`, color: "#06B6D4" },
                  ]}
                />
              </div>
            </div>
          </Card>

          <Card title="Weekly Buckets (Detected)" subtitle="Grouped by week for the selected period">
            <div className="aspect-[16/10]">
              <BarChart data={slice} color="#2563EB" />
            </div>
          </Card>

          <Card title="Recent Cases" subtitle="Latest flagged or blocked items">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-500">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2 font-mono text-xs">{r.id}</td>
                      <td className="py-2">{r.date}</td>
                      <td className="py-2">{r.type}</td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                            r.status === "Blocked" ? "bg-blue-100 text-blue-700" : "bg-cyan-100 text-cyan-700"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

/* ----------------- UI components ----------------- */

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="inline-flex items-center rounded-full border bg-white p-1 shadow-sm">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              active ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow" : "text-neutral-700 hover:bg-neutral-100"
            }`}
            type="button"
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white/80 p-4 shadow-sm">
      <div className="text-xs text-neutral-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-blue-800">{value}</div>
      {hint && <div className="mt-1 text-xs text-neutral-500">{hint}</div>}
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: React.PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div className="rounded-2xl border bg-white/80 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-semibold text-blue-800">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-600">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex flex-col gap-2 text-xs">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: i.color }} />
          <span className="text-neutral-700">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ----------------- Charts (SVG/CSS) ----------------- */

function LineChart({
  data,
  height = 220,
  padding = 28,
  series,
}: {
  data: DayPoint[];
  height?: number;
  padding?: number;
  series: { key: keyof DayPoint; label: string; color: string }[];
}) {
  const width = 700;
  const maxY = Math.max(10, ...series.map((s) => Math.max(...data.map((d) => (d[s.key] as number) || 0))));
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
  const scaleY = (v: number) => height - padding - (v / maxY) * (height - padding * 2);

  const yTicks = 4;
  const grid = Array.from({ length: yTicks + 1 }, (_, i) => {
    const y = padding + ((height - padding * 2) * i) / yTicks;
    const value = Math.round(maxY - (maxY * i) / yTicks);
    return { y, value };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {grid.map((g, idx) => (
        <g key={idx}>
          <line x1={padding} x2={width - padding} y1={g.y} y2={g.y} stroke="#E5E7EB" strokeWidth={1} />
          <text x={8} y={g.y + 4} fontSize="10" fill="#6B7280">
            {g.value}
          </text>
        </g>
      ))}
      {series.map((s) => {
        const points = data.map((d, i) => [padding + i * stepX, scaleY(d[s.key] as number)]);
        const dPath = "M " + points.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
        return <path key={String(s.key)} d={dPath} fill="none" stroke={s.color} strokeWidth={2.2} strokeLinejoin="round" strokeLinecap="round" />;
      })}
    </svg>
  );
}

function groupWeekly(data: DayPoint[]) {
  const copy = [...data];
  const buckets: { label: string; detected: number }[] = [];
  while (copy.length > 0) {
    const chunk = copy.splice(Math.max(copy.length - 7, 0), 7);
    buckets.unshift({ label: buckets.length === 0 ? "This" : `Wk-${buckets.length}`, detected: sum(chunk.map((c) => c.detected)) });
  }
  return buckets.slice(-5);
}

function BarChart({ data, height = 220, color = "#2563EB" }: { data: DayPoint[]; height?: number; color?: string }) {
  const buckets = groupWeekly(data);
  const width = 700;
  const padding = 28;
  const gap = 12;
  const barW = (width - padding * 2 - gap * (buckets.length - 1)) / buckets.length;
  const maxV = Math.max(10, ...buckets.map((b) => b.detected));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {[0, 1, 2, 3, 4].map((i) => {
        const y = padding + ((height - padding * 2) * i) / 4;
        const val = Math.round(maxV - (maxV * i) / 4);
        return (
          <g key={i}>
            <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#E5E7EB" />
            <text x={8} y={y + 4} fontSize="10" fill="#6B7280">
              {val}
            </text>
          </g>
        );
      })}
      {buckets.map((b, i) => {
        const h = ((b.detected / maxV) * (height - padding * 2)) || 0;
        const x = padding + i * (barW + gap);
        const y = height - padding - h;
        return (
          <g key={b.label}>
            <rect x={x} y={y} width={barW} height={h} rx={6} fill={color} />
            <text x={x + barW / 2} y={height - padding + 14} fontSize="10" textAnchor="middle" fill="#6B7280">
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Donut({
  values,
  size = 180,
  thickness = 28,
}: {
  values: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
}) {
  const total = sum(values.map((v) => v.value));
  let acc = 0;
  const stops = values.map((v) => {
    const start = (acc / total) * 360;
    const end = ((acc + v.value) / total) * 360;
    acc += v.value;
    return `${v.color} ${start}deg ${end}deg`;
  });
  const bg = `conic-gradient(${stops.join(",")})`;

  return (
    <div className="relative mx-auto rounded-full" style={{ width: size, height: size, background: bg }}>
      <div
        className="absolute inset-0 m-auto rounded-full bg-white"
        style={{ width: size - thickness * 2, height: size - thickness * 2, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)" }}
      />
    </div>
  );
}

export default LandingDashboard;
