import React, { useState } from 'react';
import { User, Seller } from '../../types';
import { Cog6ToothIcon, UsersIcon, ShieldCheckIcon } from '../common/Icons';

interface AdminPersonaSwitcherProps {
  allUsers: User[];
  currentUser: User;
  onSwitchUser: (user: User) => void;
  allSellers: Seller[];
  onUpdateSellerTier: (sellerId: string, tier: 'Free' | 'Basic' | 'Premium') => void;
  onNavigateAdmin: () => void;
}

export const AdminPersonaSwitcher: React.FC<AdminPersonaSwitcherProps> = ({ allUsers, currentUser, onSwitchUser, allSellers, onUpdateSellerTier, onNavigateAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentSeller = currentUser.persona === 'Seller' 
    ? allSellers.find(s => s.companyName === currentUser.company)
    : null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`absolute bottom-full right-0 mb-2 w-72 bg-brand-card rounded-lg shadow-2xl border border-brand-border transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="p-3 border-b border-brand-border">
          <h3 className="font-bold text-sm text-brand-accent flex items-center"><UsersIcon className="w-4 h-4 mr-2" /> Impersonate User</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select a user to view the app as them.</p>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {allUsers.map(user => (
            <button
              key={user.id}
              onClick={() => {
                onSwitchUser(user);
                setIsOpen(false);
              }}
              className={`w-full text-left flex items-center p-3 space-x-3 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${currentUser.id === user.id ? 'bg-brand-primary/10' : ''}`}
            >
              <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
              <div>
                <p className={`font-semibold text-sm ${currentUser.id === user.id ? 'text-brand-primary' : ''}`}>{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.persona} - {user.company}</p>
              </div>
            </button>
          ))}
        </div>
        {currentSeller && (
            <div className="p-3 border-t border-brand-border">
                <h4 className="font-bold text-xs text-brand-accent mb-2">Subscription Tier</h4>
                <div className="flex justify-between space-x-1">
                    {(['Free', 'Basic', 'Premium'] as const).map(tier => (
                        <button 
                            key={tier}
                            onClick={() => onUpdateSellerTier(currentSeller.id, tier)}
                            className={`w-full px-2 py-1 text-xs font-semibold rounded-md transition-colors ${currentSeller.subscriptionTier === tier ? 'bg-brand-secondary text-white' : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500'}`}
                        >
                            {tier}
                        </button>
                    ))}
                </div>
            </div>
        )}
        <div className="p-2 border-t border-brand-border">
          <button onClick={onNavigateAdmin} className="w-full flex items-center justify-center space-x-2 p-2 text-sm font-semibold text-brand-secondary hover:bg-brand-secondary/10 rounded-md">
            <ShieldCheckIcon className="w-5 h-5" />
            <span>Platform Settings</span>
          </button>
        </div>
      </div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-primary rounded-full shadow-lg flex items-center justify-center text-white hover:bg-brand-secondary transition-all transform hover:rotate-45"
        aria-label="Open Admin Controls"
      >
        <Cog6ToothIcon className="w-8 h-8" />
      </button>
    </div>
  );
};