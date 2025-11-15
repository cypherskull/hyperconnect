// FIX: Consolidated component logic into this canonical PascalCase file to resolve casing conflicts.
import React, { useState, useMemo, useEffect } from 'react';
import { Seller, Post as PostType, User, Solution, InboxItem, DueDiligenceData } from '../../types';
import { ProfileTabs } from './ProfileTabs';
import { PostsTab } from './PostsTab';
import { ManageTab } from './ManageTab';
import { SellerDashboardPage } from './dashboard/SellerDashboardPage';
import { ArrowLeftIcon, UsersIcon, CurrencyDollarIcon } from '../common/Icons';
import { TabButton } from '../common/TabButton';
import InvestmentTab from './investment/InvestmentTab';
import LockedFeatureCard from '../common/LockedFeatureCard';

export type ProfileTab = 'about' | 'posts' | 'manage' | 'analytics' | 'investment';

interface SellerProfilePageProps {
    seller: Seller;
    allPosts: PostType[];
    currentUser: User;
    inboxItems: InboxItem[];
    initialSolutionId?: string;
    initialTab?: ProfileTab;
    initialPostId?: string;
    onBack: () => void;
    onSelectSeller: (seller: Seller, options?: { solutionId?: string; tab?: ProfileTab; postId?: string }) => void;
    onLikePost: (postId: string) => void;
    onBookmarkPost: (postId: string) => void;
    onComment: (post: PostType) => void;
    onSendConnectionRequest: () => void;
    onFollowSeller: () => void;
    onOpenPostCreator: (solution: Solution, shareItem?: any, postToEdit?: PostType | null) => void;
    onAddTestimonial: () => void;
    onUpdateSolutions: (solutions: Solution[]) => void;
    onMessage: () => void;
    onMeeting: () => void;
    // Monetization actions
    onActivateSolution: (solutionId: string) => void;
    onSetSolutionHold: (solutionId: string, startDate: string, endDate: string) => void;
    onCancelSolutionHold: (solutionId: string) => void;
    onToggleInvestmentStatus: (sellerId: string, status: boolean) => void;
    onUpdateDueDiligence: (sellerId: string, data: DueDiligenceData) => void;
}

const SellerHeader: React.FC<{
    seller: Seller;
    connectionStatus: 'connected' | 'pending' | 'not_connected';
    isFollowed: boolean;
    isOwner: boolean;
    onSendConnectionRequest: () => void;
    onFollowSeller: () => void;
    onMessage: () => void;
    onMeeting: () => void;
    onAddTestimonial: () => void;
}> = ({ seller, connectionStatus, isFollowed, isOwner, onSendConnectionRequest, onFollowSeller, onMessage, onMeeting, onAddTestimonial }) => {

    const ConnectionButton = () => {
         switch (connectionStatus) {
            case 'connected':
                return <button disabled className="w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-sm bg-gray-200 dark:bg-gray-700 cursor-default">Connected</button>;
            case 'pending':
                return <button disabled className="w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-sm bg-gray-200 dark:bg-gray-700 cursor-default">Request Sent</button>;
            default:
                return <button onClick={onSendConnectionRequest} className="w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-sm bg-brand-primary text-white hover:bg-brand-secondary">Connect</button>;
        }
    }
    
    return (
        <div className="bg-brand-card rounded-lg shadow-md p-6 border border-brand-border">
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <img src={seller.companyLogoUrl} alt={seller.companyName} className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800" />
                <div className="flex-grow">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold">{seller.companyName}</h1>
                        {seller.isOpenForInvestment && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full">
                                <CurrencyDollarIcon className="w-4 h-4" />
                                Open for Investment
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 mt-1">
                        <span>{seller.solutions[0]?.industry.join(', ')}</span>
                        <div className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4" />
                            <span className="font-semibold">{seller.followers.toLocaleString()}</span>
                            <span>followers</span>
                        </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">{seller.about}</p>
                </div>
                {!isOwner && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-shrink-0 w-full sm:w-auto">
                        <ConnectionButton />
                        <button onClick={onMessage} className="w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-sm bg-brand-secondary text-white">Message</button>
                        <button onClick={onMeeting} className="w-full sm:w-auto px-4 py-2 rounded-md font-semibold text-sm border border-brand-border">Request Meeting</button>
                    </div>
                )}
            </div>
            {!isOwner && (
                 <div className="mt-4 pt-4 border-t border-brand-border flex items-center gap-4">
                     <button onClick={onFollowSeller} className={`font-semibold text-sm ${isFollowed ? 'text-brand-primary' : 'text-gray-500'}`}>
                         {isFollowed ? 'Following' : 'Follow'}
                     </button>
                     <button onClick={onAddTestimonial} className="font-semibold text-sm text-gray-500 hover:text-brand-primary">
                        Write a Testimonial
                     </button>
                 </div>
            )}
        </div>
    );
};

export const SellerProfilePage: React.FC<SellerProfilePageProps> = (props) => {
    const { seller, allPosts, currentUser, inboxItems, onBack, onSelectSeller, onUpdateSolutions, onOpenPostCreator, onAddTestimonial, onSendConnectionRequest, onMessage, onMeeting, initialPostId, onActivateSolution, onSetSolutionHold, onCancelSolutionHold, onToggleInvestmentStatus, onUpdateDueDiligence } = props;
    
    const [activeTab, setActiveTab] = useState<ProfileTab>(props.initialTab || 'about');
    const [selectedSolutionId] = useState<string>(props.initialSolutionId || seller.solutions[0]?.id);

    useEffect(() => {
        if (props.initialTab === 'posts' && initialPostId) {
            // Need a small delay for the content to render
            setTimeout(() => {
                const postElement = document.getElementById(`post-${initialPostId}`);
                if (postElement) {
                    postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Add a temporary highlight effect
                    postElement.style.transition = 'background-color 0.5s';
                    postElement.style.backgroundColor = 'var(--color-primary-accent-translucent)'; // A temporary highlight color
                    setTimeout(() => {
                        postElement.style.backgroundColor = '';
                    }, 2000);
                }
            }, 100);
        }
    }, [initialPostId, props.initialTab]);
    
    const isOwner = currentUser.company === seller.companyName && currentUser.persona === 'Seller';
    const isFollowed = !!currentUser.followedSellers?.includes(seller.id);

    const connectionStatus = useMemo(() => {
        if (currentUser.connections?.includes(seller.id)) return 'connected';
        const pendingRequest = inboxItems.find(item => 
            item.category === 'Connection Request' && 
            ((item.fromUser.id === currentUser.id && item.relatedSellerId === seller.id) || 
             (item.relatedSellerId === currentUser.id)) && // check both ways for profile view
            item.status === 'Pending'
        );
        if (pendingRequest) return 'pending';
        return 'not_connected';
    }, [currentUser, inboxItems, seller.id]);

    const sellerPosts = useMemo(() => allPosts.filter(p => p.sellerId === seller.id && seller.solutions.find(s => s.id === p.solutionId && s.status === 'active')), [allPosts, seller]);
    
    const selectedSolution = seller.solutions.find(s => s.id === selectedSolutionId) || seller.solutions[0];
    
    const renderContent = () => {
        if (!selectedSolution && !['manage', 'analytics', 'investment'].includes(activeTab)) {
            return isOwner 
                ? <div className="text-center p-8">Go to the 'Manage' tab to add your first solution.</div>
                : <div className="text-center p-8">This seller has not configured any solutions.</div>
        }
        switch (activeTab) {
            case 'posts':
                return <PostsTab 
                    posts={sellerPosts} 
                    seller={seller}
                    isOwner={isOwner}
                    onSelectSeller={onSelectSeller}
                    onLikePost={props.onLikePost}
                    onBookmarkPost={props.onBookmarkPost}
                    onComment={props.onComment}
                    onSendConnectionRequest={onSendConnectionRequest}
                    onMessage={onMessage}
                    onMeeting={onMeeting}
                    onEditPost={(post) => onOpenPostCreator(selectedSolution, null, post)}
                    currentUser={currentUser}
                    inboxItems={inboxItems}
                />;
            case 'manage':
                return isOwner ? <ManageTab seller={seller} onUpdateSolutions={onUpdateSolutions} onOpenCreator={onOpenPostCreator} onActivateSolution={onActivateSolution} onSetSolutionHold={onSetSolutionHold} onCancelSolutionHold={onCancelSolutionHold} onToggleInvestmentStatus={onToggleInvestmentStatus} /> : <p>Access denied.</p>;
            case 'analytics':
                 return isOwner ? <SellerDashboardPage seller={seller} isEmbedded /> : <p>Access denied.</p>;
            case 'investment':
                if (currentUser.persona !== 'Investor' && !isOwner) {
                     return <LockedFeatureCard title="Investor Access Only" message="This dashboard is exclusively available to users with an Investor persona." />
                }
                if (!seller.dueDiligence) {
                     return <div className="text-center p-8">This seller has not provided detailed investment data.</div>;
                }
                 return <InvestmentTab seller={seller} isOwner={isOwner} onUpdateDueDiligence={onUpdateDueDiligence} />;
            case 'about':
            default:
                return <ProfileTabs seller={seller} solution={selectedSolution} posts={sellerPosts} isOwner={isOwner} />;
        }
    };

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-primary">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back</span>
            </button>
            <SellerHeader 
                seller={seller} 
                connectionStatus={connectionStatus}
                isFollowed={isFollowed}
                isOwner={isOwner}
                onSendConnectionRequest={onSendConnectionRequest}
                onFollowSeller={props.onFollowSeller}
                onMessage={onMessage}
                onMeeting={onMeeting}
                onAddTestimonial={onAddTestimonial}
            />

            <div className="border-b border-brand-border flex space-x-2">
                <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} variant="underline">About</TabButton>
                <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} variant="underline">Posts ({sellerPosts.length})</TabButton>
                {seller.isOpenForInvestment && (currentUser.persona === 'Investor' || isOwner) && <TabButton active={activeTab === 'investment'} onClick={() => setActiveTab('investment')} variant="underline">Investment</TabButton>}
                {isOwner && <TabButton active={activeTab === 'manage'} onClick={() => setActiveTab('manage')} variant="underline">Manage</TabButton>}
                {isOwner && <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} variant="underline">Analytics</TabButton>}
            </div>

            <div>{renderContent()}</div>
        </div>
    );
};
