"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PlotData {
    success: boolean;
    plot_data?: {
        data: Array<Record<string, unknown>>;
        layout: Record<string, unknown>;
    };
    equations?: string[];
    x_range?: number[];
    title?: string;
    error?: string;
    detail?: string;
}

interface PlotRendererProps {
    plotData: PlotData;
}

export const PlotRenderer: React.FC<PlotRendererProps> = ({ plotData }) => {
    const [isPlotLoaded, setIsPlotLoaded] = useState(false);

    const decodeBinaryData = (bdata: string, dtype: string): number[] | null => {
        try {
            // base64 to ArrayBuffer
            const binaryString = atob(bdata);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            if (dtype === 'f8') {
                const typedArray = new Float64Array(bytes.buffer);
                return Array.from(typedArray);
            } else if (dtype === 'f4') {
                const typedArray = new Float32Array(bytes.buffer);
                return Array.from(typedArray);
            } else if (dtype === 'i4') {
                const typedArray = new Int32Array(bytes.buffer);
                return Array.from(typedArray);
            } else if (dtype === 'i8') {
                // Special handling for BigInt64Array since bigint can't be directly converted to number
                const typedArray = new BigInt64Array(bytes.buffer);
                // Convert each bigint to number manually
                return Array.from({ length: typedArray.length }, (_, i) => Number(typedArray[i]));
            } else {
                throw new Error(`Unsupported dtype: ${dtype}`);
            }
        } catch (error) {
            console.error('Error decoding binary data:', error);
            return null;
        }
    };

    const processPlotData = (rawPlotData: Record<string, unknown>) => {
        const processedData = JSON.parse(JSON.stringify(rawPlotData));

        if (processedData.data && Array.isArray(processedData.data)) {
            processedData.data.forEach((trace: Record<string, unknown>) => {
                if (trace.x && typeof trace.x === 'object' && 
                   (trace.x as Record<string, unknown>).bdata && 
                   (trace.x as Record<string, unknown>).dtype) {
                    const xObj = trace.x as Record<string, unknown>;
                    const decodedX = decodeBinaryData(xObj.bdata as string, xObj.dtype as string);
                    if (decodedX) {
                        trace.x = decodedX;
                    }
                }

                if (trace.y && typeof trace.y === 'object' && 
                   (trace.y as Record<string, unknown>).bdata && 
                   (trace.y as Record<string, unknown>).dtype) {
                    const yObj = trace.y as Record<string, unknown>;
                    const decodedY = decodeBinaryData(yObj.bdata as string, yObj.dtype as string);
                    if (decodedY) {
                        trace.y = decodedY;
                    }
                }

                if (trace.z && typeof trace.z === 'object' && 
                   (trace.z as Record<string, unknown>).bdata && 
                   (trace.z as Record<string, unknown>).dtype) {
                    const zObj = trace.z as Record<string, unknown>;
                    const decodedZ = decodeBinaryData(zObj.bdata as string, zObj.dtype as string);
                    if (decodedZ) {
                        trace.z = decodedZ;
                    }
                }
            });
        }

        return processedData;
    };

    if (!plotData.success) {
        return (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 my-2">
                <div className="text-red-300 font-semibold">Plot Error:</div>
                <div className="text-red-200">
                    {plotData.error || 'Unknown error'}
                    {plotData.detail && ` - ${plotData.detail}`}
                </div>
            </div>
        );
    }

    if (!plotData.plot_data || !plotData.plot_data.data || !plotData.plot_data.layout) {
        return (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 my-2">
                <div className="text-red-300 font-semibold">Plot Error:</div>
                <div className="text-red-200">Invalid plot data structure</div>
            </div>
        );
    }

    try {
        const processedPlotData = processPlotData(plotData.plot_data);
        const equations = plotData.equations?.length ? plotData.equations.join(', ') : 'No equations specified';
        const xRange = plotData.x_range?.length === 2 ? `[${plotData.x_range[0]}, ${plotData.x_range[1]}]` : 'No range specified';

        return (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 my-4 w-full">
                <div className="mb-3 pb-2 border-b border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-200 mb-1">
                        {plotData.title || 'Generated Plot'}
                    </h3>
                    <div className="text-sm text-gray-400">
                        <span className="font-medium">Equations:</span> {equations} |
                        <span className="font-medium"> X-range:</span> {xRange}
                    </div>
                </div>

                <div className="bg-white rounded-lg p-2 relative">
                    {!isPlotLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                            <div className="text-gray-500">Loading plot...</div>
                        </div>
                    )}
                    <Plot
                        data={processedPlotData.data}
                        layout={{
                            ...processedPlotData.layout,
                            autosize: true,
                            responsive: true,
                            margin: { l: 50, r: 30, t: 30, b: 50 },
                        }}
                        config={{
                            responsive: true,
                            displayModeBar: true,
                            modeBarButtonsToRemove: ['pan2d', 'lasso2d'],
                        }}
                        style={{
                            width: '100%',
                            height: '450px',
                            visibility: isPlotLoaded ? 'visible' : 'hidden'
                        }}
                        useResizeHandler={true}
                        onInitialized={() => setIsPlotLoaded(true)}
                        onUpdate={() => setIsPlotLoaded(true)}
                    />
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 my-2">
                <div className="text-red-300 font-semibold">Plot Rendering Error:</div>
                <div className="text-red-200">{(error as Error).message}</div>
            </div>
        );
    }
};
