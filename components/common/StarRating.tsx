import React from 'react';
import { StarIcon } from './Icons';

interface StarRatingProps {
    rating: number;
    setRating: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };
    return (
        <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={(e) => { e.preventDefault(); setRating(star); }} type="button">
                    <StarIcon className={`${sizeClasses[size]} ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
            ))}
        </div>
    );
};
