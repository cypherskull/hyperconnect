import React, { useRef, useState, useEffect } from 'react';
import { Event, Seller } from '../../types';
import { EventCard } from '../common/EventCard';
import { ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';

interface UpcomingEventsSliderProps {
    sellers: Seller[];
    onMessageProgramManager?: (managerId: string, eventTitle: string) => void;
    userInterests?: { geography: string[], industry: string[], valueChain: string[], offering: string[] };
}

export const UpcomingEventsSlider: React.FC<UpcomingEventsSliderProps> = ({ sellers, onMessageProgramManager, userInterests }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const allEvents = React.useMemo(() => {
        const events: Event[] = [];
        sellers.forEach(seller => {
            if (seller.events) {
                events.push(...seller.events.filter(e => e.isPublic));
            }
        });

        // Filter by user interests
        return events.filter(e => {
            let match = false;
            if (!userInterests) return true;

            if (e.geography && e.geography.some(g => userInterests.geography.includes(g))) match = true;
            if (e.industry && e.industry.some(i => userInterests.industry.includes(i))) match = true;
            if (e.valueChain && e.valueChain.some(vc => userInterests.valueChain.includes(vc))) match = true;

            // If no interests specified or if one matches
            const hasInterests = userInterests.geography.length > 0 || userInterests.industry.length > 0 || userInterests.valueChain.length > 0;
            return !hasInterests || match;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [sellers, userInterests]);

    const checkScroll = () => {
        if (!sliderRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [allEvents]);

    const scroll = (direction: 'left' | 'right') => {
        if (!sliderRef.current) return;
        const scrollAmount = direction === 'left' ? -sliderRef.current.clientWidth / 2 : sliderRef.current.clientWidth / 2;
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setTimeout(checkScroll, 350); // check after animation
    };

    if (allEvents.length === 0) return null;

    return (
        <div className="relative group mb-12">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Upcoming Events</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className="p-2 rounded-full bg-brand-card shadow-sm border border-brand-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/10 transition-colors"
                        aria-label="Previous events"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-brand-accent" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className="p-2 rounded-full bg-brand-card shadow-sm border border-brand-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/10 transition-colors"
                        aria-label="Next events"
                    >
                        <ArrowRightIcon className="w-5 h-5 text-brand-accent" />
                    </button>
                </div>
            </div>

            <div
                ref={sliderRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pt-2 pb-6 px-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {allEvents.map((event) => (
                    <div key={event.id} className="min-w-[320px] w-[320px] sm:min-w-[360px] sm:w-[360px] flex-shrink-0 snap-start">
                        <EventCard
                            event={event}
                            onMessageProgramManager={onMessageProgramManager}
                        />
                    </div>
                ))}
            </div>
            {/* Custom CSS to hide scrollbar but allow scrolling */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};
