import React from 'react';
import { Solution, Seller } from '../../types';

interface SolutionSlideCardProps {
  solution: Solution;
  seller: Seller;
  onSelectSeller: (seller: Seller) => void;
  score: number;
  onClick: () => void;
}

export const SolutionSlideCard: React.FC<SolutionSlideCardProps> = ({ solution, seller, onSelectSeller, score, onClick }) => {
  return (
    <div 
      className="w-full h-full rounded-lg shadow-lg flex overflow-hidden relative group/card cursor-pointer"
      onClick={onClick}
    >
      <div className="w-1/2 relative">
        <img src={solution.imageUrl || `https://picsum.photos/seed/${solution.id}/400`} alt={solution.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col items-center justify-end text-white p-4 text-center">
            <p className="font-bold tracking-wider text-white text-xl mb-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>{solution.name}</p>
            <p className="font-bold leading-none" style={{ fontSize: '48px', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
                {score}
            </p>
            <p className="text-xs uppercase tracking-widest -mt-1">Engagements</p>
        </div>
      </div>
      <div className="w-1/2 p-6 flex flex-col justify-center bg-stone-100 dark:bg-stone-800">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{solution.name}</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{solution.shortDescription}</p>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onSelectSeller(seller);
          }}
          className="mt-4 px-4 py-2 text-sm font-semibold bg-brand-primary text-white rounded-[10px] hover:bg-brand-primary/70 transition-colors self-start relative">
          Details
        </button>
      </div>
    </div>
  );
};