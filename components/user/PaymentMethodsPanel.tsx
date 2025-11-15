import React, { useState } from 'react';
import { User, PaymentMethod } from '../../types';
import { CreditCardIcon, BanknotesIcon, PlusIcon, TrashIcon, CheckCircleIcon } from '../common/Icons';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';

interface PaymentMethodsPanelProps {
    user: User;
    onAddMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    onRemoveMethod: (methodId: string) => void;
    onSetPreferred: (methodId: string) => void;
}

export const PaymentMethodsPanel: React.FC<PaymentMethodsPanelProps> = ({ user, onAddMethod, onRemoveMethod, onSetPreferred }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const getIcon = (type: 'Card' | 'Netbanking') => {
        if (type === 'Card') return <CreditCardIcon className="w-6 h-6 text-blue-500" />;
        return <BanknotesIcon className="w-6 h-6 text-green-500" />;
    };

    return (
        <>
            <div className="space-y-4">
                {(user.paymentMethods && user.paymentMethods.length > 0) ? (
                    user.paymentMethods.map(method => (
                        <div key={method.id} className="flex items-center justify-between p-3 bg-brand-card-light rounded-lg border border-brand-border/50">
                            <div className="flex items-center gap-4">
                                {getIcon(method.type)}
                                <div>
                                    <p className="font-semibold">{method.provider} <span className="text-gray-500 font-normal">ending in {method.last4}</span></p>
                                    {user.preferredPaymentMethodId === method.id && (
                                        <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                                            <CheckCircleIcon className="w-4 h-4" />
                                            <span>Preferred</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {user.preferredPaymentMethodId !== method.id && (
                                    <button onClick={() => onSetPreferred(method.id)} className="text-xs font-semibold text-brand-primary hover:underline">Set as Preferred</button>
                                )}
                                <button onClick={() => onRemoveMethod(method.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-full">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-center text-gray-500 py-4">No payment methods saved.</p>
                )}
                <button onClick={() => setIsAddModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-brand-border rounded-lg text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-brand-primary">
                    <PlusIcon className="w-5 h-5" />
                    Add New Payment Method
                </button>
            </div>
            {isAddModalOpen && (
                <AddPaymentMethodModal
                    onClose={() => setIsAddModalOpen(false)}
                    onAddMethod={(method) => {
                        onAddMethod(method);
                        setIsAddModalOpen(false);
                    }}
                />
            )}
        </>
    );
};