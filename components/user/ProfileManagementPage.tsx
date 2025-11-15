import React, { useState, useMemo } from 'react';
import { User, Enterprise, Persona, Seller, Transaction, PaymentMethod } from '../../types';
import { PencilIcon, CreditCardIcon, CheckCircleIcon, ShieldCheckIcon, TrashIcon, UsersIcon, ChevronDownIcon, CubeIcon, ChartBarIcon, ArrowLeftIcon, GiftIcon, BillingIcon } from '../common/Icons';
import { InterestsEditModal } from './InterestsEditModal';
import { AddFundsModal } from './AddFundsModal';
// FIX: Standardized import to use PascalCase 'SellerProfilePage.tsx' to resolve file casing conflict.
import { ProfileTab } from '../seller/SellerProfilePage';
import { ReferralPanel } from './ReferralPanel';
import { SubscriptionPanel } from './SubscriptionPanel';
import { PaymentMethodsPanel } from './PaymentMethodsPanel';

// --- ENTERPRISE ADMIN PANEL SUB-COMPONENT --- //
interface EnterpriseAdminPanelProps {
    currentUser: User;
    enterprise: Enterprise;
    allUsers: User[];
    onInviteUser: (email: string, enterprise: Enterprise) => void;
    onUpdateUser: (userId: string, updates: Partial<User>) => void;
    onRemoveUser: (userId: string, enterpriseId: string) => void;
    onApprove: (userId: string, enterpriseId: string) => void;
    onDeny: (userId: string, enterpriseId: string) => void;
}

const EnterpriseAdminPanel: React.FC<EnterpriseAdminPanelProps> = ({ currentUser, enterprise, allUsers, onInviteUser, onUpdateUser, onRemoveUser, onApprove, onDeny }) => {
    const [inviteEmail, setInviteEmail] = useState('');
    const members = useMemo(() => allUsers.filter(u => enterprise.members.includes(u.id)), [allUsers, enterprise.members]);
    const pendingMembers = useMemo(() => allUsers.filter(u => enterprise.pendingMembers?.includes(u.id)), [allUsers, enterprise.pendingMembers]);

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (inviteEmail) {
            onInviteUser(inviteEmail, enterprise);
            setInviteEmail('');
        }
    };
    
    const availablePersonas: Persona[] = ['Buyer', 'Seller', 'Investor', 'Collaborator'];

    return (
        <SectionCard title="Enterprise Management">
            <div>
                <h3 className="font-semibold mb-2">Enterprise Details</h3>
                <p className="text-sm">Association Code: <span className="font-bold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{enterprise.associationCode}</span></p>
            </div>
            <div className="border-t border-brand-border pt-4">
                <h3 className="font-semibold mb-2">Invite Existing User</h3>
                <form onSubmit={handleInvite} className="flex gap-2">
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter user's business email" className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none" />
                    <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary">Invite</button>
                </form>
            </div>
            {pendingMembers.length > 0 && (
                 <div className="border-t border-brand-border pt-4">
                    <h3 className="font-semibold mb-2">Pending Join Requests ({pendingMembers.length})</h3>
                    <div className="space-y-2">
                        {pendingMembers.map(user => (
                            <div key={user.id} className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.businessEmail}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onApprove(user.id, enterprise.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full"><CheckCircleIcon className="w-5 h-5"/></button>
                                    <button onClick={() => onDeny(user.id, enterprise.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="border-t border-brand-border pt-4">
                <h3 className="font-semibold mb-2">Team Members ({members.length})</h3>
                <div className="space-y-2">
                    {members.map(user => (
                        <div key={user.id} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="font-bold">{user.name} {user.id === currentUser.id && '(You)'}</p>
                                    <p className="text-sm text-gray-500">{user.designation}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                               <select value={user.persona} onChange={e => onUpdateUser(user.id, { persona: e.target.value as Persona })} className="p-1 text-xs border border-brand-border rounded-md bg-brand-card-light">
                                    {availablePersonas.map(p => <option key={p} value={p}>{p}</option>)}
                               </select>
                               <select value={user.role} onChange={e => onUpdateUser(user.id, { role: e.target.value as 'Admin' | 'Member' })} className="p-1 text-xs border border-brand-border rounded-md bg-brand-card-light">
                                    <option value="Member">Member</option>
                                    <option value="Admin">Admin</option>
                               </select>
                                {user.id !== currentUser.id && <button onClick={() => onRemoveUser(user.id, enterprise.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SectionCard>
    )
}

// --- MAIN PROFILE PAGE COMPONENT --- //
interface ProfileManagementPageProps {
    user: User;
    allUsers: User[];
    allSellers: Seller[];
    allEnterprises: Enterprise[];
    onBack: () => void;
    onUpdateUser: (updatedUser: User) => void;
    onAcceptInvite: (user: User) => void;
    onDeclineInvite: (user: User) => void;
    onInviteUserToEnterprise: (email: string, enterprise: Enterprise) => void;
    onUpdateEnterpriseUser: (userId: string, updates: Partial<User>) => void;
    onRemoveUserFromEnterprise: (userId: string, enterpriseId: string) => void;
    onApproveJoinRequest: (userId: string, enterpriseId: string) => void;
    onDenyJoinRequest: (userId: string, enterpriseId: string) => void;
    onSelectSeller: (seller: Seller, options?: { solutionId?: string; tab?: ProfileTab }) => void;
    onRequestToJoinEnterprise: (associationCode: string) => void;
    onClaimMonthlyEarnings: (userId: string) => void;
    onPayDues: () => void;
    onSimulateBilling: () => void;
    onAddPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    onRemovePaymentMethod: (methodId: string) => void;
    onSetPreferredPaymentMethod: (methodId: string) => void;
}

const ProfileField: React.FC<{ label: string, value: string | undefined, onEdit?: () => void }> = ({ label, value, onEdit }) => (
    <div>
        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</label>
        <div className="flex items-center justify-between">
            <p className="text-gray-800 dark:text-gray-200">{value || 'Not set'}</p>
            {onEdit && <button onClick={onEdit}><PencilIcon className="w-4 h-4 text-gray-400 hover:text-brand-primary"/></button>}
        </div>
    </div>
);

const SectionCard: React.FC<{ title: string, children: React.ReactNode, icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-brand-card rounded-lg shadow-md border border-brand-border">
        <h2 className="text-xl font-bold p-4 border-b border-brand-border flex items-center gap-2">
            {icon}
            <span>{title}</span>
        </h2>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

export const ProfileManagementPage: React.FC<ProfileManagementPageProps> = (props) => {
    const { user, allUsers, allSellers, allEnterprises, onBack, onUpdateUser, onAcceptInvite, onDeclineInvite, onSelectSeller, onRequestToJoinEnterprise, onClaimMonthlyEarnings, onPayDues, onSimulateBilling, onAddPaymentMethod, onRemovePaymentMethod, onSetPreferredPaymentMethod, ...adminProps } = props;
    const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
    const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
    const [associationCode, setAssociationCode] = useState('');
    
    const userEnterprise = useMemo(() => user.enterpriseId ? allEnterprises.find(e => e.id === user.enterpriseId) : null, [user, allEnterprises]);
    const userSellerProfile = useMemo(() => user.persona === 'Seller' ? allSellers.find(s => s.companyName === user.company) : null, [user, allSellers]);
    const isEnterpriseAdmin = user.role === 'Admin' && !!userEnterprise;
    
    const effectiveSubscription = userEnterprise?.subscriptionPlan || user.subscriptionPlan;
    const canUseWallet = effectiveSubscription === 'Basic' || effectiveSubscription === 'Pro' || effectiveSubscription === 'Enterprise' || user.walletBalance !== undefined;


    const handleSaveInterests = (interests: NonNullable<User['interests']>) => {
        onUpdateUser({ ...user, interests });
        setIsInterestsModalOpen(false);
    };

    const handleAddFunds = (amount: number) => {
        const newBalance = (user.walletBalance || 0) + amount;
        const newTransaction: Transaction = {
            id: `txn-${Date.now()}`,
            date: new Date().toISOString(),
            description: `Added funds to wallet`,
            amount: amount,
            status: 'paid'
        };
        onUpdateUser({ ...user, walletBalance: newBalance, transactionHistory: [...(user.transactionHistory || []), newTransaction] });
        setIsAddFundsModalOpen(false);
    };

    const handleJoinRequest = (e: React.FormEvent) => {
        e.preventDefault();
        if (associationCode.trim()) {
            onRequestToJoinEnterprise(associationCode.trim());
            setAssociationCode('');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <button onClick={onBack} className="flex items-center space-x-2 text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-primary mb-4">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back</span>
            </button>
            <div className="flex items-center space-x-6">
                <img src={user.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full" />
                <div>
                    <h1 className="text-3xl font-bold">{user.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400">{user.designation} at {user.company}</p>
                </div>
            </div>

            {user.enterpriseInvite && (
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg flex items-center justify-between">
                    <p>You have been invited to join <strong>{user.enterpriseInvite.enterpriseName}</strong>.</p>
                    <div className="flex gap-2">
                        <button onClick={() => onAcceptInvite(user)} className="px-3 py-1 text-sm font-semibold bg-brand-primary text-white rounded">Accept</button>
                        <button onClick={() => onDeclineInvite(user)} className="px-3 py-1 text-sm font-semibold bg-gray-200 dark:bg-gray-600 rounded">Decline</button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <SectionCard title="Personal Information">
                    <ProfileField label="Persona" value={user.persona} />
                    <ProfileField label="Business Email" value={user.businessEmail} />
                    <ProfileField label="Personal Email" value={user.personalEmail} />
                    <ProfileField label="Phone Number" value={user.phone} onEdit={() => alert('Edit phone not implemented.')} />
                </SectionCard>
                
                <SectionCard title="Interests & Subscription">
                    <ProfileField label="Value Chain" value={user.interests?.valueChain.join(', ')} />
                    <ProfileField label="Geography" value={user.interests?.geography.join(', ')} />
                    <ProfileField label="Industry" value={user.interests?.industry.join(', ')} />
                    <ProfileField label="Offering" value={user.interests?.offering?.join(', ')} />
                    <div className="flex items-center justify-between">
                        <button onClick={() => setIsInterestsModalOpen(true)} className="text-sm text-brand-primary hover:underline mt-2">Edit Interests</button>
                         <button className="text-sm text-brand-secondary hover:underline mt-2">Upgrade Plan</button>
                    </div>
                </SectionCard>
            </div>
            
             <SectionCard title="Subscription & Billing" icon={<BillingIcon className="w-6 h-6 text-brand-primary" />}>
                <SubscriptionPanel user={user} onPayDues={onPayDues} onSimulateBilling={onSimulateBilling}/>
            </SectionCard>
            
            <SectionCard title="Payment & Billing" icon={<CreditCardIcon className="w-6 h-6 text-green-600" />}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold mb-2">My Wallet</h3>
                         <div className="flex items-center justify-between p-4 bg-brand-card-light rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">Current Balance</p>
                                <p className="text-3xl font-bold">₹{user.walletBalance?.toLocaleString('en-IN') || 0}</p>
                            </div>
                            <button onClick={() => setIsAddFundsModalOpen(true)} className="px-4 py-2 text-sm font-semibold text-white bg-brand-secondary rounded-md hover:bg-brand-secondary/80 transition-colors">
                                Add Funds
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Payment Methods</h3>
                        <PaymentMethodsPanel 
                            user={user}
                            onAddMethod={onAddPaymentMethod}
                            onRemoveMethod={onRemovePaymentMethod}
                            onSetPreferred={onSetPreferredPaymentMethod}
                        />
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Refer & Earn" icon={<GiftIcon className="w-6 h-6 text-yellow-500" />}>
                <ReferralPanel user={user} onClaimMonthlyEarnings={() => onClaimMonthlyEarnings(user.id)} allUsers={allUsers}/>
            </SectionCard>

             {user.persona === 'Seller' && userSellerProfile && (
                <SectionCard title="Company Management">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button onClick={() => onSelectSeller(userSellerProfile, { tab: 'manage' })} className="p-4 flex items-center space-x-3 bg-brand-card-light rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-primary/10">
                            <CubeIcon className="w-8 h-8 text-brand-primary" />
                            <div>
                                <p className="font-bold text-left">Manage Content</p>
                                <p className="text-xs text-gray-500 text-left">Edit solutions, testimonials, etc.</p>
                            </div>
                        </button>
                         <button onClick={() => onSelectSeller(userSellerProfile, { tab: 'analytics' })} className="p-4 flex items-center space-x-3 bg-brand-card-light rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-primary/10">
                            <ChartBarIcon className="w-8 h-8 text-brand-primary" />
                            <div>
                                <p className="font-bold text-left">View Analytics</p>
                                <p className="text-xs text-gray-500 text-left">Check performance and insights.</p>
                            </div>
                        </button>
                    </div>
                </SectionCard>
            )}

            {!userEnterprise && (
                <SectionCard title="Join an Enterprise">
                    <form onSubmit={handleJoinRequest} className="flex gap-2">
                        <input type="text" value={associationCode} onChange={e => setAssociationCode(e.target.value)} placeholder="Enter Association Code" className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none" />
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary">Send Request</button>
                    </form>
                </SectionCard>
            )}
            
            {isEnterpriseAdmin && userEnterprise && (
                <EnterpriseAdminPanel 
                    currentUser={user}
                    enterprise={userEnterprise}
                    allUsers={allUsers}
                    onInviteUser={adminProps.onInviteUserToEnterprise}
                    onUpdateUser={adminProps.onUpdateEnterpriseUser}
                    onRemoveUser={adminProps.onRemoveUserFromEnterprise}
                    onApprove={adminProps.onApproveJoinRequest}
                    onDeny={adminProps.onDenyJoinRequest}
                />
            )}
            
            {isInterestsModalOpen && (
                <InterestsEditModal
                    initialInterests={user.interests || { valueChain: [], geography: [], industry: [], offering: [] }}
                    onClose={() => setIsInterestsModalOpen(false)}
                    onSave={handleSaveInterests}
                />
            )}
            
            {isAddFundsModalOpen && (
                <AddFundsModal
                    onClose={() => setIsAddFundsModalOpen(false)}
                    onAddFunds={handleAddFunds}
                />
            )}

        </div>
    );
};