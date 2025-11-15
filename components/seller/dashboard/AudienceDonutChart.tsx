import React from 'react';
import { Persona } from '../../../types';

interface AudienceDonutChartProps {
    data: { [key: string]: number };
}

const personaColors: Record<Persona, string> = {
    Buyer: '#4D96FF',
    Seller: '#FF6B6B',
    Investor: '#FFD93D',
    Collaborator: '#6BCB77',
    Browser: '#9CA3AF',
    Admin: '#6B7280',
};

const DonutSegment: React.FC<{
    radius: number;
    strokeWidth: number;
    color: string;
    percentage: number;
    offset: number;
    strokeDasharray: string;
}> = ({ radius, strokeWidth, color, percentage, offset, strokeDasharray }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = (offset / 100) * circumference;

    return (
        <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
    );
};


export const AudienceDonutChart: React.FC<AudienceDonutChartProps> = ({ data }) => {
    const total = (Object.values(data) as number[]).reduce((sum, value) => sum + value, 0);
    const chartData = (Object.entries(data) as [string, number][]).map(([name, value]) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: personaColors[name as Persona] || '#6B7280', // gray-500
    }));

    let cumulativePercentage = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;


    return (
        <div className="bg-brand-card rounded-lg shadow-md p-6 border border-brand-border h-full">
            <h3 className="text-lg font-bold text-brand-accent mb-4">Audience Breakdown</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-40 h-40 flex-shrink-0">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                        {chartData.map((segment, index) => {
                            const offset = cumulativePercentage;
                            cumulativePercentage += segment.percentage;
                            const strokeDasharray = `${(segment.percentage / 100) * circumference} ${circumference}`;
                            return (
                                <DonutSegment
                                    key={index}
                                    radius={radius}
                                    strokeWidth={30}
                                    color={segment.color}
                                    percentage={segment.percentage}
                                    offset={-offset}
                                    strokeDasharray={strokeDasharray}
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{total}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Users</p>
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-2 text-sm">
                    {chartData.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                                <span>{item.name}</span>
                            </div>
                            <span className="font-semibold">{item.value} ({item.percentage.toFixed(0)}%)</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};