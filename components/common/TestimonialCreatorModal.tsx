import React, { useState } from 'react';
import { Seller, Testimonial, Post, User } from '../../types';
import { CloseIcon } from './Icons';
import { StarRating } from './StarRating';
import { Select, Textarea, Input, Button } from './Forms';

interface TestimonialCreatorModalProps {
    seller: Seller;
    currentUser: User;
    onClose: () => void;
    onAddTestimonial: (solutionId: string, testimonial: Testimonial) => void;
    onCreatePost: (postData: Omit<Post, 'id' | 'likes' | 'saves' | 'comments' | 'isLiked' | 'isSaved' | 'timestamp' | 'author'>) => void;
}

export const TestimonialCreatorModal: React.FC<TestimonialCreatorModalProps> = ({ seller, currentUser, onClose, onAddTestimonial, onCreatePost }) => {
    const hasSolutions = seller.solutions && seller.solutions.length > 0;
    const [selectedSolutionId, setSelectedSolutionId] = useState<string>(hasSolutions ? seller.solutions[0].id : '');
    const [quote, setQuote] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [scores, setScores] = useState({ quality: 0, time: 0, cost: 0, experience: 0, solutionImpact: 0 });
    const [shareAsPost, setShareAsPost] = useState(true);
    const [postContent, setPostContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasSolutions || !selectedSolutionId || !quote.trim()) {
            alert('Please select a solution and write a testimonial quote.');
            return;
        }

        const newTestimonial: Testimonial = {
            id: `test-${Date.now()}`,
            customerName: `${currentUser.name}, ${currentUser.company}`,
            quote,
            videoUrl: videoUrl || undefined,
            scores
        };

        onAddTestimonial(selectedSolutionId, newTestimonial);

        if (shareAsPost) {
            const solution = seller.solutions.find(s => s.id === selectedSolutionId);
            onCreatePost({
                sellerId: seller.id,
                solutionId: selectedSolutionId,
                title: `New Testimonial for ${solution?.name || seller.companyName}`,
                content: postContent,
                media: [],
                sharedContent: { type: 'testimonial', item: newTestimonial },
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-brand-border">
                    <h2 className="text-xl font-bold">Add a Testimonial for {seller.companyName}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Which solution are you reviewing?</label>
                        <Select value={selectedSolutionId} onChange={e => setSelectedSolutionId(e.target.value)} required disabled={!hasSolutions}>
                            {!hasSolutions && <option value="">No solutions available to review</option>}
                            {hasSolutions && seller.solutions.map(sol => <option key={sol.id} value={sol.id}>{sol.name}</option>)}
                        </Select>
                    </div>
                    <fieldset disabled={!hasSolutions} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Your Testimonial</label>
                            <Textarea value={quote} onChange={e => setQuote(e.target.value)} required rows={4} placeholder="Share your experience..." />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Rate Your Experience</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-6">
                                {Object.keys(scores).map(key => (
                                    <div key={key} className="space-y-1">
                                        <label className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                        <StarRating rating={scores[key as keyof typeof scores]} setRating={(rating) => setScores(s => ({...s, [key]: rating}))} size="md" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Video Testimonial URL (Optional)</label>
                            <Input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
                        </div>

                        <div className="pt-4 border-t border-brand-border space-y-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={shareAsPost} onChange={e => setShareAsPost(e.target.checked)} className="h-5 w-5 rounded border-gray-400 text-brand-primary focus:ring-brand-primary" />
                                <span className="font-semibold text-gray-700 dark:text-gray-200">Share this testimonial as a post on the feed.</span>
                            </label>
                            {shareAsPost && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Add a personal message to your post (Optional)</label>
                                    <Textarea value={postContent} onChange={e => setPostContent(e.target.value)} rows={3} placeholder="e.g., We had a great experience working with this team!" />
                                </div>
                            )}
                        </div>
                    </fieldset>
                     <div className="flex justify-end pt-4">
                        <Button type="submit" className="px-6" disabled={!hasSolutions}>
                            Submit Testimonial
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};