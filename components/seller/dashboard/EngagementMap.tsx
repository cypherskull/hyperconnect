import React, { useState, useMemo } from 'react';
import { PieChart, PieChartData } from '../../common/PieChart';
import { mockEngagementEvents, mockUsers } from '../../../services/api';
import { User, Persona } from '../../../types';
import { stringToColor } from '../../common/ColorUtils';

const personaColors: Record<Persona, string> = {
    Buyer: '#4D96FF',
    Seller: '#FF6B6B',
    Investor: '#FFD93D',
    Collaborator: '#6BCB77',
    Browser: '#9CA3AF',
    Admin: '#6B7280',
};

type ViewMode = 'Persona' | 'Country' | 'City';

const ToggleButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
        active ? 'bg-brand-primary text-white' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
);

const EngagementMap: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('Persona');

    const chartData: PieChartData[] = useMemo(() => {
        if (viewMode === 'Persona') {
            const engagementByPersona = mockEngagementEvents.reduce((acc, event) => {
                const user = mockUsers.find(u => u.id === event.userId);
                if (user) {
                    acc[user.persona] = (acc[user.persona] || 0) + 1;
                }
                return acc;
            }, {} as Record<Persona, number>);

            return (Object.entries(engagementByPersona) as [Persona, number][])
                .map(([persona, count]) => ({
                    name: persona,
                    value: count,
                    color: personaColors[persona as Persona] || '#CCCCCC'
                }))
                .filter(item => item.value > 0);

        } else if (viewMode === 'Country') {
             const engagementByCountry = mockEngagementEvents.reduce((acc, event) => {
                const country = event.location.country;
                acc[country] = (acc[country] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return (Object.entries(engagementByCountry) as [string, number][])
                .map(([country, count]) => ({
                    name: country,
                    value: count,
                    color: stringToColor(country)
                }));
        } else { // City
            const engagementByCity = mockEngagementEvents.reduce((acc, event) => {
                const city = event.location.city;
                acc[city] = (acc[city] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            
            const sortedCities = (Object.entries(engagementByCity) as [string, number][])
                .sort(([, a], [, b]) => b - a)
                .map(([city, count]) => ({
                    name: city,
                    value: count,
                    color: stringToColor(city)
                }));

            // Group smaller cities into "Others" for clarity
            const topN = 7;
            if(sortedCities.length > topN) {
                const topCities = sortedCities.slice(0, topN);
                const otherValue = sortedCities.slice(topN).reduce((acc, item) => acc + item.value, 0);
                return [...topCities, { name: 'Others', value: otherValue, color: '#6B7280' }];
            }
            return sortedCities;
        }

    }, [viewMode]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <div>
                    <h3 className="text-lg font-bold text-brand-accent">Engagement by {viewMode}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Breakdown of global user interactions.</p>
                </div>
                <div className="flex space-x-2 bg-brand-card-light p-1 rounded-lg">
                    <ToggleButton active={viewMode === 'Persona'} onClick={() => setViewMode('Persona')}>Persona</ToggleButton>
                    <ToggleButton active={viewMode === 'Country'} onClick={() => setViewMode('Country')}>Country</ToggleButton>
                    <ToggleButton active={viewMode === 'City'} onClick={() => setViewMode('City')}>City</ToggleButton>
                </div>
            </div>

            {chartData.length > 0 ? (
                 <PieChart data={chartData} title="Total Engagements" />
            ) : (
                <div className="text-center py-10 bg-brand-card-light rounded-lg">
                    <p className="text-gray-500">No engagement data available.</p>
                </div>
            )}
        </div>
    );
};
export default EngagementMap;