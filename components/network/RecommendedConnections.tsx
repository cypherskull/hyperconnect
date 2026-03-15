import React, { useMemo } from 'react';
import { User, Seller, InboxItem, Persona } from '../../types';
import { PlusIcon, CheckCircleIcon } from '../common/Icons';

interface RecommendedConnectionsProps {
    currentUser: User;
    allUsers: User[];
    allSellers: Seller[];
    inboxItems: InboxItem[];
    onSendConnectionRequest: (entityId: string) => void;
    onSelectSeller: (seller: Seller) => void;
}

const RecommendedConnectionCard: React.FC<{
    entity: User | Seller;
    type: string;
    connectionStatus: 'connected' | 'pending' | 'not_connected';
    onConnect: () => void;
    onSelect?: () => void;
}> = ({ entity, type, connectionStatus, onConnect, onSelect }) => {
    const isSeller = 'solutions' in entity;
    const name = isSeller ? entity.companyName : entity.name;
    const avatar = isSeller ? entity.companyLogoUrl : entity.avatarUrl;
    const description = isSeller ? entity.about : `${entity.designation} at ${entity.company}`;

    const ConnectButton = () => {
        switch (connectionStatus) {
            case 'pending':
                return <button disabled className="w-full mt-auto px-4 py-2 text-sm rounded-md font-semibold bg-gray-200 dark:bg-gray-700 cursor-default">Request Sent</button>;
            case 'connected':
                 return <button disabled className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 cursor-default"><CheckCircleIcon className="w-4 h-4" /> Connected</button>
            default:
                return <button onClick={onConnect} className="w-full mt-auto flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md font-semibold bg-brand-primary text-white hover:bg-brand-secondary"><PlusIcon className="w-4 h-4"/> Connect</button>;
        }
    }

    return (
        <div className="bg-brand-card rounded-lg shadow-md border border-brand-border flex flex-col p-4 h-full transition-shadow hover:shadow-lg">
             <div 
                className={`flex items-center gap-4 ${isSeller ? 'cursor-pointer' : ''}`}
                onClick={onSelect}
             >
                <img src={avatar} alt={name} className="w-16 h-16 rounded-full" />
                <div>
                    <h4 className="font-bold">{name}</h4>
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-secondary">{type}</p>
                </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 my-3 line-clamp-3 flex-grow">{description}</p>
            <ConnectButton />
        </div>
    );
};

export const RecommendedConnections: React.FC<RecommendedConnectionsProps> = ({ currentUser, allUsers, allSellers, inboxItems, onSendConnectionRequest, onSelectSeller }) => {
    
    const recommendedConnections = useMemo(() => {
        const connectedIds = new Set(currentUser.connections || []);
        
        const currentUserSellerProfile = allSellers.find(s => s.companyName === currentUser.company && currentUser.persona === 'Seller');
        if (currentUserSellerProfile) {
            connectedIds.add(currentUserSellerProfile.id);
        }
        connectedIds.add(currentUser.id);

        const userInterests = currentUser.interests || { industry: [], geography: [], valueChain: [], offering: [] };

        const targetPersonas: Persona[] = ['Buyer', 'Investor', 'Collaborator'];
        
        const scoredEntities = [
            // Recommend Sellers if current user is not a seller
            ...(currentUser.persona !== 'Seller' ? allSellers.filter(s => !connectedIds.has(s.id)).map(seller => {
                let interestScore = 0;
                seller.solutions.forEach(solution => {
                    let currentSolutionScore = 0;
                    currentSolutionScore += (solution.industry || []).filter(i => userInterests.industry.includes(i)).length * 2;
                    currentSolutionScore += (solution.geography || []).filter(g => userInterests.geography.includes(g)).length;
                    currentSolutionScore += (solution.valueChain || []).filter(vc => userInterests.valueChain.includes(vc)).length;
                    if(userInterests.offering && userInterests.offering.length > 0) {
                        currentSolutionScore += [solution.offering].filter(o => userInterests.offering!.includes(o)).length;
                    }
                    interestScore = Math.max(interestScore, currentSolutionScore);
                });
                const activityScore = seller.platformEngagement / 500;
                return { entity: seller, score: interestScore + activityScore, type: 'Seller' as const };
            }) : []),

            // Recommend other Users
            ...allUsers.filter(user => targetPersonas.includes(user.persona) && !connectedIds.has(user.id)).map(user => {
                let interestScore = 0;
                 const targetInterests = user.interests;
                if (targetInterests) {
                    interestScore += (targetInterests.industry || []).filter(i => userInterests.industry.includes(i)).length * 2;
                    interestScore += (targetInterests.geography || []).filter(g => userInterests.geography.includes(g)).length;
                    interestScore += (targetInterests.valueChain || []).filter(vc => userInterests.valueChain.includes(vc)).length;
                    if (userInterests.offering && targetInterests.offering) {
                        interestScore += (targetInterests.offering || []).filter(o => userInterests.offering!.includes(o)).length;
                    }
                }
                return { entity: user, score: interestScore, type: user.persona };
            })
        ];

        return scoredEntities.sort((a, b) => b.score - a.score).slice(0, 6);

    }, [currentUser, allSellers, allUsers]);

    const getConnectionStatus = (entityId: string) => {
        if (currentUser.connections?.includes(entityId)) return 'connected';
        const isSeller = entityId.startsWith('seller-');
        const pendingRequest = inboxItems.find(item =>
            item.category === 'ConnectionRequest' &&
            item.status === 'Pending' &&
            item.fromUser.id === currentUser.id &&
            (item.relatedSellerId === entityId || item.relatedUserId === entityId)
        );
        return pendingRequest ? 'pending' : 'not_connected';
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedConnections.map(({ entity, type }) => (
                    <RecommendedConnectionCard
                        key={entity.id}
                        entity={entity}
                        type={type}
                        connectionStatus={getConnectionStatus(entity.id)}
                        onConnect={() => onSendConnectionRequest(entity.id)}
                        onSelect={type === 'Seller' ? () => onSelectSeller(entity as Seller) : undefined}
                    />
                ))}
            </div>
        </div>
    );
};
