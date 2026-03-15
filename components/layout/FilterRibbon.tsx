import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CloseIcon, StarIcon, GlobeAltIcon, BuildingOfficeIcon, CubeIcon, MagnifyingGlassCircleIcon, UsersIcon, EyeIcon, LinkIcon } from '../common/Icons';
import { User, Seller, Post, Solution, ScopeFilter } from '../../types';
import { useAppContext } from '../../hooks/useAuth';

interface FilterRibbonProps {
  onApplyFilters: (filters: { valueChain: string[]; geography: string[]; industry: string[]; offering: string[]; }, scope: ScopeFilter) => void;
  initialFilters?: User['interests'];
  initialScope: ScopeFilter;
  allSellers: Seller[];
  allPosts: Post[];
  currentUser: User;
}

type ActiveFilter = 'scope' | 'valueChain' | 'geography' | 'industry' | 'offering' | null;

const filterMetadata = {
    scope: { icon: StarIcon, label: 'My View', fullLabel: 'My View'},
    valueChain: { icon: LinkIcon, label: 'ValueChain', fullLabel: 'Value Chain' },
    geography: { icon: GlobeAltIcon, label: 'Geo', fullLabel: 'Geography' },
    industry: { icon: BuildingOfficeIcon, label: 'Industry', fullLabel: 'Industry' },
    offering: { icon: CubeIcon, label: 'Offering', fullLabel: 'Offering' }
};

const scopeIcons = {
    all: StarIcon,
    connections: UsersIcon,
    favourites: EyeIcon,
    invstScan: MagnifyingGlassCircleIcon,
};


export const FilterRibbon: React.FC<FilterRibbonProps> = (props) => {
  const { state } = useAppContext();
  const platformSettings = state.platformSettings;

  const { onApplyFilters, initialFilters, initialScope, allSellers, allPosts, currentUser } = props;
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
  
  const [selectedVC, setSelectedVC] = useState<string[]>(initialFilters?.valueChain || []);
  const [selectedGeo, setSelectedGeo] = useState<string[]>(initialFilters?.geography || []);
  const [selectedIndustry, setSelectedIndustry] = useState<string[]>(initialFilters?.industry || []);
  const [selectedOffering, setSelectedOffering] = useState<string[]>(initialFilters?.offering || []);
  const [selectedScope, setSelectedScope] = useState<ScopeFilter>(initialScope);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedVC(initialFilters?.valueChain || []);
    setSelectedGeo(initialFilters?.geography || []);
    setSelectedIndustry(initialFilters?.industry || []);
    setSelectedOffering(initialFilters?.offering || []);
    setSelectedScope(initialScope);
  }, [initialFilters, initialScope]);
  
  const filterConfig = useMemo(() => ({
    scope: { label: 'View'},
    valueChain: { options: platformSettings?.valueChains || [], selected: selectedVC, setter: setSelectedVC, label: 'Value Chain' },
    geography: { options: platformSettings?.geographies || [], selected: selectedGeo, setter: setSelectedGeo, label: 'Geography' },
    industry: { options: platformSettings?.industries || [], selected: selectedIndustry, setter: setSelectedIndustry, label: 'Industry' },
    offering: { options: platformSettings?.offerings || [], selected: selectedOffering, setter: setSelectedOffering, label: 'Offering' },
  }), [selectedVC, selectedGeo, selectedIndustry, selectedOffering, platformSettings]);

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };
  
  const handleApply = () => {
    onApplyFilters({
      valueChain: selectedVC,
      geography: selectedGeo,
      industry: selectedIndustry,
      offering: selectedOffering
    }, selectedScope);
    setActiveFilter(null);
  };

  const handleReset = () => {
    setSelectedVC([]);
    setSelectedGeo([]);
    setSelectedIndustry([]);
    setSelectedOffering([]);
    setSelectedScope('all');
    onApplyFilters({ valueChain: [], geography: [], industry: [], offering: [] }, 'all');
    setActiveFilter(null);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('#filter-buttons-container')) {
            setActiveFilter(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const contentCount = useMemo(() => {
     let scopedSellers: Seller[] = allSellers;
      if (selectedScope === 'connections' && currentUser.connections) {
        const sellerConnections = currentUser.connections.filter(c => c.startsWith('seller-'));
        scopedSellers = allSellers.filter(s => sellerConnections.includes(s.id));
      } else if (selectedScope === 'favourites' && currentUser.followedSellers) {
        scopedSellers = allSellers.filter(s => currentUser.followedSellers?.includes(s.id));
      } else if (selectedScope === 'invstScan') {
        scopedSellers = allSellers.filter(s => s.isOpenForInvestment);
      }

      const hasInterestFilters = selectedVC.length > 0 || selectedGeo.length > 0 || selectedIndustry.length > 0 || selectedOffering.length > 0;
      if (!hasInterestFilters) {
        const scopedSellerIds = new Set(scopedSellers.map(s => s.id));
        const scopedPosts = allPosts.filter(p => scopedSellerIds.has(p.sellerId));
        return { sellers: scopedSellers.length, posts: scopedPosts.length };
      }

      const solutionMatchesFilters = (solution: Solution) => {
        const vcMatch = selectedVC.length === 0 || selectedVC.some(vc => solution.valueChain.includes(vc));
        const geoMatch = selectedGeo.length === 0 || selectedGeo.some(g => solution.geography.includes(g));
        const industryMatch = selectedIndustry.length === 0 || selectedIndustry.some(s => solution.industry.includes(s));
        const offeringMatch = selectedOffering.length === 0 || selectedOffering.includes(solution.offering);
        return vcMatch && geoMatch && industryMatch && offeringMatch;
      };

      const filteredSellers = scopedSellers.filter(seller => seller.solutions.some(solutionMatchesFilters));
      const filteredSellerIds = new Set(filteredSellers.map(s => s.id));
      const filteredPosts = allPosts.filter(post => filteredSellerIds.has(post.sellerId));

      return { sellers: filteredSellers.length, posts: filteredPosts.length };
  }, [selectedVC, selectedGeo, selectedIndustry, selectedOffering, selectedScope, allSellers, allPosts, currentUser]);

  const totalFilters = selectedVC.length + selectedGeo.length + selectedIndustry.length + selectedOffering.length + (selectedScope !== 'all' ? 1 : 0);
  const popoverTitle = activeFilter ? filterMetadata[activeFilter as keyof typeof filterMetadata].fullLabel : '';

  const enabledScopes = useMemo(() => {
      return platformSettings?.scopes.filter(s => s.isEnabled) || [];
  }, [platformSettings]);

  const activeScopeInfo = useMemo(() => {
      return platformSettings?.scopes.find(s => s.id === selectedScope) || { label: 'View', id: 'all' };
  }, [platformSettings, selectedScope]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30">
      {activeFilter && (
        <div ref={popoverRef} className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg max-h-[50vh] flex flex-col bg-brand-card border border-brand-border rounded-lg shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-brand-border">
            <h3 className="font-semibold text-lg">{popoverTitle}</h3>
            <button onClick={() => setActiveFilter(null)} className="p-1 rounded-full hover:bg-gray-500/20"><CloseIcon className="w-5 h-5"/></button>
          </div>
          <div className="overflow-y-auto p-4">
            {activeFilter === 'scope' ? (
              <div className="space-y-2">
                  {enabledScopes.map(scope => {
                     if (scope.id === 'invstScan' && currentUser.persona !== 'Investor') return null;
                     const Icon = scopeIcons[scope.id as ScopeFilter];
                     return (
                        <label key={scope.id} className="flex items-start p-3 hover:bg-gray-500/10 cursor-pointer rounded-md">
                            <input type="radio" name="scope" value={scope.id} checked={selectedScope === scope.id} onChange={() => setSelectedScope(scope.id as ScopeFilter)} className="h-4 w-4 mt-1 border-gray-500 bg-transparent text-brand-primary focus:ring-brand-primary" />
                            <div className="ml-3">
                                <span className="font-semibold">{scope.label}</span>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{scope.description}</p>
                            </div>
                        </label>
                     )
                  })}
              </div>
            ) : (
                (filterConfig[activeFilter as 'valueChain' | 'geography' | 'industry' | 'offering'].options || []).map(option => (
                <label key={option} className="flex items-center py-2 hover:bg-gray-500/10 cursor-pointer rounded-md px-2">
                    <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-500 bg-transparent text-brand-primary focus:ring-brand-primary"
                    checked={(filterConfig[activeFilter as 'valueChain' | 'geography' | 'industry' | 'offering'].selected).includes(option)}
                    onChange={() => handleToggle(filterConfig[activeFilter as 'valueChain' | 'geography' | 'industry' | 'offering'].setter, option)}
                    />
                    <span className="ml-3">{option}</span>
                </label>
                ))
            )}
          </div>
           <div className="p-4 border-t border-brand-border flex justify-between items-center">
             <div className="text-sm">
                <p><span className="font-bold">{contentCount.sellers}</span> Businesses</p>
                <p><span className="font-bold">{contentCount.posts}</span> Updates</p>
             </div>
             <div className="flex space-x-2">
                <button onClick={handleReset} className="py-2 px-4 rounded-md text-center bg-gray-500/20 font-semibold hover:bg-gray-500/40 transition-colors">
                Reset
                </button>
                <button onClick={handleApply} className="py-2 px-4 rounded-md text-center bg-brand-primary text-white font-semibold hover:bg-brand-primary/80 transition-colors">
                Apply
                </button>
             </div>
          </div>
        </div>
      )}

      <div id="filter-buttons-container" className="h-16 bg-brand-card border-t border-brand-border flex justify-center items-center space-x-1 sm:space-x-2 px-1">
        {(Object.keys(filterMetadata) as (keyof typeof filterMetadata)[]).map(key => {
            const { icon: Icon, label, fullLabel } = filterMetadata[key];

            const isScope = key === 'scope';
            const selectionCount = isScope 
                ? (selectedScope !== 'all' ? 1 : 0) 
                : (filterConfig[key as 'valueChain' | 'geography' | 'industry' | 'offering'].selected.length);
            
            const ScopeIcon = isScope ? (scopeIcons[selectedScope] || Icon) : Icon;
            
            return (
                <button 
                    key={key} 
                    onClick={() => setActiveFilter(key)} 
                    className={`relative flex flex-col items-center justify-center p-1 rounded-lg font-medium transition-colors text-center h-full min-w-[48px] sm:min-w-[70px] ${activeFilter === key ? 'bg-brand-primary/10 text-brand-primary' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                    aria-label={`Filter by ${fullLabel}`}
                >
                    <ScopeIcon className="w-5 h-5 mb-0.5" />
                    <span className="text-[10px] leading-tight font-semibold">{isScope ? activeScopeInfo.label : label}</span>
                    {selectionCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-secondary text-white text-[10px] font-bold border border-brand-card">
                            {selectionCount}
                        </span>
                    )}
                </button>
            )
        })}
        {totalFilters > 0 && (
            <button onClick={handleReset} className="flex flex-col items-center justify-center h-full min-w-[48px] sm:min-w-[70px] p-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20" aria-label="Reset all filters">
                <CloseIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-tight font-semibold">Reset</span>
            </button>
        )}
      </div>
    </div>
  );
};