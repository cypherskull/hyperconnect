import React, { useMemo } from 'react';
import { Seller, User, InboxItem } from '../../types';
import { PlusIcon, CheckCircleIcon, StarIcon, LikeIcon, MessageIcon, CalendarIcon } from '../common/Icons';

interface SellerCardProps {
    seller: Seller;
    onSelectSeller: (seller: Seller) => void;
    currentUser: User;
    inboxItems: InboxItem[];
    onSendConnectionRequest: (sellerId: string) => void;
    onFollowSeller: (sellerId: string) => void;
    onLikeSellerToggle: (sellerId: string) => void;
    onMessage: (seller: Seller) => void;
    onMeeting: (seller: Seller) => void;
}

const Stat: React.FC<{label: string, value: string | number}> = ({label, value}) => (
    <div className="text-center">
        <p className="font-bold text-lg text-green-950 dark:text-white">{value}</p>
        <p className="text-xs text-green-900/80 dark:text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
);

const ActionButton: React.FC<{ onClick: (e: React.MouseEvent) => void, children: React.ReactNode, 'aria-label': string, isActive?: boolean, disabled?: boolean, title?: string }> = 
({ onClick, children, 'aria-label': ariaLabel, isActive = false, disabled = false, title }) => (
    <button
        onClick={onClick}
        aria-label={ariaLabel}
        disabled={disabled}
        title={title}
        className={`flex-1 flex flex-col items-center justify-center p-2 rounded-md transition-colors ${
            isActive 
                ? 'bg-brand-primary/20 text-brand-primary' 
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        {children}
    </button>
);


export const SellerCard: React.FC<SellerCardProps> = React.memo((props) => {
    const { seller, onSelectSeller, currentUser, inboxItems, onSendConnectionRequest, onFollowSeller, onLikeSellerToggle, onMessage, onMeeting } = props;
    const primarySolution = seller.solutions[0];

    const connectionStatus = useMemo(() => {
        if (currentUser.connections?.includes(seller.id)) return 'connected';
        const pendingRequest = inboxItems.find(item => 
            item.category === 'Connection Request' && 
            ((item.fromUser.id === currentUser.id && item.relatedSellerId === seller.id) || (item.relatedSellerId === currentUser.id)) && 
            item.status === 'Pending'
        );
        if (pendingRequest) return 'pending';
        return 'not_connected';
    }, [currentUser, inboxItems, seller.id]);

    const isFollowed = useMemo(() => currentUser.followedSellers?.includes(seller.id), [currentUser.followedSellers, seller.id]);
    const isLiked = useMemo(() => currentUser.likedSellers?.includes(seller.id), [currentUser.likedSellers, seller.id]);

    const ConnectionContent = () => {
        switch (connectionStatus) {
            case 'connected': return <><CheckCircleIcon className="w-5 h-5 text-green-600" /><span className="text-[10px] mt-1 font-semibold">Connected</span></>;
            case 'pending': return <><span className="text-xs font-bold">SENT</span><span className="text-[10px] mt-1 font-semibold">Request</span></>;
            default: return <><PlusIcon className="w-5 h-5" /><span className="text-[10px] mt-1 font-semibold">Connect</span></>;
        }
    };

    return (
        <div 
            className="bg-brand-secondary/25 dark:bg-brand-card backdrop-blur-sm rounded-lg shadow-lg border border-brand-secondary/30 dark:border-brand-border h-full flex flex-col overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-secondary/50"
        >
            <div className="p-4 flex-grow cursor-pointer" onClick={() => onSelectSeller(seller)}>
                <div className="flex items-center space-x-4 mb-3">
                    <img 
                        src={seller.companyLogoUrl} 
                        alt={`${seller.companyName} logo`}
                        className="w-16 h-16 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-lg text-gray-900 dark:text-white">{seller.companyName}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-400 truncate">{primarySolution?.industry.join(', ') || 'No solutions'}</p>
                    </div>
                </div>
                <p className="text-sm text-brand-secondary font-semibold text-center bg-brand-secondary/20 rounded p-2 mb-3">
                    {seller.keyImpacts[0] ? `${seller.keyImpacts[0].area}: ${seller.keyImpacts[0].value}` : "Innovative Solutions"}
                </p>
                <div className="flex justify-around items-center pt-3 border-t border-brand-secondary/20 dark:border-brand-border">
                    <Stat label="Clients" value={seller.businessStats.clients} />
                    <Stat label="Followers" value={seller.followers.toLocaleString()} />
                    <Stat label="Score" value={seller.platformScore} />
                </div>
            </div>
             <div className="p-3 bg-white/20 dark:bg-brand-card-light border-t border-brand-secondary/20 dark:border-brand-border flex items-center space-x-2">
                <ActionButton 
                    onClick={(e) => { e.stopPropagation(); onLikeSellerToggle(seller.id); }} 
                    aria-label={isLiked ? 'Unlike' : 'Like'} 
                    isActive={isLiked}
                    title={isLiked ? 'Unlike' : 'Like'}
                >
                    <LikeIcon className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
                    <span className="text-[10px] mt-1 font-semibold">Like</span>
                </ActionButton>
                <ActionButton
                    onClick={(e) => { e.stopPropagation(); if (connectionStatus === 'not_connected') onSendConnectionRequest(seller.id); }}
                    aria-label="Connect with Seller"
                    disabled={connectionStatus !== 'not_connected'}
                    isActive={connectionStatus === 'connected'}
                    title={connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}
                >
                    <ConnectionContent />
                </ActionButton>
                 <ActionButton onClick={(e) => { e.stopPropagation(); onMessage(seller); }} aria-label="Message Seller" title="Message">
                    <MessageIcon className="w-5 h-5" />
                    <span className="text-[10px] mt-1 font-semibold">Message</span>
                </ActionButton>
                 <ActionButton onClick={(e) => { e.stopPropagation(); onMeeting(seller); }} aria-label="Request Meeting" title="Meet">
                    <CalendarIcon className="w-5 h-5" />
                    <span className="text-[10px] mt-1 font-semibold">Meet</span>
                </ActionButton>
                <ActionButton 
                    onClick={(e) => { e.stopPropagation(); onFollowSeller(seller.id); }} 
                    aria-label={isFollowed ? 'Unfollow Seller' : 'Follow Seller'} 
                    isActive={isFollowed}
                    title={isFollowed ? 'Unfollow' : 'Follow'}
                >
                    <StarIcon className={`w-5 h-5 ${isFollowed ? 'text-yellow-500 fill-current' : ''}`} />
                    <span className="text-[10px] mt-1 font-semibold">Follow</span>
                </ActionButton>
            </div>
        </div>
    );
});