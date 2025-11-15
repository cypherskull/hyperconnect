import React, { useState } from 'react';
import { Post, User } from '../../types';
import { CloseIcon } from './Icons';

interface CommentModalProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onAddComment: (commentText: string) => void;
}

export const CommentModal: React.FC<CommentModalProps> = ({ post, currentUser, onClose, onAddComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">Comments on "{post.title}"</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {post.comments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No comments yet. Be the first to comment!</p>
          ) : (
            post.comments.map(comment => (
              <div key={comment.id} className="flex items-start space-x-3">
                <img src={comment.user.avatarUrl} alt={comment.user.name} className="w-9 h-9 rounded-full" />
                <div className="flex-grow bg-brand-card-light rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">{comment.user.name}</p>
                    <p className="text-xs text-gray-400">{comment.timestamp}</p>
                  </div>
                  <p className="text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t border-brand-border">
          <form onSubmit={handleSubmit} className="flex items-start space-x-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-9 h-9 rounded-full"/>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="w-full p-2 text-sm border border-brand-border rounded-md bg-transparent focus:ring-2 focus:ring-brand-primary outline-none"
                required
              />
              <div className="text-right mt-2">
                <button type="submit" className="px-4 py-1.5 text-sm rounded-[10px] bg-brand-primary text-white font-semibold hover:bg-brand-primary/70 transition-colors">
                  Post
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};