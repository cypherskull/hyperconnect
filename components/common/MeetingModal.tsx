import React, { useState } from 'react';
import { Seller } from '../../types';
import { CloseIcon } from './Icons';
import { Input, Textarea, Button, Label } from './Forms';
import * as api from '../../services/apiService';
import * as authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface MeetingModalProps {
  seller: Seller;
  onClose: () => void;
}

export const MeetingModal: React.FC<MeetingModalProps> = ({ seller, onClose }) => {
  const [proposedTime, setProposedTime] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedTime.trim() === '') return;
    const token = authService.getToken();
    if (!token) {
      showToast('error', 'Not Logged In', 'You must be logged in to request a meeting.');
      return;
    }
    setSending(true);
    try {
      await api.sendMeetingRequest(token, seller.id, proposedTime, message || undefined);
      setSent(true);
      showToast('success', 'Meeting Requested!', `Your meeting request was sent to ${seller.companyName}.`);
      setTimeout(onClose, 1800);
    } catch (err) {
      console.error(err);
      showToast('error', 'Request Failed', 'Failed to send meeting request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div id="meeting-modal" className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Request Meeting with {seller.companyName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5" /></button>
        </div>
        {sent ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg className="w-9 h-9 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-lg text-emerald-700 dark:text-emerald-300">Meeting Requested!</p>
            <p className="text-sm text-gray-500"><span className="font-semibold">{seller.companyName}</span> will be notified of your meeting request.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              <div>
                <Label>Proposed Date &amp; Time</Label>
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
              <Button type="submit" className="px-6 rounded-[10px]" disabled={sending}>
                {sending ? 'Sending...' : 'Send Request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};