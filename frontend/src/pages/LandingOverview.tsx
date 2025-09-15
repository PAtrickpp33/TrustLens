import React, { useMemo, useState } from "react";

/**
 * TrustLens Overview — Standalone (TS + SVG)
 * - Tailwind/Chart lib (فقط inline styles)
 * - Mock data CSV
 */

type Daily = { date: string; scans: number; detected: number; category?: "Phishing"|"Impersonation"|"Malware" };
type CaseRow = { id: string; date: string; type: "Phishing"|"Impersonation"|"Malware"; status: "Flagged"|"Blocked" };

// ---------------- Mock data ----------------
const MOCK_DAYS = 90;
const start = new Date(); start.setDate(start.getDate() - (MOCK_DAYS-1));

const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
const cats: Array<Daily["category"]> = ["Phishing","Impersonation","Malware"];

const daily: Daily[] = Array.from({length: MOCK_DAYS}).map((_,i)=>{
  const d = new Date(start); d.setDate(start.getDate()+i);
  // seasonal-ish
  const scansBase = 80 + Math.sin(i/7)*18 + Math.cos(i/11)*12;
  const scans = Math.max(25, Math.round(scansBase + rand(-18, 18)));
  const detected = Math.max(5, Math.round(scans * (0.12 + 0.03*Math.sin(i/9)) + rand(-6,6)));
  return {
    date: fmtDate(d),
    scans,
    detected,
    category: cats[rand(0,2)]
  };
});

// Recent cases (mock)
const recentCases: CaseRow[] = Array.from({length: 6}).map((_,i)=>{
  const d = new Date(); d.setDate(d.getDate() - i);
  const type = cats[rand(0,2)]!;
  const status: CaseRow["status"] = Math.random()>0.5? "Flagged":"Blocked";
  return { id: `CASE-${rand(100000,999999)}`, date: fmtDate(d), type, status };
});

// ---------------- Component ----------------
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
    // 4 Wk-4 ... This
    const buckets = [0,0,0,0];
    for (let i=0;i<slice.length;i++){
      const w = 3 - Math.min(3, Math.floor((slice.length-1-i)/7));
      buckets[w] += slice[i].detected;
    }
    return buckets;
  }, [slice]);

  return (
    <section style={{padding:'1.5rem', maxWidth: 1200, margin:'0 auto', color:'#111827'}}>
      {/* Header */}
      <div style={{textAlign:'center', marginBottom: 8}}>
        <h1 style={{
          fontSize:'1.8rem', fontWeight:800, margin:0,
          backgroundImage:'linear-gradient(90deg,#1d4ed8,#06b6d4,#3b82f6)',
          WebkitBackgroundClip:'text', color:'transparent'
        }}>
          TrustLens Overview
        </h1>
        <p style={{margin:'6px 0 10px', color:'#6B7280', fontSize:12}}>
          Key statistics and trends at a glance—scans, detections, risk distribution, and recent cases.
        </p>

        {/* Range switches */}
        <div style={{display:'inline-flex', gap:8}}>
          {[7,30,90].map(r=>(
            <button key={r}
              onClick={()=>setRange(r as 7|30|90)}
              style={{
                border:'1px solid #E5E7EB', borderRadius:12, padding:'6px 10px', fontSize:12, cursor:'pointer',
                background: r===range? '#E0F2FE':'#fff', color: r===range? '#0369A1':'#111827'
              }}>
              {r} Days
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',
        gap:12, marginTop:12, marginBottom:12
      }}>
        <Kpi title="Total Scans" value={totalScans.toLocaleString()} note={`${range} days`} color="#3B82F6" />
        <Kpi title="Detection Rate" value={`${detectionRate.toFixed(1)}%`} note="Detected / Scans" color="#F43F5E" />
        <Kpi title="Detected Scams" value={totalDetected.toLocaleString()} note="Flagged/Blocked" color="#10B981" />
      </div>

      {/* Top charts grid */}
      <div style={{display:'grid', gridTemplateColumns:'1.2fr 0.8fr', gap:12}}>
        <Card title="Trend: Scans vs Detected" subtitle="Daily counts for the selected period.">
          <LineDual data={slice} />
        </Card>

        <Card title="Detection Share" subtitle="Share of detected by category">
          <div style={{display:'grid', gridTemplateColumns:'140px 1fr', alignItems:'center'}}>
            <Donut data={share} colors={["#4F46E5","#F97316","#0EA5E9","#10B981","#EF4444"]}/>
            <div style={{fontSize:12, color:'#374151', paddingLeft:10}}>
              {share.map((s,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:8, marginBottom:6}}>
                  <span style={{width:10, height:10, borderRadius:2, background:getColor(i)}} />
                  <span>{s.label}</span>
                  <span style={{marginLeft:'auto', color:'#6B7280'}}>
                    ({s.value.toLocaleString()}, {percent(s.value, totalDetected)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom grid */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
        <Card title="Weekly Buckets (Detected)" subtitle="Grouped by week for the selected period">
          <BarsHorizontal labels={['Wk-4','Wk-3','Wk-2','This']} values={weekly} />
        </Card>

        <Card title="Recent Cases" subtitle="Latest flagged or blocked items">
          <CasesTable rows={recentCases} />
        </Card>
      </div>
    </section>
  );
}

/* ---------------- UI primitives ---------------- */
function Kpi({ title, value, note, color }:{title:string;value:string;note?:string;color:string}) {
  return (
    <div style={{
      backgroundColor: color, color:'#fff', borderRadius:14, padding:'14px 12px',
      textAlign:'center', boxShadow:'0 6px 16px rgba(0,0,0,0.12)'
    }}>
      <div style={{fontSize:12, opacity:0.95}}>{title}</div>
      <div style={{fontSize:22, fontWeight:800, margin:'6px 0'}}>{value}</div>
      {note && <div style={{fontSize:11, opacity:0.95}}>{note}</div>}
    </div>
  );
}

function Card({title, subtitle, children}:{title:string;subtitle?:string;children:React.ReactNode}) {
  return (
    <div style={{
      background:'#fff', border:'1px solid #E5E7EB', borderRadius:16, padding:16,
      boxShadow:'0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <h3 style={{margin:0, color:'#1E3A8A'}}>{title}</h3>
      {subtitle && <p style={{margin:'4px 0 8px', color:'#6B7280', fontSize:12}}>{subtitle}</p>}
      {children}
    </div>
  );
}

/* ---------------- Charts (SVG) ---------------- */
function LineDual({ data }: { data: Daily[] }) {
  const W=680,H=260,pad=36;
  const maxY=Math.max(1,...data.map(d=>Math.max(d.scans,d.detected)));
  const stepX=(W-pad*2)/Math.max(1,data.length-1);
  const y=(v:number)=>H-pad-(v/maxY)*(H-pad*2);

  const path = (key:"scans"|"detected", smooth=false)=>{
    const pts=data.map((d,i)=>[pad+i*stepX, y(d[key])]);
    if(!smooth) return "M "+pts.map(p=>`${p[0]} ${p[1]}`).join(" L ");
    // tiny smoothing (quadratic)
    let d="M "+pts[0][0]+" "+pts[0][1];
    for(let i=1;i<pts.length;i++){
      const [x,yv]=pts[i]; const [px,py]=pts[i-1];
      const cx=(px+x)/2; d += ` Q ${cx} ${py} ${x} ${yv}`;
    }
    return d;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:260}}>
      {[0,0.25,0.5,0.75,1].map((t,i)=>{
        const gy=pad+(1-t)*(H-pad*2); const gv=Math.round(maxY*t);
        return (<g key={i}><line x1={pad} x2={W-pad} y1={gy} y2={gy} stroke="#E5E7EB"/><text x={8} y={gy+4} fontSize="11" fill="#374151">{gv}</text></g>);
      })}
      {/* x labels (every ~7th) */}
      {data.map((d,i)=> i%Math.ceil(data.length/7)===0 &&
        <text key={i} x={pad+i*stepX} y={H-8} fontSize="10" textAnchor="middle" fill="#6B7280">{d.date.slice(5)}</text>
      )}
      <path d={path("scans",true)} fill="none" stroke="#4F46E5" strokeWidth={2.4}/>
      <path d={path("detected",true)} fill="none" stroke="#F97316" strokeWidth={2.2}/>
      {/* legend */}
      <g>
        <circle cx={pad} cy={16} r={4} fill="#4F46E5"/><text x={pad+10} y={20} fontSize="11" fill="#1F2937">Scans</text>
        <circle cx={pad+70} cy={16} r={4} fill="#F97316"/><text x={pad+80} y={20} fontSize="11" fill="#1F2937">Detected</text>
      </g>
    </svg>
  );
}

function Donut({ data, colors }:{data:{label:string;value:number}[]; colors:string[]}) {
  const W=160,H=160,cx=W/2,cy=H/2,r=56,inner=36;
  const total=Math.max(1,data.reduce((s,d)=>s+d.value,0));
  let start=-Math.PI/2;
  const arcs=data.map((d,i)=>{
    const a=(d.value/total)*Math.PI*2; const end=start+a;
    const p=donutArc(cx,cy,r,inner,start,end);
    start=end; return {p, color:getColor(i,colors)};
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:160, height:160}}>
      {arcs.map((a,i)=><path key={i} d={a.p} fill={a.color} stroke="#fff" strokeWidth={2}/>)}
      <circle cx={cx} cy={cy} r={inner} fill="transparent"/>
      <text x={cx} y={cy+4} textAnchor="middle" fontSize="11" fill="#6B7280">{total.toLocaleString()}</text>
    </svg>
  );
}

function BarsHorizontal({ labels, values }:{labels:string[]; values:number[]}) {
  const W=560,H=200,pad=36,gap=10;
  const max=Math.max(1,...values);
  const barW=(W-pad*2-gap*(values.length-1))/values.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%', height:200}}>
      {[0,0.25,0.5,0.75,1].map((t,i)=>{
        const gy=pad+(1-t)*(H-pad*2); const gv=Math.round(max*t);
        return (<g key={i}><line x1={pad} x2={W-pad} y1={gy} y2={gy} stroke="#E5E7EB"/><text x={8} y={gy+4} fontSize="11" fill="#374151">{gv}</text></g>);
      })}
      {values.map((v,i)=>{
        const h=(v/max)*(H-pad*2); const x=pad+i*(barW+gap); const y=H-pad-h;
        return <g key={i}>
          <rect x={x} y={y} width={barW} height={h} rx={6} fill="#4F46E5"/>
          <text x={x+barW/2} y={H-8} fontSize="10" textAnchor="middle" fill="#6B7280">{labels[i]}</text>
        </g>;
      })}
    </svg>
  );
}

function CasesTable({ rows }:{rows: CaseRow[]}) {
  return (
    <div style={{overflowX:'auto', fontSize:12}}>
      <table style={{width:'100%', borderCollapse:'collapse'}}>
        <thead>
          <tr style={{background:'#F9FAFB'}}>
            <Th>ID</Th><Th>Date</Th><Th>Type</Th><Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} style={{borderBottom:'1px solid #E5E7EB'}}>
              <Td>{r.id}</Td>
              <Td>{r.date}</Td>
              <Td>{r.type}</Td>
              <Td><StatusBadge status={r.status} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({status}:{status: CaseRow["status"]}) {
  const color = status==="Flagged" ? "#3B82F6" : "#EF4444";
  const bg = status==="Flagged" ? "#EFF6FF" : "#FEF2F2";
  return <span style={{display:'inline-block', padding:'3px 8px', borderRadius:999, border:`1px solid ${color}`, background:bg, color}}>
    {status}
  </span>;
}

function Th({ children }:{children:React.ReactNode}) {
  return <th style={{textAlign:'left', padding:'8px', color:'#6B7280', fontWeight:600}}>{children}</th>;
}
function Td({ children }:{children:React.ReactNode}) {
  return <td style={{padding:'8px', color:'#111827'}}>{children}</td>;
}

/* ---------------- utils ---------------- */
function percent(val:number, total:number) {
  return total? ((val/total)*100).toFixed(1) : "0.0";
}
function donutArc(cx:number,cy:number,r:number,r0:number,start:number,end:number){
  const large = end-start > Math.PI ? 1 : 0;
  const x0 = cx + r * Math.cos(start), y0 = cy + r * Math.sin(start);
  const x1 = cx + r * Math.cos(end),   y1 = cy + r * Math.sin(end);
  const x2 = cx + r0 * Math.cos(end),  y2 = cy + r0 * Math.sin(end);
  const x3 = cx + r0 * Math.cos(start),y3 = cy + r0 * Math.sin(start);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${r0} ${r0} 0 ${large} 0 ${x3} ${y3} Z`;
}
function getColor(i:number, palette?:string[]){
  const P = palette || ["#4F46E5","#F97316","#0EA5E9","#10B981","#EF4444","#8B5CF6"];
  return P[i%P.length];
}
function fmtDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
