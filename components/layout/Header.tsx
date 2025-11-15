import React, { useState, useContext } from 'react';
import { User, Persona, FeatureKey } from '../../types';
import { UserIcon, ChevronDownIcon, HomeIcon, EnvelopeIcon, StarIcon, SunIcon, MoonIcon, ShieldCheckIcon, UsersIcon } from '../common/Icons';
import { ThemeContext } from '../../context/ThemeContext';

interface HeaderProps {
  user: User;
  currentPersona: Persona;
  personas: Persona[];
  onChangePersona: (persona: Persona) => void;
  onNavigate: (view: 'feed' | 'userProfile' | 'favourites' | 'inbox' | 'admin' | 'network') => void;
  onLogout: () => void;
  accessConfig: Record<FeatureKey, boolean>;
}

export const Header: React.FC<HeaderProps> = ({ user, currentPersona, personas, onChangePersona, onNavigate, onLogout, accessConfig }) => {
  const [isPersonaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const isEnterpriseUser = !!user.enterpriseId;

  return (
    <header className="bg-brand-card shadow-md sticky top-0 z-40 border-b border-brand-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
             <button onClick={() => onNavigate('feed')} className="flex flex-col items-start">
                <span className="text-xl sm:text-2xl font-bold tracking-tight spectrum-text">Hyper Connect</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 hidden sm:block">Connect. Collaborate. Create. New possibilities@Scale</span>
            </button>
          </div>

          <div className="flex items-center justify-end sm:space-x-1">
            {accessConfig.canViewFeed && (
              <button onClick={() => onNavigate('feed')} className="flex items-center justify-center p-2 sm:flex-col sm:w-16 sm:h-16 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-brand-primary transition-colors rounded-lg" aria-label="Home">
                  <HomeIcon className="w-6 h-6" />
                  <span className="text-[10px] font-semibold mt-1 hidden sm:block">Home</span>
              </button>
            )}
            {accessConfig.canUseFavourites && (
              <button onClick={() => onNavigate('favourites')} className="flex items-center justify-center p-2 sm:flex-col sm:w-16 sm:h-16 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-brand-primary transition-colors rounded-lg" aria-label="Favourites">
                  <StarIcon className="w-6 h-6" />
                  <span className="text-[10px] font-semibold mt-1 hidden sm:block">Favourites</span>
              </button>
            )}
            {accessConfig.canUseInbox && (
              <button onClick={() => onNavigate('inbox')} className="flex items-center justify-center p-2 sm:flex-col sm:w-16 sm:h-16 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-brand-primary transition-colors rounded-lg" aria-label="Inbox">
                  <EnvelopeIcon className="w-6 h-6" />
                  <span className="text-[10px] font-semibold mt-1 hidden sm:block">Inbox</span>
              </button>
            )}
             <button onClick={() => onNavigate('network')} className="flex items-center justify-center p-2 sm:flex-col sm:w-16 sm:h-16 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-brand-primary transition-colors rounded-lg" aria-label="My Network">
                <UsersIcon className="w-6 h-6" />
                <span className="text-[10px] font-semibold mt-1 hidden sm:block">Network</span>
            </button>
             <button onClick={toggleTheme} className="flex items-center justify-center p-2 sm:flex-col sm:w-16 sm:h-16 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-brand-primary transition-colors rounded-lg" aria-label="Toggle Theme">
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                <span className="text-[10px] font-semibold mt-1 hidden sm:block">Theme</span>
            </button>

            {/* Persona Display/Switcher */}
            <div className="relative">
              <div
                onClick={() => !isEnterpriseUser && setPersonaDropdownOpen(!isPersonaDropdownOpen)}
                className={`flex items-center space-x-1 p-1 sm:p-2 rounded-md ${!isEnterpriseUser ? 'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer' : ''}`}
              >
                <span className="text-sm font-medium hidden md:inline">{currentPersona}</span>
                 <UserIcon className="w-5 h-5 md:hidden"/>
                {!isEnterpriseUser && <ChevronDownIcon className={`w-4 h-4 text-gray-600 dark:text-gray-300 transition-transform ${isPersonaDropdownOpen ? 'rotate-180' : ''}`} />}
              </div>
              {!isEnterpriseUser && isPersonaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-brand-card rounded-md shadow-lg py-1 z-50 border border-brand-border">
                  {personas.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        onChangePersona(p);
                        setPersonaDropdownOpen(false);
                      }}
                      className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      Switch to {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative">
              <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-2 cursor-pointer p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full" />
              </button>

               {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-brand-card rounded-md shadow-lg py-1 z-50 border border-brand-border">
                  <div className="px-4 py-2 border-b border-brand-border">
                     <p className="font-semibold text-sm">{user.name}</p>
                     <p className="text-xs text-gray-500 dark:text-gray-400">{user.persona}</p>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('userProfile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    My Profile
                  </button>
                  {user.persona === 'Admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <ShieldCheckIcon className="w-4 h-4 text-brand-secondary" />
                      <span>Platform Admin</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onLogout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left block px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};