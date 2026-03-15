import React, { ReactNode, useMemo } from 'react';
import { AuthProvider, AuthContext } from './AuthContext';
import { UIProvider, UIContext } from './UIContext';
import { DataProvider, DataContext } from './DataContext';
import { mockPlatformSettings, initialAccessConfig } from '../services/api';

// Root Provider to wrap everything
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <AuthProvider>
            <DataProvider>
                <UIProvider>
                    <AppContextProviderMigrationFacade>
                        {children}
                    </AppContextProviderMigrationFacade>
                </UIProvider>
            </DataProvider>
        </AuthProvider>
    );
};

// We will keep AppContext export as a combination of three merely for backward compatibility 
// with components that haven't been migrated yet! 
// Note: using this un-migrated hook WILL cause re-renders. 
export const AppContext = React.createContext<any>(undefined);

export const AppContextProviderMigrationFacade: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = React.useContext(AuthContext);
    const ui = React.useContext(UIContext);
    const data = React.useContext(DataContext);

    const legacyValue = useMemo(() => {
        if (!auth || !ui || !data) {
            // Return a safe minimal value so useAppContext() doesn't throw during initialization
            return {
                state: {
                    currentUser: null, impersonatingUser: null, currentPersona: 'Browser',
                    accessConfig: initialAccessConfig, platformSettings: mockPlatformSettings,
                    view: 'feed', scopeFilter: 'all', selectedSeller: null, filters: {},
                    commentingPost: null, messagingSeller: null, meetingSeller: null,
                    testimonialModalSeller: null, isPostCreatorOpen: false, postCreatorData: null,
                    respondingToItem: null,
                    allUsers: [], allSellers: [], allPosts: [], allEnterprises: [],
                    inboxItems: [], monetizationRules: [],
                },
                effectiveUser: null,
                personasForCurrentUser: [],
                userAccessConfig: {},
                currentUserSellerProfile: null,
                filteredSellers: [],
                filteredPosts: [],
                handleLogin: () => { },
                handleSignUp: async () => { },
                handleLogout: () => { },
                handleBack: () => { },
                handleNavigate: () => { },
                handleSelectSeller: () => { },
                handleChangePersona: () => { },
                handleApplyFilters: () => { },
                handleLikePost: async () => { },
                handleBookmarkPostToggle: async () => { },
                handleSendConnectionRequest: async () => { },
                handleUpdateUser: async () => { },
                handleConnectionRequestResponse: async () => { },
                handleFollowSeller: async () => { },
                handleLikeSellerToggle: async () => { },
                handleOpenPostCreator: () => { },
                handleSavePost: async () => { },
                handleAddComment: async () => { },
                handleAddTestimonial: async () => { },
                handleUpdateSellerTier: async () => { },
                setCommentingPost: () => { },
                setTestimonialModalSeller: () => { },
                setMessagingSeller: () => { },
                setMeetingSeller: () => { },
                setRespondingToItem: () => { },
                setAccessConfig: () => { },
                setImpersonatingUser: () => { },
                setIsPostCreatorOpen: () => { },
                handleSendResponse: () => { },
                handleCreateEnterprise: () => { },
                handleRequestToJoinEnterprise: () => { },
                handleAcceptInvite: () => { },
                handleDeclineInvite: () => { },
                handleInviteToEnterprise: () => { },
                handleUpdateEnterpriseUser: () => { },
                handleRemoveFromEnterprise: () => { },
                handleApproveJoin: () => { },
                handleDenyJoin: () => { },
                handleClaimMonthlyEarnings: () => { },
                handleAddMonetizationRule: () => { },
                handleUpdateMonetizationRule: () => { },
                handleDeleteMonetizationRule: () => { },
                handleAddPaymentMethod: () => { },
                handleRemovePaymentMethod: () => { },
                handleSetPreferredPaymentMethod: () => { },
                handlePayDues: () => { },
                handleSimulateBilling: () => { },
                handleUpdateSolutions: () => { },
                handleActivateSolution: () => { },
                handleSetSolutionHold: () => { },
                handleCancelSolutionHold: () => { },
                handleToggleInvestmentStatus: () => { },
                handleUpdateDueDiligence: () => { },
            };
        }
        return {
            state: { ...auth.state, ...ui.state, ...data.state },
            effectiveUser: auth.effectiveUser,
            personasForCurrentUser: auth.personasForCurrentUser,
            userAccessConfig: auth.userAccessConfig,
            currentUserSellerProfile: auth.effectiveUser?.persona === 'Seller' ? data.state.allSellers.find(s => s.companyName === auth.effectiveUser?.company) || null : null,
            filteredSellers: data.state.allSellers,
            filteredPosts: data.state.allPosts,
            ...auth.actions,
            ...ui.actions,
            ...data.actions,
            // Polyfills for missing stuff
            handleSendResponse: () => { },
            handleCreateEnterprise: () => { },
            handleRequestToJoinEnterprise: () => { },
            handleAcceptInvite: () => { },
            handleDeclineInvite: () => { },
            handleInviteToEnterprise: () => { },
            handleUpdateEnterpriseUser: () => { },
            handleRemoveFromEnterprise: () => { },
            handleApproveJoin: () => { },
            handleDenyJoin: () => { },
            handleClaimMonthlyEarnings: () => { },
            handleAddMonetizationRule: () => { },
            handleUpdateMonetizationRule: () => { },
            handleDeleteMonetizationRule: () => { },
            handleAddPaymentMethod: () => { },
            handleRemovePaymentMethod: () => { },
            handleSetPreferredPaymentMethod: () => { },
            handlePayDues: () => { },
            handleSimulateBilling: () => { },
            handleActivateSolution: () => { },
            handleSetSolutionHold: () => { },
            handleCancelSolutionHold: () => { }
        };
    }, [auth, ui, data]);

    return (
        <AppContext.Provider value={legacyValue}>
            {children}
        </AppContext.Provider>
    );
};