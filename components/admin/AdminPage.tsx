import React, { useState } from 'react';
import { AccessConfig, User, MonetizationRule } from '../../types';
import { ArrowLeftIcon, CreditCardIcon, ShieldCheckIcon, UsersIcon, WrenchScrewdriverIcon } from '../common/Icons';
import UserManagementTab from './tabs/UserManagementTab';
import AccessManagementTab from './tabs/AccessManagementTab';
import MonetizationTab from './tabs/MonetizationTab';

interface AdminPageProps {
    onNavigateBack: () => void;
    allUsers: User[];
    accessConfig: AccessConfig;
    onUpdateAccessConfig: React.Dispatch<React.SetStateAction<AccessConfig>>;
    monetizationRules: MonetizationRule[];
    onAddRule: (rule: Omit<MonetizationRule, 'id'>) => void;
    onUpdateRule: (rule: MonetizationRule) => void;
    onDeleteRule: (ruleId: string) => void;
}

type AdminTab = 'settings' | 'users' | 'access' | 'monetization';

const AdminPage: React.FC<AdminPageProps> = (props) => {
    const { onNavigateBack, allUsers, accessConfig, onUpdateAccessConfig, monetizationRules, onAddRule, onUpdateRule, onDeleteRule } = props;
    const [activeTab, setActiveTab] = useState<AdminTab>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagementTab allUsers={allUsers} />;
            case 'access':
                return <AccessManagementTab accessConfig={accessConfig} onUpdateAccessConfig={onUpdateAccessConfig} />;
            case 'monetization':
                return <MonetizationTab 
                            rules={monetizationRules}
                            onAddRule={onAddRule}
                            onUpdateRule={onUpdateRule}
                            onDeleteRule={onDeleteRule}
                       />;
            case 'settings':
            default:
                return <div className="p-8"><h2 className="text-2xl font-bold">Platform Settings</h2><p className="mt-4 text-gray-500">Global platform settings will be managed here.</p></div>;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-brand-light dark:bg-brand-dark">
            <header className="bg-brand-card/80 backdrop-blur-lg shadow-md sticky top-0 z-40 border-b border-brand-border">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button onClick={onNavigateBack} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-brand-accent">Platform Administration</h1>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Vertical Tabs */}
                    <aside className="md:w-1/4 lg:w-1/5">
                        <nav className="flex flex-col space-y-2">
                           <AdminTabButton icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                           <AdminTabButton icon={<UsersIcon className="w-5 h-5"/>} label="User Management" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                           <AdminTabButton icon={<ShieldCheckIcon className="w-5 h-5"/>} label="Access Management" isActive={activeTab === 'access'} onClick={() => setActiveTab('access')} />
                           <AdminTabButton icon={<CreditCardIcon className="w-5 h-5"/>} label="Monetization" isActive={activeTab === 'monetization'} onClick={() => setActiveTab('monetization')} />
                        </nav>
                    </aside>

                    {/* Content */}
                    <div className="flex-grow bg-brand-card rounded-xl shadow-md border border-brand-border overflow-hidden">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

const AdminTabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-3 p-3 rounded-lg font-semibold text-sm transition-colors ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}>
        {icon}
        <span>{label}</span>
    </button>
);


export default AdminPage;