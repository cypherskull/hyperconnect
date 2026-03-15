import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import { View, ScopeFilter, Seller, ProfileTab, Post, Solution, SharedContent, InboxItem, User } from '../types';

interface UIContextState {
    view: View;
    viewHistory: View[];
    scopeFilter: ScopeFilter;
    interestFilters: User['interests'];
    selectedSeller: { seller: Seller, solutionId?: string, tab?: ProfileTab, postId?: string } | null;
    isPostCreatorOpen: boolean;
    postCreatorData: { solution: Solution, shareItem?: SharedContent, postToEdit?: Post | null } | null;
    commentingPost: Post | null;
    testimonialModalSeller: Seller | null;
    messagingSeller: Seller | null;
    meetingSeller: Seller | null;
    respondingToItem: InboxItem | null;
}

interface UIContextActions {
    setView: (view: View) => void;
    setScopeFilter: (scope: ScopeFilter) => void;
    setInterestFilters: (filters: User['interests']) => void;
    setSelectedSeller: (data: { seller: Seller, solutionId?: string, tab?: ProfileTab, postId?: string } | null) => void;
    setIsPostCreatorOpen: (isOpen: boolean) => void;
    setPostCreatorData: (data: any) => void;
    setCommentingPost: (post: Post | null) => void;
    setTestimonialModalSeller: (seller: Seller | null) => void;
    setMessagingSeller: (seller: Seller | null) => void;
    setMeetingSeller: (seller: Seller | null) => void;
    setRespondingToItem: (item: InboxItem | null) => void;
    handleNavigate: (view: View) => void;
    handleBack: () => void;
    handleApplyFilters: (filters: User['interests'], scope: ScopeFilter) => void;
    handleSelectSeller: (seller: Seller, options?: { solutionId?: string, tab?: ProfileTab, postId?: string }) => void;
    handleOpenPostCreator: (solution: Solution, shareItem?: SharedContent, postToEdit?: Post | null) => void;
}

interface UIContextValue {
    state: UIContextState;
    actions: UIContextActions;
}

export const UIContext = createContext<UIContextValue | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [view, setView] = useState<View>('feed');
    const [viewHistory, setViewHistory] = useState<View[]>(['feed']);
    const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
    const [interestFilters, setInterestFilters] = useState<User['interests']>({ valueChain: [], geography: [], industry: [], offering: [] });

    // Modals & Selections
    const [selectedSeller, setSelectedSeller] = useState<{ seller: Seller, solutionId?: string, tab?: ProfileTab, postId?: string } | null>(null);
    const [isPostCreatorOpen, setIsPostCreatorOpen] = useState(false);
    const [postCreatorData, setPostCreatorData] = useState<{ solution: Solution, shareItem?: SharedContent, postToEdit?: Post | null } | null>(null);
    const [commentingPost, setCommentingPost] = useState<Post | null>(null);
    const [testimonialModalSeller, setTestimonialModalSeller] = useState<Seller | null>(null);
    const [messagingSeller, setMessagingSeller] = useState<Seller | null>(null);
    const [meetingSeller, setMeetingSeller] = useState<Seller | null>(null);
    const [respondingToItem, setRespondingToItem] = useState<InboxItem | null>(null);

    const handleNavigate = useCallback((newView: View) => {
        if (view !== newView) {
            setViewHistory(prev => [...prev, newView]);
            setView(newView);
            window.history.pushState({ view: newView }, '', '#' + newView);
        }
    }, [view]);

    useEffect(() => {
        // Initialize state on load
        if (!window.history.state || !window.history.state.view) {
            window.history.replaceState({ view }, '', '#' + view);
        }

        const handlePopState = (event: PopStateEvent) => {
            const state = event.state;
            if (state && state.view) {
                setView(state.view);
                setViewHistory(prev => {
                    if (prev.length > 1 && prev[prev.length - 2] === state.view) {
                        return prev.slice(0, prev.length - 1);
                    }
                    return [...prev, state.view];
                });
                if (state.view !== 'sellerProfile') {
                    setSelectedSeller(null);
                }
            } else {
                setView('feed');
                setSelectedSeller(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const handleBack = useCallback(() => {
        window.history.back();
    }, []);

    const handleApplyFilters = useCallback((filters: User['interests'], scope: ScopeFilter) => {
        setInterestFilters(filters);
        setScopeFilter(scope);
    }, []);

    const handleSelectSeller = useCallback((seller: Seller, options?: { solutionId?: string, tab?: ProfileTab, postId?: string }) => {
        setSelectedSeller({ seller, ...options });
        handleNavigate('sellerProfile');
    }, [handleNavigate]);

    const handleOpenPostCreator = useCallback((solution: Solution, shareItem?: SharedContent, postToEdit?: Post | null) => {
        setPostCreatorData({ solution, shareItem, postToEdit });
        setIsPostCreatorOpen(true);
    }, []);

    const value: UIContextValue = useMemo(() => ({
        state: {
            view, viewHistory, scopeFilter, interestFilters, selectedSeller,
            isPostCreatorOpen, postCreatorData, commentingPost, testimonialModalSeller,
            messagingSeller, meetingSeller, respondingToItem
        },
        actions: {
            setView, setScopeFilter, setInterestFilters, setSelectedSeller,
            setIsPostCreatorOpen, setPostCreatorData, setCommentingPost, setTestimonialModalSeller,
            setMessagingSeller, setMeetingSeller, setRespondingToItem, handleNavigate,
            handleBack, handleApplyFilters, handleSelectSeller, handleOpenPostCreator
        }
    }), [
        view, viewHistory, scopeFilter, interestFilters, selectedSeller, isPostCreatorOpen, postCreatorData,
        commentingPost, testimonialModalSeller, messagingSeller, meetingSeller, respondingToItem, handleNavigate,
        handleBack, handleApplyFilters, handleSelectSeller, handleOpenPostCreator
    ]);

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
