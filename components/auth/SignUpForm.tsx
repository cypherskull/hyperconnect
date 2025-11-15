import React, { useState, useEffect } from 'react';
import { User, Persona } from '../../types';
import { ArrowLeftIcon } from '../common/Icons';
import { OtpModal } from './OtpModal';
import { MultiSelectDropdown } from '../common/MultiSelectDropdown';
import { mockFilterOptions } from '../../services/api';
import { Input, Button } from '../common/Forms';

interface SignUpFormProps {
  provider: 'Google' | 'LinkedIn' | 'Email';
  onSignUpComplete: (user: Omit<User, 'id' | 'referralCode'> & { referralCode?: string }) => void;
  onBack: () => void;
}

const personas: Persona[] = ['Buyer', 'Seller', 'Investor', 'Collaborator', 'Browser'];
const OTP_REQUIRED_PERSONAS: Persona[] = ['Buyer', 'Seller', 'Investor'];

export const SignUpForm: React.FC<SignUpFormProps> = ({ provider, onSignUpComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    businessEmail: '',
    password: '',
    company: '',
    designation: '',
    roleInCompany: '',
    phone: '',
    persona: '' as Persona | '',
    preferredContactEmail: 'business' as 'personal' | 'business',
    referralCode: '',
  });

  const [interests, setInterests] = useState({
    valueChain: [] as string[],
    geography: [] as string[],
    industry: [] as string[],
    offering: [] as string[],
  });

  const [isBusinessEmailVerified, setIsBusinessEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Simulate fetching data from OAuth provider
    if (provider === 'Google') {
      setFormData(prev => ({ ...prev, name: 'Alex Doe (Google)', personalEmail: 'alex.doe@gmail.com' }));
    } else if (provider === 'LinkedIn') {
      setFormData(prev => ({ ...prev, name: 'Taylor Smith (LinkedIn)', personalEmail: 'taylor.smith@outlook.com', company: 'Tech Solutions Inc.', designation: 'Project Manager' }));
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'businessEmail') {
        setIsBusinessEmailVerified(false); // Reset verification status on change
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const isOtpRequired = OTP_REQUIRED_PERSONAS.includes(formData.persona as Persona);
  const isFormValid =
    formData.name &&
    formData.personalEmail &&
    formData.businessEmail &&
    (provider !== 'Email' || formData.password) &&
    formData.company &&
    formData.designation &&
    formData.persona &&
    (!isOtpRequired || isBusinessEmailVerified) &&
    interests.valueChain.length > 0 &&
    interests.geography.length > 0 &&
    interests.industry.length > 0 &&
    interests.offering.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
        alert("Please complete all required fields and verify your email if necessary.");
        return;
    };

    const { referralCode, ...restOfData } = formData;

    const newUser: Omit<User, 'id' | 'referralCode'> & { referralCode?: string } = {
      ...restOfData,
      referralCode: referralCode || undefined,
      avatarUrl: `https://i.pravatar.cc/150?u=${formData.name.replace(/\s/g, '')}`,
      persona: formData.persona as Persona,
      role: 'Member', // All new signups are members by default
      roleInCompany: formData.roleInCompany,
      isPersonalEmailVerified: true, // Assume personal is verified by OAuth/Initial signup
      isBusinessEmailVerified: isBusinessEmailVerified,
      phone: formData.phone || undefined,
      interests: interests,
      wantsEmailNotifications: true,
      subscriptionPlan: 'Free',
    };
    onSignUpComplete(newUser);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark p-4">
        <div className="w-full max-w-3xl bg-brand-card rounded-xl shadow-lg border border-brand-border">
          <div className="p-6 border-b border-brand-border relative">
             <button onClick={onBack} className="absolute top-1/2 -translate-y-1/2 left-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-center">Complete Your Profile</h1>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">Sign up via {provider}</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name*</label>
                    <Input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Personal Email*</label>
                    <Input type="email" name="personalEmail" value={formData.personalEmail} readOnly={provider !== 'Email'} className="bg-gray-200 dark:bg-gray-700" />
                </div>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium mb-1">Organization*</label>
                    <Input type="text" name="company" value={formData.company} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Designation*</label>
                    <Input type="text" name="designation" value={formData.designation} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Role*</label>
                    <Input type="text" name="roleInCompany" value={formData.roleInCompany} onChange={handleChange} required placeholder="e.g., Team Lead, Contributor" />
                </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Mobile No. (Optional)</label>
                    <Input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Business Email*{isOtpRequired ? " (Verification Required)" : ""}</label>
                <div className="flex gap-2">
                    <Input type="email" name="businessEmail" value={formData.businessEmail} onChange={handleChange} required />
                    {isOtpRequired && (
                        <Button type="button" onClick={() => setIsVerifying(true)} disabled={isBusinessEmailVerified || !formData.businessEmail} variant={isBusinessEmailVerified ? 'secondary' : 'ghost'} className={isBusinessEmailVerified ? 'bg-green-500 hover:bg-green-600' : ''}>
                            {isBusinessEmailVerified ? 'Verified' : 'Verify'}
                        </Button>
                    )}
                </div>
            </div>
            
            {provider === 'Email' && (
                 <div>
                    <label className="block text-sm font-medium mb-1">Password*</label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} required />
                </div>
            )}
            
             <div>
                <label className="block text-sm font-medium mb-2">Preferred Contact Email*</label>
                <div className="flex gap-4">
                    <label className="flex items-center"><input type="radio" name="preferredContactEmail" value="business" checked={formData.preferredContactEmail === 'business'} onChange={handleChange} className="mr-2"/> Business</label>
                    <label className="flex items-center"><input type="radio" name="preferredContactEmail" value="personal" checked={formData.preferredContactEmail === 'personal'} onChange={handleChange} className="mr-2"/> Personal</label>
                </div>
            </div>


            <div>
                 <label className="block text-sm font-medium mb-2">Primary Persona*</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {personas.map(p => (
                        <button key={p} type="button" onClick={() => { setFormData(prev => ({...prev, persona: p})); setIsBusinessEmailVerified(false); }} className={`p-4 border rounded-lg text-center transition-all duration-200 ${formData.persona === p ? 'bg-brand-primary text-white border-brand-primary scale-105 shadow-lg' : 'hover:border-brand-primary hover:shadow-md'}`}>
                            <span className="font-semibold">{p}</span>
                        </button>
                    ))}
                 </div>
            </div>

             <div className="space-y-4 pt-4 border-t border-brand-border">
                 <label className="block text-sm font-medium">Your Interests (Select up to 5 from each)*</label>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MultiSelectDropdown label="Value Chain" options={mockFilterOptions.valueChains} selectedItems={interests.valueChain} onChange={items => setInterests(prev => ({ ...prev, valueChain: items }))} maxSelection={5} />
                    <MultiSelectDropdown label="Geography" options={mockFilterOptions.geographies} selectedItems={interests.geography} onChange={items => setInterests(prev => ({ ...prev, geography: items }))} maxSelection={5} />
                    <MultiSelectDropdown label="Industry" options={mockFilterOptions.industries} selectedItems={interests.industry} onChange={items => setInterests(prev => ({ ...prev, industry: items }))} maxSelection={5} />
                    <MultiSelectDropdown label="Offering" options={mockFilterOptions.offerings} selectedItems={interests.offering} onChange={items => setInterests(prev => ({ ...prev, offering: items }))} maxSelection={5} />
                 </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Referral Code (Optional)</label>
                <Input type="text" name="referralCode" value={formData.referralCode} onChange={handleChange} />
            </div>
            
            <div className="pt-6 border-t border-brand-border">
                <Button type="submit" disabled={!isFormValid} className="w-full py-3">
                    Create Account
                </Button>
            </div>
          </form>
        </div>
      </div>
      {isVerifying && (
        <OtpModal
          emailToVerify={formData.businessEmail}
          onClose={() => setIsVerifying(false)}
          onVerifySuccess={() => {
            setIsBusinessEmailVerified(true);
            setIsVerifying(false);
          }}
        />
      )}
    </>
  );
};