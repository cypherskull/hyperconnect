import React, { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { AccessConfig, Enterprise, InboxItem, MonetizationRule, Persona, Post, Seller, Solution, Testimonial, User, MeetingDetails, SharedContent, View, ScopeFilter, DueDiligenceData } from '../types';
import * as api from '../services/apiService';
import * as auth from '../services/authService';

// Define the shape of the context state
interface AppContextState {
    // UI State
    view: View;
    viewHistory: View[];
    scopeFilter: ScopeFilter;
    interestFilters: User['interests'];
    
    // Modal State
    selectedSeller: { seller: Seller, solutionId?: string, tab?: any, postId?: string } | null;
    isPostCreatorOpen: boolean;
    postCreatorData: { solution: Solution, shareItem?: any, postToEdit?: Post | null } | null;
    commentingPost: Post | null;
    testimonialModalSeller: Seller | null;
    messagingSeller: Seller | null;
    meetingSeller: Seller | null;
    respondingToItem: InboxItem | null;

    // Data State
    allUsers: User[];
    allSellers: Seller[];
    allPosts: Post[];
    allEnterprises: Enterprise[];
    inboxItems: InboxItem[];
    accessConfig: AccessConfig;
    monetizationRules: MonetizationRule[];

    // Auth State
    token: string | null;
    currentUser: User | null;
    impersonatingUser: User | null;
    currentPersona: Persona;
    isLoading: boolean;
    
    // State Setters for UI/Modals
    setView: React.Dispatch<React.SetStateAction<View>>;
    setViewHistory: React.Dispatch<React.SetStateAction<View[]>>;
    setSelectedSeller: React.Dispatch<React.SetStateAction<{ seller: Seller, solutionId?: string, tab?: any, postId?: string } | null>>;
    setIsPostCreatorOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setPostCreatorData: React.Dispatch<React.SetStateAction<{ solution: Solution, shareItem?: any, postToEdit?: Post | null } | null>>;
    setCommentingPost: React.Dispatch<React.SetStateAction<Post | null>>;
    setTestimonialModalSeller: React.Dispatch<React.SetStateAction<Seller | null>>;
    setMessagingSeller: React.Dispatch<React.SetStateAction<Seller | null>>;
    setMeetingSeller: React.Dispatch<React.SetStateAction<Seller | null>>;
    setRespondingToItem: React.Dispatch<React.SetStateAction<InboxItem | null>>;
    setImpersonatingUser: React.Dispatch<React.SetStateAction<User | null>>;
    setAccessConfig: React.Dispatch<React.SetStateAction<AccessConfig>>;
}

// Create the context with a default value
export const AppContext = createContext<any>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // --- STATE MANAGEMENT --- //
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allSellers, setAllSellers] = useState<Seller[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allEnterprises, setAllEnterprises] = useState<Enterprise[]>([]);
    const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
    const [accessConfig, setAccessConfig] = useState<AccessConfig>({} as AccessConfig);
    const [monetizationRules, setMonetizationRules] = useState<MonetizationRule[]>([]);
  
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(auth.getToken());
    const [currentPersona, setCurrentPersona] = useState<Persona>('Browser');
    const [isLoading, setIsLoading] = useState(true);
    
    // UI State
    const [view, setView] = useState<View>('feed');
    const [viewHistory, setViewHistory] = useState<View[]>([]);
    const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
    const [interestFilters, setInterestFilters] = useState<User['interests']>({ valueChain: [], geography: [], industry: [], offering: [] });
  
    // Modal State
    const [selectedSeller, setSelectedSeller] = useState<{ seller: Seller, solutionId?: string, tab?: any, postId?: string } | null>(null);
    const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);
    const [isPostCreatorOpen, setIsPostCreatorOpen] = useState(false);
    const [postCreatorData, setPostCreatorData] = useState<{ solution: Solution, shareItem?: any, postToEdit?: Post | null } | null>(null);
    const [commentingPost, setCommentingPost] = useState<Post | null>(null);
    const [testimonialModalSeller, setTestimonialModalSeller] = useState<Seller | null>(null);
    const [messagingSeller, setMessagingSeller] = useState<Seller | null>(null);
    const [meetingSeller, setMeetingSeller] = useState<Seller | null>(null);
    const [respondingToItem, setRespondingToItem] = useState<InboxItem | null>(null);

    // --- INITIALIZATION --- //
    useEffect(() => {
        const initializeApp = async () => {
            const existingToken = auth.getToken();
            if (existingToken) {
                try {
                    const user = await auth.validateToken(existingToken);
                    setCurrentUser(user);
                    setCurrentPersona(user.persona);
                    setToken(existingToken);

                    const data = await api.getInitialData(existingToken);
                    setAllUsers(data.users);
                    setAllSellers(data.sellers);
                    setAllPosts(data.posts);
                    setAllEnterprises(data.enterprises);
                    setInboxItems(data.inboxItems);
                    setAccessConfig(data.accessConfig);
                    setMonetizationRules(data.monetizationRules);

                } catch (error) {
                    console.error("Token validation failed:", error);
                    auth.removeToken();
                    setToken(null);
                    setCurrentUser(null);
                }
            }
            setIsLoading(false);
        };
        initializeApp();
    }, []);
    
    const effectiveUser = impersonatingUser || currentUser;

    // --- DERIVED STATE --- // (Remains largely the same)
    const personasForCurrentUser: Persona[] = useMemo(() => {
      if (!effectiveUser) return ['Browser'];
      const available: Persona[] = [effectiveUser.persona];
      if (effectiveUser.persona !== 'Buyer' && !available.includes('Buyer')) available.push('Buyer');
      if (effectiveUser.persona !== 'Investor' && !available.includes('Investor')) available.push('Investor');
      return available;
    }, [effectiveUser]);
    
    const filteredSellers = useMemo(() => {
        // This filtering is UI-level and can remain on the client
        let sellers = allSellers;
        if (scopeFilter === 'connections' && effectiveUser?.connections) {
          const sellerConnections = effectiveUser.connections.filter(c => c.startsWith('seller-'));
          sellers = sellers.filter(s => sellerConnections.includes(s.id));
        } else if (scopeFilter === 'favourites' && effectiveUser?.followedSellers) {
          sellers = sellers.filter(s => effectiveUser.followedSellers?.includes(s.id));
        } else if (scopeFilter === 'invstScan') {
            sellers = sellers.filter(s => s.isOpenForInvestment);
        }
        if (interestFilters && (interestFilters.valueChain.length > 0 || interestFilters.geography.length > 0 || interestFilters.industry.length > 0 || (interestFilters.offering && interestFilters.offering.length > 0))) {
            sellers = sellers.filter(seller => 
                seller.solutions.some(solution => 
                    (interestFilters.valueChain.length === 0 || interestFilters.valueChain.some(vc => solution.valueChain.includes(vc))) &&
                    (interestFilters.geography.length === 0 || interestFilters.geography.some(g => solution.geography.includes(g))) &&
                    (interestFilters.industry.length === 0 || interestFilters.industry.some(s => solution.industry.includes(s))) &&
                    (!interestFilters.offering || interestFilters.offering.length === 0 || interestFilters.offering.includes(solution.offering))
                )
            );
        }
        return sellers;
    }, [allSellers, effectiveUser, scopeFilter, interestFilters]);
      
    const filteredPosts = useMemo(() => {
        const sellerIds = new Set(filteredSellers.map(s => s.id));
        return allPosts.filter(p => sellerIds.has(p.sellerId));
    }, [allPosts, filteredSellers]);
      
    const userAccessConfig = useMemo(() => {
          return accessConfig[currentPersona] || {};
    }, [accessConfig, currentPersona]);
      
    const currentUserSellerProfile = useMemo(() => {
        if (effectiveUser?.persona === 'Seller') {
            return allSellers.find(s => s.companyName === effectiveUser.company);
        }
        return null;
    }, [effectiveUser, allSellers]);

    // --- ASYNC EVENT HANDLERS (API-driven) --- //
    
    const handleLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
        try {
            const { token: newToken, user } = await auth.login(email, password);
            auth.setToken(newToken);
            setToken(newToken);
            setCurrentUser(user);
            setCurrentPersona(user.persona);

            // Fetch initial data after login
            const data = await api.getInitialData(newToken);
            setAllUsers(data.users);
            setAllSellers(data.sellers);
            setAllPosts(data.posts);
            setAllEnterprises(data.enterprises);
            setInboxItems(data.inboxItems);
            setAccessConfig(data.accessConfig);
            setMonetizationRules(data.monetizationRules);

            setView('feed');
            setViewHistory([]);
            return true;
        } catch (error) {
            console.error("Login failed:", error);
            return false;
        }
    }, []);

    const handleSignUp = useCallback(async (newUserData: Omit<User, 'id' | 'referralCode'> & { referralCode?: string }) => {
        try {
            const { token: newToken, user } = await auth.signUp(newUserData);
            auth.setToken(newToken);
            setToken(newToken);
            setCurrentUser(user);
            setCurrentPersona(user.persona);
            // Re-fetch all data to include the new user and potential referral updates
            const data = await api.getInitialData(newToken);
            setAllUsers(data.users);
            setAllSellers(data.sellers);
            // ... etc
        } catch (error) {
            alert("Sign up failed. Please try again.");
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await auth.logout();
        setCurrentUser(null);
        setImpersonatingUser(null);
        setToken(null);
        setCurrentPersona('Browser');
        setView('feed');
        setViewHistory([]);
    }, []);
    
    const handleLikePost = useCallback(async (postId: string) => {
        if (!token) return;
        
        // Optimistic update
        setAllPosts(posts => posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
        
        try {
            const impersonatedId = impersonatingUser ? impersonatingUser.id : undefined;
            const updatedPost = await api.toggleLikePost(token, postId, impersonatedId);
            // Sync with server state
            setAllPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
        } catch (error) {
            console.error("Failed to like post:", error);
            // Revert optimistic update
            setAllPosts(posts => posts.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes + 1 : p.likes - 1 } : p));
        }
    }, [token, impersonatingUser]);

    const handleBookmarkPostToggle = useCallback(async (postId: string) => {
        if (!token) return;
    
        // Optimistic update
        setAllPosts(posts => posts.map(p => 
            p.id === postId 
                ? { ...p, isBookmarked: !p.isBookmarked, bookmarks: p.isBookmarked ? p.bookmarks - 1 : p.bookmarks + 1 } 
                : p
        ));
    
        try {
            const impersonatedId = impersonatingUser ? impersonatingUser.id : undefined;
            const updatedPost = await api.toggleBookmarkPost(token, postId, impersonatedId); 
            // Sync with server state
            setAllPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
        } catch (error) {
            console.error("Failed to bookmark post:", error);
            // Revert optimistic update
            setAllPosts(posts => posts.map(p => 
                p.id === postId 
                    ? { ...p, isBookmarked: !p.isBookmarked, bookmarks: p.isBookmarked ? p.bookmarks + 1 : p.bookmarks - 1 } 
                    : p
            ));
        }
    }, [token, impersonatingUser]);

    const handleFollowSeller = useCallback(async (sellerId: string) => {
        if (!token || !effectiveUser) return;
    
        const originalUser = { ...effectiveUser };
        const originalSeller = allSellers.find(s => s.id === sellerId);
        if (!originalSeller) return;
    
        const isCurrentlyFollowed = (originalUser.followedSellers || []).includes(sellerId);
    
        // Optimistic update
        const updatedUser: User = {
            ...originalUser,
            followedSellers: isCurrentlyFollowed
                ? (originalUser.followedSellers || []).filter(id => id !== sellerId)
                : [...(originalUser.followedSellers || []), sellerId]
        };
        const updatedSeller: Seller = {
            ...originalSeller,
            followers: isCurrentlyFollowed ? originalSeller.followers - 1 : originalSeller.followers + 1
        };
        
        if (impersonatingUser) {
            setImpersonatingUser(updatedUser);
        } else {
            setCurrentUser(updatedUser);
        }
        setAllSellers(sellers => sellers.map(s => s.id === sellerId ? updatedSeller : s));
    
        try {
            const impersonatedId = impersonatingUser ? impersonatingUser.id : undefined;
            const { user: serverUser, seller: serverSeller } = await api.toggleFollowSeller(token, sellerId, impersonatedId);
            
            // Sync with server state
            if (impersonatingUser) {
                setImpersonatingUser(serverUser);
            } else {
                setCurrentUser(serverUser);
            }
            setAllUsers(users => users.map(u => u.id === serverUser.id ? serverUser : u));
            setAllSellers(sellers => sellers.map(s => s.id === serverSeller.id ? serverSeller : s));
    
        } catch (error) {
            console.error("Failed to follow seller:", error);
            // Revert optimistic update
            if (impersonatingUser) {
                setImpersonatingUser(originalUser);
            } else {
                setCurrentUser(originalUser);
            }
            setAllSellers(sellers => sellers.map(s => s.id === sellerId ? originalSeller : s));
        }
    }, [token, effectiveUser, allSellers, impersonatingUser]);

    const handleSavePost = useCallback(async (postData: Omit<Post, 'id' | 'sellerId' | 'likes' | 'bookmarks' | 'comments' | 'isLiked' | 'isBookmarked' | 'timestamp'> & { id?: string }) => {
        if (!token) return;
        try {
            const impersonatedId = impersonatingUser ? impersonatingUser.id : undefined;
            const savedPost = await api.savePost(token, postData, impersonatedId);
            if (postData.id) { // Editing
                setAllPosts(allPosts.map(p => p.id === savedPost.id ? savedPost : p));
            } else { // Creating
                setAllPosts([savedPost, ...allPosts]);
            }
            setIsPostCreatorOpen(false);
            setPostCreatorData(null);
        } catch (error) {
            console.error("Failed to save post:", error);
            alert("Could not save the post.");
        }
    }, [token, allPosts, impersonatingUser]);
    
    const handleUpdateUser = useCallback(async (updatedUser: User) => {
        if (!token) return;
        try {
            const savedUser = await api.updateUser(token, updatedUser);
            setAllUsers(allUsers.map(u => u.id === savedUser.id ? savedUser : u));
            if (currentUser?.id === savedUser.id) setCurrentUser(savedUser);
            if (impersonatingUser?.id === savedUser.id) setImpersonatingUser(savedUser);
        } catch (error) {
             console.error("Failed to update user:", error);
             alert("Could not update user profile.");
        }
    }, [token, allUsers, currentUser, impersonatingUser]);

    const handleUpdateSellerTier = useCallback(async (sellerId: string, tier: 'Free' | 'Basic' | 'Premium') => {
        if (!token || currentUser?.persona !== 'Admin') return;
        try {
            const updatedSeller = await api.updateSellerTier(token, sellerId, tier);
            setAllSellers(sellers => sellers.map(s => s.id === sellerId ? updatedSeller : s));
        } catch (error) {
            console.error("Failed to update seller tier:", error);
            alert("Could not update seller tier.");
        }
    }, [token, currentUser]);
    
    const handleToggleInvestmentStatus = useCallback(async (sellerId: string, status: boolean) => {
        if (!token) return;

        const originalSeller = allSellers.find(s => s.id === sellerId);
        if (!originalSeller) return;

        // Optimistic update
        const updatedSeller = { ...originalSeller, isOpenForInvestment: status };
        setAllSellers(sellers => sellers.map(s => s.id === sellerId ? updatedSeller : s));
        if (selectedSeller?.seller.id === sellerId) {
            setSelectedSeller(prev => prev ? ({ ...prev, seller: updatedSeller }) : null);
        }

        try {
            const returnedSeller = await api.toggleInvestmentStatus(token, sellerId, status);
            // Sync with server state
            setAllSellers(sellers => sellers.map(s => s.id === sellerId ? returnedSeller : s));
            if (selectedSeller?.seller.id === sellerId) {
                setSelectedSeller(prev => prev ? ({ ...prev, seller: returnedSeller }) : null);
            }
        } catch (error) {
            console.error("Failed to toggle investment status:", error);
            // Revert optimistic update
            setAllSellers(sellers => sellers.map(s => s.id === sellerId ? originalSeller : s));
            if (selectedSeller?.seller.id === sellerId) {
                setSelectedSeller(prev => prev ? ({ ...prev, seller: originalSeller }) : null);
            }
            alert("Failed to update investment status.");
        }
    }, [token, allSellers, selectedSeller]);

    const handleUpdateDueDiligence = useCallback(async (sellerId: string, data: DueDiligenceData) => {
        if (!token) return;

        const originalSeller = allSellers.find(s => s.id === sellerId);
        if (!originalSeller) return;

        // Optimistic Update
        const updatedSeller = { ...originalSeller, dueDiligence: data };
        setAllSellers(sellers => sellers.map(s => s.id === sellerId ? updatedSeller : s));
        if (selectedSeller?.seller.id === sellerId) {
            setSelectedSeller(prev => prev ? ({ ...prev, seller: updatedSeller }) : null);
        }

        try {
            const returnedSeller = await api.updateDueDiligence(token, sellerId, data);
            // Sync
             setAllSellers(sellers => sellers.map(s => s.id === sellerId ? returnedSeller : s));
            if (selectedSeller?.seller.id === sellerId) {
                setSelectedSeller(prev => prev ? ({ ...prev, seller: returnedSeller }) : null);
            }
        } catch (error) {
            console.error("Failed to update due diligence data:", error);
            // Revert
            setAllSellers(sellers => sellers.map(s => s.id === sellerId ? originalSeller : s));
             if (selectedSeller?.seller.id === sellerId) {
                setSelectedSeller(prev => prev ? ({ ...prev, seller: originalSeller }) : null);
            }
            alert("Failed to save investment data.");
        }

    }, [token, allSellers, selectedSeller]);


    // --- UI HANDLERS (can remain mostly client-side) --- //
    const handleBack = useCallback(() => {
        if (viewHistory.length > 0) {
            const previousView = viewHistory[viewHistory.length - 1];
            setViewHistory(prev => prev.slice(0, -1));
            setView(previousView);
            setSelectedSeller(null);
        } else {
            setView('feed');
        }
    }, [viewHistory]);

    const handleNavigate = useCallback((newView: View) => {
        if (newView === 'sellerProfile' && !selectedSeller) return;
        if (['feed', 'favourites', 'inbox', 'network'].includes(newView)) {
            setViewHistory([]);
        } else if (view !== newView) {
            setViewHistory(prev => [...prev, view]);
        }
        setView(newView);
        if (newView !== 'sellerProfile') {
            setSelectedSeller(null);
        }
    }, [view, selectedSeller]);

    const handleSelectSeller = useCallback((seller: Seller, options?: { solutionId?: string; tab?: any; postId?: string }) => {
        setViewHistory(prev => [...prev, view]);
        setSelectedSeller({ seller, ...options });
        setView('sellerProfile');
    }, [view]);

     const handleChangePersona = useCallback((persona: Persona) => {
        setCurrentPersona(persona);
        setView('feed');
        setViewHistory([]);
    }, []);
  
    const handleApplyFilters = useCallback((filters: User['interests'], scope: ScopeFilter) => {
      setInterestFilters(filters || { valueChain: [], geography: [], industry: [], offering: [] });
      setScopeFilter(scope);
    }, []);

    const handleOpenPostCreator = useCallback((solution: Solution, shareItem?: any, postToEdit?: Post | null) => {
        setPostCreatorData({ solution, shareItem, postToEdit });
        setIsPostCreatorOpen(true);
    }, []);

    // --- CONTEXT VALUE --- //
    const contextValue = {
        state: {
            view, viewHistory, scopeFilter, interestFilters, selectedSeller, isPostCreatorOpen, postCreatorData, commentingPost,
            testimonialModalSeller, messagingSeller, meetingSeller, respondingToItem,
            allUsers, allSellers, allPosts, allEnterprises, inboxItems, accessConfig, monetizationRules,
            token, currentUser, impersonatingUser, currentPersona, isLoading,
            // Pass setters for modals/UI
            setView, setViewHistory, setSelectedSeller, setIsPostCreatorOpen, setPostCreatorData, setCommentingPost,
            setTestimonialModalSeller, setMessagingSeller, setMeetingSeller, setRespondingToItem, setImpersonatingUser, setAccessConfig
        },
        effectiveUser,
        personasForCurrentUser,
        filteredSellers,
        filteredPosts,
        userAccessConfig,
        currentUserSellerProfile,
        handleLogin,
        handleSignUp,
        handleLogout,
        handleBack,
        handleNavigate,
        handleSelectSeller,
        handleChangePersona,
        handleApplyFilters,
        handleLikePost,
        handleBookmarkPostToggle,
        handleFollowSeller,
        handleSavePost,
        handleUpdateUser,
        handleUpdateSellerTier,
        handleToggleInvestmentStatus,
        handleUpdateDueDiligence,
        // Pass-through for simpler handlers or ones to be implemented
        handleSendConnectionRequest: () => {},
        handleConnectionRequestResponse: () => {},
        handleLikeSellerToggle: () => {},
        handleOpenPostCreator,
        handleAddComment: () => {},
        handleAddTestimonial: () => {},
        handleSendResponse: () => {},
        handleRequestToJoinEnterprise: () => {},
        handleClaimMonthlyEarnings: () => {},
        handleUpdateMonetizationRule: () => {},
        handleAddMonetizationRule: () => {},
        handleDeleteMonetizationRule: () => {},
        handleAddPaymentMethod: () => {},
        handleRemovePaymentMethod: () => {},
        handleSetPreferredPaymentMethod: () => {},
        handleCreateEnterprise: auth.createEnterpriseAndAdmin,
        handleAcceptInvite: () => {},
        handleDeclineInvite: () => {},
        handleInviteToEnterprise: () => {},
        handleUpdateEnterpriseUser: () => {},
        handleRemoveFromEnterprise: () => {},
        handleApproveJoin: () => {},
        handleDenyJoin: () => {},
        handlePayDues: () => {},
        handleSimulateBilling: () => {},
        handleUpdateSolutions: () => {},
        handleActivateSolution: () => {},
        handleSetSolutionHold: () => {},
        handleCancelSolutionHold: () => {},
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-brand-light dark:bg-brand-dark"><p>Loading...</p></div>;
    }

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};