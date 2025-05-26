"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

interface MessageContentProps {
  content: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;
          
          return isInline ? (
            <code className="bg-gray-700 px-1 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          ) : (
            <pre className="bg-gray-700 p-3 rounded-lg overflow-x-auto my-2">
              <code className="text-sm font-mono" {...props}>
                {children}
              </code>
            </pre>
          );
        },
        // Customize paragraphs to avoid extra spacing
        p: ({ children }) => <span className="block mb-2 last:mb-0">{children}</span>,
        // Style lists
        ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
        // Style headings
        h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-md font-bold mb-1">{children}</h3>,
        // Style blockquotes
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-gray-600 pl-4 italic my-2">
            {children}
          </blockquote>
        ),
        // Style tables
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="border-collapse border border-gray-600">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="border border-gray-600 px-2 py-1 bg-gray-700 font-bold">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="border border-gray-600 px-2 py-1">
            {children}
          </td>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
