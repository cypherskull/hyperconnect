import React, { useState, useMemo } from 'react';
import { User, Persona, InboxItem } from '../../types';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';
import { PlusIcon } from '../common/Icons';
import { useAppContext } from '../../hooks/useAuth';

interface UserScannerProps {
    currentUser: User;
    allUsers: User[];
    inboxItems: InboxItem[];
    onSendConnectionRequest: (userId: string) => void;
}

const UserScanner: React.FC<UserScannerProps> = ({ currentUser, allUsers, inboxItems, onSendConnectionRequest }) => {
    const { state } = useAppContext();
    const settings = state.platformSettings;

    const [filters, setFilters] = useState<Required<Pick<User['interests'], 'industry' | 'geography' | 'valueChain' | 'offering'>>>({
        industry: [],
        geography: [],
        valueChain: [],
        offering: [],
    });
    const [selectedPersonas, setSelectedPersonas] = useState<Persona[]>(['Buyer', 'Investor', 'Collaborator']);

    const handlePersonaToggle = (persona: Persona) => {
        setSelectedPersonas(prev => prev.includes(persona) ? prev.filter(p => p !== persona) : [...prev, persona]);
    }

    const filteredUsers = useMemo(() => {
        const connectedIds = new Set(currentUser.connections || []);
        connectedIds.add(currentUser.id);

        return allUsers.filter(user => {
            if (connectedIds.has(user.id)) return false;
            if (selectedPersonas.length > 0 && !selectedPersonas.includes(user.persona)) return false;

            const userInterests = user.interests;
            if (!userInterests) return false;

            const industryMatch = filters.industry.length === 0 || filters.industry.some(f => userInterests.industry.includes(f));
            const geoMatch = filters.geography.length === 0 || filters.geography.some(f => userInterests.geography.includes(f));
            const vcMatch = filters.valueChain.length === 0 || filters.valueChain.some(f => userInterests.valueChain.includes(f));
            const offeringMatch = filters.offering.length === 0 || (userInterests.offering && filters.offering.some(f => userInterests.offering!.includes(f)));

            return industryMatch && geoMatch && vcMatch && offeringMatch;
        });
    }, [filters, selectedPersonas, allUsers, currentUser]);

    const getConnectionStatus = (userId: string) => {
        if (currentUser.connections?.includes(userId)) return 'connected';
        const pendingRequest = inboxItems.find(item =>
            item.category === 'ConnectionRequest' &&
            item.status === 'Pending' &&
            item.fromUser.id === currentUser.id &&
            item.relatedUserId === userId
        );
        return pendingRequest ? 'pending' : 'not_connected';
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Scan the Network</h2>
            <div className="bg-brand-card rounded-lg shadow border border-brand-border p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MultiSelectDropdown label="Industry" options={settings?.industries || []} selectedItems={filters.industry} onChange={items => setFilters(f => ({...f, industry: items}))} maxSelection={5} />
                    <MultiSelectDropdown label="Geography" options={settings?.geographies || []} selectedItems={filters.geography} onChange={items => setFilters(f => ({...f, geography: items}))} maxSelection={5} />
                    <MultiSelectDropdown label="Value Chain" options={settings?.valueChains || []} selectedItems={filters.valueChain} onChange={items => setFilters(f => ({...f, valueChain: items}))} maxSelection={5} />
                    <MultiSelectDropdown label="Offering" options={settings?.offerings || []} selectedItems={filters.offering} onChange={items => setFilters(f => ({...f, offering: items}))} maxSelection={5} />
                </div>
                 <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-brand-border">
                    <span className="text-sm font-semibold mr-2">Filter by Persona:</span>
                    {(['Buyer', 'Investor', 'Collaborator'] as Persona[]).map(persona => (
                        <label key={persona} className="flex items-center gap-2 text-sm p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                             <input type="checkbox" checked={selectedPersonas.includes(persona)} onChange={() => handlePersonaToggle(persona)} className="h-4 w-4 rounded border-gray-400 text-brand-primary focus:ring-brand-primary" />
                             {persona}
                        </label>
                    ))}
                 </div>
                 <div className="pt-6 border-t border-brand-border">
                    <h3 className="font-semibold mb-3">Results ({filteredUsers.length})</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {filteredUsers.length > 0 ? filteredUsers.map(user => {
                             const status = getConnectionStatus(user.id);
                             return (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-brand-card-light rounded-md">
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.designation} at {user.company}</p>
                                        </div>
                                    </div>
                                    {status === 'connected' ? (
                                        <button disabled className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-md cursor-default">Connected</button>
                                    ) : status === 'pending' ? (
                                        <button disabled className="px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-md cursor-default">Sent</button>
                                    ) : (
                                        <button onClick={() => onSendConnectionRequest(user.id)} className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-brand-primary text-white rounded-md hover:bg-brand-secondary">
                                            <PlusIcon className="w-4 h-4"/> Connect
                                        </button>
                                    )}
                                </div>
                             )
                        }) : (
                            <p className="text-center text-sm text-gray-500 py-8">No users match your criteria. Try broadening your search.</p>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default UserScanner;