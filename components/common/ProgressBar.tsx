import React from 'react';

interface ProgressBarProps {
  progress: number; // 0-100
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, colorClass = 'bg-brand-primary' }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
      <div
        className={`${colorClass} h-2.5 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
};