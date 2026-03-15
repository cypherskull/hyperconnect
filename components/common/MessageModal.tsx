import React, { useState } from 'react';
import { Seller } from '../../types';
import { CloseIcon } from './Icons';
import { Textarea, Button } from './Forms';
import * as api from '../../services/apiService';
import * as authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

interface MessageModalProps {
  seller: Seller;
  onClose: () => void;
}

export const MessageModal: React.FC<MessageModalProps> = ({ seller, onClose }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') return;
    const token = authService.getToken();
    if (!token) {
      showToast('error', 'Not Logged In', 'You must be logged in to send a message.');
      return;
    }
    setSending(true);
    try {
      await api.sendMessage(token, seller.id, message.trim());
      setSent(true);
      showToast('success', 'Message Sent!', `Your message to ${seller.companyName} was delivered.`);
      setTimeout(onClose, 1500);
    } catch (err) {
      console.error(err);
      showToast('error', 'Send Failed', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div id="message-modal" className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Message {seller.companyName}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5" /></button>
        </div>
        {sent ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <svg className="w-9 h-9 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-bold text-lg text-emerald-700 dark:text-emerald-300">Message Sent!</p>
            <p className="text-sm text-gray-500">Your message to <span className="font-semibold">{seller.companyName}</span> has been delivered.</p>
          </div>
        ) : (
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
              <Button type="submit" className="px-6 rounded-[10px]" disabled={sending}>
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};