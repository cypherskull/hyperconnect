import React from 'react';
import { Post as PostType, Seller, User, InboxItem } from '../../types';
import { Post } from '../feed/Post';

interface PostsTabProps {
  posts: PostType[];
  seller: Seller;
  isOwner: boolean;
  onSelectSeller: (seller: Seller, options?: {solutionId?: string}) => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onComment: (post: PostType) => void;
  onSendConnectionRequest: () => void;
  onMessage: () => void;
  onMeeting: () => void;
  onEditPost: (post: PostType) => void;
  currentUser: User;
  inboxItems: InboxItem[];
}

export const PostsTab: React.FC<PostsTabProps> = (props) => {
  const {
    posts,
    seller,
    isOwner,
    onSelectSeller,
    onLikePost,
    onBookmarkPost,
    onComment,
    onSendConnectionRequest,
    onMessage,
    onMeeting,
    onEditPost,
    currentUser,
    inboxItems
  } = props;

  return (
    <div className="space-y-6">
      {posts.length > 0 ? (
        posts.map(post => (
          <div key={post.id} id={`post-${post.id}`}>
            <Post 
              post={post} 
              seller={seller}
              isOwner={isOwner}
              onSelectSeller={onSelectSeller}
              onLikePost={onLikePost}
              onBookmarkPost={onBookmarkPost}
              onComment={onComment}
              onSendConnectionRequest={onSendConnectionRequest}
              onMessage={onMessage}
              onMeeting={onMeeting}
              onEditPost={onEditPost}
              currentUser={currentUser}
              inboxItems={inboxItems}
            />
          </div>
        ))
      ) : (
        <div className="text-center py-12 bg-brand-card-light rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">This seller hasn't published any posts yet.</p>
        </div>
      )}
    </div>
  );
};