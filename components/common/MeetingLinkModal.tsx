import React, { useState } from 'react';
import { CloseIcon } from './Icons';
import { MeetingPlatform, MeetingDetails } from '../../types';

interface MeetingInviteModalProps {
  mode: 'propose' | 'accept';
  onClose: () => void;
  onSave: (details: Partial<Omit<MeetingDetails, 'status'>>) => void;
}

export const MeetingInviteModal: React.FC<MeetingInviteModalProps> = ({ mode, onClose, onSave }) => {
  const [platform, setPlatform] = useState<MeetingPlatform>('Google Meet');
  const [meetingLink, setMeetingLink] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [additionalParticipants, setAdditionalParticipants] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingLink.trim() || !meetingLink.startsWith('http')) {
        alert('Please enter a valid meeting URL.');
        return;
    };
    if (mode === 'propose' && !proposedTime) {
        alert('Please select a date and time for the meeting.');
        return;
    }

    onSave({
        platform,
        meetingLink,
        proposedTime: proposedTime || new Date().toISOString(),
        message,
        additionalParticipants: additionalParticipants.split(',').map(email => email.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">{mode === 'propose' ? 'Create Meeting Invite' : 'Add Meeting Link'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {mode === 'propose' && (
                 <div>
                    <label className="block text-sm font-medium mb-1">Proposed Date & Time*</label>
                    <input
                        type="datetime-local"
                        value={proposedTime}
                        onChange={(e) => setProposedTime(e.target.value)}
                        className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                        required
                    />
                </div>
            )}
             <div>
                <label className="block text-sm font-medium mb-1">Platform*</label>
                <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as MeetingPlatform)}
                    className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                >
                    <option>Google Meet</option>
                    <option>Microsoft Teams</option>
                    <option>Zoom</option>
                </select>
            </div>
            <div>
                 <label className="block text-sm font-medium mb-1">Meeting URL*</label>
                <input
                    type="url"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                    required
                />
            </div>
             {mode === 'propose' && (
                <>
                    <div>
                        <label className="block text-sm font-medium mb-1">Additional Participants (comma-separated emails)</label>
                        <textarea
                            value={additionalParticipants}
                            onChange={(e) => setAdditionalParticipants(e.target.value)}
                            placeholder="participant1@email.com, participant2@email.com"
                            rows={2}
                            className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Message / Agenda (Optional)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Include a brief agenda or introduction..."
                            rows={3}
                            className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none"
                        />
                    </div>
                </>
            )}
          </div>
          <div className="flex justify-end p-4 bg-brand-card-light rounded-b-lg border-t border-brand-border">
            <button type="submit" className="px-6 py-2 rounded-[10px] bg-brand-primary text-white font-semibold hover:bg-brand-primary/70 transition-colors">
              {mode === 'propose' ? 'Attach Invite' : 'Save & Send Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};