import React, { useEffect } from 'react';
import { useResults } from '@/queries/useResults';

const Results: React.FC = () => {
  const { data, isLoading, error, fetchResults } = useResults();

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (isLoading) return <p className="container">Loading…</p>;
  if (error) return <p className="container">Failed to load results.</p>;

  return (
    <section className="section container">
      <h2>Security Results</h2>
      <pre className="code-block">{JSON.stringify(data, null, 2)}</pre>
    </section>
  );
};

export default Results;


