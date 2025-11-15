import React from 'react';
import { User } from '../../types';
import { BillingIcon } from '../common/Icons';

interface SubscriptionPanelProps {
    user: User;
    onPayDues: () => void;
    onSimulateBilling: () => void;
}

const isDateInPast = (dateString?: string) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
}

export const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ user, onPayDues, onSimulateBilling }) => {

    const dueTransactions = user.transactionHistory?.filter(t => t.status === 'due') || [];
    const totalDue = dueTransactions.reduce((sum, t) => sum + t.amount, 0);
    const isTrialActive = user.trialEndsAt && !isDateInPast(user.trialEndsAt);

    return (
        <div className="space-y-6">
            {user.isDormant && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <h3 className="font-bold text-red-800 dark:text-red-200">Account Dormant</h3>
                    <p className="text-sm text-red-700 dark:text-red-300">Your account is dormant due to overdue payments. Please settle your dues to reactivate your account.</p>
                </div>
            )}
            
            <div className="p-4 bg-brand-card-light rounded-lg border border-brand-border flex justify-between items-center">
                <div>
                    <p className="text-sm text-gray-500">Account Status</p>
                    {isTrialActive ? (
                        <p className="text-lg font-bold text-green-600">Free Trial Active</p>
                    ) : (
                        <p className="text-lg font-bold text-blue-600">Active Subscription</p>
                    )}
                </div>
                {isTrialActive && (
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Trial Ends On</p>
                        <p className="font-semibold">{new Date(user.trialEndsAt!).toLocaleDateString()}</p>
                    </div>
                )}
            </div>

            {user.persona === 'Seller' && user.messageCredits && (
                <div className="p-4 bg-brand-card-light rounded-lg border border-brand-border">
                    <p className="text-sm text-gray-500">Actionable Message Credits</p>
                    <p className="text-2xl font-bold">{user.messageCredits.remaining} / 10</p>
                    <p className="text-xs text-gray-400">Resets on {new Date(user.messageCredits.resetsAt).toLocaleDateString()}</p>
                </div>
            )}

            <div>
                <h3 className="font-semibold mb-2">Outstanding Payments</h3>
                <div className="space-y-2">
                    {dueTransactions.length > 0 ? (
                        dueTransactions.map(txn => (
                            <div key={txn.id} className="flex justify-between items-center text-sm p-3 rounded bg-yellow-50 dark:bg-yellow-900/20">
                                <div>
                                    <p>{txn.description}</p>
                                    <p className="text-xs text-gray-400">{new Date(txn.date).toLocaleString()}</p>
                                </div>
                                <p className="font-semibold text-red-600">
                                    ₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No outstanding payments. You're all set!</p>
                    )}
                </div>
                {totalDue < 0 && (
                    <div className="flex justify-between items-center mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <span className="font-bold">Total Due: ₹{Math.abs(totalDue).toLocaleString('en-IN')}</span>
                        <button onClick={onPayDues} className="px-4 py-2 text-sm font-semibold bg-brand-secondary text-white rounded-md hover:bg-brand-secondary/80">
                            Pay All Dues
                        </button>
                    </div>
                )}
            </div>
            
            {user.persona === 'Seller' && (
                <div>
                    <button onClick={onSimulateBilling} className="w-full text-center text-xs py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                        (Dev) Simulate Monthly Billing Cycle
                    </button>
                </div>
            )}
        </div>
    );
};
