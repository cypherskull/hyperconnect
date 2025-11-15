import React from 'react';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'underline' | 'solid';
  className?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children, variant = 'underline', className = "" }) => {
    const baseClasses = 'font-semibold transition-colors whitespace-nowrap';

    const variantClasses = {
        underline: `px-4 py-2 border-b-2 ${active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-primary'}`,
        solid: `px-3 py-2 text-xs sm:px-4 sm:text-sm rounded-md ${active ? 'bg-brand-primary text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
    };

    return (
        <button onClick={onClick} className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </button>
    );
};