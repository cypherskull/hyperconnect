import React, { useState } from 'react';
import { Solution, Seller, Post as PostType, User } from '../../types';
import { PencilIcon, ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';

interface TrendingSliderProps {
  trendingItems: { solution: Solution; seller: Seller; score: number; topPost: PostType | null }[];
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
  if (!activeItem || !activeItem.topPost) return null;
  const { seller, solution, topPost } = activeItem;

  const handleSliderClick = () => {
    if (isDragging) return;
    onSelectSeller(seller, { solutionId: solution.id });
  };
  
  const handlePostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDragging) return;
    onSelectSeller(seller, { solutionId: solution.id, tab: 'posts', postId: topPost.id });
  };

  const backgroundImageUrl = topPost.media?.find(m => m.type === 'image')?.url || solution.imageUrl || `https://source.unsplash.com/1600x900/?business,technology&sig=${solution.id}`;
  
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
              <p className="mt-3 text-sm text-white/80 line-clamp-3">{solution.shortDescription.replace(/<[^>]+>/g, '')}</p>
               <div 
                    onClick={handlePostClick}
                    className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-yellow">Trending Post</p>
                  <p className="font-semibold mt-1">{topPost.title}</p>
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
        <div className="flex justify-center items-center space-x-2 md:space-x-4">
            {trendingItems.map((item, index) => (
                <button
                    key={item.solution.id}
                    onMouseEnter={() => handleNav(index)}
                    onClick={(e) => {
                        e.stopPropagation(); // prevent triggering the main div's onClick
                        onSelectSeller(item.seller, {solutionId: item.solution.id});
                    }}
                    className={`relative rounded-full transition-all duration-300 ease-out focus:outline-none ${activeIndex === index ? 'scale-110 shadow-lg' : 'scale-90 opacity-70 hover:opacity-100 hover:scale-100'}`}
                    style={{ width: '80px', height: '80px' }}
                    aria-label={`View trending item from ${item.seller.companyName}`}
                >
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
                    <div className="absolute -top-1 -right-1 flex items-center justify-center w-8 h-8 bg-brand-secondary text-white text-xs font-bold rounded-full border-2 border-brand-card">
                        {item.score}
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