import React from 'react';
import { AccessConfig, Persona } from '../../../types';
import { featureAccessKeys } from '../../../services/api';

interface AccessManagementTabProps {
    accessConfig: AccessConfig;
    onUpdateAccessConfig: React.Dispatch<React.SetStateAction<AccessConfig>>;
}

const AccessManagementTab: React.FC<AccessManagementTabProps> = ({ accessConfig, onUpdateAccessConfig }) => {

    const handleToggle = (persona: Persona, feature: keyof AccessConfig[Persona]) => {
        onUpdateAccessConfig(prevConfig => ({
            ...prevConfig,
            [persona]: {
                ...prevConfig[persona],
                [feature]: !prevConfig[persona][feature]
            }
        }));
    };

    const personas = Object.keys(accessConfig) as Persona[];

    return (
        <div>
            <div className="p-4 border-b border-brand-border">
                <h2 className="text-xl font-bold">Access Management</h2>
                <p className="text-sm text-gray-500">Configure feature access for each user persona.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-brand-card-light">
                        <tr>
                            <th className="px-6 py-3 font-semibold">Feature</th>
                            {personas.map(p => <th key={p} className="px-6 py-3 font-semibold text-center">{p}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {featureAccessKeys.map(({key, name, description}) => (
                            <tr key={key}>
                                <td className="px-6 py-4">
                                    <p className="font-medium">{name}</p>
                                    <p className="text-xs text-gray-400">{description}</p>
                                </td>
                                {personas.map(persona => (
                                    <td key={`${persona}-${key}`} className="px-6 py-4 text-center">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={accessConfig[persona]?.[key] || false}
                                                onChange={() => handleToggle(persona, key)}
                                                className="sr-only peer"
                                                disabled={persona === 'Admin'} // Admin should always have all permissions
                                            />
                                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
                                        </label>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccessManagementTab;