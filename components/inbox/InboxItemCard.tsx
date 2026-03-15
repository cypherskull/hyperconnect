import React, { useState } from 'react';
import { InboxItem, InboxItemCategory, MeetingDetails, User } from '../../types';
import { UsersIcon, CalendarIcon, CurrencyDollarIcon, LikeIcon, EnvelopeIcon } from '../common/Icons';
import { MeetingInviteModal } from '../common/MeetingLinkModal';
import { SharedItemCard } from '../common/SharedItemCard';
import { useToast } from '../../context/ToastContext';

interface InboxItemCardProps {
    item: InboxItem;
    currentUser: User;
    onRespondToConnectionRequest: (itemId: string, response: 'Accepted' | 'Declined') => void;
    onRespondToItem: (item: InboxItem) => void;
}

const categoryDetails: Record<InboxItemCategory, { icon: React.FC<any>, color: string }> = {
    'ConnectionRequest': { icon: UsersIcon, color: 'text-blue-500' },
    'MeetingRequest': { icon: CalendarIcon, color: 'text-green-500' },
    'SalesEnquiry': { icon: CurrencyDollarIcon, color: 'text-yellow-500' },
    'Engagement': { icon: LikeIcon, color: 'text-pink-500' },
    'CollaborationRequest': { icon: UsersIcon, color: 'text-purple-500' },
    'Message': { icon: EnvelopeIcon, color: 'text-gray-500' },
};

export const InboxItemCard: React.FC<InboxItemCardProps> = React.memo(({ item, currentUser, onRespondToConnectionRequest, onRespondToItem }) => {
    const { fromUser, category, content, timestamp, status } = item;
    const { icon: Icon, color } = categoryDetails[category];
    const [isMeetingLinkModalOpen, setIsMeetingLinkModalOpen] = useState(false);
    const { showToast } = useToast();

    const timeAgo = (dateStr: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
        if (seconds < 60) return "Just now";
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    const renderActions = () => {
        if (status !== 'Pending') {
            let statusText = `This item has been actioned.`;
            if (item.category === 'ConnectionRequest' && item.connectionRequestDetails) {
                statusText = `You ${item.connectionRequestDetails.toLowerCase()} this request.`;
            } else if (item.category === 'MeetingRequest' && item.meetingDetails && item.meetingDetails.status !== 'pending') {
                statusText = `You ${item.meetingDetails?.status} this meeting.`;
            }
            return <p className="text-sm font-semibold text-gray-500">{statusText}</p>;
        }

        const isSentByMe = item.fromUser.id === currentUser.id;
        if (isSentByMe) {
            return <p className="text-sm italic text-gray-400">Sent (Pending response)</p>;
        }

        switch (category) {
            case 'ConnectionRequest':
                return (
                    <div className="flex space-x-2">
                        <button id="btn-accept-conn" onClick={() => onRespondToConnectionRequest(item.id, 'Accepted')} className="px-3 py-1 text-sm font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Accept</button>
                        <button id="btn-decline-conn" onClick={() => onRespondToConnectionRequest(item.id, 'Declined')} className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded-md">Decline</button>
                    </div>
                );
            case 'MeetingRequest':
                return (
                    <div className="flex space-x-2">
                        <button id="btn-accept-meeting" onClick={() => setIsMeetingLinkModalOpen(true)} className="px-3 py-1 text-sm font-semibold bg-green-500 text-white rounded-md hover:bg-green-600">Accept & Add Link</button>
                        <button id="btn-respond-meeting" onClick={() => onRespondToItem(item)} className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600">Respond</button>
                        <button id="btn-decline-meeting" className="px-3 py-1 text-sm font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded-md">Decline</button>
                    </div>
                );
            case 'SalesEnquiry':
            case 'CollaborationRequest':
            case 'Message':
                return (
                    <div className="flex space-x-2">
                        <button id="btn-respond-item" onClick={() => onRespondToItem(item)} className="px-3 py-1 text-sm font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary">Respond</button>
                        <button id="btn-archive-item" className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded-md">Archive</button>
                    </div>
                );
            default:
                return (
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-700 rounded-md">Archive</button>
                    </div>
                );
        }
    }

    return (
        <>
            <div className={`inbox-item-card p-4 bg-brand-card rounded-lg shadow-md border border-brand-border flex flex-col sm:flex-row items-start gap-4 ${status !== 'Pending' ? 'opacity-60' : ''}`}>
                <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto">
                    <Icon className={`w-6 h-6 ${color}`} />
                    <img src={fromUser.avatarUrl} alt={fromUser.name} className="w-12 h-12 rounded-full" />
                </div>
                <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-baseline">
                        <p className="font-bold truncate">
                            {item.fromUser.id === currentUser.id ? (
                                <>Sent to {item.toUser?.name || 'Seller'}</>
                            ) : (
                                <>{item.fromUser.name} <span className="text-gray-500 font-normal hidden md:inline">from {item.fromUser.company}</span></>
                            )}
                        </p>
                        <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{timeAgo(timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{content}</p>
                    {item.meetingDetails && (
                        <div className="text-sm mt-2 p-3 bg-brand-card-light rounded-md border border-brand-border/50 space-y-1">
                            <p className="font-semibold text-gray-700 dark:text-gray-200">Meeting Details:</p>
                            {item.meetingDetails.message && <p><strong>Message:</strong> "{item.meetingDetails.message}"</p>}
                            <p><strong>Time:</strong> {new Date(item.meetingDetails.proposedTime).toLocaleString()}</p>
                            {item.meetingDetails.meetingLink && <p><strong>Link:</strong> <a href={item.meetingDetails.meetingLink} className="text-brand-primary underline" target="_blank" rel="noopener noreferrer">Join Meeting</a> ({item.meetingDetails.platform})</p>}
                            {item.meetingDetails.additionalParticipants && item.meetingDetails.additionalParticipants.length > 0 && <p><strong>Participants:</strong> {item.meetingDetails.additionalParticipants.join(', ')}</p>}
                        </div>
                    )}
                    {item.attachments && item.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                            <p className="text-xs font-semibold text-gray-500">Attachments:</p>
                            {item.attachments.map((att, index) => (
                                <div key={index} className="w-full sm:w-2/3">
                                    <SharedItemCard content={att} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex-shrink-0 self-center sm:self-end mt-2 sm:mt-0">
                    {renderActions()}
                </div>
            </div>
            {isMeetingLinkModalOpen && (
                <MeetingInviteModal
                    mode="accept"
                    onClose={() => setIsMeetingLinkModalOpen(false)}
                    onSave={(details: Partial<Omit<MeetingDetails, 'status'>>) => {
                        showToast('success', 'Meeting Link Sent!', `Platform: ${details.platform}, Link: ${details.meetingLink}`);
                        // In a real app, you would update the item state here and notify the other user.
                        setIsMeetingLinkModalOpen(false);
                    }}
                />
            )}
        </>
    );
});