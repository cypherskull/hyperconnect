import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Seller, Post as PostType, Solution, Testimonial, User, InboxItem } from '../../types';
import { ChartBarIcon, UsersIcon, MessageIcon, CalendarIcon, PlusIcon, CheckCircleIcon, LikeIcon, CommentIcon, BookmarkIcon, VideoCameraIcon, ImageIcon, ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';

const AUTOPLAY_INTERVAL = 5000; // 5 seconds

const calculateAvgImpactScore = (solution: Solution): string => {
    if (!solution.testimonials || solution.testimonials.length === 0) {
        return 'N/A';
    }
    const totalScore = solution.testimonials.reduce((sum, t: Testimonial) => sum + t.scores.solutionImpact, 0);
    return (totalScore / solution.testimonials.length).toFixed(1);
}

const SolutionCard: React.FC<{
    seller?: Seller;
    solution?: Solution;
    connectionStatus: 'connected' | 'pending' | 'not_connected';
    onSendConnectionRequest: (sellerId: string) => void;
    onMessage: (seller: Seller) => void;
    onMeeting: (seller: Seller) => void;
}> = ({ seller, solution, connectionStatus, onSendConnectionRequest, onMessage, onMeeting }) => {
    if (!seller || !solution) return <div className="bg-brand-card rounded-xl shadow p-6 border border-brand-border h-full animate-pulse"></div>;

    const impactScore = calculateAvgImpactScore(solution);
    const keyImpact = seller.keyImpacts[0] || { value: 'N/A', area: 'Sustainability' };

    return (
        <div className="bg-brand-card rounded-xl shadow p-6 border border-brand-border h-full flex flex-col">
            <p className="font-semibold text-brand-primary">{seller.companyName}</p>
            <h3 className="text-2xl font-bold mt-1 text-brand-accent">{solution.name}</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{solution.shortDescription.replace(/<[^>]+>/g, '')}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">VALUE CHAIN</p>
                    <p className="font-semibold text-brand-accent">{solution.valueChain.join(', ')}</p>
                </div>
                <div>
                    <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">INDUSTRY</p>
                    <p className="font-semibold text-brand-accent">{solution.industry.join(', ')}</p>
                </div>
            </div>

            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800/50 rounded-lg grid grid-cols-3 gap-2 text-center items-center">
                <div>
                    <UsersIcon className="w-5 h-5 mx-auto text-brand-primary mb-1" />
                    <p className="text-lg font-bold text-brand-primary">{seller.businessStats.clients}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Clients</p>
                </div>
                <div>
                    <ChartBarIcon className="w-5 h-5 mx-auto text-brand-primary mb-1" />
                    <p className="text-lg font-bold text-brand-primary">{keyImpact.value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{keyImpact.area}</p>
                </div>
                <div>
                    <p className="text-2xl font-bold text-brand-primary">{impactScore}/5</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Impact Score</p>
                </div>
            </div>

            <div className="mt-auto pt-6 flex items-center justify-center gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); if (connectionStatus === 'not_connected') onSendConnectionRequest(seller.id); }}
                    disabled={connectionStatus !== 'not_connected'}
                    className="flex-1 py-2 px-3 text-sm bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 disabled:bg-gray-400"
                    title={connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'pending' ? 'Request Sent' : 'Connect'}
                >
                    <PlusIcon className="w-4 h-4"/>
                    <span>{connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'pending' ? 'Sent' : 'Connect'}</span>
                </button>
                <button onClick={(e) => {e.stopPropagation(); onMessage(seller)}} className="flex-1 py-2 px-3 text-sm bg-green-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-green-600">
                    <MessageIcon className="w-4 h-4"/>
                    <span>Message</span>
                </button>
                <button onClick={(e) => {e.stopPropagation(); onMeeting(seller)}} className="flex-1 py-2 px-3 text-sm bg-yellow-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-yellow-600">
                    <CalendarIcon className="w-4 h-4"/>
                    <span>Meeting</span>
                </button>
            </div>
        </div>
    );
};

const RightPostCard: React.FC<{
    post?: PostType;
    isDragging: boolean;
    onLikePost: (postId: string) => void;
    onBookmarkPost: (postId: string) => void;
    onComment: (post: PostType) => void;
    onPostClick: (post: PostType) => void;
}> = ({ post, isDragging, onLikePost, onBookmarkPost, onComment, onPostClick }) => {
    if (!post) return <div className="bg-brand-card rounded-xl shadow p-6 border-2 border-brand-border h-full animate-pulse"></div>;
    
    return (
        <div 
          className="bg-brand-card rounded-xl shadow p-4 border-2 border-brand-border h-full flex flex-col"
          onClick={() => { if (!isDragging) onPostClick(post); }}
        >
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden cursor-pointer">
                {post.media && post.media.length > 0 && post.media[0].type === 'image' ? (
                    <img src={post.media[0].url} alt={post.title} className="w-full h-full object-cover" />
                ) : post.media && post.media.length > 0 && post.media[0].type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 bg-black">
                        <VideoCameraIcon className="w-12 h-12 text-gray-400"/>
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <ImageIcon className="w-12 h-12 text-gray-400"/>
                    </div>
                )}
            </div>

            <div 
                className="mt-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-4 flex-grow cursor-pointer"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
            <div className="mt-auto pt-4 border-t border-brand-border flex justify-end items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); onLikePost(post.id); }} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <LikeIcon className={`w-5 h-5 transition-colors ${post.isLiked ? 'text-red-500 fill-current' : 'text-gray-500'}`} />
                </button>
                 <button onClick={(e) => { e.stopPropagation(); onComment(post); }} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <CommentIcon className="w-5 h-5 text-gray-500" />
                </button>
                 <button onClick={(e) => { e.stopPropagation(); onBookmarkPost(post.id); }} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700">
                    <BookmarkIcon className={`w-5 h-5 transition-colors ${post.isBookmarked ? 'text-brand-primary fill-current' : 'text-gray-500'}`} />
                </button>
            </div>
        </div>
    );
};

export const MyUpdates: React.FC<{
  posts: PostType[];
  allSellers: Seller[];
  onSelectSeller: (seller: Seller, options?: { solutionId?: string, tab?: 'posts', postId?: string }) => void;
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onComment: (post: PostType) => void;
  onEditPost: (post: PostType) => void;
  currentUser: User;
  inboxItems: InboxItem[];
  onSendConnectionRequest: (sellerId: string) => void;
  onMessage: (seller: Seller) => void;
  onMeeting: (seller: Seller) => void;
}> = (props) => {
    const { posts, allSellers, onSelectSeller, currentUser, inboxItems, onSendConnectionRequest, onMessage, onMeeting, onLikePost, onBookmarkPost, onComment } = props;
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const autoplayRef = useRef<number | null>(null);

    const [dragStartX, setDragStartX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        const startAutoplay = () => {
          stopAutoplay();
          if (!isHovered && posts.length > 1) {
            autoplayRef.current = window.setInterval(() => {
              setActiveIndex(prev => (prev + 1) % posts.length);
            }, AUTOPLAY_INTERVAL);
          }
        };
        startAutoplay();
        return () => stopAutoplay();
    }, [isHovered, posts.length]);

    const stopAutoplay = () => {
        if (autoplayRef.current) clearInterval(autoplayRef.current);
    };

    const handleNav = (direction: 'next' | 'prev' | number) => {
        stopAutoplay();
        let newIndex;
        if (typeof direction === 'number') {
            newIndex = direction;
        } else {
            newIndex = direction === 'next'
                ? (activeIndex + 1) % posts.length
                : (activeIndex - 1 + posts.length) % posts.length;
        }
        setActiveIndex(newIndex);
    };

    const handlePointerDown = (clientX: number) => {
        stopAutoplay();
        setDragStartX(clientX);
        setIsDragging(false);
    };

    const handlePointerMove = (clientX: number) => {
        if (dragStartX !== 0 && Math.abs(clientX - dragStartX) > 10) {
            setIsDragging(true);
        }
    };

    const handlePointerUp = (clientX: number) => {
        if (isDragging) {
            const diff = dragStartX - clientX;
            if (diff > 50) {
                handleNav('next');
            } else if (diff < -50) {
                handleNav('prev');
            }
        }
        setDragStartX(0);
        setIsDragging(false);
    };

    const handlePostClick = (post: PostType) => {
        const postSeller = allSellers.find(s => s.id === post.sellerId);
        if (postSeller) {
            onSelectSeller(postSeller, { solutionId: post.solutionId, tab: 'posts', postId: post.id });
        }
    };

    if (!posts || posts.length === 0) return null;

    const activePost = posts[activeIndex] || posts[0];
    const seller = allSellers.find(s => s.id === activePost.sellerId);
    const solution = seller?.solutions.find(s => s.id === activePost.solutionId);

    const connectionStatus = useMemo(() => {
        if (!seller || !currentUser) return 'not_connected';
        if (currentUser.connections?.includes(seller.id)) return 'connected';
        const pendingRequest = inboxItems.find(item => 
            item.category === 'Connection Request' && 
            item.fromUser.id === currentUser.id && 
            item.relatedSellerId === seller.id && 
            item.status === 'Pending'
        );
        return pendingRequest ? 'pending' : 'not_connected';
    }, [currentUser, inboxItems, seller]);

    return (
        <div className="my-8">
            <h2 className="text-2xl font-bold mb-4">My Updates</h2>
            <div
                className="relative cursor-grab active:cursor-grabbing"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => { setIsHovered(false); setDragStartX(0); setIsDragging(false); }}
                onMouseDown={(e) => handlePointerDown(e.clientX)}
                onMouseMove={(e) => handlePointerMove(e.clientX)}
                onMouseUp={(e) => handlePointerUp(e.clientX)}
                onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
                onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
                onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                    <div key={activeIndex} className="animate-fadeIn">
                       <SolutionCard 
                         seller={seller} 
                         solution={solution}
                         connectionStatus={connectionStatus}
                         onSendConnectionRequest={onSendConnectionRequest}
                         onMessage={onMessage}
                         onMeeting={onMeeting}
                       />
                    </div>
                    <div key={activeIndex + '-post'} className="animate-fadeIn">
                       <RightPostCard 
                         post={activePost}
                         isDragging={isDragging}
                         onLikePost={onLikePost}
                         onBookmarkPost={onBookmarkPost}
                         onComment={onComment}
                         onPostClick={handlePostClick}
                       />
                    </div>
                </div>
            </div>

            {posts.length > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6">
                    <button 
                        onClick={() => handleNav('prev')} 
                        className="w-8 h-8 bg-brand-card-light rounded-full shadow flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Previous update"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {posts.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => handleNav(index)}
                                className={`pagination-dot ${activeIndex === index ? 'active' : ''}`}
                                aria-label={`Go to update ${index + 1}`}
                            />
                        ))}
                    </div>
                    <button 
                        onClick={() => handleNav('next')} 
                        className="w-8 h-8 bg-brand-card-light rounded-full shadow flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Next update"
                    >
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
};

export const ImmersiveShowcase = MyUpdates;