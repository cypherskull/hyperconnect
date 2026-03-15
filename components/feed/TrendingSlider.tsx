import React, { useState } from 'react';
import { Solution, Seller, Post as PostType, User } from '../../types';
import { PencilIcon, ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';

interface TrendingSliderProps {
    trendingItems: { solution: Solution | null; seller: Seller; score: number; topPost: PostType | null }[];
    onSelectSeller: (seller: Seller, options: { solutionId: string; tab?: 'posts'; postId?: string; }) => void;
    onEditPost: (post: PostType) => void;
    currentUser: User;
}

export const TrendingSlider: React.FC<TrendingSliderProps> = ({ trendingItems, onSelectSeller, onEditPost, currentUser }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    // State for swipe/drag handling
    const [dragStartX, setDragStartX] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragThreshold = 10; // pixels to start considering it a drag

    if (!trendingItems || trendingItems.length === 0) {
        return (
            <div className="py-12 bg-brand-card rounded-lg text-center">
                <p className="text-gray-500">Not enough data to show trending items yet.</p>
            </div>
        );
    }

    // Navigation logic
    const handleNav = (direction: 'next' | 'prev' | number) => {
        if (typeof direction === 'number') {
            setActiveIndex(direction);
        } else {
            setActiveIndex(prev => {
                const newIndex = direction === 'next'
                    ? (prev + 1) % trendingItems.length
                    : (prev - 1 + trendingItems.length) % trendingItems.length;
                return newIndex;
            });
        }
    };

    const handlePointerDown = (clientX: number) => {
        setDragStartX(clientX);
        setIsDragging(false); // Reset on new interaction
    };

    const handlePointerMove = (clientX: number) => {
        if (dragStartX === null) return;
        if (!isDragging && Math.abs(clientX - dragStartX) > dragThreshold) {
            setIsDragging(true);
        }
    };

    const handlePointerUp = (clientX: number) => {
        if (dragStartX === null) return;

        if (isDragging) {
            const dragDistance = clientX - dragStartX;
            const swipeThreshold = 50; // more significant movement to trigger slide change

            if (dragDistance < -swipeThreshold) {
                handleNav('next');
            } else if (dragDistance > swipeThreshold) {
                handleNav('prev');
            }
        }

        setDragStartX(null);
        // Use timeout to prevent click from firing on drag end
        setTimeout(() => {
            setIsDragging(false);
        }, 0);
    };

    const activeItem = trendingItems[activeIndex];
    if (!activeItem) return null;
    const { seller, solution, topPost } = activeItem;
    if (!solution) return null;

    const handleSliderClick = () => {
        if (isDragging) return;
        onSelectSeller(seller, { solutionId: solution.id });
    };

    const handlePostClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDragging) return;
        if (topPost) onSelectSeller(seller, { solutionId: solution.id, tab: 'posts', postId: topPost.id });
        else onSelectSeller(seller, { solutionId: solution.id });
    };

    const backgroundImageUrl = topPost?.media?.find(m => m.type === 'image')?.url || `https://picsum.photos/seed/${solution.id}/1600/900`;
    const solutionDescription = (solution as any).shortDescription || (solution as any).offering || (solution as any).name || 'Innovative solution';

    const isOwner = currentUser && topPost && !!(topPost.author ? topPost.author.id === currentUser.id : currentUser.company === seller.companyName && currentUser.persona === 'Seller');

    return (
        <div
            className="h-[500px] bg-brand-dark rounded-2xl overflow-hidden relative group cursor-grab active:cursor-grabbing shadow-2xl"
            onClick={handleSliderClick}
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseUp={(e) => handlePointerUp(e.clientX)}
            onMouseLeave={() => { if (dragStartX !== null) { setDragStartX(null); setIsDragging(false); } }}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
            onTouchEnd={(e) => handlePointerUp(e.changedTouches[0].clientX)}
        >
            {/* Full Bleed Image Display */}
            <img
                key={activeIndex}
                src={backgroundImageUrl}
                alt={solution.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:scale-105 animate-fadeIn opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent md:bg-gradient-to-r md:from-black/70 md:to-transparent"></div>

            {/* Content Section */}
            <div key={activeIndex + '-content'} className="relative p-6 md:p-12 text-white z-10 h-full flex flex-col justify-center animate-fadeIn">
                <div className="max-w-md">
                    <p className="font-semibold text-white/90">{seller.companyName}</p>
                    <h3 className="text-4xl font-bold mt-1" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{solution.name}</h3>
                    <p className="mt-3 text-sm text-white/80 line-clamp-3">{solutionDescription}</p>
                    <div
                        onClick={handlePostClick}
                        className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                    >
                        {topPost ? (
                            <>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">Trending Post</p>
                                <p className="font-semibold mt-1">{topPost.title}</p>
                            </>
                        ) : (
                            <>
                                <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">View Profile</p>
                                <p className="font-semibold mt-1">{seller.companyName}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {isOwner && (
                <button
                    onClick={(e) => { e.stopPropagation(); onEditPost(topPost); }}
                    className="absolute top-6 right-6 z-20 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
                    aria-label="Edit Post"
                    title="Edit Post"
                >
                    <PencilIcon className="w-5 h-5 text-white" />
                </button>
            )}

            {/* Navigation Controls */}
            <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-4 md:gap-8">
                {/* Left Arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleNav('prev'); }}
                    className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center text-white transition-all hover:bg-black/50 hover:scale-110"
                    aria-label="Previous trend"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>

                {/* Planets Pagination */}
                <div className="flex justify-center items-end space-x-2 md:space-x-4 h-28">
                    {trendingItems.map((item, index) => (
                        <button
                            key={item.solution?.id ?? item.seller.id}
                            onMouseEnter={() => handleNav(index)}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.solution) onSelectSeller(item.seller, { solutionId: item.solution.id });
                                else onSelectSeller(item.seller, { solutionId: '' });
                            }}
                            className={`relative group/planet rounded-full transition-all duration-300 ease-out focus:outline-none flex flex-col items-center ${activeIndex === index ? 'scale-110' : 'scale-90 opacity-70 hover:opacity-100 hover:scale-100'}`}
                            style={{ width: '80px' }}
                            aria-label={`View trending item from ${item.seller.companyName}`}
                        >
                            <div className="relative w-20 h-20">
                                <div
                                    className={`w-full h-full rounded-full bg-gray-700 border-2 transition-all duration-300 ${activeIndex === index ? 'border-brand-primary' : 'border-transparent'}`}
                                    style={{
                                        backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png'), linear-gradient(45deg, #2d3748, #4a5568)`,
                                        boxShadow: activeIndex === index ? '0 0 15px rgba(77, 150, 255, 0.7), 0 0 5px rgba(77, 150, 255, 1) inset' : 'none'
                                    }}
                                >
                                    <img
                                        src={item.seller.companyLogoUrl}
                                        alt={item.seller.companyName}
                                        className="w-full h-full object-cover rounded-full p-2"
                                    />
                                </div>
                                {/* Score Badge */}
                                <div className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 bg-white dark:bg-gray-900 text-xs font-bold rounded-full border-2 border-brand-border z-10">
                                    <span className="spectrum-text">{item.score}</span>
                                </div>
                            </div>
                            {/* Seller Name Label */}
                            <div className={`mt-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 transition-all duration-300 transform ${activeIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover/planet:opacity-100 group-hover/planet:translate-y-0'}`}>
                                <span className="text-[10px] font-bold text-white whitespace-nowrap shadow-sm">
                                    {item.seller.companyName}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                <button
                    onClick={(e) => { e.stopPropagation(); handleNav('next'); }}
                    className="w-10 h-10 bg-black/30 rounded-full flex items-center justify-center text-white transition-all hover:bg-black/50 hover:scale-110"
                    aria-label="Next trend"
                >
                    <ArrowRightIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};