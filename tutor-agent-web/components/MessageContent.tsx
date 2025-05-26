"use client";

import React, { useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { PlotRenderer } from './PlotRenderer';
import { CircuitRenderer } from './CircuitRenderer';

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

    // Only process if this is specifically identified as plot data
    if (messageData.content && messageData.content.parts) {
      for (const part of messageData.content.parts) {
        // Check function calls for plotting tool
        if (part.functionCall && part.functionCall.name === "plotting_tool") {
          // This is a plotting tool function call, but we need the response
          continue;
        }

        // Check function response with plotting tool
        if (part.functionResponse &&
          part.functionResponse.name === "plotting_tool" &&
          part.functionResponse.response) {
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

  // New function to extract circuit visualization data
  const extractCircuitData = (messageData: any) => {
    const circuitData: any[] = [];

    if (!messageData) return circuitData;

    if (messageData.content && messageData.content.parts) {
      for (const part of messageData.content.parts) {
        if (part.functionResponse &&
          part.functionResponse.name === "circuit_visualization_tool" &&
          part.functionResponse.response) {
          const response = part.functionResponse.response;
          if (response.success === true && response.image_data) {
            circuitData.push({
              success: response.success,
              image_data: response.image_data,
              title: response.title || 'Circuit Visualization',
              error: response.error
            });
          }
        }
      }
    }

    return circuitData;
  };

  const cleanContent = useMemo(() => {
    if (!content || !rawMessage) return content;

    let cleanedContent = content;

    const jsonCodeBlockRegex = /```(?:json)?\s*\{[\s\S]*?(?:"plot_data"|"equations"|"bdata"|"dtype"|"mode"|"scatter"|"image_data")[\s\S]*?\}\s*```/g;
    cleanedContent = cleanedContent.replace(jsonCodeBlockRegex, '');

    const plainJsonRegex = /\{\s*[\s\S]*?(?:"plot_data"|"equations"|"bdata"|"dtype"|"image_data")[\s\S]*?\}/g;
    cleanedContent = cleanedContent.replace(plainJsonRegex, '');

    const bdataRegex = /"bdata"\s*:\s*"[A-Za-z0-9+/=]*"/g;
    cleanedContent = cleanedContent.replace(bdataRegex, '');

    const imageDataRegex = /"image_data"\s*:\s*"[A-Za-z0-9+/=]*"/g;
    cleanedContent = cleanedContent.replace(imageDataRegex, '');

    const longBase64Regex = /"(?:bdata|image_data)"\s*:\s*"[^"]{20,}(?:")?/g;
    cleanedContent = cleanedContent.replace(longBase64Regex, '');

    const lines = cleanedContent.split('\n');
    const filteredLines = lines.filter(line => {
      return !line.match(/^\s*"bdata"\s*:\s*"[A-Za-z0-9+/=]{20,}/) &&
        !line.match(/^\s*"bdata":/) &&
        !line.match(/^\s*"image_data"\s*:\s*"[A-Za-z0-9+/=]{20,}/) &&
        !line.match(/^\s*"image_data":/) &&
        !line.match(/^[A-Za-z0-9+/=]{40,}$/);
    });

    cleanedContent = filteredLines.join('\n');

    const plotDataRegex = /(?:"|')?(?:mode|name|type|x|y|bdata|dtype)(?:"|')?\s*:\s*(?:"|')?[^,\n]*(?:"|')?[,\n]/g;

    const newLines = [];
    let skipCount = 0;

    for (let i = 0; i < filteredLines.length; i++) {
      if (skipCount > 0) {
        skipCount--;
        continue;
      }

      let matchesInSequence = 0;
      for (let j = 0; j < 10 && i + j < filteredLines.length; j++) {
        if (plotDataRegex.test(filteredLines[i + j])) {
          matchesInSequence++;
          plotDataRegex.lastIndex = 0; // Reset regex
        }
      }

      // If we found 3+ consecutive lines with plot data patterns, skip them
      if (matchesInSequence >= 3) {
        skipCount = matchesInSequence;
        continue;
      }

      // Not part of a plot data block, keep this line
      newLines.push(filteredLines[i]);
    }

    cleanedContent = newLines.join('\n');

    // Clean up standalone plot-related patterns that might remain
    cleanedContent = cleanedContent.replace(/["`']?(?:mode|type|scatter|name|bdata|dtype|image_data)["`']?\s*:\s*["`'][^"`'\n]*["`'],?/g, '');

    // Clean up multiple commas that might be left after removing content
    cleanedContent = cleanedContent.replace(/,\s*,/g, ',');

    // Clean up multiple newlines
    cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n');

    // Clean up leftover brackets from JSON objects that might have been partially removed
    cleanedContent = cleanedContent.replace(/\{\s*\}/g, '');
    cleanedContent = cleanedContent.replace(/\[\s*\]/g, '');

    // Final check to remove any remaining large blocks of base64 data
    cleanedContent = cleanedContent.replace(/[A-Za-z0-9+/=]{100,}/g, '');

    return cleanedContent.trim();
  }, [content, rawMessage]);

  const plots = rawMessage ? extractPlotData(rawMessage) : [];
  const circuits = rawMessage ? extractCircuitData(rawMessage) : [];
  const hasVisualizations = plots.length > 0 || circuits.length > 0;

  // Fix the useEffect dependency array to have consistent size
  useEffect(() => {
    // Only call setHasPlot once when visualizations are detected
    if (setHasPlot && hasVisualizations && !notifiedRef.current) {
      setHasPlot(true);
      notifiedRef.current = true;
    }
  }, [setHasPlot]); // Only depend on setHasPlot, check other values inside

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
        {cleanContent}
      </ReactMarkdown>

      {plots.map((plot, index) => (
        <PlotRenderer key={`plot-${index}`} plotData={plot} />
      ))}

      {circuits.map((circuit, index) => (
        <CircuitRenderer key={`circuit-${index}`} imageData={circuit.image_data} title={circuit.title} />
      ))}
    </div>
  );
};
