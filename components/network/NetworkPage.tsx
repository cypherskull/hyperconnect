import React from 'react';
import { User, Post, InboxItem, Seller } from '../../types';
import { RecommendedConnections } from './RecommendedConnections';
import { ExistingConnections } from './ExistingConnections';

interface NetworkPageProps {
  currentUser: User;
  allUsers: User[];
  allPosts: Post[];
  inboxItems: InboxItem[];
  onSendConnectionRequest: (sellerId: string) => void;
  onSelectSeller: (seller: Seller) => void;
  allSellers: Seller[];
}

export const NetworkPage: React.FC<NetworkPageProps> = (props) => {
  return (
    <div className="space-y-12">
      <ExistingConnections 
        currentUser={props.currentUser} 
        allSellers={props.allSellers} 
        allUsers={props.allUsers}
        onSelectSeller={props.onSelectSeller} 
      />
      <RecommendedConnections {...props} />
    </div>
  );
};