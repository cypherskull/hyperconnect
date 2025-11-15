import React, { useState } from 'react';

export interface BarChartData {
  name: string;
  value: number;
  color: string;
  tooltipData: Record<string, string | number>;
}

interface BarChartProps {
  data: BarChartData[];
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const [hoveredBar, setHoveredBar] = useState<BarChartData | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState<{ top: number, left: number } | null>(null);

    const maxValue = Math.max(...data.map(d => d.value), 0);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, barData: BarChartData) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({ top: rect.top, left: rect.right + 5 });
        setHoveredBar(barData);
    };

    return (
        <div className="space-y-3 relative" onMouseLeave={() => setHoveredBar(null)}>
            {data.map(bar => (
                <div 
                    key={bar.name} 
                    className="flex items-center group"
                    onMouseMove={(e) => handleMouseMove(e, bar)}
                >
                    <div className="w-1/4 text-xs font-semibold truncate pr-2 text-right">{bar.name}</div>
                    <div className="w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full h-6 p-0.5">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end px-2"
                            style={{ 
                                width: `${(bar.value / maxValue) * 100}%`,
                                backgroundColor: bar.color
                            }}
                        >
                           <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                             {bar.value.toLocaleString()}
                           </span>
                        </div>
                    </div>
                </div>
            ))}

            {hoveredBar && tooltipPosition && (
                <div 
                    className="fixed bg-brand-dark text-white text-xs rounded-md p-3 shadow-lg pointer-events-none z-10 animate-fadeIn"
                    style={{ top: tooltipPosition.top, left: tooltipPosition.left, minWidth: '150px' }}
                >
                    <p className="font-bold text-base mb-2" style={{color: hoveredBar.color}}>{hoveredBar.name}</p>
                    <div className="space-y-1">
                        {Object.entries(hoveredBar.tooltipData).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-gray-400">{key}:</span>
                                <span className="font-semibold">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};