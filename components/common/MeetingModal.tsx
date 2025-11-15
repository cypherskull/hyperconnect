import React, { useState } from 'react';
import { Seller } from '../../types';
import { CloseIcon } from './Icons';
import { Input, Textarea, Button, Label } from './Forms';

interface MeetingModalProps {
  seller: Seller;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ seller, onClose }) => {
  const [proposedTime, setProposedTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedTime.trim() === '') return;
    // In a real app, this would send the meeting request
    console.log(`Requesting meeting with ${seller.companyName} at ${proposedTime}. Message:`, message);
    alert(`Meeting request sent to ${seller.companyName}!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Request Meeting with {seller.companyName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
             <div>
                <Label>Proposed Date & Time</Label>
                <Input
                    type="datetime-local"
                    value={proposedTime}
                    onChange={(e) => setProposedTime(e.target.value)}
                    required
                />
            </div>
            <div>
                 <Label>Message (Optional)</Label>
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Include a brief agenda or introduction..."
                    rows={4}
                />
            </div>
          </div>
          <div className="flex justify-end p-4 bg-brand-card-light rounded-b-lg border-t border-brand-border">
            <Button type="submit" className="px-6 rounded-[10px]">
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};