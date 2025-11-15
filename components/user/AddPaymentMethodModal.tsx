import React, { useState } from 'react';
import { PaymentMethod } from '../../types';
import { CloseIcon, CreditCardIcon, BanknotesIcon } from '../common/Icons';

interface AddPaymentMethodModalProps {
  onClose: () => void;
  onAddMethod: (method: Omit<PaymentMethod, 'id'>) => void;
}

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onAddMethod }) => {
  const [type, setType] = useState<'Card' | 'Netbanking'>('Card');
  const [provider, setProvider] = useState('');
  const [last4, setLast4] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !last4) {
      alert('Please fill all fields.');
      return;
    }
    onAddMethod({ type, provider, last4 });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Add Payment Method</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Type</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setType('Card')} className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg ${type === 'Card' ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'}`}>
                <CreditCardIcon className="w-5 h-5" /> Card
              </button>
              <button type="button" onClick={() => setType('Netbanking')} className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg ${type === 'Netbanking' ? 'border-brand-primary bg-brand-primary/10' : 'border-brand-border'}`}>
                <BanknotesIcon className="w-5 h-5" /> Netbanking
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{type === 'Card' ? 'Card Provider' : 'Bank Name'}</label>
            <input
              type="text"
              value={provider}
              onChange={e => setProvider(e.target.value)}
              placeholder={type === 'Card' ? 'e.g., Visa, Mastercard' : 'e.g., HDFC Bank'}
              className="w-full p-2 text-lg border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{type === 'Card' ? 'Last 4 Digits' : 'Account Number (last 4)'}</label>
            <input
              type="text"
              value={last4}
              onChange={e => setLast4(e.target.value.replace(/\D/g, ''))}
              maxLength={4}
              placeholder="1234"
              className="w-full p-2 text-lg border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
              required
            />
          </div>
          <button type="submit" className="w-full py-3 px-4 rounded-md text-center bg-brand-secondary text-white font-semibold hover:bg-brand-secondary/80 transition-colors">
            Save Method
          </button>
        </form>
      </div>
    </div>
  );
};