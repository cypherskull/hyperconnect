import React, { useState } from 'react';
import { CloseIcon } from '../common/Icons';
import { Input, Button } from '../common/Forms';

interface AddFundsModalProps {
  onClose: () => void;
  onAddFunds: (amount: number) => void;
}

export const AddFundsModal: React.FC<AddFundsModalProps> = ({ onClose, onAddFunds }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }
    onAddFunds(numericAmount);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Add Funds to Wallet</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g., 5000"
              min="1"
              className="text-lg"
              required
            />
          </div>
          <Button type="submit" variant="secondary" className="w-full py-3">
            Add Funds
          </Button>
        </form>
      </div>
    </div>
  );
};