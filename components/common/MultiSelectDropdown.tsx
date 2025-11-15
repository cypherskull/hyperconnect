import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CloseIcon } from './Icons';

interface MultiSelectDropdownProps {
  label: string;
  options: string[];
  selectedItems: string[];
  onChange: (items: string[]) => void;
  maxSelection: number;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ label, options, selectedItems, onChange, maxSelection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (item: string) => {
    const isSelected = selectedItems.includes(item);
    if (isSelected) {
      onChange(selectedItems.filter(i => i !== item));
    } else if (selectedItems.length < maxSelection) {
      onChange([...selectedItems, item]);
    } else {
      alert(`You can only select up to ${maxSelection} items.`);
    }
  };

  const removeSelectedItem = (item: string) => {
    onChange(selectedItems.filter(i => i !== item));
  };

  return (
    <div ref={dropdownRef} className="w-full">
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light text-left flex justify-between items-center"
        >
          <span className="text-gray-500 dark:text-gray-400">Select... ({selectedItems.length}/{maxSelection})</span>
          <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-brand-card border border-brand-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <label key={option} className="flex items-center py-2 px-3 hover:bg-gray-500/10 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-500 bg-transparent text-brand-primary focus:ring-brand-primary"
                  checked={selectedItems.includes(option)}
                  onChange={() => handleToggle(option)}
                  disabled={!selectedItems.includes(option) && selectedItems.length >= maxSelection}
                />
                <span className="ml-3 text-sm">{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 mt-2 min-h-[26px]">
        {selectedItems.map(item => (
          <span key={item} className="flex items-center bg-brand-primary/10 text-brand-primary/90 dark:bg-brand-primary/20 dark:text-brand-primary/80 text-xs font-semibold px-2.5 py-1 rounded-full">
            {item}
            <button type="button" onClick={() => removeSelectedItem(item)} className="ml-2 text-brand-primary/70 hover:text-brand-primary">
              <CloseIcon className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};