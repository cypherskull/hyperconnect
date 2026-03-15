import React from 'react';
import { Post as PostType, Seller, User } from '../../types';
import { CloseIcon, LikeIcon, CommentIcon, BookmarkIcon } from './Icons';
import { SharedItemCard } from './SharedItemCard';

interface PostDetailModalProps {
  post: PostType;
  seller: Seller;
  currentUser: User;
  onClose: () => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onComment: (post: PostType) => void;
}

export const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, seller, currentUser, onClose, onLikePost, onBookmarkPost, onComment }) => {
  const author = post.author || { name: seller.companyName, avatarUrl: seller.companyLogoUrl };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-3xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <div className="flex items-center space-x-3">
              <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full" />
              <div>
                  <p className="font-bold">{author.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
              </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-6 h-6"/></button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          <h2 className="text-2xl font-bold text-brand-accent">{post.title}</h2>
          
          {post.media && post.media.length > 0 && (
            <div className="my-4 rounded-lg overflow-hidden">
                {post.media[0].type === 'video' ? (
                    <div className="aspect-video">
                        <iframe src={post.media[0].url} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                    </div>
                ) : (
                     <img src={post.media[0].url} alt={post.title} className="w-full object-cover"/>
                )}
            </div>
          )}

          <div 
            className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300" 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
          {post.sharedContent && <div className="mt-4"><SharedItemCard content={post.sharedContent} /></div>}
        </div>
        
        <div className="flex-shrink-0 p-4 border-t border-brand-border flex justify-between items-center text-gray-500 dark:text-gray-400">
            <div className="flex space-x-6">
                <button onClick={() => onLikePost(post.id)} className={`flex items-center space-x-1.5 hover:text-red-500 ${post.isLiked ? 'text-red-500' : ''}`}>
                    <LikeIcon className={`w-6 h-6 ${post.isLiked ? 'fill-current' : ''}`}/>
                    <span className="text-sm font-semibold">{post.likes}</span>
                </button>
                <button onClick={() => onComment(post)} className="flex items-center space-x-1.5 hover:text-brand-primary">
                    <CommentIcon className="w-6 h-6"/>
                    <span className="text-sm font-semibold">{post.comments.length}</span>
                </button>
            </div>
            <button onClick={() => onBookmarkPost(post.id)} className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 ${post.isBookmarked ? 'text-brand-primary' : ''}`} title="Bookmark Post">
                <BookmarkIcon className={`w-6 h-6 ${post.isBookmarked ? 'fill-current' : ''}`}/>
            </button>
        </div>
      </div>
    </div>
  );
};