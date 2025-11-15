import React from 'react';
import { User, Seller, Post as PostType, InboxItem } from '../../types';
import { FavouriteSellerCard } from './FavouriteSellerCard';
import { Post } from '../feed/Post';

interface FavouritesPageProps {
  currentUser: User;
  inboxItems: InboxItem[];
  allSellers: Seller[];
  allPosts: PostType[];
  onSelectSeller: (seller: Seller) => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onComment: (post: PostType) => void;
  onSendConnectionRequest: (sellerId: string) => void;
  onEditPost: (post: PostType) => void;
}

export const FavouritesPage: React.FC<FavouritesPageProps> = (props) => {
    const { currentUser, inboxItems, allSellers, allPosts, onSelectSeller, onLikePost, onBookmarkPost, onComment, onSendConnectionRequest, onEditPost } = props;

    const followedSellers = allSellers.filter(s => currentUser.followedSellers?.includes(s.id));
    const bookmarkedPosts = allPosts.filter(p => currentUser.followedSellers?.includes(p.sellerId) || p.isBookmarked);

    return (
        <div className="space-y-10">
            <div>
                <h1 className="text-3xl font-bold mb-4">My Favourites</h1>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold mb-4">Followed Businesses ({followedSellers.length})</h2>
                {followedSellers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {followedSellers.map(seller => (
                            <FavouriteSellerCard key={seller.id} seller={seller} onSelectSeller={onSelectSeller} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">You haven't followed any businesses yet.</p>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Bookmarked Posts ({bookmarkedPosts.length})</h2>
                 {bookmarkedPosts.length > 0 ? (
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {bookmarkedPosts.map(post => {
                            const seller = allSellers.find(s => s.id === post.sellerId);
                            if (!seller) return null;
                            const isOwner = !!(post.author ? post.author.id === currentUser.id : currentUser.company === seller.companyName && currentUser.persona === 'Seller');
                            return (
                                <Post 
                                    key={post.id} 
                                    post={post} 
                                    seller={seller}
                                    isOwner={isOwner}
                                    onSelectSeller={onSelectSeller}
                                    onLikePost={onLikePost}
                                    onBookmarkPost={onBookmarkPost}
                                    onComment={onComment}
                                    onSendConnectionRequest={() => onSendConnectionRequest(seller.id)}
                                    onEditPost={() => onEditPost(post)}
                                    currentUser={currentUser}
                                    inboxItems={inboxItems}
                                    // Dummy props for actions not directly available here
                                    onMessage={() => alert("Message action from this view not implemented.")}
                                    onMeeting={() => alert("Meeting action from this view not implemented.")}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">You haven't bookmarked any posts yet.</p>
                )}
            </div>
        </div>
    );
};
