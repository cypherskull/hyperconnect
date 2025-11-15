import React from 'react';
import { Post as PostType, Seller, User, InboxItem } from '../../types';
import { Post } from './Post';

interface PostFeedProps {
    posts: PostType[];
    sellers: Seller[];
    onSelectSeller: (seller: Seller) => void;
    onLikePost: (postId: string) => void;
    onBookmarkPost: (postId: string) => void;
    onComment: (post: PostType) => void;
    currentUser: User;
    inboxItems: InboxItem[];
    onSendConnectionRequest: (sellerId: string) => void;
    onEditPost: (post: PostType) => void;
}

export const PostFeed: React.FC<PostFeedProps> = (props) => {
    const { posts, sellers, onSelectSeller, onLikePost, onBookmarkPost, onComment, currentUser, inboxItems, onSendConnectionRequest, onEditPost } = props;
    const getSellerById = (id: string) => sellers.find(s => s.id === id);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Latest Updates</h2>
            <div className="space-y-6 max-w-3xl mx-auto">
                {posts.length > 0 ? posts.map(post => {
                    const seller = getSellerById(post.sellerId);
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
                            onEditPost={() => onEditPost(post)}
                            currentUser={currentUser}
                            inboxItems={inboxItems}
                            onSendConnectionRequest={() => onSendConnectionRequest(seller.id)}
                            // Dummy handlers for actions not passed down to this level
                            onMessage={() => alert("Message action from post not implemented.")}
                            onMeeting={() => alert("Meeting action from post not implemented.")}
                        />
                    );
                }) : (
                    <div className="text-center py-12 bg-brand-card-light rounded-lg">
                        <p className="text-gray-500 dark:text-gray-400">No posts match your current filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};