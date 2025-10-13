import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./Articles.css";

type Article = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  hero?: string;
  excerpt?: string;
  bodyHtml?: string;
};

const PLACEHOLDER = "/articles/placeholder.jpg";
const HERO_BY_TAG: Record<string, string> = {
  Report: "/bg/ns1.png",
  Trends: "/bg/hero-network-2.webp",
  Investment: "/bg/hero-security.jpg",
  Phishing: "/bg/hero-network-2.webp",
  "Remote access": "/bg/hero-security.jpg",
  Email: "/bg/hero-network-2.webp",
  Romance: "/bg/hero-network-2.webp",
  BEC: "/bg/hero-security.jpg",
  SMB: "/bg/hero-security.jpg",
};
const pickHero = (a: Article) =>
  a.hero || a.tags.map((t) => HERO_BY_TAG[t]).find(Boolean) || PLACEHOLDER;

export default function ArticleDetail() {
  const { slug } = useParams();
  const [item, setItem] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    document.body.classList.add("route-articles");
    return () => document.body.classList.remove("route-articles");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await fetch("/data/articles.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Article[];
        const found = data.find((a) => a.slug === slug) || null;
        setItem(found);
      } catch (e: any) {
        setErr(e?.message || "Failed to load article.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) {
    return (
      <section className="article-detail-root">
        <div className="articles-status">Loading…</div>
      </section>
    );
  }

  if (err || !item) {
    return (
      <section className="article-detail-root">
        <div className="articles-error">Article not found.</div>
        <p style={{ textAlign: "center", marginTop: 8 }}>
          <Link to="/articles" className="read-link">
            ← Back to articles
          </Link>
        </p>
      </section>
    );
  }

  const hero = pickHero(item);

  return (
    <article className="article-detail-root" aria-labelledby="article-h">
      <div className="detail-hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="detail-overlay" />
        <div className="detail-inner">
          <div className="detail-meta">
            <time dateTime={item.date}>{formatDate(item.date)}</time>
            <span className="dot">•</span>
            <span>{item.tags.join(", ")}</span>
          </div>
          <h1 id="article-h" className="detail-title">
            {item.title}
          </h1>
        </div>
      </div>

      <div className="detail-body">
        {item.excerpt && <p className="detail-excerpt">{item.excerpt}</p>}
        {item.bodyHtml ? (
          <div
            className="detail-content"
            dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
          />
        ) : (
          <p className="detail-content">No content provided.</p>
        )}

        <div className="detail-back">
          <Link to="/articles" className="read-link">
            ← Back to articles
          </Link>
        </div>
      </div>
    </article>
  );
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
