import React, { useState } from 'react';
import { User, Enterprise, EntityType, Persona } from '../../types';
import { ArrowLeftIcon } from '../common/Icons';
import { Input, Select, Button } from '../common/Forms';

interface CreateEnterpriseFormProps {
  onEnterpriseCreate: (enterprise: Omit<Enterprise, 'id' | 'associationCode' | 'members'>, admin: Omit<User, 'id'>) => void;
  onBack: () => void;
}

const entityTypes: EntityType[] = ['Listed Entity', 'Public Entity', 'Private entity', 'Partnership', 'LLP', 'Sole Proprietorship'];
const enterprisePersonas: ('Seller' | 'Buyer' | 'Investor')[] = ['Seller', 'Buyer', 'Investor'];

export const CreateEnterpriseForm: React.FC<CreateEnterpriseFormProps> = ({ onEnterpriseCreate, onBack }) => {
    const [enterpriseData, setEnterpriseData] = useState({
        companyName: '',
        address: '',
        entityType: 'Private entity' as EntityType,
        gstNumber: '',
        persona: 'Seller' as 'Seller' | 'Buyer' | 'Investor',
    });
    const [adminData, setAdminData] = useState({
        name: '',
        designation: '',
        businessEmail: '',
        password: ''
    });

    const handleEnterpriseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEnterpriseData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const enterprisePayload: Omit<Enterprise, 'id' | 'associationCode' | 'members'> = {
            ...enterpriseData,
            subscriptionPlan: 'Enterprise',
            // Dummy location for now
            location: { lat: 0, lng: 0, city: 'Unknown', country: 'Unknown' },
        };
        
        const adminPayload: Omit<User, 'id'> = {
            name: adminData.name,
            avatarUrl: `https://i.pravatar.cc/150?u=${adminData.name.replace(/\s/g, '')}`,
            persona: enterpriseData.persona as Persona,
            designation: adminData.designation,
            company: enterpriseData.companyName,
            role: 'Admin',
            personalEmail: adminData.businessEmail, // Use business email as personal for this flow
            isPersonalEmailVerified: false,
            businessEmail: adminData.businessEmail,
            isBusinessEmailVerified: true, // Assume verified upon creation
            password: adminData.password,
            wantsEmailNotifications: true,
            subscriptionPlan: 'Enterprise',
            referralCode: `HYPER-${adminData.name.split(' ')[0].toUpperCase()}${Date.now() % 1000}`,
            referrals: [],
            monthlyReferralEarnings: [],
        };

        onEnterpriseCreate(enterprisePayload, adminPayload);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark p-4">
            <div className="w-full max-w-3xl bg-brand-card rounded-xl shadow-lg border border-brand-border">
                <div className="p-6 border-b border-brand-border relative">
                    <button onClick={onBack} className="absolute top-1/2 -translate-y-1/2 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-bold text-center">Create New Enterprise</h1>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                    {/* Enterprise Details */}
                    <fieldset className="space-y-4 p-4 border border-brand-border rounded-lg">
                        <legend className="text-lg font-semibold px-2">Enterprise Details</legend>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Enterprise Name*</label>
                                <Input type="text" name="companyName" value={enterpriseData.companyName} onChange={handleEnterpriseChange} required />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Enterprise Persona*</label>
                                <Select name="persona" value={enterpriseData.persona} onChange={handleEnterpriseChange} required>
                                    {enterprisePersonas.map(p => <option key={p} value={p}>{p}</option>)}
                                </Select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Entity Type*</label>
                                <Select name="entityType" value={enterpriseData.entityType} onChange={handleEnterpriseChange} required>
                                    {entityTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">GST Number*</label>
                                <Input type="text" name="gstNumber" value={enterpriseData.gstNumber} onChange={handleEnterpriseChange} required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Full Address*</label>
                            <Input type="text" name="address" value={enterpriseData.address} onChange={handleEnterpriseChange} required />
                        </div>
                    </fieldset>

                    {/* Admin Details */}
                     <fieldset className="space-y-4 p-4 border border-brand-border rounded-lg">
                        <legend className="text-lg font-semibold px-2">Administrator Details</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <label className="block text-sm font-medium mb-1">Your Full Name*</label>
                                <Input type="text" name="name" value={adminData.name} onChange={handleAdminChange} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Designation*</label>
                                <Input type="text" name="designation" value={adminData.designation} onChange={handleAdminChange} required placeholder="e.g., CEO, Founder" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Business Email*</label>
                                <Input type="email" name="businessEmail" value={adminData.businessEmail} onChange={handleAdminChange} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password*</label>
                                <Input type="password" name="password" value={adminData.password} onChange={handleAdminChange} required />
                            </div>
                        </div>
                    </fieldset>

                    <div className="pt-6 border-t border-brand-border">
                        <Button type="submit" variant="secondary" className="w-full py-3">
                            Create Enterprise & Sign Up
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};