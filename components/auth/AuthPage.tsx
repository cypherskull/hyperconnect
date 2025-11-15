import React, { useState } from 'react';
import { User, Enterprise } from '../../types';
import { GoogleIcon, LinkedInIcon, EnvelopeIcon } from '../common/Icons';
import { SignUpForm } from './SignUpForm';
import { CreateEnterpriseForm } from './CreateEnterpriseForm'; // New import
import { Input, Button } from '../common/Forms';

interface AuthPageProps {
  onLoginAttempt: (email: string, password: string) => boolean;
  onSignUp: (user: Omit<User, 'id'>) => void;
  onEnterpriseCreate: (enterprise: Omit<Enterprise, 'id' | 'associationCode' | 'members'>, admin: Omit<User, 'id'>) => void;
  enterprises: Enterprise[];
}

// Individual Flow Components
const SignInForm: React.FC<{ onLoginAttempt: AuthPageProps['onLoginAttempt'] }> = ({ onLoginAttempt }) => {
    const [email, setEmail] = useState('admin@hyperconnect.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = onLoginAttempt(email, password);
        if (!success) {
            setError('Invalid email or password.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Business Email" required className="p-3" />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="p-3" />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full py-3">Sign In</Button>
        </form>
    );
};

const SignUpOptions: React.FC<{ 
    onSelectProvider: (provider: 'Google' | 'LinkedIn' | 'Email') => void,
    onSelectEnterprise: () => void,
}> = ({ onSelectProvider, onSelectEnterprise }) => (
    <div className="space-y-4">
        <p className="text-center text-sm text-gray-500">Choose a method to create your account.</p>
        <button onClick={() => onSelectProvider('Google')} className="w-full flex items-center justify-center gap-3 py-3 border border-brand-border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <GoogleIcon className="w-6 h-6" />
            <span className="font-semibold">Sign Up with Google</span>
        </button>
        <button onClick={() => onSelectProvider('LinkedIn')} className="w-full flex items-center justify-center gap-3 py-3 border border-brand-border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <LinkedInIcon className="w-6 h-6 text-[#0A66C2]" />
            <span className="font-semibold">Sign Up with LinkedIn</span>
        </button>
        <button onClick={() => onSelectProvider('Email')} className="w-full flex items-center justify-center gap-3 py-3 border border-brand-border rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <EnvelopeIcon className="w-6 h-6" />
            <span className="font-semibold">Sign Up with Email</span>
        </button>
        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-brand-border"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-400">OR</span>
            <div className="flex-grow border-t border-brand-border"></div>
        </div>
         <Button onClick={onSelectEnterprise} variant="secondary" className="w-full py-3">
            Create an Enterprise Account
        </Button>
    </div>
);

export const AuthPage: React.FC<AuthPageProps> = (props) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [subview, setSubview] = useState<'options' | 'userForm' | 'enterpriseForm'>('options');
  const [signupProvider, setSignupProvider] = useState<'Google' | 'LinkedIn' | 'Email' | null>(null);

  if (mode === 'signup') {
    if (subview === 'userForm' && signupProvider) {
      return <SignUpForm 
                provider={signupProvider} 
                onSignUpComplete={props.onSignUp} 
                onBack={() => setSubview('options')} 
             />
    }
    if (subview === 'enterpriseForm') {
      return <CreateEnterpriseForm 
                onEnterpriseCreate={props.onEnterpriseCreate} 
                onBack={() => { setMode('signup'); setSubview('options'); }}
             />
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark p-4">
      <div className="w-full max-w-lg bg-brand-card rounded-xl shadow-lg border border-brand-border">
        <div className="p-8 pb-4">
          <h1 className="text-3xl font-bold text-center spectrum-text">Welcome to Hyper Connect</h1>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Connect. Collaborate. Create. New possibilities@Scale
          </p>
        </div>
        
        <div className="flex border-b border-brand-border">
            <button onClick={() => setMode('signin')} className={`w-full py-3 font-semibold border-b-2 transition-colors ${mode === 'signin' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-primary'}`}>Sign In</button>
            <button onClick={() => { setMode('signup'); setSubview('options'); }} className={`w-full py-3 font-semibold border-b-2 transition-colors ${mode === 'signup' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-brand-primary'}`}>Sign Up</button>
        </div>

        <div className="p-8">
            {mode === 'signin' 
                ? <SignInForm onLoginAttempt={props.onLoginAttempt} />
                : <SignUpOptions 
                    onSelectProvider={(provider) => {
                        setSignupProvider(provider);
                        setSubview('userForm');
                    }}
                    onSelectEnterprise={() => setSubview('enterpriseForm')}
                  />
            }
        </div>
      </div>
    </div>
  );
};