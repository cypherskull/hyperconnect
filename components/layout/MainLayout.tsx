

import React from 'react';
import { Header } from './Header';
import { User, Persona, FeatureKey, Seller, Post, ScopeFilter } from '../../types';
import { FilterRibbon } from './FilterRibbon';

interface MainLayoutProps {
  children: React.ReactNode;
  currentUser: User;
  currentPersona: Persona;
  personas: Persona[];
  onChangePersona: (persona: Persona) => void;
  onNavigate: (view: 'feed' | 'userProfile' | 'favourites' | 'inbox' | 'admin' | 'network') => void;
  onApplyFilters: (filters: { valueChain: string[]; geography: string[]; industry: string[]; offering?: string[]; }, scope: ScopeFilter) => void;
  onLogout: () => void;
  userInterests?: {
    valueChain: string[];
    geography: string[];
    industry: string[];
    offering?: string[];
  };
  scopeFilter: ScopeFilter;
  accessConfig: Record<FeatureKey, boolean>;
  allSellers: Seller[];
  allPosts: Post[];
}

export const MainLayout: React.FC<MainLayoutProps> = (props) => {
  const {
    children,
    currentUser,
    currentPersona,
    personas,
    onChangePersona,
    onNavigate,
    onApplyFilters,
    onLogout,
    userInterests,
    scopeFilter,
    accessConfig,
    allSellers,
    allPosts,
  } = props;

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        user={currentUser}
        currentPersona={currentPersona}
        personas={personas}
        onChangePersona={onChangePersona}
        onNavigate={onNavigate}
        onLogout={onLogout}
        accessConfig={accessConfig}
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 mb-20">
        {children}
      </main>
      <FilterRibbon 
        onApplyFilters={onApplyFilters as any} 
        initialFilters={userInterests} 
        initialScope={scopeFilter}
        allSellers={allSellers}
        allPosts={allPosts}
        currentUser={currentUser}
      />
    </div>
  );
};