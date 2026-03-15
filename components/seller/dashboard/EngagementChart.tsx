
import React, { useState } from 'react';

interface EngagementChartProps {
    data: { [key: string]: number };
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, date: string, value: number } | null>(null);

    const chartHeight = 250;
    const chartWidth = 500; // Assuming a container width
    
    const chartData = Array.from({ length: 30 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        const dateKey = d.toISOString().split('T')[0];
        return {
            date: dateKey,
            value: data[dateKey] || 0
        };
    });
    
    const maxValue = Math.max(...chartData.map(d => d.value), 1);
    const barWidth = chartWidth / chartData.length;

    return (
        <div className="bg-brand-card rounded-lg shadow-md p-6 border border-brand-border h-full">
            <h3 className="text-lg font-bold text-brand-accent mb-4">Engagement Over Time</h3>
            <div className="relative" style={{ width: '100%', height: `${chartHeight}px` }}>
                <svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="xMidYMid meet">
                    {chartData.map((d, i) => {
                        const barHeight = (d.value / maxValue) * chartHeight;
                        const x = i * barWidth;
                        const y = chartHeight - barHeight;
                        const displayDate = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                        return (
                            <g key={d.date}>
                                <rect
                                    x={x}
                                    y={y}
                                    width={barWidth - 2}
                                    height={barHeight}
                                    className="fill-current text-brand-primary/60 hover:text-brand-primary/80 transition-colors"
                                    onMouseMove={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        setTooltip({ x: e.clientX - rect.left + 10, y: e.clientY - rect.top, date: displayDate, value: d.value });
                                    }}
                                    onMouseLeave={() => setTooltip(null)}
                                />
                            </g>
                        );
                    })}
                </svg>
                 {tooltip && (
                    <div 
                        className="absolute bg-brand-dark text-white text-xs rounded-md py-1 px-2 pointer-events-none"
                        style={{ top: tooltip.y, left: tooltip.x, transform: 'translateY(-100%)' }}
                    >
                        <strong>{tooltip.date}</strong>: {tooltip.value} engagement{tooltip.value !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
             <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                <span>30 days ago</span>
                <span>Today</span>
            </div>
        </div>
    );
};