




import React from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Feed } from './components/feed/Feed';
// FIX: Standardized import to use PascalCase 'SellerProfilePage.tsx' to resolve file casing conflict.
import { SellerProfilePage } from './components/seller/SellerProfilePage';
import { ProfileManagementPage } from './components/user/ProfileManagementPage';
import { FavouritesPage } from './components/favourites/FavouritesPage';
import { InboxPage } from './components/inbox/InboxPage';
import { AuthPage } from './components/auth/AuthPage';
import AdminPage from './components/admin/AdminPage';
import { AdminPersonaSwitcher } from './components/admin/AdminPersonaSwitcher';
import { PostEditorModal } from './components/seller/PostEditorModal';
import { CommentModal } from './components/common/CommentModal';
import { TestimonialCreatorModal } from './components/common/TestimonialCreatorModal';
import { MessageModal } from './components/common/MessageModal';
import { MeetingModal } from './components/common/MeetingModal';
import { ResponseModal } from './components/inbox/ResponseModal';
import { NetworkPage } from './components/network/NetworkPage';
import { useAppContext } from './hooks/useAuth';

const App: React.FC = () => {
    const {
        // State
        state,
        effectiveUser,
        personasForCurrentUser,
        filteredSellers,
        filteredPosts,
        userAccessConfig,
        currentUserSellerProfile,

        // Handlers
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
        handleSendConnectionRequest,
        handleUpdateUser,
        handleConnectionRequestResponse,
        handleFollowSeller,
        handleLikeSellerToggle,
        handleOpenPostCreator,
        handleSavePost,
        handleAddComment,
        handleAddTestimonial,
        handleSendResponse,
        handleRequestToJoinEnterprise,
        handleClaimMonthlyEarnings,
        handleUpdateMonetizationRule,
        handleAddMonetizationRule,
        handleDeleteMonetizationRule,
        handleAddPaymentMethod,
        handleRemovePaymentMethod,
        handleSetPreferredPaymentMethod,
        handleCreateEnterprise,
        handleAcceptInvite,
        handleDeclineInvite,
        handleInviteToEnterprise,
        handleUpdateEnterpriseUser,
        handleRemoveFromEnterprise,
        handleApproveJoin,
        handleDenyJoin,
        handlePayDues,
        handleSimulateBilling,
        handleUpdateSellerTier,
        handleUpdateSolutions,
        handleActivateSolution,
        handleSetSolutionHold,
        handleCancelSolutionHold,
        handleToggleInvestmentStatus,
        handleUpdateDueDiligence,
    } = useAppContext();

    if (!effectiveUser) {
        return <AuthPage 
            onLoginAttempt={handleLogin}
            onSignUp={handleSignUp}
            onEnterpriseCreate={handleCreateEnterprise}
            enterprises={state.allEnterprises}
        />;
    }

    const renderView = () => {
        switch (state.view) {
            case 'userProfile':
                return <ProfileManagementPage 
                    user={effectiveUser} 
                    allUsers={state.allUsers}
                    allSellers={state.allSellers}
                    allEnterprises={state.allEnterprises}
                    onUpdateUser={handleUpdateUser}
                    onSelectSeller={handleSelectSeller}
                    onBack={handleBack}
                    onRequestToJoinEnterprise={handleRequestToJoinEnterprise}
                    onClaimMonthlyEarnings={handleClaimMonthlyEarnings}
                    onAddPaymentMethod={(method) => handleAddPaymentMethod(effectiveUser.id, method)}
                    onRemovePaymentMethod={(methodId) => handleRemovePaymentMethod(effectiveUser.id, methodId)}
                    onSetPreferredPaymentMethod={(methodId) => handleSetPreferredPaymentMethod(effectiveUser.id, methodId)}
                    onAcceptInvite={handleAcceptInvite}
                    onDeclineInvite={handleDeclineInvite}
                    onInviteUserToEnterprise={handleInviteToEnterprise}
                    onUpdateEnterpriseUser={handleUpdateEnterpriseUser}
                    onRemoveUserFromEnterprise={handleRemoveFromEnterprise}
                    onApproveJoinRequest={handleApproveJoin}
                    onDenyJoinRequest={handleDenyJoin}
                    onPayDues={handlePayDues}
                    onSimulateBilling={handleSimulateBilling}
                />
            case 'sellerProfile':
                if (!state.selectedSeller) return <p>Seller not found.</p>;
                return <SellerProfilePage 
                    seller={state.selectedSeller.seller} 
                    allPosts={state.allPosts}
                    currentUser={effectiveUser}
                    inboxItems={state.inboxItems}
                    initialSolutionId={state.selectedSeller.solutionId}
                    initialTab={state.selectedSeller.tab}
                    initialPostId={state.selectedSeller.postId}
                    onBack={handleBack}
                    onSelectSeller={handleSelectSeller}
                    onLikePost={handleLikePost}
                    onBookmarkPost={handleBookmarkPostToggle}
                    onComment={state.setCommentingPost}
                    onSendConnectionRequest={() => handleSendConnectionRequest(state.selectedSeller!.seller.id)}
                    onFollowSeller={() => handleFollowSeller(state.selectedSeller!.seller.id)}
                    onOpenPostCreator={handleOpenPostCreator}
                    onAddTestimonial={() => state.setTestimonialModalSeller(state.selectedSeller!.seller)}
                    onUpdateSolutions={handleUpdateSolutions}
                    onMessage={() => state.setMessagingSeller(state.selectedSeller!.seller)}
                    onMeeting={() => state.setMeetingSeller(state.selectedSeller!.seller)}
                    onActivateSolution={handleActivateSolution}
                    onSetSolutionHold={handleSetSolutionHold}
                    onCancelSolutionHold={handleCancelSolutionHold}
                    onToggleInvestmentStatus={handleToggleInvestmentStatus}
                    onUpdateDueDiligence={handleUpdateDueDiligence}
                />;
            case 'favourites':
                return <FavouritesPage 
                    currentUser={effectiveUser} 
                    inboxItems={state.inboxItems}
                    allSellers={state.allSellers} 
                    allPosts={state.allPosts} 
                    onSelectSeller={handleSelectSeller} 
                    onLikePost={handleLikePost}
                    onBookmarkPost={handleBookmarkPostToggle}
                    onComment={state.setCommentingPost}
                    onSendConnectionRequest={handleSendConnectionRequest}
                    onEditPost={(post) => handleOpenPostCreator(state.allSellers.find(s => s.id === post.sellerId)!.solutions.find(sol => sol.id === post.solutionId)!, undefined, post)}
                />;
            case 'inbox':
                return <InboxPage 
                    allInboxItems={state.inboxItems} 
                    currentUser={effectiveUser} 
                    onRespondToConnectionRequest={handleConnectionRequestResponse}
                    onRespondToItem={state.setRespondingToItem}
                />;
            case 'network':
                return <NetworkPage
                    currentUser={effectiveUser}
                    allUsers={state.allUsers}
                    allSellers={state.allSellers}
                    allPosts={state.allPosts}
                    inboxItems={state.inboxItems}
                    onSendConnectionRequest={handleSendConnectionRequest}
                    onSelectSeller={handleSelectSeller}
                />;
            case 'admin':
                return <AdminPage 
                    onNavigateBack={() => handleNavigate('feed')} 
                    allUsers={state.allUsers}
                    accessConfig={state.accessConfig}
                    onUpdateAccessConfig={state.setAccessConfig}
                    monetizationRules={state.monetizationRules}
                    onAddRule={handleAddMonetizationRule}
                    onUpdateRule={handleUpdateMonetizationRule}
                    onDeleteRule={handleDeleteMonetizationRule}
                />;
            case 'feed':
            default:
                return <Feed
                    sellers={filteredSellers}
                    posts={filteredPosts}
                    allPosts={state.allPosts}
                    onSelectSeller={handleSelectSeller}
                    onLikePost={handleLikePost}
                    onBookmarkPost={handleBookmarkPostToggle}
                    onComment={state.setCommentingPost}
                    currentUser={effectiveUser}
                    inboxItems={state.inboxItems}
                    onSendConnectionRequest={handleSendConnectionRequest}
                    onFollowSeller={handleFollowSeller}
                    onLikeSellerToggle={handleLikeSellerToggle}
                    onMessage={state.setMessagingSeller}
                    onMeeting={state.setMeetingSeller}
                    onEditPost={(post) => handleOpenPostCreator(state.allSellers.find(s => s.id === post.sellerId)!.solutions.find(sol => sol.id === post.solutionId)!, undefined, post)}
                 />;
        }
    }

    return (
        <>
            <MainLayout
                currentUser={effectiveUser}
                currentPersona={state.currentPersona}
                personas={personasForCurrentUser}
                onChangePersona={handleChangePersona}
                onNavigate={handleNavigate}
                onApplyFilters={handleApplyFilters}
                onLogout={handleLogout}
                userInterests={effectiveUser.interests}
                scopeFilter={state.scopeFilter}
                accessConfig={userAccessConfig}
                allSellers={state.allSellers}
                allPosts={state.allPosts}
            >
                {renderView()}
            </MainLayout>
            
            {state.currentUser?.persona === 'Admin' && (
                <AdminPersonaSwitcher 
                    allUsers={state.allUsers}
                    currentUser={effectiveUser}
                    onSwitchUser={state.setImpersonatingUser}
                    allSellers={state.allSellers}
                    onUpdateSellerTier={handleUpdateSellerTier}
                    onNavigateAdmin={() => handleNavigate('admin')}
                />
            )}
            
            {state.isPostCreatorOpen && state.postCreatorData && (
                <PostEditorModal
                    solution={state.postCreatorData.solution}
                    shareItem={state.postCreatorData.shareItem || null}
                    postToEdit={state.postCreatorData.postToEdit || null}
                    onClose={() => state.setIsPostCreatorOpen(false)}
                    onSave={handleSavePost}
                />
            )}
            
            {state.commentingPost && (
                <CommentModal 
                    post={state.commentingPost}
                    currentUser={effectiveUser}
                    onClose={() => state.setCommentingPost(null)}
                    onAddComment={handleAddComment}
                />
            )}
            
            {state.testimonialModalSeller && (
                <TestimonialCreatorModal
                    seller={state.testimonialModalSeller}
                    currentUser={effectiveUser}
                    onClose={() => state.setTestimonialModalSeller(null)}
                    onAddTestimonial={handleAddTestimonial}
                    onCreatePost={(postData) => handleSavePost(postData)}
                />
            )}
            {state.messagingSeller && <MessageModal seller={state.messagingSeller} onClose={() => state.setMessagingSeller(null)} />}
            {state.meetingSeller && <MeetingModal seller={state.meetingSeller} onClose={() => state.setMeetingSeller(null)} />}

            {state.respondingToItem && effectiveUser && (
                <ResponseModal
                    item={state.respondingToItem}
                    currentUser={effectiveUser}
                    currentUserSellerProfile={currentUserSellerProfile}
                    onClose={() => state.setRespondingToItem(null)}
                    onSend={handleSendResponse}
                />
            )}
        </>
    );
};

export default App;