// import { Link } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
impo

/** Story-led ScamHub dashboard with original charts — cleaned filters + hints */

type Row = {
  Month: string;
  Year: string | number;
  Category?: string;
  Reports: number;
  LossMillions: number;
};
type Point = { label: string; month: string; year: string; reports: number; loss: number };

/* ---- Visual constants (white cards so it reads well in light or dark OS theme) ---- */
const COLORS = {
  kpiBlue: "#3B82F6",
  kpiGreen: "#10B981",
  kpiRed: "#F43F5E",
  kpiIndigo: "#4F46E5",
  line: "#2563EB",
  bar: "#F97316",
  text: "#0f172a",
  subtext: "#475569",
  border: "#E5E7EB",
  grid: "#E5E7EB",
  bgSoft: "#F9FAFB",
};
const PALETTE = ["#3B82F6","#10B981","#F59E0B","#EF4444","#8B5CF6","#06B6D4","#84CC16","#F97316","#EC4899","#14B8A6","#A855F7","#D946EF"];
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monthIndex = (m: string) => Math.max(0, MONTHS.indexOf(m));
const monthKey = (m: string, y: string|number) =>
  `${String(y).padStart(4,"0")}-${String(monthIndex(m)+1).padStart(2,"0")}`;

/* ---- Category normalization + friendly meanings ---- */
const normalizeCategory = (c?: string) => {
  const t = (c || "").trim();
  const map: Record<string, string> = {
    Investment: "Investment",
    investment: "Investment",
    Crypto: "Investment",
    Phishing: "Phishing",
    phishing: "Phishing",
    Romance: "Romance",
    romance: "Romance",
    Shopping: "Shopping",
    shopping: "Shopping",
    Job: "Jobs",
    Jobs: "Jobs",
    Employment: "Jobs",
    Other: "Other",
    Unknown: "Other",
  };
  return map[t] || t;
};

const CATEGORY_MEANING: Record<string, string> = {
  Investment: "Fake brokers/crypto platforms and “guaranteed high returns”.",
  Phishing: "Fake logins/attachments to steal passwords, OTPs or card details.",
  Romance: "Catfishing + “emergencies”, money mules, long-con trust plays.",
  Shopping: "Fake stores/marketplace listings; goods never arrive or are counterfeit.",
  Jobs: "Upfront fees, reshipping ‘agent’ schemes, too-good-to-be-true offers.",
  Other: "Mixed/unclear category or not reported.",
};

function useContainerWidth<T extends HTMLElement>(min = 320): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [w, setW] = useState<number>(min);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new ResizeObserver(([entry]) => setW(Math.max(min, Math.floor(entry.contentRect.width))));
    obs.observe(el); return () => obs.disconnect();
  }, [min]);
  return [ref, w];
}

export default function LandingDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  // filters
  const [year, setYear] = useState("All");
  const [category, setCategory] = useState("All");
  const [topN, setTopN] = useState(5);

  useEffect(() => {
    Papa.parse<any>("/scam_data.csv", {
      download: true, header: true, dynamicTyping: true,
      complete: (res) => {
        try {
          const raw = (res.data as any[]).map((r) => ({
            Month: String(r.Month ?? r.month ?? r.MonthName ?? "").trim(),
            Year: r.Year ?? r.year ?? r.YEAR,
            Category: String(r.Category ?? r.category ?? r.Type ?? r.type ?? "").trim(),
            Reports: Number(r.Reports ?? r.reports ?? r.Count ?? r.count ?? 0),
            LossMillions: Number(r.LossMillions ?? r.loss_m ?? r.Loss ?? r.loss ?? r["Loss ($m)"] ?? 0),
          })) as Row[];

          const data = raw.filter(
            (r) => r.Month && MONTHS.includes(String(r.Month)) && r.Year !== undefined &&
                   !Number.isNaN(r.Reports) && !Number.isNaN(r.LossMillions)
          );
          setRows(data);
        } catch (e:any) { setError(e?.message || "Parse error"); }
        finally { setLoading(false); }
      },
      error: (err) => { setError(err.message || "CSV error"); setLoading(false); },
    });
  }, []);

  const years = useMemo(
    () => ["All", ...Array.from(new Set(rows.map(r=>String(r.Year)))).sort()],
    [rows]
  );

  // ONE "All" only + normalized names + strip any accidental "All" from data
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(rows.map(r => normalizeCategory(r.Category)).filter(Boolean))
    )
      .filter(c => c.toLowerCase() !== "all")
      .sort();
    return ["All", ...unique];
  }, [rows]);

  const filtered = useMemo(
    () => rows.filter(r =>
      (year === "All" || String(r.Year) === year) &&
      (category === "All" || normalizeCategory(r.Category) === category)
    ),
    [rows, year, category]
  );

  const series: Point[] = useMemo(() => {
    if (!filtered.length) return [];
    const m = new Map<string, Point>();
    filtered.forEach((r) => {
      const k = `${r.Year}-${r.Month}`;
      if (!m.has(k)) m.set(k, { label: `${r.Month} ${r.Year}`, month: String(r.Month), year: String(r.Year), reports: 0, loss: 0 });
      const p = m.get(k)!; p.reports += r.Reports; p.loss += r.LossMillions;
    });
    return Array.from(m.values()).sort((a,b)=>monthKey(a.month,a.year).localeCompare(monthKey(b.month,b.year)));
  }, [filtered]);

  const totalReports = series.reduce((s,p)=>s+p.reports,0);
  const totalLoss = series.reduce((s,p)=>s+p.loss,0);
  const avgLoss = totalReports ? totalLoss/totalReports : 0;

  const monthRanks = useMemo(() => {
    const byLoss=[...series].sort((a,b)=>b.loss-a.loss);
    const byReports=[...series].sort((a,b)=>b.reports-a.reports);
    return { maxLoss: byLoss[0]?.label, maxReports: byReports[0]?.label };
  }, [series]);

  const lastChange = useMemo(() => {
    if (series.length < 2) return null;
    const prev = series[series.length-2], curr = series[series.length-1];
    const diffLoss = curr.loss-prev.loss, pctLoss = prev.loss? (diffLoss/prev.loss)*100:0;
    const diffRep = curr.reports-prev.reports, pctRep = prev.reports? (diffRep/prev.reports)*100:0;
    return { month: curr.label, diffLoss, pctLoss, diffRep, pctRep };
  }, [series]);

  const byCategory = useMemo(() => {
    const m = new Map<string,{loss:number;reports:number}>();
    filtered.forEach(r=>{
      const k = normalizeCategory(r.Category) || "Unspecified";
      const v = m.get(k) || {loss:0,reports:0};
      v.loss += r.LossMillions; v.reports += r.Reports; m.set(k,v);
    });
    const arr = Array.from(m.entries()).map(([name,v])=>({name,...v}));
    arr.sort((a,b)=>b.loss-a.loss);
    return arr;
  }, [filtered]);

  if (loading) return <div style={{padding:"2rem",textAlign:"center"}}>Loading data…</div>;
  if (error)   return <div style={{padding:"2rem",color:"#991B1B"}}>Error: {String(error)}</div>;
  if (!rows.length) return <div style={{padding:"2rem"}}>No rows in /scam_data.csv.</div>;

  return (
    <section style={{ padding: "2rem 1rem 3rem", maxWidth: 1200, margin: "0 auto" }}>
      {/* HERO */}
      <div
        style={{
          background: "#FFFFFF",
          color: COLORS.text,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 18,
          padding: "22px 18px",
          boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
          marginBottom: 16,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: 800 }}>
          ScamHub — Learn • Check • Act
        </h1>
        <p style={{ margin: "8px 0 0", maxWidth: 820, color: COLORS.subtext }}>
          A story of how scams impact Australians. Explore trends, the riskiest categories, and common red flags — then test yourself.
        </p>
      </div>

      {/* INSIGHT STRIP */}
      <div style={{background:"#EFF6FF",border:`1px solid #BFDBFE`,borderRadius:12,padding:"10px 14px",marginBottom:10,color:"#334155"}}>
        💬 Australians lost <b>${totalLoss.toFixed(0)}m</b> across {totalReports.toLocaleString()} reports in this selection.
      </div>

      {/* FILTERS */}
      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 14,
          padding: 12,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6,
          boxShadow: "0 6px 16px rgba(0,0,0,.05)",
        }}
      >
        <Select label="Year" value={year} onChange={setYear} options={years} />
        {categories.length > 1 && (
          <Select
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories}
            titles={CATEGORY_MEANING}
          />
        )}
        <Select
          label="Top N (table/pie)"
          value={String(topN)}
          onChange={(v) => setTopN(Number(v))}
          options={["3", "5", "8", "10"]}
        />
        {(year !== "All" || category !== "All") && (
          <ResetBtn onClick={() => { setYear("All"); setCategory("All"); }} />
        )}
      </div>

      {/* Category meaning hint */}
      <div style={{ textAlign:"center", marginBottom: 16, color: COLORS.subtext, fontSize: 12 }}>
        {category === "All"
          ? "Tip: choose a category to see its meaning."
          : CATEGORY_MEANING[category] || ""}
      </div>

      {/* SECTION 1 — Big picture with KPIs */}
      <Section title="1) The big picture" blurb="Losses remain high even as report counts fluctuate — scams that succeed are getting more sophisticated.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
          <Kpi title="Total Reports" value={totalReports.toLocaleString()} note="Reports with loss" color={COLORS.kpiBlue}/>
          <Kpi title="Total Loss" value={`$${totalLoss.toFixed(1)}m`} note="Financial losses" color={COLORS.kpiGreen}/>
          <Kpi title="Avg Loss / Report" value={`$${avgLoss.toFixed(3)}m`} note="Loss ÷ Reports" color={COLORS.kpiRed}/>
          {monthRanks.maxLoss && <Kpi title="Peak Loss Month" value={monthRanks.maxLoss} note="Highest monthly loss" color={COLORS.kpiIndigo}/>}
        </div>
        {lastChange && (
          <div style={{ textAlign:"center", marginTop:10 }}>
            <small style={{ background:"#F3F4F6", padding:"6px 10px", borderRadius:999, border:`1px solid ${COLORS.border}`, color:COLORS.text }}>
              Last month ({lastChange.month}): Loss {fmtDelta(lastChange.diffLoss)}m ({lastChange.pctLoss.toFixed(1)}%), Reports {fmtDelta(lastChange.diffRep)} ({lastChange.pctRep.toFixed(1)}%)
            </small>
          </div>
        )}
      </Section>

      {/* SECTION 2 — Trends */}
      <Section title="2) Are things improving?" blurb="Reports dipped in late months, but loss values didn’t fall as much — indicating higher-value scams.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:18 }}>
          <Card title="Financial loss ($m)" subtitle="Monthly trend">
            <ResponsiveChart>{(w)=> <LossLine data={series} width={w} height={260} />}</ResponsiveChart>
          </Card>
          <Card title="Reports with loss" subtitle="Monthly counts">
            <ResponsiveChart>{(w)=> <ReportsBars data={series} width={w} height={260} />}</ResponsiveChart>
          </Card>
        </div>
      </Section>

      {/* SECTION 3 — Categories */}
      <Section title="3) Where does risk come from?" blurb="These categories dominate total losses — use them as red-flag cues.">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:18 }}>
          <Card title="Loss share by category" subtitle={`Top ${topN} categories`}>
            {byCategory.length ? (
              <>
                <ResponsiveChart minWidth={320}>{(w)=> <CategoryPie data={byCategory.slice(0, topN)} width={w} height={260} />}</ResponsiveChart>
                <Legend items={byCategory.slice(0, topN).map((c,i)=>({label:c.name, color: PALETTE[i%PALETTE.length]}))}/>
              </>
            ) : <p style={{ color: COLORS.subtext }}>No category data found.</p>}
          </Card>
          <Card title="Loss ($m) by category" subtitle={`Top ${topN} categories`}>
            {byCategory.length ? (
              <ResponsiveChart>{(w)=> <CategoryBars data={byCategory.slice(0, topN)} width={w} height={260} />}</ResponsiveChart>
            ) : <p style={{ color: COLORS.subtext }}>No category data found.</p>}
          </Card>
        </div>

        <Card title={`Top ${topN} categories`} subtitle="Sorted by loss ($m)">
          {byCategory.length ? <CategoryTable rows={byCategory.slice(0, topN)} totalLoss={totalLoss} /> : <p style={{ color: COLORS.subtext }}>No category data found.</p>}
        </Card>
      </Section>

      {/* Quick Safety Panel */}
      <QuickSafetyPanel />
    </section>
  );
}

/* -------- story helpers -------- */
function Section({ title, blurb, children }:{ title: string; blurb?: string; children: React.ReactNode; }) {
  return (
    <section
      style={{
        margin: "18px 0 22px",
        background: "#FFFFFF",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "16px 20px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.04)",
      }}
    >
      <h2 style={{ margin: 0, color: COLORS.text, fontWeight: 900, fontSize: "1.3rem", lineHeight: 1.25 }}>
        {title}
      </h2>
      {blurb && (
        <p style={{ margin: "6px 0 12px", color: COLORS.subtext }}>
          {blurb}
        </p>
      )}
      {children}
    </section>
  );
}

function QuickSafetyPanel() {
  return (
    <section
      style={{
        marginTop: 10,
        marginBottom: 22,
        borderRadius: 18,
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 10px 28px rgba(0,0,0,.08)",
        background: "linear-gradient(180deg, #0ea5e9 0%, #2563eb 60%, #1f2937 100%)",
      }}
      aria-label="Quick safety check"
    >
      {/* header */}
      <div
        style={{
          padding: "16px 18px",
          background: "rgba(255,255,255,.08)",
          backdropFilter: "blur(4px)",
          borderBottom: "1px solid rgba(255,255,255,.15)",
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 900, letterSpacing: 0.2, color: "white" }}>
          Quick safety check (10 sec)
        </h3>
        <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,.85)" }}>
          Three fast heuristics before you click or pay. Works for email, SMS, job ads, and marketplaces.
        </p>
      </div>

      {/* three tips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Tip icon="🔗" title="Hover / long-press links" text="Check the real domain. Prefer the brand’s primary domain (e.g. mybank.com). Extra words or odd TLDs = risk." />
        <Divider />
        <Tip icon="⏱️" title="Watch for urgency" text='“Act now”, “verify in 24h”. Pressure is a classic trick to rush mistakes.' />
        <Divider />
        <Tip icon="💳" title="Confirm off-thread" text="Never pay or share sensitive info in the same thread. Use official numbers/portal to verify first." />
      </div>

      {/* footer */}
      <div
        style={{
          padding: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          background: "rgba(255,255,255,.06)",
          borderTop: "1px solid rgba(255,255,255,.15)",
        }}
      >
        <span style={{ color: "rgba(255,255,255,.85)", fontSize: 13 }}>
          Guidance only — if unsure, don’t click.
        </span>
        <a
          href="/quiz" /* change to /quiz if that’s your quiz route */
          style={{
            background: "#22c55e",
            color: "white",
            textDecoration: "none",
            padding: "10px 14px",
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: "0 8px 18px rgba(34,197,94,.35)",
          }}
        >
          Test yourself → Quiz
        </a>
      </div>
    </section>
  );
}

function Tip({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={{ padding: 16, color: "white" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span aria-hidden style={{ display: "inline-grid", placeItems: "center", width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.25)", fontSize: 18 }}>
          {icon}
        </span>
        <h4 style={{ margin: 0, fontWeight: 900 }}>{title}</h4>
      </div>
      <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,.9)" }}>{text}</p>
    </div>
  );
}
function Divider() { return <div aria-hidden style={{ display: "none" }} />; }

/* -------- UI atoms -------- */
function Kpi({ title, value, note, color }:{title:string; value:string; note?:string; color:string}) {
  return (
    <div style={{ backgroundColor: color, color: "white", borderRadius: 14, padding: "18px 16px", textAlign: "center", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }}>
      <div style={{ fontSize: 13, opacity: 0.95 }}>{title}</div>
      <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1, margin: "6px 0" }}>{value}</div>
      {note && <div style={{ fontSize: 12, opacity: 0.95 }}>{note}</div>}
    </div>
  );
}
function Card({ title, subtitle, children }:{title:string; subtitle?:string; children:React.ReactNode}) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${COLORS.border}`, borderRadius:16, padding:16, boxShadow:"0 2px 10px rgba(0,0,0,0.05)" }}>
      <h3 style={{margin:0, color:"#1E3A8A", fontWeight:700}}>{title}</h3>
      {subtitle && <p style={{margin:"4px 0 10px", color:COLORS.subtext, fontSize:13}}>{subtitle}</p>}
      {children}
    </div>
  );
}
function Select({
  label, value, onChange, options, titles
}:{label:string; value:string; onChange:(v:string)=>void; options:string[]; titles?: Record<string,string>}) {
  return (
    <label style={{display:"flex", gap:8, alignItems:"center", color:COLORS.text, fontSize:13}}>
      <span>{label}:</span>
      <select
        value={value}
        onChange={(e)=>onChange(e.target.value)}
        style={{ border:`1px solid ${COLORS.border}`, borderRadius:10, padding:"6px 10px", background:"#fff", color:COLORS.text }}
      >
        {options.map(op => (
          <option key={op} value={op} title={titles?.[op]}>
            {op}
          </option>
        ))}
      </select>
    </label>
  );
}
function ResetBtn({ onClick }:{onClick:()=>void}) {
  return <button onClick={onClick} style={{ border:`1px solid ${COLORS.border}`, background:"#fff", borderRadius:999, padding:"6px 12px", cursor:"pointer", fontSize:13 }}>Reset filters</button>;
}
function ResponsiveChart({ children, minWidth = 360 }:{children:(w:number)=>React.ReactNode; minWidth?:number}) {
  const [ref, width] = useContainerWidth<HTMLDivElement>(minWidth);
  return <div ref={ref} style={{ width:"100%" }}>{children(width)}</div>;
}

/* -------- Charts (unchanged visuals) -------- */
function LossLine({ data, width, height }:{data:Point[]; width:number; height:number}) {
  const pad=36, W=Math.max(360,width), H=height, maxY=Math.max(1,...data.map(d=>d.loss));
  const stepX=(W-pad*2)/Math.max(1,data.length-1);
  const y=(v:number)=>H-pad-(v/maxY)*(H-pad*2);
  const pts=data.map((d,i)=>[pad+i*stepX,y(d.loss)]);
  const dPath="M "+pts.map(p=>`${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {[0,.25,.5,.75,1].map((t,i)=>{const gy=pad+(1-t)*(H-pad*2), gv=(maxY*t).toFixed(0);
        return <g key={i}><line x1={pad} x2={W-pad} y1={gy} y2={gy} stroke={COLORS.grid}/><text x={8} y={gy+4} fontSize="11" fill="#374151">{gv}</text></g>;
      })}
      {data.map((d,i)=>(<text key={i} x={pad+i*stepX} y={H-8} fontSize="10" fill={COLORS.subtext} textAnchor="middle">{d.month}</text>))}
      <path d={dPath} fill="none" stroke={COLORS.line} strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}
function ReportsBars({ data, width, height }:{data:Point[]; width:number; height:number}) {
  const pad=36, W=Math.max(360,width), H=height, gap=6, maxY=Math.max(1,...data.map(d=>d.reports));
  const barW=(W-pad*2-gap*(data.length-1))/Math.max(1,data.length);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {[0,.25,.5,.75,1].map((t,i)=>{const gy=pad+(1-t)*(H-pad*2), gv=Math.round(maxY*t);
        return <g key={i}><line x1={pad} x2={W-pad} y1={gy} y2={gy} stroke={COLORS.grid}/><text x={8} y={gy+4} fontSize="11" fill="#374151">{gv}</text></g>;
      })}
      {data.map((d,i)=>{const h=(d.reports/maxY)*(H-pad*2), x=pad+i*(barW+gap), y=H-pad-h;
        return (<g key={i}><rect x={x} y={y} width={barW} height={h} rx={4} fill={COLORS.bar}/><text x={x+barW/2} y={H-8} fontSize="10" fill={COLORS.subtext} textAnchor="middle">{d.month}</text></g>);
      })}
    </svg>
  );
}
function CategoryPie({ data, width, height }:{data:{name:string;loss:number}[]; width:number; height:number}) {
  const W=Math.max(320,width), H=height, cx=W/2, cy=H/2+6, r=Math.min(120, Math.floor(W/4)), inner=Math.max(40, Math.floor(r*.55));
  const total=Math.max(1,data.reduce((s,d)=>s+d.loss,0));
  let start=-Math.PI/2;
  const arcs = data.map((d,idx)=>{const a=(d.loss/total)*Math.PI*2, end=start+a, path=donutArc(cx,cy,r,inner,start,end); start=end; return {path,color:PALETTE[idx%PALETTE.length]};});
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {arcs.map((a,i)=><path key={i} d={a.path} fill={a.color} stroke="#fff" strokeWidth={1}/>)}
      <text x={cx} y={cy-4} fontSize="16" fontWeight={700} textAnchor="middle" fill={COLORS.text}>${total.toFixed(0)}m</text>
      <text x={cx} y={cy+14} fontSize="11" textAnchor="middle" fill={COLORS.subtext}>total loss</text>
    </svg>
  );
}
function donutArc(cx:number, cy:number, r:number, r0:number, start:number, end:number){
  const large = end-start>Math.PI?1:0;
  const x0=cx+r*Math.cos(start), y0=cy+r*Math.sin(start);
  const x1=cx+r*Math.cos(end),   y1=cy+r*Math.sin(end);
  const x2=cx+r0*Math.cos(end),  y2=cy+r0*Math.sin(end);
  const x3=cx+r0*Math.cos(start),y3=cy+r0*Math.sin(start);
  return [`M ${x0} ${y0}`,`A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`,`L ${x2} ${y2}`,`A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3}`,"Z"].join(" ");
}
function CategoryBars({ data, width, height }:{data:{name:string;loss:number}[]; width:number; height:number}) {
  const pad=36, W=Math.max(360,width), H=height, gap=8, max=Math.max(1,...data.map(d=>d.loss));
  const barH=(H-pad*2-gap*(data.length-1))/data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:H}}>
      {data.map((d,i)=>{const w=(d.loss/max)*(W-pad*2), y=pad+i*(barH+gap);
        return (<g key={i}><rect x={pad} y={y} width={w} height={barH} rx={6} fill={PALETTE[i%PALETTE.length]}/>
          <text x={pad-8} y={y+barH/2+4} fontSize="12" fill={COLORS.text} textAnchor="end">{d.name}</text>
          <text x={pad+w+6} y={y+barH/2+4} fontSize="12" fill={COLORS.subtext}>${d.loss.toFixed(1)}m</text></g>);
      })}
    </svg>
  );
}
function Legend({ items }:{items:{label:string;color:string}[]}) {
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginTop:6 }}>
      {items.map((it,i)=>(
        <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:12, color:COLORS.text }}>
          <span style={{ width:10, height:10, borderRadius:2, background:it.color }}/>
          {it.label}
        </span>
      ))}
    </div>
  );
}
function CategoryTable({ rows, totalLoss }:{rows:{name:string;loss:number;reports:number}[]; totalLoss:number}) {
  return (
    <div style={{ overflowX:"auto" }}>
      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead>
          <tr style={{ background: COLORS.bgSoft }}>
            <Th>Category</Th><Th align="right">Reports</Th><Th align="right">Loss ($m)</Th>
            <Th align="right">% of Total Loss</Th><Th align="right">Avg Loss / Report ($m)</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{ borderBottom:`1px solid ${COLORS.border}` }}>
              <Td>{r.name}</Td>
              <Td align="right">{r.reports.toLocaleString()}</Td>
              <Td align="right">{r.loss.toFixed(2)}</Td>
              <Td align="right">{totalLoss? ((r.loss/totalLoss)*100).toFixed(1):"0.0"}%</Td>
              <Td align="right">{r.reports? (r.loss/r.reports).toFixed(3):"0.000"}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Th({ children, align="left" }:{children:React.ReactNode; align?:"left"|"right"}) {
  return <th style={{ textAlign:align, color:COLORS.subtext, fontWeight:600, fontSize:12, padding:"10px 8px" }}>{children}</th>;
}
function Td({ children, align="left" }:{children:React.ReactNode; align?:"left"|"right"}) {
  return <td style={{ textAlign:align, color:COLORS.text, fontSize:13, padding:"10px 8px" }}>{children}</td>;
}

/* helpers */
function fmtDelta(v:number){ const sign = v>0?"+":""; return `${sign}${v.toFixed(1)}`; }
