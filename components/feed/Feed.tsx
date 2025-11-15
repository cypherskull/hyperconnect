import React from 'react';
import { Post as PostType, Seller, User, InboxItem } from '../../types';
import { SellerCarousel } from './SellerCarousel';
import { PostFeed } from './PostFeed';
import { TrendingSlider } from './TrendingSlider';
import { InfoCarousel } from './InfoCarousel';
import { MyUpdates } from './SellerShowcase';

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
        onComment
    } = props;
    
    // Create some dummy trending data for the slider
    const trendingItems = sellers.slice(0, 5).map(seller => ({
        seller,
        solution: seller.solutions.find(s => s.status === 'active'),
        score: Math.floor(seller.platformEngagement / 10),
        topPost: allPosts.find(p => p.sellerId === seller.id) || null
    })).filter((item): item is { seller: Seller; solution: import('../../types').Solution; score: number; topPost: PostType; } => !!item.solution && !!item.topPost);

    const myUpdatesPosts = React.useMemo(() => {
        const connectedSellerIds = new Set([
            ...(currentUser.connections || []),
            ...(currentUser.followedSellers || [])
        ]);
        const activeSolutionIds = new Set(sellers.flatMap(s => s.solutions.filter(sol => sol.status === 'active').map(sol => sol.id)));
        return allPosts.filter(post => connectedSellerIds.has(post.sellerId) && activeSolutionIds.has(post.solutionId));
    }, [allPosts, currentUser, sellers]);

  return (
    <div className="space-y-12">
        <h2 className="text-2xl font-bold">What's trending</h2>
        <TrendingSlider 
            trendingItems={trendingItems} 
            onSelectSeller={onSelectSeller} 
            onEditPost={onEditPost}
            currentUser={currentUser}
        />
      
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
      
        <InfoCarousel />
        
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
  );
};