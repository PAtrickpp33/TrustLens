import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";

type UrlRow = {
  registrable_domain?: string;
  full_url?: string;
  phishing_flag?: string | number;
  risk_level?: string | number;
  last_reported_at?: string;
  notes?: string;
  is_deleted?: string | number;
};

type EmailRow = {
  address?: string;
  domain?: string;
  risk_level?: string | number;
  last_reported_at?: string;
  notes?: string;
  is_deleted?: string | number;
};

type MobileRow = {
  e164?: string;
  risk_level?: string | number;
  last_reported_at?: string;
  notes?: string;
  is_deleted?: string | number;
};

type ThemeHit = { theme: string; hits: number };
type DomainHit = { domain: string; reports: number };

const THEME_RULES: { theme: string; regex: RegExp }[] = [
  { theme: "Delivery fee", regex: /(deliver|parcel|courier|post|package)/i },
  { theme: "Tax refund", regex: /(tax|refund|ato)/i },
  { theme: "Crypto giveaway", regex: /(crypto|bitcoin|giveaway)/i },
  { theme: "Bank impersonation", regex: /(bank|verify\s+identity|account\s+locked)/i },
  { theme: "Job / lottery", regex: /(job|work\s*from\s*home|lottery|prize)/i },
];

function parseBoolish(v: any) {
  if (v === undefined || v === null) return false;
  const s = String(v).trim().toLowerCase();
  return s === "1" || s === "true" || s === "yes";
}
function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function inLastDays(iso: string | undefined, days: number) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return t >= cutoff;
}

async function loadCSV<T = any>(url: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<T>(url, {
      download: true,
      header: true,
      skipEmptyLines: 'greedy',
      complete: (res) => resolve(res.data as T[]),
      error: (err) => reject(err),
    });
  });
}

export default function InsightsPeekCSV({ days = 14 }: { days?: number }) {
  const [urls, setUrls] = useState<UrlRow[] | null>(null);
  const [emails, setEmails] = useState<EmailRow[] | null>(null);
  const [mobiles, setMobiles] = useState<MobileRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setErr(null);
        const [u, e, m] = await Promise.all([
          loadCSV<UrlRow>("/data/risk_url.csv"),
          loadCSV<EmailRow>("/data/risk_email.csv"),
          loadCSV<MobileRow>("/data/risk_mobile.csv"),
        ]);
        if (!cancelled) {
          setUrls(u);
          setEmails(e);
          setMobiles(m);
        }
      } catch (e) {
        if (!cancelled) setErr("Failed to load CSV data.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const snapshot = useMemo(() => {
    if (!urls || !emails || !mobiles) return null;

    // --- Top flagged domains (from risk_url) ---
    const domainCounts = new Map<string, number>();
    for (const r of urls) {
      if (parseBoolish(r.is_deleted)) continue;
      if (!inLastDays(r.last_reported_at, days)) continue;
      const flagged = parseBoolish(r.phishing_flag) || num(r.risk_level) >= 3;
      if (!flagged) continue;
      const d = (r.registrable_domain || "").trim().toLowerCase();
      if (!d) continue;
      domainCounts.set(d, (domainCounts.get(d) || 0) + 1);
    }
    const topDomains: DomainHit[] = [...domainCounts.entries()]
      .map(([domain, reports]) => ({ domain, reports }))
      .sort((a, b) => b.reports - a.reports)
      .slice(0, 10);

    // --- Theme detection across url/email/mobile (notes + a few fields) ---
    const themeCounts = new Map<string, number>();
    const pushText = (text: string) => {
      for (const rule of THEME_RULES) {
        if (rule.regex.test(text)) {
          themeCounts.set(rule.theme, (themeCounts.get(rule.theme) || 0) + 1);
        }
      }
    };

    for (const r of urls) {
      if (parseBoolish(r.is_deleted)) continue;
      if (!inLastDays(r.last_reported_at, days)) continue;
      const txt = `${r.notes ?? ""} ${r.full_url ?? ""} ${r.registrable_domain ?? ""}`;
      pushText(txt);
    }
    for (const r of emails) {
      if (parseBoolish(r.is_deleted)) continue;
      if (!inLastDays(r.last_reported_at, days)) continue;
      const txt = `${r.notes ?? ""} ${r.address ?? ""} ${r.domain ?? ""}`;
      pushText(txt);
    }
    for (const r of mobiles) {
      if (parseBoolish(r.is_deleted)) continue;
      if (!inLastDays(r.last_reported_at, days)) continue;
      const txt = `${r.notes ?? ""} ${r.e164 ?? ""}`;
      pushText(txt);
    }

    const themes: ThemeHit[] = [...themeCounts.entries()]
      .map(([theme, hits]) => ({ theme, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    return { days, themes, topDomains };
  }, [urls, emails, mobiles, days]);

  return (
    <section className="insights-peek" aria-label="Live insights">
      <div className="peek-card">
        <h2>What TrustLens is Seeing Right Now</h2>
        <p>Snapshot of scam patterns from community reports and CSV feeds (last {days} days).</p>

        {err && <div className="peek-error">{err}</div>}

        <div className="peek-grid">
          <div className="peek-col">
            <h3>Trending scam themes</h3>
            <ul>
              {(snapshot?.themes ?? []).map((t) => (
                <li key={t.theme}>
                  <span className="dot" /> {t.theme}
                  {t.hits ? <span className="count"> {t.hits}</span> : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="peek-col">
            <h3>Top flagged domains</h3>
            <ul>
              {(snapshot?.topDomains ?? []).map((d) => (
                <li key={d.domain}>
                  <span className="dot" /> {d.domain}
                  {d.reports ? <span className="count"> {d.reports}</span> : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="peek-col">
            <h3>Where to dig deeper</h3>
            <ul className="links">
              <li><a href="/insights">Insights → Live feed</a></li>
              <li><a href="/education">Education Hub → Red flags</a></li>
              <li><a href="/articles">Articles → Case studies</a></li>
            </ul>
          </div>
        </div>

        <a className="peek-cta" href="/insights">Open Insights</a>
      </div>
    </section>
  );
}
