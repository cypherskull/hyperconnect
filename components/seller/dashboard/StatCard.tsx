
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    change: string;
    icon: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
    const isPositive = change.startsWith('+');
    return (
        <div className="bg-brand-card rounded-lg shadow-md p-5 border border-brand-border">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                {icon}
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
                <p className="text-2xl font-bold">{value}</p>
                <span className={`text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {change}
                </span>
            </div>
        </div>
    );
};
