import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { http } from '@/lib/http';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type ArticleDetailData = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  content_md: string;
  gmt_create?: string | null;
  gmt_modified?: string | null;
};

const ArticleDetail: React.FC = () => {
  const { slug } = useParams();
  const [data, setData] = useState<ArticleDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await http.get(`/api/v1/articles/${slug}`);
        if (res.data?.success) {
          setData(res.data.data);
        } else {
          setError(res.data?.error || 'Failed to load');
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!data) return <div>Not found</div>;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-2">{data.title}</h1>
      {data.summary && <p className="text-muted-foreground mb-6">{data.summary}</p>}
      <article className="prose max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content_md}</ReactMarkdown>
      </article>
    </section>
  );
};

export default ArticleDetail;


