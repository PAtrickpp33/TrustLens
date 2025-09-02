import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Breadcrumb, Typography } from 'antd';

export const ArticlesLayout: React.FC = () => {
  const location = useLocation();
  const isList = location.pathname.endsWith('/articles') || location.pathname === '/articles';

  return (
    <section className="container py-8">
      <div className="mb-4 flex items-center justify-between">
        <Typography.Title level={2} style={{ margin: 0 }}>Articles & News</Typography.Title>
      </div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/">Home</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/articles">Articles</Link>
        </Breadcrumb.Item>
        {!isList && <Breadcrumb.Item>Detail</Breadcrumb.Item>}
      </Breadcrumb>
      <Outlet />
    </section>
  );
};

export default ArticlesLayout;


