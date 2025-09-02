import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { List, Card, Typography } from 'antd';

type ArticleListItem = {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  gmt_create?: string | null;
};

const Articles: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ArticleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get('/api/v1/articles');
        if (res.data?.success) {
          setItems(res.data.data?.items || []);
          setError(null);
        } else {
          // Gracefully degrade to empty list without showing error banner
          setItems([]);
          setError(null);
        }
      } catch (e: any) {
        // Gracefully degrade to empty list without showing error banner
        setItems([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <List
        loading={loading}
        grid={{ gutter: 16, xs: 1, sm: 1, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={items}
        locale={{ emptyText: 'No articles yet' }}
        renderItem={(it) => (
          <List.Item key={it.id}>
            <Card
              hoverable
              onClick={() => navigate(`/articles/${it.slug}`)}
              title={<Link to={`/articles/${it.slug}`}>{it.title}</Link>}
            >
              {it.summary && (
                <Typography.Paragraph ellipsis={{ rows: 3 }}>{it.summary}</Typography.Paragraph>
              )}
              {it.gmt_create && (
                <Typography.Text type="secondary">
                  {new Date(it.gmt_create).toLocaleString()}
                </Typography.Text>
              )}
            </Card>
          </List.Item>
        )}
      />
    </>
  );
};

export default Articles;


