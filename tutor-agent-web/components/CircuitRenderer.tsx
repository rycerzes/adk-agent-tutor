"use client";

import React from 'react';

interface CircuitRendererProps {
    imageData: string;
    title?: string;
}

export const CircuitRenderer: React.FC<CircuitRendererProps> = ({ imageData, title = 'Circuit Visualization' }) => {
    // Decode base64 string to SVG markup
    const decodeSvg = (base64Data: string): string => {
        try {
            return atob(base64Data);
        } catch (error) {
            console.error('Error decoding SVG data:', error);
            return '';
        }
    };

    const svgContent = decodeSvg(imageData);

    if (!svgContent) {
        return (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4 my-2">
                <div className="text-red-300 font-semibold">Circuit Rendering Error:</div>
                <div className="text-red-200">Failed to decode SVG data</div>
            </div>
        );
    }

    return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 my-4 w-full">
            <div className="mb-3 pb-2 border-b border-gray-600">
                <h3 className="text-lg font-semibold text-gray-200 mb-1">{title}</h3>
            </div>

            <div className="bg-white rounded-lg p-2 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: svgContent }} />
            </div>
        </div>
    );
};
