import React, { useRef, useState } from 'react';
import { Seller, User, InboxItem } from '../../types';
import { SellerCard } from './SellerCard';
import { ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';

interface SellerCarouselProps {
  sellers: Seller[];
  onSelectSeller: (seller: Seller) => void;
  currentUser: User;
  inboxItems: InboxItem[];
  onSendConnectionRequest: (sellerId: string) => void;
  onFollowSeller: (sellerId: string) => void;
  onLikeSellerToggle: (sellerId: string) => void;
  onMessage: (seller: Seller) => void;
  onMeeting: (seller: Seller) => void;
}

export const SellerCarousel: React.FC<SellerCarouselProps> = (props) => {
  const { sellers, onSelectSeller, currentUser, inboxItems, onSendConnectionRequest, onFollowSeller, onLikeSellerToggle, onMessage, onMeeting } = props;
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };
  
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const onMouseLeave = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const onMouseUp = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = 'grab';
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Multiplier for faster scroll
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (!sellers || sellers.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Businesses to Watch</h2>
      <div className="relative group">
        <div 
          ref={scrollRef} 
          className="flex space-x-6 overflow-x-auto pb-4 card-carousel -mx-4 px-4 cursor-grab"
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseLeave}
          onMouseUp={onMouseUp}
          onMouseMove={onMouseMove}
        >
          {sellers.map(seller => (
            <div key={seller.id} className="flex-shrink-0 w-80">
                <SellerCard 
                    seller={seller} 
                    onSelectSeller={onSelectSeller} 
                    currentUser={currentUser}
                    inboxItems={inboxItems}
                    onSendConnectionRequest={onSendConnectionRequest}
                    onFollowSeller={onFollowSeller}
                    onLikeSellerToggle={onLikeSellerToggle}
                    onMessage={onMessage}
                    onMeeting={onMeeting}
                />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button 
          onClick={() => scroll('left')}
          className="w-10 h-10 bg-brand-card rounded-full shadow-md flex items-center justify-center transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Scroll left"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>
        <button 
          onClick={() => scroll('right')}
          className="w-10 h-10 bg-brand-card rounded-full shadow-md flex items-center justify-center transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="Scroll right"
        >
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};