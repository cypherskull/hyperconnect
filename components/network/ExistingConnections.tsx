import React, { useState, useMemo } from 'react';
import { User, Seller } from '../../types';

interface ExistingConnectionsProps {
    currentUser: User;
    allUsers: User[];
    allSellers: Seller[];
    onSelectSeller: (seller: Seller) => void;
}

type ConnectionTab = 'Sellers' | 'Buyers' | 'Investors' | 'Collaborators';
const TABS: ConnectionTab[] = ['Sellers', 'Buyers', 'Investors', 'Collaborators'];

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center flex-shrink-0 space-x-2 px-4 py-3 font-semibold border-b-2 text-sm ${active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-primary'}`}
    >
        {children}
    </button>
);

export const ExistingConnections: React.FC<ExistingConnectionsProps> = ({ currentUser, allUsers, allSellers, onSelectSeller }) => {
    const [activeTab, setActiveTab] = useState<ConnectionTab>('Sellers');

    const connectionsByType = useMemo(() => {
        const connectionIds = new Set(currentUser.connections || []);
        const result = {
            Sellers: allSellers.filter(s => connectionIds.has(s.id)),
            Buyers: allUsers.filter(u => connectionIds.has(u.id) && u.persona === 'Buyer'),
            Investors: allUsers.filter(u => connectionIds.has(u.id) && u.persona === 'Investor'),
            Collaborators: allUsers.filter(u => connectionIds.has(u.id) && u.persona === 'Collaborator'),
        };
        return result;
    }, [currentUser, allSellers, allUsers]);

    const groupedConnections = useMemo(() => {
        const connections = connectionsByType[activeTab];
        if (!connections || connections.length === 0) return {};

        const grouped: Record<string, (User | Seller)[]> = {};

        connections.forEach(conn => {
            let geos: string[] = [];
            if ('solutions' in conn) { // It's a Seller
                geos = Array.from(new Set(conn.solutions.flatMap(s => s.geography)));
            } else { // It's a User
                geos = conn.interests?.geography || [];
            }

            if (geos.length === 0) {
                if (!grouped['Unspecified']) grouped['Unspecified'] = [];
                grouped['Unspecified'].push(conn);
            } else {
                geos.forEach(geo => {
                    if (!grouped[geo]) grouped[geo] = [];
                    grouped[geo].push(conn);
                });
            }
        });

        return grouped;
    }, [activeTab, connectionsByType]);
    
    const getInterests = (conn: User | Seller, interestType: 'industry' | 'valueChain' | 'geography') => {
        let interestsSet: Set<string>;
        if ('solutions' in conn) { // Seller
            interestsSet = new Set(conn.solutions.flatMap(s => s[interestType]));
        } else { // User
            interestsSet = new Set(conn.interests?.[interestType] || []);
        }
        return Array.from(interestsSet).join(', ');
    };

    return (
        <div>
            <div className="bg-cyan-500 rounded-t-lg p-3">
                <h2 className="text-xl font-bold text-white">My Connections</h2>
            </div>
            <div className="bg-brand-card rounded-b-lg shadow border border-brand-border">
                <div className="flex border-b border-brand-border px-2 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => {
                        const count = connectionsByType[tab].length;
                        if (count === 0) return null;
                        return (
                            <TabButton key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                                <span>{tab}</span>
                                <span className="bg-gray-200 dark:bg-gray-700 text-xs font-bold rounded-full px-2 py-0.5">{count}</span>
                            </TabButton>
                        );
                    })}
                </div>
                
                <div className="p-4 space-y-6">
                    {Object.keys(groupedConnections).length === 0 ? (
                        <div className="p-8 text-center">
                           <p className="text-gray-500 dark:text-gray-400">You haven't made any connections in the {activeTab.toLowerCase()} category yet.</p>
                        </div>
                    ) : (
                        Object.keys(groupedConnections).sort().map(geo => (
                            <div key={geo}>
                                <h3 className="font-bold text-lg mb-2 text-brand-accent pb-1 border-b-2 border-brand-secondary">{geo}</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead className="text-left text-sm">
                                            <tr>
                                                <th className="p-2 font-semibold">Name</th>
                                                {activeTab !== 'Sellers' && <th className="p-2 font-semibold">Company</th>}
                                                {activeTab !== 'Sellers' && <th className="p-2 font-semibold">Designation</th>}
                                                <th className="p-2 font-semibold">Industry</th>
                                                <th className="p-2 font-semibold">Value Chain</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {groupedConnections[geo].map(conn => (
                                                <tr key={conn.id} className="border-b border-brand-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-sm">
                                                    {activeTab === 'Sellers' ? (
                                                        <>
                                                            <td className="p-2">
                                                                <div className="font-bold cursor-pointer hover:underline" onClick={() => onSelectSeller(conn as Seller)}>
                                                                    {(conn as Seller).companyName}
                                                                </div>
                                                            </td>
                                                            <td className="p-2 text-gray-600 dark:text-gray-300">{getInterests(conn, 'industry')}</td>
                                                            <td className="p-2 text-gray-600 dark:text-gray-300">{getInterests(conn, 'valueChain')}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td className="p-2 font-bold">{(conn as User).name}</td>
                                                            <td className="p-2 text-gray-600 dark:text-gray-300">{(conn as User).company}</td>
                                                            <td className="p-2 text-gray-600 dark:text-gray-300">{(conn as User).designation}</td>
                                                            <td className="p-2 text-gray-600 dark:text-gray-300">{getInterests(conn, 'industry')}</td>
                                                            <td className="p-2 text-gray-600 dark:text-gray-300">{getInterests(conn, 'valueChain')}</td>
                                                        </>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};