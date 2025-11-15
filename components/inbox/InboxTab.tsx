import React from 'react';
import { InboxItem } from '../../types';
import { InboxItemCard } from './InboxItemCard';

interface InboxTabProps {
  items: InboxItem[];
  onRespondToConnectionRequest: (itemId: string, response: 'Accepted' | 'Declined') => void;
  onRespondToItem: (item: InboxItem) => void;
}

export const InboxTab: React.FC<InboxTabProps> = ({ items, onRespondToConnectionRequest, onRespondToItem }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-brand-card-light rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No items in this category.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map(item => (
          <InboxItemCard 
            key={item.id} 
            item={item} 
            onRespondToConnectionRequest={onRespondToConnectionRequest} 
            onRespondToItem={onRespondToItem}
          />
      ))}
    </div>
  );
};