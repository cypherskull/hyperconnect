import React, { useMemo } from 'react';
import { Post as PostType, Seller, User, InboxItem } from '../../types';
import { LikeIcon, CommentIcon, BookmarkIcon, PencilIcon, PlusIcon, CheckCircleIcon } from '../common/Icons';
import { SharedItemCard } from '../common/SharedItemCard';

interface PostProps {
    post: PostType;
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

const PostHeader: React.FC<Pick<PostProps, 'post'|'seller'|'onSelectSeller'|'currentUser'|'inboxItems'|'onSendConnectionRequest'>> = React.memo((props) => {
    const { post, seller, onSelectSeller, currentUser, inboxItems, onSendConnectionRequest } = props;
    const isPostAuthorSelf = post.author?.id === currentUser.id;

    const connectionStatus = useMemo(() => {
        if (isPostAuthorSelf || currentUser.connections?.includes(seller.id)) return 'connected';
        const pendingRequest = inboxItems.find(item => 
            item.category === 'Connection Request' && 
            item.fromUser.id === currentUser.id && 
            item.relatedSellerId === seller.id && 
            item.status === 'Pending'
        );
        if (pendingRequest) return 'pending';
        return 'not_connected';
    }, [currentUser, inboxItems, seller.id, isPostAuthorSelf]);

    const ConnectionButton = () => {
        if (isPostAuthorSelf) return null;
        switch (connectionStatus) {
            case 'connected':
                return <button disabled className="flex items-center space-x-1 text-xs font-semibold text-green-600 cursor-default"><CheckCircleIcon className="w-4 h-4"/><span>Connected</span></button>;
            case 'pending':
                return <button disabled className="text-xs font-semibold text-gray-500 cursor-default">Request Sent</button>;
            case 'not_connected':
            default:
                 return <button onClick={onSendConnectionRequest} className="flex items-center space-x-1 text-xs font-semibold text-brand-primary hover:text-brand-secondary"><PlusIcon className="w-4 h-4"/><span>Connect</span></button>;
        }
    };
    
    return (
        <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
                <img 
                    src={post.author?.avatarUrl || seller.companyLogoUrl}
                    alt={post.author?.name || seller.companyName}
                    className="w-12 h-12 rounded-full cursor-pointer object-cover"
                    onClick={() => onSelectSeller(seller, {solutionId: post.solutionId})}
                />
                <div>
                    <p className="font-bold cursor-pointer" onClick={() => onSelectSeller(seller, {solutionId: post.solutionId})}>{post.author?.name || seller.companyName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{post.timestamp}</p>
                </div>
            </div>
            <ConnectionButton />
        </div>
    );
});

export const Post: React.FC<PostProps> = React.memo((props) => {
    const { post, isOwner, onLikePost, onBookmarkPost, onComment, onEditPost } = props;
    
    return (
      <div className="bg-brand-card rounded-lg shadow-md border border-brand-border">
        <div className="p-4 sm:p-6">
            <PostHeader {...props} />
            <div className="mt-4">
                <h2 className="text-lg font-bold text-brand-accent">{post.title}</h2>
                <div 
                    className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 mt-2" 
                    dangerouslySetInnerHTML={{ __html: post.content }} 
                />
            </div>

            {post.sharedContent && <div className="mt-4"><SharedItemCard content={post.sharedContent} /></div>}
            
            {post.media && post.media.length > 0 && (
                <div className="mt-4 -mx-4 sm:-mx-6 rounded-t-none overflow-hidden">
                    {post.media[0].type === 'video' ? (
                        <div className="aspect-video">
                            <iframe src={post.media[0].url} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                        </div>
                    ) : (
                         <img src={post.media[0].url} alt={post.title} className="w-full object-cover"/>
                    )}
                </div>
            )}
            
            <div className="mt-4 flex justify-around items-center text-gray-500 dark:text-gray-400 border-t border-brand-border pt-2">
                <button onClick={() => onLikePost(post.id)} className={`flex flex-col items-center justify-center w-20 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 ${post.isLiked ? 'text-red-500' : ''}`}>
                    <div className="flex items-center space-x-1">
                        <LikeIcon className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}/>
                        <span className="text-sm font-semibold">{post.likes}</span>
                    </div>
                    <span className="text-xs font-semibold mt-1">Like</span>
                </button>
                <button onClick={() => onComment(post)} className="flex flex-col items-center justify-center w-20 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-brand-primary">
                    <div className="flex items-center space-x-1">
                        <CommentIcon className="w-5 h-5"/>
                        <span className="text-sm font-semibold">{post.comments.length}</span>
                    </div>
                    <span className="text-xs font-semibold mt-1">Comment</span>
                </button>
                <button onClick={() => onBookmarkPost(post.id)} className={`flex flex-col items-center justify-center w-20 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50 ${post.isBookmarked ? 'text-brand-primary' : ''}`} title="Bookmark Post">
                     <div className="flex items-center space-x-1">
                        <BookmarkIcon className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`}/>
                        <span className="text-sm font-semibold">{post.bookmarks}</span>
                    </div>
                    <span className="text-xs font-semibold mt-1">Bookmark</span>
                </button>
                {isOwner && (
                    <button onClick={() => onEditPost(post)} className="flex flex-col items-center justify-center w-20 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/50" title="Edit Post">
                        <PencilIcon className="w-5 h-5" />
                        <span className="text-xs font-semibold mt-1">Edit</span>
                    </button>
                )}
            </div>
        </div>
      </div>
    );
});