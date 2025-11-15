import React, { useState } from 'react';
import { InboxItem, User, InboxItemCategory } from '../../types';
import { InboxTab } from './InboxTab';
import { UsersIcon, CalendarIcon, CurrencyDollarIcon, LikeIcon, EnvelopeIcon } from '../common/Icons';

interface InboxPageProps {
  allInboxItems: InboxItem[];
  currentUser: User;
  onRespondToConnectionRequest: (itemId: string, response: 'Accepted' | 'Declined') => void;
  onRespondToItem: (item: InboxItem) => void;
}

type TabCategory = 'All' | InboxItemCategory;

const categories: { name: TabCategory, icon: React.FC<any> }[] = [
    { name: 'All', icon: EnvelopeIcon },
    { name: 'Connection Request', icon: UsersIcon },
    { name: 'Meeting Request', icon: CalendarIcon },
    { name: 'Sales Enquiry', icon: CurrencyDollarIcon },
    { name: 'Engagement', icon: LikeIcon },
    { name: 'Collaboration Request', icon: UsersIcon },
    { name: 'Message', icon: EnvelopeIcon },
];

export const InboxPage: React.FC<InboxPageProps> = ({ allInboxItems, currentUser, onRespondToConnectionRequest, onRespondToItem }) => {
    const [activeTab, setActiveTab] = useState<TabCategory>('All');

    const filteredItems = activeTab === 'All' 
        ? allInboxItems 
        : allInboxItems.filter(item => item.category === activeTab);

    const getCount = (name: TabCategory) => {
        if (name === 'All') {
            return allInboxItems.filter(i => i.status === 'Pending').length;
        }
        return allInboxItems.filter(i => i.category === name && i.status === 'Pending').length;
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Inbox</h1>
            <div className="flex border-b border-brand-border mb-6 overflow-x-auto scrollbar-hide">
                {categories.map(({ name, icon: Icon }) => {
                    const count = getCount(name);
                    const hasItems = name === 'All' || allInboxItems.some(i => i.category === name);

                    if (!hasItems) return null;
                    
                    return (
                        <button key={name} onClick={() => setActiveTab(name)} className={`flex items-center flex-shrink-0 space-x-2 px-4 py-3 font-semibold border-b-2 text-sm ${activeTab === name ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-primary'}`}>
                            <Icon className="w-5 h-5" />
                            <span>{name}</span>
                            {count > 0 && <span className="bg-brand-primary text-white text-xs font-bold rounded-full px-2 py-0.5">{count}</span>}
                        </button>
                    )
                })}
            </div>

            <InboxTab 
                items={filteredItems} 
                onRespondToConnectionRequest={onRespondToConnectionRequest}
                onRespondToItem={onRespondToItem}
            />
        </div>
    );
};