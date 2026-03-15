

import React from 'react';
import { LockClosedIcon } from './Icons';

interface LockedFeatureCardProps {
    title: string;
    message: string;
}

const LockedFeatureCard: React.FC<LockedFeatureCardProps> = ({ title, message }) => {
    return (
        <div className="bg-brand-card rounded-lg shadow-md border border-dashed border-brand-border p-8 text-center flex flex-col items-center my-8">
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 rounded-full mb-4">
                <LockClosedIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-brand-accent">{title}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">{message}</p>
            <button className="mt-6 px-6 py-2 text-sm font-semibold bg-brand-secondary text-white rounded-md hover:bg-brand-secondary/80 transition-colors">
                Upgrade Your Plan
            </button>
        </div>
    );
};

export default LockedFeatureCard;