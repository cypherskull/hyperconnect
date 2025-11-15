import React, { useState, useRef, forwardRef, useEffect } from 'react';
import { Solution, SharedContent, Media, Post } from '../../types';
import { CloseIcon, UploadIcon, TrashIcon } from '../common/Icons';
import { SharedItemCard } from '../common/SharedItemCard';
import { RichTextInput } from '../common/RichTextInput';

interface PostEditorModalProps {
  solution: Solution;
  shareItem: SharedContent | null;
  postToEdit: Post | null;
  onClose: () => void;
  onSave: (postData: Omit<Post, 'id' | 'sellerId' | 'likes' | 'saves' | 'comments' | 'isLiked' | 'isSaved' | 'timestamp'> & { id?: string }) => void;
}

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className={`w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none ${props.className}`} />
);

export const PostEditorModal: React.FC<PostEditorModalProps> = ({ solution, shareItem, postToEdit, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<Media[]>([]);
  const [currentShareItem, setCurrentShareItem] = useState<SharedContent | null>(null);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setMedia(postToEdit.media || []);
      setCurrentShareItem(postToEdit.sharedContent || null);
    } else if (shareItem) {
      setTitle(`New ${shareItem.type} for ${solution.name}`);
      setContent(`<p>We're excited to share this update about our <b>${solution.name}</b> solution!</p>`);
      setMedia([]);
      setCurrentShareItem(shareItem);
    } else {
      setTitle('');
      setContent('');
      setMedia([]);
      setCurrentShareItem(null);
    }
  }, [postToEdit, shareItem, solution]);

  const handleAddMedia = (type: Media['type']) => {
      if (media.length >= 4) {
          alert("You can add a maximum of 4 media items.");
          return;
      }
      if (type === 'audio') {
          alert("Audio uploads not implemented in this demo.");
          return;
      }
      setMedia(prev => [...prev, { type, url: '' }]);
  };
  
  const handleMediaUrlChange = (indexToUpdate: number, newUrl: string) => {
    setMedia(prev => 
        prev.map((item, index) => 
            index === indexToUpdate ? { ...item, url: newUrl } : item
        )
    );
  };

  const handleRemoveMedia = (indexToRemove: number) => {
    setMedia(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  
  const handleRemoveShareItem = () => {
    setCurrentShareItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
        alert("Please provide a title for your post.");
        return;
    }
    // Filter out media items with empty URLs before saving
    const finalMedia = media.filter(m => m.url.trim() !== '');

    onSave({
        id: postToEdit?.id,
        solutionId: solution.id,
        title,
        content,
        media: finalMedia,
        sharedContent: currentShareItem || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-brand-border">
          <h2 className="text-xl font-bold">{postToEdit ? 'Edit Post' : `Create Post for ${solution.name}`}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-grow">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} required placeholder="An engaging title for your post" />
          </div>
          
          <RichTextInput
            label="Narrative"
            value={content}
            onChange={setContent}
          />

          {currentShareItem && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium">Shared Item</label>
                <button type="button" onClick={handleRemoveShareItem} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <TrashIcon className="w-3 h-3"/> Remove
                </button>
              </div>
              <SharedItemCard content={currentShareItem} />
            </div>
          )}
          
          {media.length > 0 && (
            <div>
                <label className="block text-sm font-medium mb-1">Attached Media</label>
                <div className="space-y-3">
                    {media.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-brand-card-light rounded-md border border-brand-border/50">
                        <span className="font-semibold text-sm capitalize flex-shrink-0">{m.type}:</span>
                        <Input
                          type="url"
                          value={m.url}
                          onChange={(e) => handleMediaUrlChange(i, e.target.value)}
                          placeholder={m.type === 'video' ? 'Enter YouTube embed URL...' : `Enter ${m.type} URL...`}
                          required
                        />
                        <button type="button" onClick={() => handleRemoveMedia(i)} className="p-1 text-red-500 hover:bg-red-500/10 rounded-full flex-shrink-0">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
            </div>
          )}

        </form>
        <div className="p-4 border-t border-brand-border flex flex-wrap gap-2 justify-between items-center">
            <div className="flex space-x-2">
                 <button onClick={() => handleAddMedia('image')} type="button" className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">Add Image</button>
                 <button onClick={() => handleAddMedia('video')} type="button" className="p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">Add Video</button>
            </div>
            <button onClick={handleSubmit} type="submit" className="px-6 py-2 rounded-md text-center bg-brand-primary text-white font-semibold hover:bg-brand-secondary transition-colors">
              {postToEdit ? 'Save Changes' : 'Publish Post'}
            </button>
        </div>
      </div>
    </div>
  );
};