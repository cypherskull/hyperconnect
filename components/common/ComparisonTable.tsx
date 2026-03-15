
import React from 'react';
import { ComparisonMetric } from '../../types';

interface ComparisonTableProps {
    title: string;
    metrics: ComparisonMetric[];
    competitor1Name?: string;
    competitor2Name?: string;
}

export const ComparisonTable: React.FC<ComparisonTableProps> = ({ 
    title, 
    metrics, 
    competitor1Name = "Competitor 1", 
    competitor2Name = "Competitor 2" 
}) => {
    return (
        <div className="bg-brand-card rounded-lg shadow-sm border border-brand-border overflow-hidden">
            <div className="bg-brand-card-light px-4 py-3 border-b border-brand-border">
                <h3 className="font-bold text-gray-700 dark:text-gray-200">{title}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <th className="px-4 py-3">Metric</th>
                            <th className="px-4 py-3 text-brand-primary">This Business</th>
                            <th className="px-4 py-3">Industry Avg.</th>
                            <th className="px-4 py-3 text-gray-600 dark:text-gray-400">{competitor1Name}</th>
                            <th className="px-4 py-3 text-gray-600 dark:text-gray-400">{competitor2Name}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {metrics.map((metric, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{metric.name}</td>
                                <td className="px-4 py-3 font-bold text-brand-primary bg-brand-primary/5">{metric.businessValue}</td>
                                <td className="px-4 py-3">{metric.industryAverage}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{metric.competitor1}</td>
                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{metric.competitor2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
