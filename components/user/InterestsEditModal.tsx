import React, { useState } from 'react';
import { User } from '../../types';
import { CloseIcon } from '../common/Icons';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';
import { mockFilterOptions } from '../../services/api';

interface InterestsEditModalProps {
  initialInterests: NonNullable<User['interests']>;
  onClose: () => void;
  onSave: (interests: NonNullable<User['interests']>) => void;
}

export const InterestsEditModal: React.FC<InterestsEditModalProps> = ({ initialInterests, onClose, onSave }) => {
  const [interests, setInterests] = useState({
      valueChain: initialInterests.valueChain || [],
      geography: initialInterests.geography || [],
      industry: initialInterests.industry || [],
      offering: initialInterests.offering || [],
  });

  const handleSubmit = () => {
    onSave(interests);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Edit Your Interests</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Select your interests to get better content recommendations.</p>
          <MultiSelectDropdown
            label="Value Chain"
            options={mockFilterOptions.valueChains}
            selectedItems={interests.valueChain}
            onChange={items => setInterests(prev => ({ ...prev, valueChain: items }))}
            maxSelection={5}
          />
          <MultiSelectDropdown
            label="Geography"
            options={mockFilterOptions.geographies}
            selectedItems={interests.geography}
            onChange={items => setInterests(prev => ({ ...prev, geography: items }))}
            maxSelection={5}
          />
          <MultiSelectDropdown
            label="Industry"
            options={mockFilterOptions.industries}
            selectedItems={interests.industry}
            onChange={items => setInterests(prev => ({ ...prev, industry: items }))}
            maxSelection={5}
          />
          <MultiSelectDropdown
            label="Offering"
            options={mockFilterOptions.offerings}
            selectedItems={interests.offering}
            onChange={items => setInterests(prev => ({ ...prev, offering: items }))}
            maxSelection={5}
          />
        </div>
        <div className="flex justify-end p-4 bg-brand-card-light rounded-b-lg border-t border-brand-border">
          <button onClick={handleSubmit} className="px-6 py-2 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-primary/80 transition-colors">
            Save Interests
          </button>
        </div>
      </div>
    </div>
  );
};