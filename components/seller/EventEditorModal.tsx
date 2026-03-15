import React, { useState } from 'react';
import { Event } from '../../types';
import { CloseIcon } from '../common/Icons';
import { Input, Button, Textarea } from '../common/Forms';

interface EventEditorModalProps {
    event: Event | null; // null for new event
    onClose: () => void;
    onSave: (event: Event) => void;
}

export const EventEditorModal: React.FC<EventEditorModalProps> = ({ event, onClose, onSave }) => {
    const [title, setTitle] = useState(event?.title || '');
    const [date, setDate] = useState(event?.date || '');
    const [endDate, setEndDate] = useState(event?.endDate || '');
    const [time, setTime] = useState(event?.time || '');
    const [venue, setVenue] = useState(event?.venue || '');
    const [virtualLink, setVirtualLink] = useState(event?.virtualLink || '');
    const [isPublic, setIsPublic] = useState(event?.isPublic ?? true);

    // Arrays as comma separated strings for simplistic editing
    const [geography, setGeography] = useState(event?.geography?.join(', ') || '');
    const [industry, setIndustry] = useState(event?.industry?.join(', ') || '');
    const [valueChain, setValueChain] = useState(event?.valueChain?.join(', ') || '');

    const [registrationLink, setRegistrationLink] = useState(event?.registrationLink || '');
    const [speakingOpportunity, setSpeakingOpportunity] = useState(event?.speakingOpportunity ?? false);
    const [speakingSlots, setSpeakingSlots] = useState(event?.speakingSlots?.toString() || '0');

    const [delegateRegistration, setDelegateRegistration] = useState<Event['delegateRegistration']>(event?.delegateRegistration || 'None');
    const [delegateSlots, setDelegateSlots] = useState(event?.delegateSlots?.toString() || '0');
    const [programManagerId, setProgramManagerId] = useState(event?.programManagerId || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const updatedEvent: Event = {
            id: event?.id || `evt-${Date.now()}`,
            title,
            date,
            endDate,
            time,
            venue,
            virtualLink,
            geography: geography.split(',').map(s => s.trim()).filter(Boolean),
            industry: industry.split(',').map(s => s.trim()).filter(Boolean),
            valueChain: valueChain.split(',').map(s => s.trim()).filter(Boolean),
            registrationLink,
            speakingOpportunity,
            speakingSlots: parseInt(speakingSlots) || 0,
            delegateRegistration,
            delegateSlots: parseInt(delegateSlots) || 0,
            isPublic,
            programManagerId
        };
        onSave(updatedEvent);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-brand-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col pt-[70px]">
                <div className="flex justify-between items-center p-6 border-b border-brand-border">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-accent bg-clip-text text-transparent">
                        {event ? 'Edit Event' : 'Create New Event'}
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-accent rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto hide-scrollbar flex-1">
                    <form id="event-form" onSubmit={handleSubmit} className="space-y-6">
                        <Input label="Event Title" value={title} onChange={e => setTitle(e.target.value)} required />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Start Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            <Input label="End Date (Optional)" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            <Input label="Time (e.g., 10:00 AM EST)" value={time} onChange={e => setTime(e.target.value)} required />
                            <Input label="Venue / Location" value={venue} onChange={e => setVenue(e.target.value)} required />
                            <Input label="Virtual Meeting Link" value={virtualLink} onChange={e => setVirtualLink(e.target.value)} />
                            <Input label="Registration Link" value={registrationLink} onChange={e => setRegistrationLink(e.target.value)} />
                            <Input label="Program Manager ID" value={programManagerId} onChange={e => setProgramManagerId(e.target.value)} placeholder="User ID for direct messages" />
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-brand-accent border-b border-brand-border pb-2">Visibility & Tags</h3>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                                <label htmlFor="isPublic" className="text-sm font-medium">Public Event (Show in feed)</label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input label="Geography (comma separated)" value={geography} onChange={e => setGeography(e.target.value)} />
                                <Input label="Industry (comma separated)" value={industry} onChange={e => setIndustry(e.target.value)} />
                                <Input label="Value Chain (comma separated)" value={valueChain} onChange={e => setValueChain(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-brand-accent border-b border-brand-border pb-2">Slots & Registration</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input type="checkbox" id="spkOpp" checked={speakingOpportunity} onChange={e => setSpeakingOpportunity(e.target.checked)} className="rounded border-gray-300" />
                                        <label htmlFor="spkOpp" className="text-sm font-medium">Has Speaking Opportunities</label>
                                    </div>
                                    {speakingOpportunity && (
                                        <Input label="Available Speaking Slots" type="number" value={speakingSlots} onChange={e => setSpeakingSlots(e.target.value)} min="0" />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium block">Delegate Registration Type</label>
                                    <select value={delegateRegistration} onChange={e => setDelegateRegistration(e.target.value as any)} className="w-full h-11 px-4 py-2 border border-brand-border rounded-md bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                        <option value="None">None</option>
                                        <option value="Free">Free</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                    {delegateRegistration !== 'None' && (
                                        <Input label="Available Delegate Slots" type="number" value={delegateSlots} onChange={e => setDelegateSlots(e.target.value)} min="0" />
                                    )}
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                <div className="p-6 border-t border-brand-border bg-gray-50 flex justify-end space-x-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="event-form">Save Event</Button>
                </div>
            </div>
        </div>
    );
};
