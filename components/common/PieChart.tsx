import React, { useState } from 'react';

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title: string;
}

const getCoordinatesForPercent = (percent: number) => {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
};

const PieSlice: React.FC<{
  data: PieChartData;
  startPercent: number;
  endPercent: number;
  onHover: (data: PieChartData | null) => void;
  isActive: boolean;
}> = ({ data, startPercent, endPercent, onHover, isActive }) => {
  const [startX, startY] = getCoordinatesForPercent(startPercent);
  const [endX, endY] = getCoordinatesForPercent(endPercent);
  const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

  const pathData = [
    `M ${startX * 0.9 + 1} ${startY * 0.9 + 1}`, // Move to outer edge of slice
    `A 0.9 0.9 0 ${largeArcFlag} 1 ${endX * 0.9 + 1} ${endY * 0.9 + 1}`, // Outer arc
    `L ${endX * 0.6 + 1} ${endY * 0.6 + 1}`, // Line to inner edge
    `A 0.6 0.6 0 ${largeArcFlag} 0 ${startX * 0.6 + 1} ${startY * 0.6 + 1}`, // Inner arc
    'Z'
  ].join(' ');

  return (
    <path
      d={pathData}
      fill={data.color}
      onMouseEnter={() => onHover(data)}
      onMouseLeave={() => onHover(null)}
      className="transition-transform duration-200 ease-in-out cursor-pointer"
      transform={isActive ? 'scale(1.05)' : 'scale(1)'}
      style={{ transformOrigin: 'center center' }}
    />
  );
};

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const [hoveredSlice, setHoveredSlice] = useState<PieChartData | null>(null);
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);

  let cumulativePercent = 0;

  return (
    <div className="bg-brand-card rounded-lg p-4 flex flex-col md:flex-row items-center justify-center gap-6 h-full">
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0">
        <svg viewBox="0 0 2 2" className="w-full h-full transform -rotate-90">
          {data.map((item) => {
            if (item.value === 0) return null;
            const startPercent = cumulativePercent;
            const percentage = (item.value / totalValue);
            cumulativePercent += percentage;
            return (
              <PieSlice
                key={item.name}
                data={item}
                startPercent={startPercent}
                endPercent={cumulativePercent}
                onHover={setHoveredSlice}
                isActive={hoveredSlice?.name === item.name}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {hoveredSlice ? (
              <>
                <div className="text-2xl font-bold" style={{ color: hoveredSlice.color }}>
                  {((hoveredSlice.value / totalValue) * 100).toFixed(1)}%
                </div>
                <div className="text-sm font-semibold truncate max-w-[100px]">{hoveredSlice.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{hoveredSlice.value.toLocaleString()}</div>
              </>
            ) : (
              <>
                <div className="text-xl font-bold">{totalValue.toLocaleString()}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="w-full md:w-56 space-y-2 overflow-y-auto max-h-56">
        {data.sort((a,b) => b.value - a.value).map((item) => (
          <div key={item.name} className="flex justify-between items-center text-sm p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800/50">
            <div className="flex items-center min-w-0">
              <span
                className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="font-medium truncate pr-2">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-600 dark:text-gray-300 flex-shrink-0">
              {((item.value / totalValue) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
