import React, { useState } from 'react';
import { Seller } from '../../types';
import { CloseIcon } from './Icons';
import { Textarea, Button } from './Forms';

interface MessageModalProps {
  seller: Seller;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ seller, onClose }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    // In a real app, this would dispatch the message
    console.log(`Sending message to ${seller.companyName}:`, message);
    alert(`Message sent to ${seller.companyName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Message {seller.companyName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Your message to ${seller.companyName}...`}
              rows={6}
              required
            />
          </div>
          <div className="flex justify-end p-4 bg-brand-card-light rounded-b-lg border-t border-brand-border">
            <Button type="submit" className="px-6 rounded-[10px]">
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};