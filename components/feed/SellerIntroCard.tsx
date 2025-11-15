import React from 'react';
import { Post as PostType, Testimonial, CaseStudy, Collateral, CollateralType } from '../../types';
import { LikeIcon, CommentIcon, PencilIcon, QuoteIcon, FileTextIcon, PresentationIcon, ImageIcon, VideoCameraIcon, BookmarkIcon } from '../common/Icons';

interface UpdatePostCardProps {
  post: PostType;
  isOwner: boolean;
  onViewPost: () => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onComment: (post: PostType) => void;
  onEditPost: (post: PostType) => void;
}

const ContentPreview: React.FC<{ post: PostType }> = ({ post }) => {
    const { sharedContent, media } = post;
    const backgroundImageUrl = media?.find(m => m.type === 'image')?.url || `https://source.unsplash.com/random/400x600/?abstract&sig=${post.id}`;

    if (sharedContent) {
        const { type, item } = sharedContent;
        if (type === 'testimonial') {
            const testimonialItem = item as Testimonial;
            return (
                <div className="p-4 h-full w-full flex flex-col justify-center items-center text-center text-white bg-blue-900/30">
                    <QuoteIcon className="w-8 h-8 opacity-60 mb-2" />
                    <p className="font-quote italic text-sm line-clamp-5">"{testimonialItem.quote}"</p>
                    <p className="text-xs mt-2 font-semibold opacity-80">- {testimonialItem.customerName}</p>
                </div>
            );
        }
        if (type === 'caseStudy') {
            const caseStudyItem = item as CaseStudy;
             return (
                <div className="p-4 h-full w-full flex flex-col justify-center items-center text-center text-white bg-purple-900/30">
                    <FileTextIcon className="w-10 h-10 opacity-60 mb-2" />
                    <p className="text-xs uppercase tracking-wider">Case Study</p>
                    <p className="text-base mt-1 font-bold line-clamp-2">{caseStudyItem.clientName}</p>
                </div>
             );
        }
        if (type === 'collateral') {
            const collateralItem = item as Collateral;
            const getFileIcon = (collateralType: CollateralType) => {
                const props = {className: "w-10 h-10 opacity-60 mb-2"};
                switch(collateralType) {
                    case 'Presentation': return <PresentationIcon {...props} />;
                    case 'Image': return <ImageIcon {...props} />;
                    default: return <FileTextIcon {...props} />;
                }
            };
            return (
                <div className="p-4 h-full w-full flex flex-col justify-center items-center text-center text-white bg-green-900/30">
                    {getFileIcon(collateralItem.type)}
                    <p className="text-sm font-bold line-clamp-3">{collateralItem.name}</p>
                </div>
            );
        }
    }

    if (media && media[0]?.type === 'video') {
        return (
            <div className="h-full w-full relative bg-black">
                <img src={backgroundImageUrl} alt={post.title} className="w-full h-full object-cover opacity-50"/>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <VideoCameraIcon className="w-8 h-8 text-white/80" />
                    </div>
                </div>
            </div>
        );
    }
    
    // Default fallback to image
    return (
        <div className="h-full w-full relative">
            <img src={backgroundImageUrl} alt={post.title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
    );
};


export const UpdatePostCard: React.FC<UpdatePostCardProps> = ({ post, isOwner, onViewPost, onLikePost, onBookmarkPost, onComment, onEditPost }) => {
    return (
        <div className="w-full h-full rounded-2xl overflow-hidden relative shadow-lg bg-white/80 dark:bg-white/20 flex flex-col">
            <div className="h-1/2 relative">
                 <ContentPreview post={post} />
            </div>
            <div className="h-1/2 p-4 text-gray-900 dark:text-white flex flex-col">
                <h4 className="font-bold text-base leading-tight line-clamp-2">{post.title}</h4>
                <div 
                    className="prose prose-sm dark:prose-invert text-gray-700 dark:text-white/80 mt-2 line-clamp-3 md:line-clamp-4 flex-grow"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
                 <div className="mt-auto pt-2 border-t border-black/10 dark:border-white/20 flex justify-around items-center gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onLikePost(post.id); }} 
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-800 dark:text-white'} hover:bg-black/5 dark:hover:bg-white/10`}
                        title="Like"
                    >
                        <div className="flex items-center space-x-1">
                           <LikeIcon className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                           <span className="text-sm font-semibold">{post.likes}</span>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Like</span>
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onComment(post); }} 
                        className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                        title="Comment"
                    >
                        <div className="flex items-center space-x-1">
                            <CommentIcon className="w-5 h-5" />
                             <span className="text-sm font-semibold">{post.comments.length}</span>
                        </div>
                        <span className="text-[10px] mt-1 font-semibold">Comment</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onBookmarkPost(post.id); }}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${post.isBookmarked ? 'text-blue-500' : 'text-gray-800 dark:text-white'} hover:bg-black/5 dark:hover:bg-white/10`}
                        title="Bookmark"
                    >
                         <div className="flex items-center space-x-1">
                            <BookmarkIcon className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                             <span className="text-sm font-semibold">{post.bookmarks}</span>
                        </div>
                         <span className="text-[10px] mt-1 font-semibold">Bookmark</span>
                    </button>
                    {isOwner && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEditPost(post); }} 
                            className="flex flex-col items-center justify-center p-2 rounded-lg text-gray-800 dark:text-white hover:bg-black/5 dark:hover:bg-white/10"
                            title="Edit Post"
                        >
                            <PencilIcon className="w-5 h-5" />
                            <span className="text-[10px] mt-1 font-semibold">Edit</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// Keeping the old export name to avoid breaking import paths after repurposing the file.
export const SellerIntroCard = UpdatePostCard;
export const ShowcasePostCard = UpdatePostCard;