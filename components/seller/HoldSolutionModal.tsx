import React, { useState } from 'react';
import { Solution } from '../../types';
import { CloseIcon } from '../common/Icons';

interface HoldSolutionModalProps {
  solution: Solution;
  onClose: () => void;
  onSave: (solutionId: string, startDate: string, endDate: string) => void;
}

export const HoldSolutionModal: React.FC<HoldSolutionModalProps> = ({ solution, onClose, onSave }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || new Date(startDate) >= new Date(endDate)) {
      alert('Please select a valid date range. The end date must be after the start date.');
      return;
    }
    onSave(solution.id, startDate, endDate);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Put Solution on Hold</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            Select the period you want to pause billing for "{solution.name}". The solution will be hidden during this time.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button type="submit" className="px-6 py-2 rounded-md bg-brand-primary text-white font-semibold hover:bg-brand-secondary">
              Confirm Hold
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};