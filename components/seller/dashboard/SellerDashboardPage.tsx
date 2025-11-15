import React, { useState } from 'react';
import { Seller } from '../../../types';
import { mockDashboardData, mockUsers } from '../../../services/api';
import { StatCard } from './StatCard';
import { EngagementChart } from './EngagementChart';
import { AudienceDonutChart } from './AudienceDonutChart';
import { InfoTables } from './InfoTables';
import { ChartBarIcon, UsersIcon, MessageIcon, CalendarIcon, CurrencyDollarIcon, TrendingUpIcon } from '../../common/Icons';
import GlobalInsightsTab from './GlobalInsightsTab';

interface SellerDashboardPageProps {
    seller: Seller;
    isEmbedded?: boolean;
}

const SubTabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-semibold border-b-2 ${
        active
          ? 'border-brand-primary text-brand-primary'
          : 'border-transparent text-gray-500 hover:text-brand-primary'
      }`}
    >
      {children}
    </button>
  );

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({ seller, isEmbedded = false }) => {
    const [activeSubTab, setActiveSubTab] = useState<'performance' | 'insights'>('performance');
    
    const totalRevenue = seller.solutions.reduce((sum, sol) => sum + (sol.revenueFromPlatform || 0), 0);
    const platformCost = seller.platformCostLTV;
    const roi = platformCost > 0 ? totalRevenue / platformCost : 0;
    
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {!isEmbedded && <h1 className="text-3xl font-bold">Analytics</h1>}
            
            <div className="border-b border-brand-border">
                <SubTabButton active={activeSubTab === 'performance'} onClick={() => setActiveSubTab('performance')}>Performance</SubTabButton>
                <SubTabButton active={activeSubTab === 'insights'} onClick={() => setActiveSubTab('insights')}>Global Insights</SubTabButton>
            </div>

            <div className="pt-4">
              {activeSubTab === 'performance' ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <StatCard title="Profile Views" value={mockDashboardData.stats.profileViews.value} change={mockDashboardData.stats.profileViews.change} icon={<UsersIcon className="w-6 h-6 text-gray-400"/>} />
                    <StatCard title="Engagement" value={mockDashboardData.stats.engagement.value} change={mockDashboardData.stats.engagement.change} icon={<ChartBarIcon className="w-6 h-6 text-gray-400"/>} />
                    <StatCard title="Platform ROI" value={`${roi.toFixed(1)}x`} change="" icon={<TrendingUpIcon className="w-6 h-6 text-gray-400"/>} />
                    <StatCard title="Enquiries" value={mockDashboardData.stats.enquiries.value} change={mockDashboardData.stats.enquiries.change} icon={<MessageIcon className="w-6 h-6 text-gray-400"/>} />
                    <StatCard title="Meetings" value={mockDashboardData.stats.meetings.value} change={mockDashboardData.stats.meetings.change} icon={<CalendarIcon className="w-6 h-6 text-gray-400"/>} />
                    <StatCard title="Platform Cost (LTV)" value={`₹${platformCost.toLocaleString('en-IN')}`} change="" icon={<CurrencyDollarIcon className="w-6 h-6 text-gray-400"/>} />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                          <EngagementChart data={mockDashboardData.engagementData} />
                      </div>
                      <div>
                          <AudienceDonutChart data={mockDashboardData.audienceData} />
                      </div>
                  </div>
                  <InfoTables
                      topPosts={mockDashboardData.topPosts}
                      recentActivity={mockDashboardData.recentActivity}
                      engagedCompanies={mockDashboardData.engagedCompanies}
                      users={mockUsers}
                  />
                </div>
              ) : (
                <GlobalInsightsTab seller={seller} />
              )}
            </div>
        </div>
    );
};