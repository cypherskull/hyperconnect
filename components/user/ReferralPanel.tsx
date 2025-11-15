import React, { useState } from 'react';
import { User } from '../../types';
import { ClipboardDocumentListIcon, CheckCircleIcon } from '../common/Icons';

interface ReferralPanelProps {
    user: User;
    allUsers: User[];
    onClaimMonthlyEarnings: () => void;
}

export const ReferralPanel: React.FC<ReferralPanelProps> = ({ user, onClaimMonthlyEarnings }) => {
    const [copied, setCopied] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    const copyToClipboard = () => {
        navigator.clipboard.writeText(user.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        alert(`In a real app, an invitation would be sent to ${inviteEmail} with your referral code: ${user.referralCode}.`);
        setInviteEmail('');
    };
    
    const totalEarnings = (user.transactionHistory || [])
        .filter(t => t.description.toLowerCase().includes('referral'))
        .reduce((sum, t) => sum + t.amount, 0);

    const totalMonthlyCredit = (user.monthlyReferralEarnings || []).reduce((sum, earning) => sum + earning.monthlyCredit, 0);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-semibold mb-2">Your Referral Code</h3>
                <div className="flex gap-2 p-3 bg-brand-card-light rounded-lg border border-brand-border">
                    <span className="font-mono text-brand-primary font-bold flex-grow break-all">{user.referralCode}</span>
                    <button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 flex-shrink-0">
                        {copied ? <CheckCircleIcon className="w-4 h-4 text-green-500"/> : <ClipboardDocumentListIcon className="w-4 h-4"/>}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>

            <div>
                 <h3 className="font-semibold mb-2">Invite by Email</h3>
                 <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-2">
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter email to invite" className="w-full p-2 border border-brand-border rounded-md bg-brand-card-light focus:ring-2 focus:ring-brand-primary outline-none" required/>
                    <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-md hover:bg-brand-secondary">Invite</button>
                </form>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-xs text-green-800 dark:text-green-300">Total Referrals</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-200">{user.referrals?.length || 0}</p>
                </div>
                 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-300">Total Earnings</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-200">₹{totalEarnings.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {user.monthlyReferralEarnings && user.monthlyReferralEarnings.length > 0 && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg space-y-3">
                     <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Monthly Earnings from Sellers</h3>
                     <div className="space-y-2">
                        {user.monthlyReferralEarnings.map(earning => (
                            <div key={earning.sellerId} className="flex justify-between items-center text-sm">
                                <span className="text-yellow-700 dark:text-yellow-300">{earning.sellerName}</span>
                                <span className="font-bold text-yellow-800 dark:text-yellow-100">+ ₹{earning.monthlyCredit.toLocaleString('en-IN')}/mo</span>
                            </div>
                        ))}
                     </div>
                     <div className="pt-2 border-t border-yellow-300/50 flex justify-between items-center">
                         <span className="font-semibold">Available to Claim: ₹{totalMonthlyCredit.toLocaleString('en-IN')}</span>
                         <button onClick={onClaimMonthlyEarnings} className="px-3 py-1 text-sm font-bold bg-yellow-400 text-yellow-900 rounded-md hover:bg-yellow-500">Claim Now</button>
                     </div>
                </div>
            )}
            
            <div>
                <h3 className="font-semibold mb-2">Your Referred Users</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(user.referrals && user.referrals.length > 0) ? (
                        user.referrals.map(ref => (
                             <div key={ref.userId} className="flex justify-between items-center text-sm p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                                <div>
                                    <p className="font-semibold">{ref.name} <span className="text-xs font-normal text-gray-500">({ref.persona})</span></p>
                                    <p className="text-xs text-gray-400">Joined on {new Date(ref.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-semibold text-green-500">
                                    +₹{ref.initialCredit.toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-center text-gray-500 py-4">You haven't referred anyone yet.</p>
                    )}
                </div>
            </div>

        </div>
    );
};