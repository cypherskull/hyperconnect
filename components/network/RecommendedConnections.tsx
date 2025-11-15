import React, { useMemo } from 'react';
import { User, Seller, InboxItem, Persona } from '../../types';
import { PlusIcon } from '../common/Icons';

interface RecommendedConnectionsProps {
    currentUser: User;
    allUsers: User[];
    allSellers: Seller[];
    inboxItems: InboxItem[];
    onSendConnectionRequest: (entityId: string) => void;
    onSelectSeller: (seller: Seller) => void;
}

export const RecommendedConnections: React.FC<RecommendedConnectionsProps> = ({ currentUser, allUsers, allSellers, inboxItems, onSendConnectionRequest, onSelectSeller }) => {
    
    const recommendedConnections = useMemo(() => {
        const connectedIds = new Set(currentUser.connections || []);
        
        const currentUserSellerProfile = allSellers.find(s => s.companyName === currentUser.company && currentUser.persona === 'Seller');
        if (currentUserSellerProfile) {
            connectedIds.add(currentUserSellerProfile.id);
        }
        connectedIds.add(currentUser.id);

        const userInterests = currentUser.interests || { industry: [], geography: [], valueChain: [], offering: [] };

        const scoredSellers = allSellers
            .filter(s => !connectedIds.has(s.id))
            .map(seller => {
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
                const activityScore = seller.platformEngagement / 1000;
                return { entity: seller, score: interestScore + activityScore, type: 'Seller' as const };
            });

        const targetPersonas: Persona[] = ['Buyer', 'Investor', 'Collaborator'];
        const scoredUsers = allUsers
            .filter(user => targetPersonas.includes(user.persona) && !connectedIds.has(user.id))
            .map(user => {
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
            });

        return [...scoredSellers, ...scoredUsers]
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

    }, [currentUser, allSellers, allUsers]);

    const getConnectionStatus = (entityId: string) => {
        const isSeller = entityId.startsWith('seller-');
        const pendingRequest = inboxItems.find(item => 
            item.category === 'Connection Request' && 
            item.fromUser.id === currentUser.id && 
            ((isSeller && item.relatedSellerId === entityId) || (!isSeller && item.relatedUserId === entityId)) &&
            item.status === 'Pending'
        );
        return pendingRequest ? 'pending' : 'not_connected';
    };

    return (
        <div>
            <div className="bg-cyan-500 rounded-t-lg p-3">
                <h2 className="text-xl font-bold text-white">Recommended Connections</h2>
            </div>
            <div className="bg-brand-card rounded-b-lg shadow border border-brand-border overflow-hidden">
                <table className="w-full">
                    <thead style={{backgroundColor: '#9ccc65'}}>
                        <tr>
                            <th className="p-3 text-left font-semibold text-white">Name</th>
                            <th className="p-3 text-left font-semibold text-white">User type</th>
                            <th className="p-3 text-left font-semibold text-white">Connect</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recommendedConnections.map(({ entity, type }) => {
                            const status = getConnectionStatus(entity.id);
                            const isSeller = type === 'Seller';
                            const sellerEntity = isSeller ? (entity as Seller) : null;
                            const userEntity = !isSeller ? (entity as User) : null;
                            const name = isSeller ? sellerEntity!.companyName : userEntity!.name;
                            const subName = isSeller ? (sellerEntity!.keyContacts[0]?.name || 'Primary Contact') : userEntity!.designation;

                            return (
                                <tr key={entity.id} className="border-b border-brand-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="p-3">
                                        <div 
                                            className={`font-bold ${isSeller ? 'cursor-pointer hover:underline' : ''}`}
                                            onClick={() => isSeller && onSelectSeller(sellerEntity!)}
                                        >
                                            {name}
                                        </div>
                                        <div className="text-xs text-gray-500">{subName}</div>
                                    </td>
                                    <td className="p-3 text-sm">{type}</td>
                                    <td className="p-3">
                                        {status === 'pending' ? (
                                             <button disabled className="px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-md cursor-default">Request Sent</button>
                                        ) : (
                                            <button 
                                                onClick={() => onSendConnectionRequest(entity.id)}
                                                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary"
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                Connect
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};