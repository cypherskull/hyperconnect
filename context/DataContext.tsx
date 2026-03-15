import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User, Seller, Post, Enterprise, InboxItem, MonetizationRule, Testimonial, SharedContent, MeetingDetails, Solution, DueDiligenceData, PaymentMethod } from '../types';
import * as api from '../services/apiService';
import { AuthContext } from './AuthContext';
import * as auth from '../services/authService';
import { useToast } from './ToastContext';

interface DataContextState {
    allUsers: User[];
    allSellers: Seller[];
    allPosts: Post[];
    allEnterprises: Enterprise[];
    inboxItems: InboxItem[];
    monetizationRules: MonetizationRule[];
}

interface DataContextActions {
    handleLikePost: (postId: string) => Promise<void>;
    handleBookmarkPostToggle: (postId: string) => Promise<void>;
    handleAddComment: (postId: string, commentText: string) => Promise<void>;
    handleSendConnectionRequest: (entityId: string) => Promise<void>;
    handleConnectionRequestResponse: (itemId: string, response: 'Accepted' | 'Declined') => Promise<void>;
    handleFollowSeller: (sellerId: string) => Promise<void>;
    handleSavePost: (postData: any) => Promise<void>;
    handleAddTestimonial: (sellerId: string, solutionId: string, testimonial: Testimonial) => Promise<void>;
    handleUpdateSellerTier: (sellerId: string, tier: 'Free' | 'Basic' | 'Premium') => Promise<void>;
    handleLikeSellerToggle: (sellerId: string) => Promise<void>;
    handleToggleInvestmentStatus: (sellerId: string, status: boolean) => Promise<void>;
    handleUpdateDueDiligence: (sellerId: string, data: DueDiligenceData) => Promise<void>;
    handleUpdateSolutions: (sellerId: string, solutions: Solution[]) => Promise<void>;
}

interface DataContextValue {
    state: DataContextState;
    actions: DataContextActions;
    refreshData: () => Promise<void>;
}

export const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allSellers, setAllSellers] = useState<Seller[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [allEnterprises, setAllEnterprises] = useState<Enterprise[]>([]);
    const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
    const [monetizationRules, setMonetizationRules] = useState<MonetizationRule[]>([]);

    const authContext = useContext(AuthContext);
    // Read token from AuthContext state so this is reactive (re-runs when user logs in)
    const token = authContext?.token || auth.getToken() || '';
    const { showToast } = useToast();

    const effectiveUser = authContext?.effectiveUser;
    const impersonatingUser = authContext?.state.impersonatingUser;

    const refreshData = useCallback(async () => {
        const currentToken = auth.getToken(); // Always read fresh in case of login race
        if (currentToken) {
            try {
                const data = await api.getInitialData(currentToken);
                setAllUsers(data.users);
                setAllSellers(data.sellers);
                setAllPosts(data.posts);
                setAllEnterprises(data.enterprises);
                setInboxItems(data.inboxItems);
                setMonetizationRules(data.monetizationRules);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        if (token) {
            refreshData();
        }
    }, [token, refreshData]);

    const handleLikePost = useCallback(async (postId: string) => {
        if (!effectiveUser) return;
        setAllPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const isLiked = !p.isLiked;
                return { ...p, isLiked, likes: isLiked ? p.likes + 1 : p.likes - 1 };
            }
            return p;
        }));
        try {
            await api.toggleLikePost(token, postId, impersonatingUser?.id);
        } catch (e) {
            console.error(e);
            refreshData();
        }
    }, [effectiveUser, token, impersonatingUser, refreshData]);

    const handleBookmarkPostToggle = useCallback(async (postId: string) => {
        if (!effectiveUser) return;
        setAllPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const isBookmarked = !p.isBookmarked;
                return { ...p, isBookmarked, bookmarks: isBookmarked ? p.bookmarks + 1 : p.bookmarks - 1 };
            }
            return p;
        }));
        try {
            await api.toggleBookmarkPost(token, postId, impersonatingUser?.id);
        } catch (e) {
            console.error(e);
            refreshData();
        }
    }, [effectiveUser, token, impersonatingUser, refreshData]);

    const handleAddComment = useCallback(async (postId: string, commentText: string) => {
        if (!effectiveUser) return;
        try {
            const newComment = await api.addComment(token, postId, commentText, impersonatingUser?.id);
            setAllPosts(prev => prev.map(p => {
                if (p.id === postId) return { ...p, comments: [...p.comments, newComment] };
                return p;
            }));
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed to Post', 'Your comment could not be posted. Please try again.');
        }
    }, [effectiveUser, token, impersonatingUser]);

    const handleSendConnectionRequest = useCallback(async (entityId: string) => {
        if (!effectiveUser) return;
        const exists = inboxItems.find(i =>
            i.category === 'ConnectionRequest' &&
            i.fromUser.id === effectiveUser.id &&
            (i.relatedSellerId === entityId || i.relatedUserId === entityId)
        );
        if (exists) return;

        try {
            const newItem = await api.sendConnectionRequest(token, entityId);
            setInboxItems(prev => [newItem, ...prev]);
            showToast('success', 'Connection Sent!', 'Your connection request has been sent successfully.');
        } catch (e: any) {
            console.error(e);
            // Ignore "already exists" errors from the server silently as the UI should handle this
            if (e?.status === 409 || (typeof e?.message === 'string' && e.message.toLowerCase().includes('already'))) {
                return;
            }
            showToast('error', 'Request Failed', 'Failed to send connection request. Please try again.');
        }
    }, [effectiveUser, inboxItems, token]);

    const handleConnectionRequestResponse = useCallback(async (itemId: string, response: 'Accepted' | 'Declined') => {
        try {
            await api.respondToConnectionRequest(token, itemId, response, impersonatingUser?.id);
            setInboxItems(prev => prev.map(item =>
                item.id === itemId ? { ...item, status: 'Actioned', connectionRequestDetails: response } : item
            ));
            refreshData(); // To update network state instantly
        } catch (e) {
            console.error(e);
            showToast('error', 'Action Failed', 'Failed to respond to connection request. Please try again.');
        }
    }, [token, impersonatingUser, refreshData]);

    const handleFollowSeller = useCallback(async (sellerId: string) => {
        if (!effectiveUser) return;
        try {
            const { user, seller } = await api.toggleFollowSeller(token, sellerId, impersonatingUser?.id);
            authContext?.actions.updateUserState(user);
            setAllSellers(prev => prev.map(s => s.id === seller.id ? seller : s));
        } catch (e) {
            console.error(e);
        }
    }, [effectiveUser, token, impersonatingUser, authContext]);

    const handleLikeSellerToggle = useCallback(async (sellerId: string) => {
        if (!effectiveUser) return;
        // Optimistic update: immediately flip the likedSellers list on currentUser
        const isCurrentlyLiked = effectiveUser.likedSellers?.includes(sellerId);
        const updatedLikedSellers = isCurrentlyLiked
            ? (effectiveUser.likedSellers || []).filter(id => id !== sellerId)
            : [...(effectiveUser.likedSellers || []), sellerId];
        const optimisticUser = { ...effectiveUser, likedSellers: updatedLikedSellers };
        // Update the auth state directly (no API hit for the user object)
        if (authContext) {
            authContext.actions.setCurrentUser ? authContext.actions.setCurrentUser(optimisticUser) : null;
        }
        // Keep local sellers list in sync with new like count
        setAllSellers(prev => prev.map(s => {
            if (s.id !== sellerId) return s;
            return { ...s, likes: (s.likes || 0) + (isCurrentlyLiked ? -1 : 1) };
        }));
        try {
            await api.toggleLikeSeller(token, sellerId, impersonatingUser?.id);
            // Confirm with server data
            if (authContext?.actions.refreshAuthData) {
                await authContext.actions.refreshAuthData();
            }
        } catch (e) {
            console.error(e);
            // Revert optimistic updates on error
            refreshData();
            if (authContext?.actions.refreshAuthData) authContext.actions.refreshAuthData();
        }
    }, [effectiveUser, token, impersonatingUser, authContext, refreshData]);

    const handleSavePost = useCallback(async (postData: any) => {
        if (!effectiveUser) return;
        try {
            const savedPost = await api.savePost(token, postData, impersonatingUser?.id);
            if (postData.id) {
                setAllPosts(prev => prev.map(p => p.id === postData.id ? savedPost : p));
            } else {
                setAllPosts(prev => [savedPost, ...prev]);
            }
        } catch (e) {
            console.error(e);
            showToast('error', 'Save Failed', 'Failed to save post. Please try again.');
            throw e;
        }
    }, [effectiveUser, token, impersonatingUser]);

    const handleAddTestimonial = useCallback(async (sellerId: string, solutionId: string, testimonial: Testimonial) => {
        try {
            await api.addTestimonial(token, solutionId, sellerId, testimonial);
            refreshData();
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed', 'Failed to add testimonial. Please try again.');
            throw e;
        }
    }, [token, refreshData]);

    const handleUpdateSellerTier = useCallback(async (sellerId: string, tier: 'Free' | 'Basic' | 'Premium') => {
        try {
            const updatedSeller = await api.updateSellerTier(token, sellerId, tier);
            setAllSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s));
        } catch (e) {
            console.error(e);
        }
    }, [token]);

    const handleToggleInvestmentStatus = useCallback(async (sellerId: string, status: boolean) => {
        try {
            const updatedSeller = await api.toggleInvestmentStatus(token, sellerId, status);
            setAllSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s));
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed', 'Failed to update investment status.');
        }
    }, [token]);

    const handleUpdateDueDiligence = useCallback(async (sellerId: string, data: DueDiligenceData) => {
        try {
            const updatedSeller = await api.updateDueDiligence(token, sellerId, data);
            setAllSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s));
            showToast('success', 'Due Diligence Updated', 'Due diligence data has been saved successfully.');
        } catch (e) {
            console.error("Failed to update due diligence", e);
            showToast('error', 'Update Failed', 'Failed to update due diligence data. Please try again.');
        }
    }, [token]);

    const handleUpdateSolutions = useCallback(async (sellerId: string, solutions: Solution[]) => {
        try {
            const updatedSeller = await api.updateSolutions(token, sellerId, solutions);
            setAllSellers(prev => prev.map(s => s.id === sellerId ? updatedSeller : s));
        } catch (e) {
            console.error(e);
            showToast('error', 'Failed', 'Failed to update solutions. Please try again.');
        }
    }, [token]);

    const value: DataContextValue = useMemo(() => ({
        state: { allUsers, allSellers, allPosts, allEnterprises, inboxItems, monetizationRules },
        actions: { handleLikePost, handleBookmarkPostToggle, handleAddComment, handleSendConnectionRequest, handleConnectionRequestResponse, handleFollowSeller, handleLikeSellerToggle, handleSavePost, handleAddTestimonial, handleUpdateSellerTier, handleToggleInvestmentStatus, handleUpdateDueDiligence, handleUpdateSolutions },
        refreshData
    }), [allUsers, allSellers, allPosts, allEnterprises, inboxItems, monetizationRules, handleLikePost, handleBookmarkPostToggle, handleAddComment, handleSendConnectionRequest, handleConnectionRequestResponse, handleFollowSeller, handleLikeSellerToggle, handleSavePost, handleAddTestimonial, handleUpdateSellerTier, handleToggleInvestmentStatus, handleUpdateDueDiligence, handleUpdateSolutions, refreshData]);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
