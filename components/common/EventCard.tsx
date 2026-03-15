import React from 'react';
import { Event, User } from '../../types';
import { CalendarIcon, GlobeAltIcon, ExternalLinkIcon, MapPinIcon, BriefcaseIcon, ChatBubbleLeftRightIcon } from './Icons';

interface EventCardProps {
    event: Event;
    onMessageProgramManager?: (managerId: string, eventTitle: string) => void;
    isOwner?: boolean;
    onEdit?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onMessageProgramManager, isOwner, onEdit }) => {
    const isSpeakingSoldOut = event.speakingSlots !== undefined && event.speakingSlots <= 0;
    const isDelegateSoldOut = event.delegateSlots !== undefined && event.delegateSlots <= 0;

    const handleContactManager = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onMessageProgramManager && event.programManagerId) {
            onMessageProgramManager(event.programManagerId, event.title);
        }
    };

    return (
        <div className="bg-brand-card rounded-lg shadow-sm border border-brand-border p-5 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-brand-accent line-clamp-2">{event.title}</h3>
                    {!event.isPublic && (
                        <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium tracking-wide border border-yellow-200">
                            Private Event
                        </span>
                    )}
                </div>
                {isOwner && onEdit && (
                    <button onClick={() => onEdit(event)} className="ml-2 text-sm text-brand-primary hover:text-brand-secondary">
                        Edit
                    </button>
                )}
            </div>

            <div className="space-y-3 mb-6 flex-1 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2">
                    <CalendarIcon className="w-5 h-5 shrink-0 text-brand-primary/70" />
                    <div>
                        <p className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} {event.endDate ? `- ${new Date(event.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}</p>
                        <p className="text-gray-500 text-xs">{event.time}</p>
                    </div>
                </div>

                <div className="flex items-start gap-2">
                    <MapPinIcon className="w-5 h-5 shrink-0 text-brand-primary/70" />
                    <p className="font-medium line-clamp-1">{event.venue}</p>
                </div>

                {(event.geography && event.geography.length > 0) && (
                    <div className="flex items-start gap-2">
                        <GlobeAltIcon className="w-5 h-5 shrink-0 text-brand-primary/70" />
                        <p className="line-clamp-1 text-xs">{event.geography.join(', ')}</p>
                    </div>
                )}

                {(event.industry && event.industry.length > 0) && (
                    <div className="flex items-start gap-2">
                        <BriefcaseIcon className="w-5 h-5 shrink-0 text-brand-primary/70" />
                        <p className="line-clamp-1 text-xs">{event.industry.join(', ')}</p>
                    </div>
                )}
            </div>

            <div className="border-t border-brand-border pt-4 mt-auto mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Speaking Opp:</span>
                    {event.speakingOpportunity ? (
                        <span className={`font-semibold ${isSpeakingSoldOut ? 'text-red-500' : 'text-green-600'}`}>
                            {isSpeakingSoldOut ? 'Sold Out' : `${event.speakingSlots} Open`}
                        </span>
                    ) : (
                        <span className="text-gray-400">None</span>
                    )}
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Delegate Reg:</span>
                    {event.delegateRegistration && event.delegateRegistration !== 'None' ? (
                        <span className={`font-semibold ${isDelegateSoldOut ? 'text-red-500' : 'text-brand-accent'}`}>
                            {event.delegateRegistration} ({isDelegateSoldOut ? <span className="text-red-500">Sold Out</span> : `${event.delegateSlots} Slots`})
                        </span>
                    ) : (
                        <span className="text-gray-400">N/A</span>
                    )}
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {event.registrationLink && (
                    <a href={event.registrationLink} target="_blank" rel="noopener noreferrer"
                        className="w-full text-center px-4 py-2 bg-brand-primary hover:bg-brand-secondary text-white rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        Register Now
                        <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                )}
                {event.programManagerId && (
                    <button
                        onClick={handleContactManager}
                        className="w-full px-4 py-2 bg-brand-card text-brand-primary border border-brand-primary/30 hover:bg-brand-primary/5 rounded-md text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        Contact Manager
                        <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};
