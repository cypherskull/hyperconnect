import React from 'react';
import { User, Post, InboxItem, Seller } from '../../types';
import { RecommendedConnections } from './RecommendedConnections';
import NetworkVisualization from './NetworkVisualization';
import UserScanner from './UserScanner';

interface NetworkPageProps {
  currentUser: User;
  allUsers: User[];
  allPosts: Post[];
  inboxItems: InboxItem[];
  onSendConnectionRequest: (entityId: string) => void;
  onSelectSeller: (seller: Seller) => void;
  allSellers: Seller[];
}

export const NetworkPage: React.FC<NetworkPageProps> = (props) => {
  return (
    <div id="network-page" className="space-y-12">
      <NetworkVisualization
        currentUser={props.currentUser}
        allSellers={props.allSellers}
        allUsers={props.allUsers}
        onSelectSeller={props.onSelectSeller}
      />
      <RecommendedConnections {...props} />
      <UserScanner
        currentUser={props.currentUser}
        allUsers={props.allUsers}
        inboxItems={props.inboxItems}
        onSendConnectionRequest={props.onSendConnectionRequest}
      />
    </div>
  );
};
