import React from 'react';
import { Seller } from '../../types';
import { ChartBarIcon, UsersIcon, CurrencyDollarIcon } from '../common/Icons';

interface FavouriteSellerCardProps {
  seller: Seller;
  onSelectSeller: (seller: Seller) => void;
}

const Metric: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex items-center space-x-2 text-sm">
        <p className="font-semibold text-gray-700 dark:text-gray-200">{value}</p>
        <p className="text-gray-500 dark:text-gray-400">{label}</p>
    </div>
);


export const FavouriteSellerCard: React.FC<FavouriteSellerCardProps> = React.memo(({ seller, onSelectSeller }) => {
  return (
    <div
      className="bg-brand-card rounded-lg shadow-md p-5 border border-brand-border cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all"
      onClick={() => onSelectSeller(seller)}
    >
        <div className="flex items-center space-x-4 mb-4">
            <img 
                src={seller.companyLogoUrl} 
                alt={`${seller.companyName} logo`}
                className="w-16 h-16 rounded-full border-2 border-white/20"
            />
            <div>
                <h3 className="font-bold text-lg leading-tight">{seller.companyName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{seller.solutions?.[0]?.industry.join(', ')}</p>
            </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {seller.about}
        </p>
        <div className="flex justify-between items-center pt-3 border-t border-brand-border text-xs">
            <Metric label="Clients" value={seller.businessStats?.clients?.toLocaleString() ?? 'N/A'} />
            <Metric label="Turnover" value={seller.businessStats?.turnover ?? 'N/A'} />
        </div>
    </div>
  );
});