import React from 'react';
import { Post as PostType, Seller, User, InboxItem } from '../../types';
import { SellerCarousel } from './SellerCarousel';
import { PostFeed } from './PostFeed';
import { TrendingSlider } from './TrendingSlider';
import { InfoCarousel } from './InfoCarousel';
import { MyUpdates } from './SellerShowcase';
import { UpcomingEventsSlider } from './UpcomingEventsSlider';

interface FeedProps {
    sellers: Seller[];
    posts: PostType[];
    allPosts: PostType[];
    onSelectSeller: (seller: Seller, options?: { solutionId?: string, postId?: string, tab?: 'posts' }) => void;
    onLikePost: (postId: string) => void;
    onBookmarkPost: (postId: string) => void;
    onComment: (post: PostType) => void;
    currentUser: User;
    inboxItems: InboxItem[];
    onSendConnectionRequest: (sellerId: string) => void;
    onFollowSeller: (sellerId: string) => void;
    onLikeSellerToggle: (sellerId: string) => void;
    onMessage: (seller: Seller) => void;
    onMeeting: (seller: Seller) => void;
    onEditPost: (post: PostType) => void;
    onMessageProgramManager?: (managerId: string, eventTitle: string) => void;
}

export const Feed: React.FC<FeedProps> = (props) => {
    const {
        sellers,
        posts,
        allPosts,
        onSelectSeller,
        currentUser,
        inboxItems,
        onSendConnectionRequest,
        onFollowSeller,
        onLikeSellerToggle,
        onMessage,
        onMeeting,
        onEditPost,
        onLikePost,
        onBookmarkPost,
        onComment,
        onMessageProgramManager
    } = props;

    // Build trending items from sellers with the highest platformScore.
    // Backend solutions have no `status` field, so we take the first available solution.
    // topPost is optional — we show the card regardless.
    const trendingItems = sellers
        .slice()
        .sort((a, b) => (b.platformScore ?? 0) - (a.platformScore ?? 0))
        .slice(0, 5)
        .map(seller => ({
            seller,
            solution: seller.solutions?.[0] ?? null,
            score: Math.floor((seller.platformEngagement ?? seller.platformScore ?? 0) / 10),
            topPost: allPosts.find(p => p.sellerId === seller.id) ?? null,
        }))
        .filter(item => item.solution != null); // only need a solution to show something meaningful


    const myUpdatesPosts = React.useMemo(() => {
        const connectedSellerIds = new Set([
            ...(currentUser.connections || []),
            ...(currentUser.followedSellers || [])
        ]);
        const activeSolutionIds = new Set(sellers.flatMap(s => s.solutions.filter(sol => sol.status === 'active').map(sol => sol.id)));
        return allPosts.filter(post => connectedSellerIds.has(post.sellerId) && activeSolutionIds.has(post.solutionId));
    }, [allPosts, currentUser, sellers]);

    return (
        <div className="space-y-6">
            <InfoCarousel />

            <div className="space-y-12">
                <div>
                    <h2 className="text-2xl font-bold mb-4">What's trending</h2>
                    <TrendingSlider
                        trendingItems={trendingItems}
                        onSelectSeller={onSelectSeller}
                        onEditPost={onEditPost}
                        currentUser={currentUser}
                    />
                </div>

                <UpcomingEventsSlider sellers={sellers} onMessageProgramManager={onMessageProgramManager} />

                <SellerCarousel
                    sellers={sellers}
                    onSelectSeller={onSelectSeller}
                    currentUser={currentUser}
                    inboxItems={inboxItems}
                    onSendConnectionRequest={onSendConnectionRequest}
                    onFollowSeller={onFollowSeller}
                    onLikeSellerToggle={onLikeSellerToggle}
                    onMessage={onMessage}
                    onMeeting={onMeeting}
                />

                {myUpdatesPosts.length > 0 && (
                    <MyUpdates
                        posts={myUpdatesPosts}
                        allSellers={sellers}
                        onSelectSeller={onSelectSeller as any}
                        onLikePost={onLikePost}
                        onComment={onComment}
                        onBookmarkPost={onBookmarkPost}
                        onEditPost={onEditPost}
                        currentUser={currentUser}
                        inboxItems={inboxItems}
                        onSendConnectionRequest={onSendConnectionRequest}
                        onMessage={onMessage}
                        onMeeting={onMeeting}
                    />
                )}

                <PostFeed
                    posts={posts}
                    sellers={sellers}
                    onSelectSeller={onSelectSeller}
                    currentUser={currentUser}
                    inboxItems={inboxItems}
                    onSendConnectionRequest={onSendConnectionRequest}
                    onEditPost={onEditPost}
                    {...props}
                />
            </div>
        </div>
    );
};