import React from 'react';
import { Seller } from '../../../types';
import EngagementMap from './EngagementMap';
import CompetitorChart from './CompetitorMap';

interface GlobalInsightsTabProps {
  seller: Seller;
}

const GlobalInsightsTab: React.FC<GlobalInsightsTabProps> = ({ seller }) => {
  return (
    <div className="space-y-8">
      <div className="bg-brand-card rounded-lg shadow-md border border-brand-border p-4 sm:p-6">
        <EngagementMap />
      </div>
       <div className="bg-brand-card rounded-lg shadow-md border border-brand-border p-4 sm:p-6">
        <CompetitorChart currentSeller={seller} />
      </div>
    </div>
  );
};
export default GlobalInsightsTab;