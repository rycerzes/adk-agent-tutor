"use client";

import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { PlotRenderer } from './PlotRenderer';

interface MessageContentProps {
  content: string;
  rawMessage?: any;
  setHasPlot?: (hasPlot: boolean) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({ content, rawMessage, setHasPlot }) => {
  const notifiedRef = useRef(false);

  const extractPlotData = (messageData: any) => {
    const plotData: any[] = [];

    if (!messageData) return plotData;

    if (messageData.success !== undefined && messageData.plot_data) {
      plotData.push({
        success: messageData.success,
        plot_data: messageData.plot_data,
        equations: messageData.equations || [],
        x_range: messageData.x_range || [],
        title: messageData.title || 'Untitled Plot',
        error: messageData.error,
        detail: messageData.detail
      });
      return plotData;
    }

    if (messageData.content && messageData.content.parts) {
      for (const part of messageData.content.parts) {
        // Check function response with plotting tool
        if (part.functionResponse && part.functionResponse.response) {
          const response = part.functionResponse.response;
          if (response.plot_data !== undefined || response.success !== undefined) {
            plotData.push({
              success: response.success,
              plot_data: response.plot_data,
              equations: response.equations || [],
              x_range: response.x_range || [],
              title: response.title || 'Untitled Plot',
              error: response.error,
              detail: response.detail
            });
          }
        }
      }
    }

    return plotData;
  };

  const plots = rawMessage ? extractPlotData(rawMessage) : [];

  useEffect(() => {
    if (setHasPlot && plots.length > 0 && !notifiedRef.current) {
      setHasPlot(true);
      notifiedRef.current = true;
    }
  }, [plots, setHasPlot]);

  return (
    <div>
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
          p: ({ children }) => <span className="block mb-2 last:mb-0">{children}</span>,
          ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          h1: ({ children }) => <h1 className="text-xl font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-md font-bold mb-1">{children}</h3>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-600 pl-4 italic my-2">
              {children}
            </blockquote>
          ),
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

      {plots.map((plot, index) => (
        <PlotRenderer key={index} plotData={plot} />
      ))}
    </div>
  );
};
