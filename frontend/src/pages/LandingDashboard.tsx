import React, { useMemo, useState } from "react";

/** TrustLens — Landing Dashboard (final) */

type DayPoint = { date: string; scans: number; detected: number };
type RangeKey = "7d" | "30d" | "90d";

const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;


const COLORS = {
  scans: "#4F46E5",          // Indigo 
  detected: "#F97316",       // Orange
  phishing: "#6366F1",       // Indigo 
  impersonation: "#F97316",  // Orange
  malware: "#10B981",        // Green 
} as const;


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

const LandingDashboard: React.FC = () => {
  const [range, setRange] = useState<RangeKey>("30d");

  const base = useMemo(() => generateMockData(90), []);
  const slice = useMemo(
    () => (range === "7d" ? base.slice(-7) : range === "30d" ? base.slice(-30) : base),
    [base, range]
  );

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

  const donutValues = useMemo(
    () => [
      { label: "Phishing", value: category.phish, color: COLORS.phishing },
      { label: "Impersonation", value: category.impersonation, color: COLORS.impersonation },
      { label: "Malware", value: category.malware, color: COLORS.malware },
    ],
    [category]
  );

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
    <section className="px-4 py-10 bg-gradient-to-b from-white via-blue-50/30 to-white">
      <div className="mx-auto max-w-6xl">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-blue-50 via-white to-blue-100 p-10 shadow-md">
          <div className="relative text-center">
            <span className="inline-block mb-3 text-[12px] font-semibold tracking-wide rounded-full px-4 py-1 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow">
              Landing Dashboard & Insights
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-500 bg-clip-text text-transparent">
              TrustLens Overview
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-neutral-800">
              Key statistics and trends at a glance—scans, detections, risk distribution, and recent cases.
            </p>
          </div>
        </div>

        {/*  KPI */}
        <div className="mt-8 flex flex-col items-center gap-6">
          <Segmented
            value={range}
            onChange={(v) => setRange(v as RangeKey)}
            options={[
              { value: "7d", label: "7 Days" },
              { value: "30d", label: "30 Days" },
              { value: "90d", label: "90 Days" },
            ]}
          />

          {/* KPI row box*/}
          <div className="flex flex-wrap justify-center gap-4">
            <KpiCard
              title="Total Scans"
              value={totals.totalScans.toLocaleString()}
              hint={`${slice.length} days`}
              color="#3B82F6"        // blue
              widthClass="w-64"
            />
            <KpiCard
              title="Detection Rate"
              value={pct(totals.rate)}
              hint="Detected / Scans"
              color="#F87171"        // pink
              widthClass="w-64"
            />
            <KpiCard
              title="Detected Scams"
              value={totals.totalDetected.toLocaleString()}
              hint="Flagged/Blocked"
              color="#10B981"        // Green
              widthClass="w-64"
            />
          </div>
        </div>

        {/* Chart */}
        <div className="mt-12 grid gap-7 md:grid-cols-2">
          <Card title="Trend: Scans vs Detected" subtitle="Daily counts for the selected period.">
            <div className="aspect-[16/10] -mb-2">
              <LineChart
                data={slice}
                series={[
                  { key: "scans", label: "Scans", color: COLORS.scans },
                  { key: "detected", label: "Detected", color: COLORS.detected },
                ]}
                showEndLabels
              />
            </div>
            {/* legend */}
            <div className="mt-2 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS.scans }} />
                Scans
              </span>
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: COLORS.detected }} />
                Detected
              </span>
            </div>
          </Card>

          <Card title="Detection Share" subtitle="Share of detected by category">
            <div className="flex items-center justify-center gap-8 p-2">
              <Donut values={donutValues} size={220} thickness={28} showPercentLabels />
              <Legend
                items={donutValues.map((v) => ({
                  label: `${v.label} (${v.value}, ${Math.round(
                    (v.value / Math.max(1, donutValues.reduce((s, x) => s + x.value, 0))) * 100
                  )}%)`,
                  color: v.color,
                }))}
              />
            </div>
          </Card>

          <Card title="Weekly Buckets (Detected)" subtitle="Grouped by week for the selected period">
            <div className="aspect-[16/10]">
              <BarChart data={slice} color={COLORS.scans} />
            </div>
          </Card>

          <Card title="Recent Cases" subtitle="Latest flagged or blocked items">
            <CasesTable rows={recent} />
          </Card>
        </div>
      </div>
    </section>
  );
};

/* ---------------- UI components ---------------- */

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
            className={`px-3 py-1.5 text-sm rounded-full transition font-medium ${
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

/* KPI */
function KpiCard({
  title,
  value,
  hint,
  color,
  widthClass = "w-56",
}: {
  title: string;
  value: string;
  hint?: string;
  color: string;       
  widthClass?: string; 
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-white rounded-md shadow-md px-6 py-4 ${widthClass}`}
      style={{ backgroundColor: color }}
    >
      <div className="text-sm font-medium opacity-90 text-center">{title}</div>
      <div className="text-2xl font-extrabold leading-tight text-center">{value}</div>
      {hint && <div className="text-xs opacity-90 text-center">{hint}</div>}
    </div>
  );
}

/* padding card*/
function Card({ title, subtitle, children }: React.PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <div className="rounded-2xl border bg-white/90 pt-7 px-6 pb-8 shadow-sm overflow-hidden">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-700">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

/* legend */
function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-1 flex flex-col gap-2 text-sm min-w-[220px]">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2">
          <span className="inline-block h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ background: i.color }} />
          <span className="font-medium text-neutral-800">{i.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Table ---------------- */
function CasesTable({
  rows,
}: {
  rows: { id: string; date: string; type: string; status: "Flagged" | "Blocked" }[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="min-w-full table-fixed">
        <colgroup>
          <col className="w-[36%]" />
          <col className="w-[22%]" />
          <col className="w-[22%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead className="sticky top-0 z-[1] bg-neutral-50">
          <tr className="text-sm text-neutral-700">
            <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase">ID</th>
            <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase">Date</th>
            <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase">Type</th>
            <th className="px-4 py-3 text-left font-semibold tracking-wide uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm md:text-base">
          {rows.map((r, idx) => (
            <tr
              key={r.id}
              className={`border-t transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-neutral-50/60"} hover:bg-blue-50/50`}
            >
              <td className="px-4 py-3 align-middle">
                <span title={r.id} className="inline-block max-w-[260px] truncate font-mono text-[13px] md:text-sm text-neutral-800">
                  {r.id}
                </span>
              </td>
              <td className="px-4 py-3 align-middle whitespace-nowrap text-neutral-800">{r.date}</td>
              <td className="px-4 py-3 align-middle whitespace-nowrap text-neutral-900 font-medium">{r.type}</td>
              <td className="px-4 py-3 align-middle">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs md:text-[13px] font-semibold ${
                    r.status === "Blocked"
                      ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/50"
                      : "bg-amber-100 text-amber-800 ring-1 ring-amber-300/50"
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
  );
}

/* ---------------- Charts (pure SVG) ---------------- */

function LineChart({
  data,
  height = 240,
  padding = 36,
  series,
  showEndLabels = false,
}: {
  data: DayPoint[];
  height?: number;
  padding?: number;
  series: { key: keyof DayPoint; label: string; color: string }[];
  showEndLabels?: boolean;
}) {
  const width = 700;
  const maxY = Math.max(10, ...series.map((s) => Math.max(...data.map((d) => (d[s.key] as number) || 0))));
  const stepX = (width - padding * 2) / Math.max(1, data.length - 1);
  const scaleY = (v: number) => height - padding - (v / maxY) * (height - padding * 2);

  const yTicks = 5;
  const grid = Array.from({ length: yTicks + 1 }, (_, i) => {
    const y = padding + ((height - padding * 2) * i) / yTicks;
    const value = Math.round(maxY - (maxY * i) / yTicks);
    return { y, value };
  });

  const endPoints = series.map((s) => {
    const lastIdx = data.length - 1;
    const x = padding + lastIdx * stepX;
    const y = scaleY(data[lastIdx][s.key] as number);
    return { x, y, s };
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
      {grid.map((g, idx) => (
        <g key={idx}>
          <line x1={padding} x2={width - padding} y1={g.y} y2={g.y} stroke="#E5E7EB" strokeWidth={1} />
          <text x={10} y={g.y + 5} fontSize="12" fill="#374151">
            {g.value}
          </text>
        </g>
      ))}
      {series.map((s) => {
        const pts = data.map((d, i) => [padding + i * stepX, scaleY(d[s.key] as number)]);
        const dPath = "M " + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
        return (
          <path key={String(s.key)} d={dPath} fill="none" stroke={s.color} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
        );
      })}
      {showEndLabels &&
        endPoints.map(({ x, y, s }) => (
          <g key={String(s.key)} transform={`translate(${x + 6}, ${y})`}>
            
            <text x={0} y={4} fontSize="12" fontWeight={700} fill="#fff" stroke="#fff" strokeWidth={3}>
              {s.label}
            </text>
            <text x={0} y={4} fontSize="12" fontWeight={700} fill={s.color}>
              {s.label}
            </text>
          </g>
        ))}
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

function BarChart({ data, height = 240, color = COLORS.scans }: { data: DayPoint[]; height?: number; color?: string }) {
  const buckets = groupWeekly(data);
  const width = 700;
  const padding = 36;
  const gap = 14;
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
            <text x={10} y={y + 5} fontSize="12" fill="#374151">
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
            <text x={x + barW / 2} y={height - padding + 16} fontSize="12" textAnchor="middle" fill="#374151">
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
  size = 220,
  thickness = 28,
  showPercentLabels = true,
  minLabelPct = 0.06,
}: {
  values: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  showPercentLabels?: boolean;
  minLabelPct?: number;
}) {
  const total = values.reduce((s, v) => s + v.value, 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - thickness / 2;
  const C = 2 * Math.PI * r;
  let acc = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto block">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={thickness} />
      {values.map((v) => {
        const p = v.value / total;
        const start = acc;
        const mid = start + p / 2;
        acc += p;

        return (
          <g key={v.label} transform={`rotate(-90 ${cx} ${cy})`}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={v.color}
              strokeWidth={thickness}
              strokeDasharray={`${p * C} ${C}`}
              strokeDashoffset={C * (1 - start)}
              strokeLinecap="butt"
            />
            {showPercentLabels && p >= minLabelPct && (() => {
              const angle = -Math.PI / 2 + 2 * Math.PI * mid;
              const x = cx + r * Math.cos(angle);
              const y = cy + r * Math.sin(angle);
              const percent = Math.round(p * 100);
              return (
                <g transform={`rotate(90 ${cx} ${cy})`}>
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight={700} fill="#fff" stroke="#fff" strokeWidth={3}>
                    {percent}%
                  </text>
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight={700} fill={v.color}>
                    {percent}%
                  </text>
                </g>
              );
            })()}
          </g>
        );
      })}
    </svg>
  );
}

export default LandingDashboard;
