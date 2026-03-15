import React, { useState } from 'react';
import { PlatformSettings, ScopeOption } from '../../../types';
import { PlusIcon, TrashIcon } from '../../common/Icons';
import { Input, Textarea, Button } from '../../common/Forms';

interface PlatformSettingsTabProps {
    settings: PlatformSettings;
    onUpdate: (settings: PlatformSettings) => void;
}

const ListEditor: React.FC<{ 
    title: string; 
    items: string[]; 
    onUpdate: (items: string[]) => void 
}> = ({ title, items, onUpdate }) => {
    const [newItem, setNewItem] = useState('');

    const handleAdd = () => {
        if (newItem.trim() && !items.includes(newItem.trim())) {
            onUpdate([...items, newItem.trim()]);
            setNewItem('');
        }
    };

    const handleRemove = (itemToRemove: string) => {
        onUpdate(items.filter(i => i !== itemToRemove));
    };

    return (
        <div className="space-y-4 p-4 border border-brand-border rounded-lg bg-brand-card-light/30">
            <h3 className="font-bold text-brand-accent">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {items.map(item => (
                    <span key={item} className="flex items-center bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full text-sm font-semibold">
                        {item}
                        <button onClick={() => handleRemove(item)} className="ml-2 hover:text-red-500">
                            <TrashIcon className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <Input 
                    value={newItem} 
                    onChange={e => setNewItem(e.target.value)} 
                    placeholder={`Add new ${title.toLowerCase()}...`}
                    onKeyPress={e => e.key === 'Enter' && handleAdd()}
                />
                <Button onClick={handleAdd} type="button">
                    <PlusIcon className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

const ScopeEditor: React.FC<{ 
    scopes: ScopeOption[]; 
    onUpdate: (scopes: ScopeOption[]) => void 
}> = ({ scopes, onUpdate }) => {
    const handleToggle = (id: string) => {
        onUpdate(scopes.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
    };

    const handleLabelChange = (id: string, label: string) => {
        onUpdate(scopes.map(s => s.id === id ? { ...s, label } : s));
    };

    const handleDescriptionChange = (id: string, description: string) => {
        onUpdate(scopes.map(s => s.id === id ? { ...s, description } : s));
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold text-lg text-brand-accent">Feed View Options (My View)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scopes.map(scope => (
                    <div key={scope.id} className={`p-4 border rounded-lg transition-colors ${scope.isEnabled ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-brand-border bg-gray-50 opacity-60'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-sm uppercase tracking-wider text-gray-500">{scope.id}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={scope.isEnabled}
                                    onChange={() => handleToggle(scope.id)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                            </label>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">UI Label (e.g. My Fav)</label>
                                <Input 
                                    value={scope.label} 
                                    onChange={e => handleLabelChange(scope.id, e.target.value)} 
                                    disabled={!scope.isEnabled}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Description</label>
                                <Textarea 
                                    value={scope.description} 
                                    onChange={e => handleDescriptionChange(scope.id, e.target.value)} 
                                    rows={2}
                                    className="text-sm"
                                    disabled={!scope.isEnabled}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PlatformSettingsTab: React.FC<PlatformSettingsTabProps> = ({ settings, onUpdate }) => {
    const [localSettings, setLocalSettings] = useState<PlatformSettings>(JSON.parse(JSON.stringify(settings)));

    const handleSave = () => {
        onUpdate(localSettings);
    };

    const updateField = <K extends keyof PlatformSettings>(field: K, value: PlatformSettings[K]) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="p-6 space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-2">Platform Configuration</h2>
                <p className="text-gray-500 text-sm">Customize the global parameters for networking and content discovery.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ListEditor title="Value Chains" items={localSettings.valueChains} onUpdate={items => updateField('valueChains', items)} />
                <ListEditor title="Industries" items={localSettings.industries} onUpdate={items => updateField('industries', items)} />
                <ListEditor title="Geographies" items={localSettings.geographies} onUpdate={items => updateField('geographies', items)} />
                <ListEditor title="Offerings" items={localSettings.offerings} onUpdate={items => updateField('offerings', items)} />
            </div>

            <div className="border-t border-brand-border pt-8">
                <ScopeEditor scopes={localSettings.scopes} onUpdate={scopes => updateField('scopes', scopes)} />
            </div>

            <div className="border-t border-brand-border pt-6 flex justify-end">
                <Button onClick={handleSave} className="px-10 py-3">
                    Save Changes to Platform
                </Button>
            </div>
        </div>
    );
};

export default PlatformSettingsTab;