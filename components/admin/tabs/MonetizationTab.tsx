import React, { useState } from 'react';
import { MonetizationRule, Persona } from '../../../types';
import { CheckCircleIcon, CloseIcon, PencilIcon, PlusIcon, TrashIcon } from '../../common/Icons';
import { Input, Select, Button } from '../../common/Forms';

interface RuleEditorModalProps {
    rule: Partial<MonetizationRule> | null;
    onClose: () => void;
    onSave: (rule: Omit<MonetizationRule, 'id'> | MonetizationRule) => void;
}

const RuleEditorModal: React.FC<RuleEditorModalProps> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState<Omit<MonetizationRule, 'id'>>({
        persona: rule?.persona || 'All',
        chargeType: rule?.chargeType || 'Joining Fee',
        amount: rule?.amount || 0,
        currency: rule?.currency || 'INR',
        country: rule?.country || 'All',
        frequency: rule?.frequency || 'one-time',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rule?.id) {
            onSave({ ...formData, id: rule.id });
        } else {
            onSave(formData);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-brand-border">
                    <h2 className="text-xl font-bold">{rule?.id ? 'Edit Rule' : 'Add New Rule'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Persona</label>
                            <Select name="persona" value={formData.persona} onChange={handleChange} className="mt-1">
                                <option value="All">All</option>
                                {(['Admin', 'Buyer', 'Seller', 'Investor', 'Collaborator', 'Browser'] as Persona[]).map(p => <option key={p} value={p}>{p}</option>)}
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Charge Type</label>
                            <Select name="chargeType" value={formData.chargeType} onChange={handleChange} className="mt-1">
                                <option>Joining Fee</option>
                                <option>Monthly Subscription</option>
                                <option>Transaction Fee</option>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-sm font-medium">Frequency</label>
                            <Select name="frequency" value={formData.frequency} onChange={handleChange} className="mt-1">
                                <option value="one-time">One-time</option>
                                <option value="monthly">Monthly</option>
                                <option value="per_transaction">Per Transaction</option>
                            </Select>
                        </div>
                         <div>
                            <label className="text-sm font-medium">Country</label>
                            <Input name="country" value={formData.country} onChange={handleChange} placeholder="e.g., IN, US, All" className="mt-1"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium">Amount</label>
                            <Input type="number" name="amount" value={formData.amount} onChange={handleChange} className="mt-1"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Currency</label>
                            <Select name="currency" value={formData.currency} onChange={handleChange} className="mt-1">
                                <option>INR</option>
                                <option>USD</option>
                                <option>EUR</option>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" className="px-6">Save Rule</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};


interface MonetizationTabProps {
    rules: MonetizationRule[];
    onAddRule: (rule: Omit<MonetizationRule, 'id'>) => void;
    onUpdateRule: (rule: MonetizationRule) => void;
    onDeleteRule: (ruleId: string) => void;
}


const MonetizationTab: React.FC<MonetizationTabProps> = ({ rules, onAddRule, onUpdateRule, onDeleteRule }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRule, setEditingRule] = useState<MonetizationRule | null>(null);

    const handleOpenModal = (rule: MonetizationRule | null = null) => {
        setEditingRule(rule);
        setIsModalOpen(true);
    };

    const handleSaveRule = (rule: Omit<MonetizationRule, 'id'> | MonetizationRule) => {
        if ('id' in rule) {
            onUpdateRule(rule);
        } else {
            onAddRule(rule);
        }
        setIsModalOpen(false);
    };

    return (
         <div>
            <div className="p-4 border-b border-brand-border flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold">Monetization Rules</h2>
                    <p className="text-sm text-gray-500">Define charges for different user actions and types.</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <PlusIcon className="w-4 h-4" /> Add New Rule
                </Button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left bg-brand-card-light">
                        <tr>
                            {['Persona', 'Charge Type', 'Amount', 'Country', 'Frequency', 'Actions'].map(h => <th key={h} className="p-3 font-semibold">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {rules.map(rule => (
                            <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-3 font-medium">{rule.persona}</td>
                                <td className="p-3">{rule.chargeType}</td>
                                <td className="p-3 font-mono">{rule.currency} {rule.amount.toLocaleString()}</td>
                                <td className="p-3">{rule.country}</td>
                                <td className="p-3 capitalize">{rule.frequency.replace('_', ' ')}</td>
                                <td className="p-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => handleOpenModal(rule)} className="p-1 text-gray-400 hover:text-brand-primary"><PencilIcon className="w-4 h-4" /></button>
                                        <button onClick={() => onDeleteRule(rule.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isModalOpen && <RuleEditorModal rule={editingRule} onClose={() => setIsModalOpen(false)} onSave={handleSaveRule} />}
        </div>
    );
};

export default MonetizationTab;