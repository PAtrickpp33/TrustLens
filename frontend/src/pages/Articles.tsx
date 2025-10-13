import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./Articles.css";

type Article = {
  slug: string;
  title: string;
  date: string;     // ISO date
  tags: string[];
  hero?: string;    // cover image path in /public
  excerpt?: string;
  bodyHtml?: string;
};

const PLACEHOLDER = "/articles/placeholder.jpg";

/** thumbnails from /public/bg for when an article has no hero */
const HERO_BY_TAG: Record<string, string> = {
  Report: "/bg/ns1.png",
  Trends: "/bg/ns2.png",
  Investment: "/bg/ns3.png",
  Phishing: "/bg/ns2.png",
  "Remote access": "/bg/ns1.png",
  Email: "/bg/hero-network-2.webp",
  Romance: "/bg/hero-network-1.webp",
  BEC: "/bg/hero-security.jpg",
  SMB: "/bg/hero-security.jpg",
};

function pickHero(a: Article) {
  if (a.hero) return a.hero;
  const hit = a.tags?.map((t) => HERO_BY_TAG[t])?.find(Boolean);
  return hit || PLACEHOLDER;
}

/** Only show a neat subset of tags */
const PREFERRED_TAGS = [
  "All",
  "Report",
  "Trends",
  "Investment",
  "Phishing",
  "Remote access",
  "Email",
  "Romance",
  "BEC",
  "SMB",
];

export default function Articles() {
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("All");
  const [sp, setSp] = useSearchParams();

  // hide the layout’s page heading/breadcrumbs on this route only
  useEffect(() => {
    document.body.classList.add("route-articles");
    return () => document.body.classList.remove("route-articles");
  }, []);

  // initial state from URL
  useEffect(() => {
    const q = sp.get("q") || "";
    const t = sp.get("tag") || "All";
    setQuery(q);
    setActiveTag(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch JSON
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/data/articles.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Article[];
        data.sort((a, b) => (a.date < b.date ? 1 : -1));
        setItems(data);
      } catch (e: any) {
        setErr(e?.message || "Failed to load articles.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // build tag list (limited to our curated list, but only if present in data)
  const allTags = useMemo(() => {
    const present = new Set<string>();
    items.forEach((a) => a.tags?.forEach((t) => present.add(t)));
    const curated = PREFERRED_TAGS.filter((t) => t === "All" || present.has(t));
    // guarantee "All" is first
    return curated.length ? curated : ["All"];
  }, [items]);

  // filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      const tagOk = activeTag === "All" || a.tags?.includes(activeTag);
      const qOk =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q) ||
        a.tags?.some((t) => t.toLowerCase().includes(q));
      return tagOk && qOk;
    });
  }, [items, query, activeTag]);

  // sync to URL
  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (activeTag && activeTag !== "All") next.set("tag", activeTag);
    setSp(next, { replace: true });
  }, [query, activeTag, setSp]);

  return (
    <section
      className="articles-root"
      style={
        {
          // change the hero background if you like
          // @ts-ignore
          "--articles-hero": "url('/bg/hero-network-2.webp')",
        } as React.CSSProperties
      }
    >
      {/* centered full-bleed hero */}
      <div className="articles-hero">
        <div className="articles-hero__overlay" />
        <div className="articles-hero-inner">
          <h1 className="articles-title">Case Studies &amp; Articles</h1>
          <p className="articles-sub">
            Real incidents distilled into practical lessons—spot red flags faster and stay safe online.
          </p>

          <div className="articles-toolbar">
            <input
              className="articles-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, tag, or keyword…"
              aria-label="Search articles"
            />
            <div className="articles-tags" role="tablist" aria-label="Filter by tag">
              {allTags.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={activeTag === t}
                  className={`tag-chip${activeTag === t ? " is-active" : ""}`}
                  onClick={() => setActiveTag(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="articles-container">
        {loading && <SkeletonGrid />}
        {err && <div className="articles-error">Error: {err}</div>}

        {!loading && !err && (
          filtered.length ? (
            <div className="articles-grid">
              {filtered.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          ) : (
            <div className="articles-empty">No articles match your filters.</div>
          )
        )}
      </div>
    </section>
  );
}

function ArticleCard({ a }: { a: Article }) {
  const isNew = isWithinDays(a.date, 45);
  const hero = pickHero(a);

  return (
    <article className="article-card">
      <Link to={`/articles/${a.slug}`} className="article-media" aria-label={a.title}>
        <Cover src={hero} alt="" />
        <div className="media-gradient" />
        <div className="media-tags">
          {a.tags.slice(0, 3).map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
        {isNew && <span className="badge-new">NEW</span>}
      </Link>

      <div className="article-body">
        <div className="article-meta">
          <time dateTime={a.date}>{formatDate(a.date)}</time>
          <span className="dot">•</span>
          <span>{a.tags.join(", ")}</span>
        </div>

        <h2 className="article-title">
          <Link to={`/articles/${a.slug}`}>{a.title}</Link>
        </h2>

        {a.excerpt && <p className="article-excerpt">{a.excerpt}</p>}

        <div className="article-actions">
          <Link className="read-link" to={`/articles/${a.slug}`}>
            Read case study →
          </Link>
        </div>
      </div>
    </article>
  );
}

function Cover({ src, alt }: { src: string; alt?: string }) {
  const [loaded, setLoaded] = useState(false);
  const [ok, setOk] = useState(true);
  return (
    <figure className={`cover${loaded ? " is-loaded" : ""}`}>
      <img
        src={ok ? src : PLACEHOLDER}
        alt={alt || ""}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setOk(false)}
      />
    </figure>
  );
}

function SkeletonGrid() {
  return (
    <div className="articles-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="article-card skeleton">
          <div className="skeleton-media shimmer" />
          <div className="skeleton-body">
            <div className="skeleton-line w40 shimmer" />
            <div className="skeleton-line w80 shimmer" />
            <div className="skeleton-line w60 shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

function isWithinDays(iso: string, days: number) {
  const d = new Date(iso).getTime();
  return Date.now() - d < days * 24 * 60 * 60 * 1000;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}
