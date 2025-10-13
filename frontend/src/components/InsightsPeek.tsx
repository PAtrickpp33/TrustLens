import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Papa from "papaparse";
import "./InsightsPeek.css";


/**
 * Replace the previous static component with a CSV-powered one.
 * It reads three CSV files placed under /public/data:
 *  - risk_url.csv
 *  - risk_email.csv
 *  - risk_mobile.csv
 *
 * You can change the location with the csvBasePath prop.
 * Lists are computed for the last `days` days (default 14).
 */

type UrlRow = {
  registrable_domain?: string;
  full_url?: string;
  phishing_flag?: string | number;
  risk_level?: string | number;
  report_count?: string | number;
  last_reported_at?: string;
  notes?: string;
  is_deleted?: string | number;
};

type EmailRow = {
  address?: string;
  domain?: string;
  risk_level?: string | number;
  report_count?: string | number;
  last_reported_at?: string;
  notes?: string;
  is_deleted?: string | number;
};

type MobileRow = {
  e164?: string;
  risk_level?: string | number;
  report_count?: string | number;
  last_reported_at?: string;
  notes?: string;
  is_deleted?: string | number;
};

type Props = {
  /** How many days of data to consider (default 14) */
  days?: number;
  /** Base path for CSV files inside /public (default /data) */
  csvBasePath?: string;
  /** Max items to show in each list (default 3) */
  limit?: number;
};

const THEME_RULES: { theme: string; regex: RegExp }[] = [
  { theme: "Delivery fee", regex: /(deliver|parcel|courier|post|package)/i },
  { theme: "Tax refund", regex: /(tax|refund|ato)/i },
  { theme: "Crypto giveaway", regex: /(crypto|bitcoin|giveaway)/i },
  { theme: "Bank impersonation", regex: /(bank|verify\s+identity|account\s+locked)/i },
  { theme: "Job / lottery", regex: /(job|work\s*from\s*home|lottery|prize)/i },
];

function parseBoolish(v: any) {
  const s = String(v ?? "").trim().toLowerCase();
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

const InsightsPeek: React.FC<Props> = ({
  days = 14,
  csvBasePath = "/data",
  limit = 3,
}) => {
  const [urls, setUrls] = useState<UrlRow[] | null>(null);
  const [emails, setEmails] = useState<EmailRow[] | null>(null);
  const [mobiles, setMobiles] = useState<MobileRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load CSVs from /public
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [u, e, m] = await Promise.all([
          loadCSV<UrlRow>(`${csvBasePath}/risk_url.csv`),
          loadCSV<EmailRow>(`${csvBasePath}/risk_email.csv`),
          loadCSV<MobileRow>(`${csvBasePath}/risk_mobile.csv`),
        ]);
        if (!cancelled) {
          setUrls(u);
          setEmails(e);
          setMobiles(m);
        }
      } catch (e) {
        if (!cancelled) setError("Could not load insights data (CSV).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [csvBasePath]);

  // Compute lists
  const { themes, topDomains } = useMemo(() => {
    const result = { themes: [] as { theme: string; hits: number }[], topDomains: [] as { domain: string; reports: number }[] };
    if (!urls || !emails || !mobiles) return result;

    // Top flagged domains (from URL table)
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
    result.topDomains = [...domainCounts.entries()]
      .map(([domain, reports]) => ({ domain, reports }))
      .sort((a, b) => b.reports - a.reports)
      .slice(0, limit);

    // Themes across url/email/mobile (notes + a few fields)
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
      pushText(`${r.notes ?? ""} ${r.full_url ?? ""} ${r.registrable_domain ?? ""}`);
    }
    for (const r of emails) {
      if (parseBoolish(r.is_deleted)) continue;
      if (!inLastDays(r.last_reported_at, days)) continue;
      pushText(`${r.notes ?? ""} ${r.address ?? ""} ${r.domain ?? ""}`);
    }
    for (const r of mobiles) {
      if (parseBoolish(r.is_deleted)) continue;
      if (!inLastDays(r.last_reported_at, days)) continue;
      pushText(`${r.notes ?? ""} ${r.e164 ?? ""}`);
    }

    result.themes = [...themeCounts.entries()]
      .map(([theme, hits]) => ({ theme, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, limit);

    return result;
  }, [urls, emails, mobiles, days, limit]);

  return (
    <section className="peek-root" aria-labelledby="peek-h">
      <div className="peek-container">
        <div className="peek-surface">
          <h2 id="peek-h" className="peek-title">
            What <span>Dodgy Detector</span> is Seeing Right Now
          </h2>

          <p className="peek-sub">
            Snapshot of scam patterns from community reports and open-data feeds.
            Explore hot domains, common email lures, and categories with the highest loss.
          </p>

          {loading && <p className="peek-sub">Loading dashboard...</p>}
          {error && <p className="peek-sub" role="alert">{error}</p>}

          {!loading && !error && (
            <div className="peek-grid">
              <div className="peek-card">
                <h3 className="peek-card-title">Trending scam themes</h3>
                <ul className="peek-list">
                  {themes.length === 0 && <li>No recent themes.</li>}
                  {themes.map((t) => (
                    <li key={t.theme}>{t.theme}</li>
                  ))}
                </ul>
              </div>

              <div className="peek-card">
                <h3 className="peek-card-title">Top flagged domains</h3>
                <ul className="peek-list">
                  {topDomains.length === 0 && <li>No flagged domains.</li>}
                  {topDomains.map((d) => (
                    <li key={d.domain}>{d.domain}</li>
                  ))}
                </ul>
              </div>

              <div className="peek-card">
                <h3 className="peek-card-title">Where to dig deeper</h3>
                <ul className="peek-list">
                  <li><Link to="/overview">Insights → Live feed</Link></li>
                  <li><Link to="/features">Education Hub → Red flags</Link></li>
                  <li><Link to="/landing">Dashboard → Overview</Link></li>
                </ul>
              </div>
            </div>
          )}

          <Link to="/landing" className="peek-cta">
            Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
};

export default InsightsPeek;
