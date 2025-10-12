import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card } from './card';

interface MarkdownReportCardProps {
  markdown: string;
  loading?: boolean;
  error?: string | null;
}

export const MarkdownReportCard: React.FC<MarkdownReportCardProps> = ({
  markdown,
  loading = false,
  error = null,
}) => {
  if (loading) {
    return (
      <Card className="markdown-report-card p-6 mt-4 animate-pulse">
        <div className="space-y-3">
          <div className="h-6 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          <div className="h-4 bg-slate-200 rounded w-4/6"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="markdown-report-card p-6 mt-4 border-red-200 bg-red-50">
        <div className="text-red-800">
          <h3 className="font-semibold text-lg mb-2">Analysis Error</h3>
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="markdown-report-card p-6 mt-4 bg-white shadow-sm">
      <div className="prose prose-slate max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Customize heading styles
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-slate-900 mb-4 mt-6 first:mt-0">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-slate-800 mb-3 mt-5">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-slate-700 mb-2 mt-4">
                {children}
              </h3>
            ),
            // Customize paragraph styles
            p: ({ children }) => (
              <p className="text-slate-700 mb-3 leading-relaxed">{children}</p>
            ),
            // Customize list styles
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-slate-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-slate-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="ml-2">{children}</li>
            ),
            // Customize code blocks
            code: ({ className, children }) => {
              const isInline = !className;
              return isInline ? (
                <code className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ) : (
                <code className="block bg-slate-100 p-3 rounded-md text-sm font-mono overflow-x-auto">
                  {children}
                </code>
              );
            },
            // Customize blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-3 bg-blue-50 text-slate-700">
                {children}
              </blockquote>
            ),
            // Customize links
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            // Customize strong/bold text
            strong: ({ children }) => (
              <strong className="font-semibold text-slate-900">{children}</strong>
            ),
            // Customize em/italic text
            em: ({ children }) => (
              <em className="italic text-slate-700">{children}</em>
            ),
            // Customize horizontal rules
            hr: () => <hr className="my-6 border-slate-200" />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </Card>
  );
};

export default MarkdownReportCard;

