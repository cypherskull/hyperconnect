import React, { useState, useMemo } from 'react';
import { BarChart, BarChartData } from '../../common/BarChart';
import { mockSellers, parseTurnover } from '../../../services/api';
import { Seller } from '../../../types';
import { stringToColor } from '../../common/ColorUtils';

interface CompetitorChartProps {
  currentSeller: Seller;
}

const ToggleButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        active ? 'bg-brand-secondary text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

const CompetitorChart: React.FC<CompetitorChartProps> = ({ currentSeller }) => {
    const [metric, setMetric] = useState<'Turnover' | 'Engagement'>('Turnover');

    const chartData: BarChartData[] = useMemo(() => {
        const primaryIndustry = currentSeller.solutions[0]?.industry[0];
        if (!primaryIndustry) return [];

        const competitors = mockSellers.filter(s => 
            s.id !== currentSeller.id && s.solutions.some(sol => sol.industry.includes(primaryIndustry))
        );

        const allSellersInSector = [currentSeller, ...competitors];

        const processedData = allSellersInSector.map(seller => ({
            name: seller.companyName,
            value: metric === 'Turnover' ? parseTurnover(seller.businessStats.turnover) : seller.platformEngagement,
            color: seller.id === currentSeller.id ? '#4D96FF' : stringToColor(seller.companyName),
            tooltipData: {
                'Turnover': `₹${(parseTurnover(seller.businessStats.turnover) / 10000000).toFixed(2)} Cr`,
                'Engagement': seller.platformEngagement.toLocaleString(),
                'Geographies': new Set(seller.solutions.flatMap(s => s.geography)).size,
                'Solutions': seller.solutions.length
            }
        }));
        
        processedData.sort((a, b) => b.value - a.value);
        
        return processedData.slice(0, 10);

    }, [currentSeller, metric]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                    <h3 className="text-lg font-bold text-brand-accent">Competitor Market Share</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Comparing companies in the same primary industry: <span className="font-semibold">{currentSeller.solutions[0]?.industry[0]}</span></p>
                </div>
                <div className="flex space-x-2 bg-brand-card-light p-1 rounded-lg">
                    <ToggleButton active={metric === 'Turnover'} onClick={() => setMetric('Turnover')}>
                        By Turnover
                    </ToggleButton>
                    <ToggleButton active={metric === 'Engagement'} onClick={() => setMetric('Engagement')}>
                        By Engagement
                    </ToggleButton>
                </div>
            </div>
             {chartData.length > 1 ? (
                 <BarChart data={chartData} />
            ) : (
                <div className="text-center py-10 bg-brand-card-light rounded-lg">
                    <p className="text-gray-500">No competitor data available for this sector.</p>
                </div>
            )}
        </div>
    );
};
export default CompetitorChart;