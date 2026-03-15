// services/apiService.ts
/**
 * Real API Service connecting to the backend.
 * Hybrid mock/real implementation during migration.
 */

import * as db from './api'; // Keep for mock fallbacks
import type { User, Persona, Post, Seller, Comment, Testimonial, Solution, Enterprise, MonetizationRule, AccessConfig, PaymentMethod, InboxItem, MeetingDetails, SharedContent, DueDiligenceData, PlatformSettings, InboxItemCategory } from '../types';

const SIMULATED_DELAY = 200; // ms
const API_URL = 'http://localhost:3001/api';

// --- LocalStorage Persistence for Mocks --- //
// This ensures mock data persists even when the backend/database is down
const STORAGE_KEYS = {
    INBOX: 'hc_mock_inbox',
    FOLLOWS: 'hc_mock_follows',
    LIKES: 'hc_mock_likes',
    BOOKMARKS: 'hc_mock_bookmarks',
    SELLER_LIKES: 'hc_mock_seller_likes'
};

const getStored = <T>(key: string, defaultValue: T): T => {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
        return defaultValue;
    }
};

const saveStored = (key: string, value: any) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error("Failed to save to localStorage", e);
    }
};

// --- Helper Functions --- //

export const mapSellerData = (s: any): Seller => ({
    ...s,
    solutions: (s.solutions || []).map((sol: any) => ({
        ...sol,
        industry: sol.industries || sol.industry || [],
        valueChain: sol.valueChains || sol.valueChain || [],
        geography: sol.geographies || sol.geography || [],
    }))
});

export const mapInboxItem = (item: any): InboxItem => {
    // Normalize category (Prisma returns PascalCase from enum)
    const category = item.category as InboxItemCategory;
    
    return {
        ...item,
        category,
        timestamp: item.timestamp || item.createdAt,
        // Match frontend's expectation of relatedUserId for matching in components
        relatedUserId: item.relatedUserId || item.toUserId || item.toUser?.id || null,
        relatedSellerId: item.relatedSellerId || null,
        fromUser: item.fromUser || {},
    };
};

const getAuthHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
});

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
    }
    return response.json();
};

// --- API Endpoints --- //

export const getInitialData = async (token: string): Promise<{ users: User[], sellers: Seller[], posts: Post[], enterprises: Enterprise[], inboxItems: InboxItem[], accessConfig: AccessConfig, monetizationRules: MonetizationRule[], platformSettings: PlatformSettings, currentUser?: User }> => {
    try {
        const headers = getAuthHeaders(token);

        // Fetch real data in parallel
        const [usersRes, sellersRes, postsRes, userProfileRes, inboxRes] = await Promise.all([
            fetch(`${API_URL}/users?limit=100`, { headers }),
            fetch(`${API_URL}/sellers?limit=50`, { headers }),
            fetch(`${API_URL}/posts?limit=50`, { headers }),
            fetch(`${API_URL}/users/me`, { headers }),
            fetch(`${API_URL}/inbox`, { headers }),
        ]);

        const usersData = await handleResponse(usersRes);
        const sellersData = await handleResponse(sellersRes);
        const postsData = await handleResponse(postsRes);
        let currentUser;
        try {
            const userProfileData = await handleResponse(userProfileRes);
            currentUser = {
                ...userProfileData,
                personalEmail: userProfileData.email || userProfileData.personalEmail,
                interests: userProfileData.interests ? {
                    ...userProfileData.interests,
                    industry: userProfileData.interests.industries || [],
                    valueChain: userProfileData.interests.valueChains || [],
                    geography: userProfileData.interests.geographies || [],
                    offering: userProfileData.interests.offerings || [],
                } : undefined
            } as User;
        } catch (e) {
            console.error("Failed to fetch user profile", e);
        }

        // Map Backend Post to Frontend Post because of slight shape differences (e.g. timestamp)
        const mappedPosts: Post[] = postsData.posts.map((p: any) => ({
            ...p,
            timestamp: p.createdAt, // Backend uses createdAt
            isLiked: p.isLiked ?? false,       // Now returned accurately from backend per-user
            isBookmarked: p.isBookmarked ?? false, // Now returned accurately from backend per-user
            comments: Array.isArray(p.comments) ? p.comments.map((c: any) => ({
                ...c,
                timestamp: c.timestamp || c.createdAt,
                user: { ...c.user, persona: c.user?.persona || 'Browser' }
            })) : [],
        }));

        // Map keys if necessary
        const mappedUsers: User[] = (usersData.users || []).map((u: any) => ({
            ...u,
            interests: u.interests ? {
                ...u.interests,
                industry: u.interests.industries || [],
                valueChain: u.interests.valueChains || [],
                geography: u.interests.geographies || [],
                offering: u.interests.offerings || [],
            } : undefined
        }));

        const mappedSellers: Seller[] = (sellersData.sellers || []).map(mapSellerData);

        const inboxData = await inboxRes.json().catch(() => ({ inboxItems: [] }));
        const mappedInbox: InboxItem[] = Array.isArray(inboxData.inboxItems) 
            ? inboxData.inboxItems.map(mapInboxItem) 
            : [];
        
        // Merge stored mock items for persistence during DB outage
        const storedInbox = getStored<InboxItem[]>(STORAGE_KEYS.INBOX, []).map(mapInboxItem);

        if (currentUser) {
            const storedFollows = getStored<string[]>(STORAGE_KEYS.FOLLOWS, []);
            const storedSellerLikes = getStored<string[]>(STORAGE_KEYS.SELLER_LIKES, []);
            const storedLikes = getStored<string[]>(STORAGE_KEYS.LIKES, []);
            const storedBookmarks = getStored<string[]>(STORAGE_KEYS.BOOKMARKS, []);

            currentUser.followedSellers = Array.from(new Set([...(currentUser.followedSellers || []), ...storedFollows]));
            currentUser.likedSellers = Array.from(new Set([...(currentUser.likedSellers || []), ...storedSellerLikes]));
            currentUser.likedPosts = Array.from(new Set([...(currentUser.likedPosts || []), ...storedLikes]));
            currentUser.bookmarkedPosts = Array.from(new Set([...(currentUser.bookmarkedPosts || []), ...storedBookmarks]));
        }

        return {
            users: mappedUsers.length > 0 ? mappedUsers : [...db.mockUsers],
            sellers: mappedSellers.length > 0 ? mappedSellers : [...db.mockSellers],
            posts: mappedPosts.length > 0 ? mappedPosts : [...db.mockPosts].map(p => ({
                ...p,
                isLiked: currentUser?.likedPosts?.includes(p.id) || p.isLiked,
                isBookmarked: currentUser?.bookmarkedPosts?.includes(p.id) || p.isBookmarked
            })),
            enterprises: [...db.enterprises],
            inboxItems: [...mappedInbox, ...storedInbox],
            accessConfig: db.initialAccessConfig,
            monetizationRules: db.mockMonetizationRules,
            platformSettings: db.mockPlatformSettings,
            currentUser,
        };
    } catch (error) {
        console.error("Failed to load initial data from API, falling back to mock:", error);
        
        const storedInbox = getStored<InboxItem[]>(STORAGE_KEYS.INBOX, []);
        
        return {
            users: [...db.mockUsers],
            sellers: [...db.mockSellers],
            posts: [...db.mockPosts],
            enterprises: [...db.enterprises],
            inboxItems: [...db.mockInboxItems, ...storedInbox],
            accessConfig: db.initialAccessConfig,
            monetizationRules: db.mockMonetizationRules,
            platformSettings: db.mockPlatformSettings,
        };
    }
};

// --- SETTINGS --- //

export const updatePlatformSettings = async (token: string, settings: PlatformSettings): Promise<PlatformSettings> => {
    // Mock for now
    return new Promise(resolve => {
        setTimeout(() => {
            Object.assign(db.mockPlatformSettings, settings);
            resolve({ ...db.mockPlatformSettings });
        }, SIMULATED_DELAY);
    });
};

// --- POSTS --- //

export const toggleLikePost = async (token: string, postId: string, impersonatedUserId?: string): Promise<Post> => {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/like`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        });
        const data = await handleResponse(response);
        const postRes = await fetch(`${API_URL}/posts/${postId}`, { headers: getAuthHeaders(token) });
        const post = await handleResponse(postRes);
        return {
            ...post,
            timestamp: post.createdAt,
            isLiked: data.liked,
            comments: post.comments.map((c: any) => ({ ...c, timestamp: c.createdAt, user: { ...c.user, persona: 'Browser' } }))
        };
    } catch (error) {
        console.warn("Toggle like post failed, returning mock:", error);
        
        const stored = getStored<string[]>(STORAGE_KEYS.LIKES, []);
        let newStored;
        const exists = stored.includes(postId);
        if (exists) {
            newStored = stored.filter(id => id !== postId);
        } else {
            newStored = [...stored, postId];
        }
        saveStored(STORAGE_KEYS.LIKES, newStored);
        
        const post = db.mockPosts.find(p => p.id === postId) || db.mockPosts[0];
        const isLikedNow = !exists;
        return { ...post, isLiked: isLikedNow, likes: isLikedNow ? post.likes + 1 : post.likes - 1 };
    }
};

export const toggleBookmarkPost = async (token: string, postId: string, impersonatedUserId?: string): Promise<Post> => {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/bookmark`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        });
        const data = await handleResponse(response);
        const postRes = await fetch(`${API_URL}/posts/${postId}`, { headers: getAuthHeaders(token) });
        const post = await handleResponse(postRes);
        return {
            ...post,
            timestamp: post.createdAt,
            isBookmarked: data.bookmarked,
            comments: post.comments.map((c: any) => ({ ...c, timestamp: c.createdAt, user: { ...c.user, persona: 'Browser' } }))
        };
    } catch (error) {
        console.warn("Toggle bookmark post failed, returning mock:", error);
        
        const stored = getStored<string[]>(STORAGE_KEYS.BOOKMARKS, []);
        let newStored;
        const exists = stored.includes(postId);
        if (exists) {
            newStored = stored.filter(id => id !== postId);
        } else {
            newStored = [...stored, postId];
        }
        saveStored(STORAGE_KEYS.BOOKMARKS, newStored);
        
        const post = db.mockPosts.find(p => p.id === postId) || db.mockPosts[0];
        const isBookmarkedNow = !exists;
        return { ...post, isBookmarked: isBookmarkedNow, bookmarks: isBookmarkedNow ? post.bookmarks + 1 : post.bookmarks - 1 };
    }
};

export const addComment = async (token: string, postId: string, commentText: string, impersonatedUserId?: string): Promise<Comment> => {
    try {
        const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ content: commentText })
        });
        const comment = await handleResponse(response);
        return {
            id: comment.id,
            content: comment.content,
            timestamp: comment.createdAt,
            user: { ...comment.user, persona: 'Browser' }
        };
    } catch (error) {
        console.warn("Add comment failed, returning mock:", error);
        return {
            id: `mock-comment-${Date.now()}`,
            content: commentText,
            timestamp: new Date().toISOString(),
            user: db.mockUsers[0]
        };
    }
};

export const savePost = async (token: string, postData: Omit<Post, 'id' | 'sellerId' | 'likes' | 'bookmarks' | 'comments' | 'isLiked' | 'isBookmarked' | 'timestamp' | 'author'> & { id?: string }, impersonatedUserId?: string): Promise<Post> => {
    const method = postData.id ? 'PUT' : 'POST';
    const url = postData.id ? `${API_URL}/posts/${postData.id}` : `${API_URL}/posts`;

    const payload = {
        ...postData,
        // Backend expects 'media' not undefined if we are sending it
    };

    const response = await fetch(url, {
        method,
        headers: getAuthHeaders(token),
        body: JSON.stringify(payload)
    });

    const post = await handleResponse(response);
    return {
        ...post,
        timestamp: post.createdAt,
        comments: (post.comments || []).map((c: any) => ({ ...c, timestamp: c.createdAt, user: { ...c.user, persona: 'Browser' } }))
    };
};


// --- USERS --- //

export const createUser = async (newUserData: Omit<User, 'id' | 'referralCode'> & { referralCode?: string }): Promise<{ user: User, referringUser?: User }> => {
    // This is now redundant as authService.signUp calls API directly, but keeping for compatibility if invoked elsewhere
    console.warn("apiService.createUser is deprecated. Use authService.signUp instead.");
    // We can't easily map this to auth/register because register returns token and logs in. 
    // For now, fail or mock to avoid breakage if used for admin creation.
    throw new Error("Use authService.signUp");
}

export const updateUser = async (token: string, updatedUser: User): Promise<User> => {
    try {
        const response = await fetch(`${API_URL}/users/me`, {
            method: 'PUT',
            headers: getAuthHeaders(token),
            body: JSON.stringify(updatedUser)
        });
        const user = await handleResponse(response);
        return {
            ...user,
            personalEmail: user.email,
            interests: user.interests ? {
                ...user.interests,
                industry: user.interests.industries || [],
                valueChain: user.interests.valueChains || [],
                geography: user.interests.geographies || [],
                offering: user.interests.offerings || [],
            } : undefined
        };
    } catch (error) {
        console.warn("Update user failed, returning input:", error);
        return updatedUser;
    }
};


// --- SELLERS --- //

export const toggleLikeSeller = async (token: string, sellerId: string, impersonatedUserId?: string): Promise<{ liked: boolean }> => {
    try {
        const response = await fetch(`${API_URL}/sellers/${sellerId}/like`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        });
        return await handleResponse(response);
    } catch (error) {
        console.warn("Toggle like seller failed, returning mock:", error);
        
        // Persist action
        const stored = getStored<string[]>(STORAGE_KEYS.SELLER_LIKES, []);
        if (!stored.includes(sellerId)) {
            saveStored(STORAGE_KEYS.SELLER_LIKES, [...stored, sellerId]);
        }
        
        return { liked: true };
    }
};

export const sendMessage = async (token: string, sellerId: string, content: string): Promise<void> => {
    const response = await fetch(`${API_URL}/sellers/${sellerId}/message`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ content })
    });
    await handleResponse(response);
};

export const sendMeetingRequest = async (token: string, sellerId: string, proposedTime: string, message?: string): Promise<void> => {
    const response = await fetch(`${API_URL}/sellers/${sellerId}/meeting`, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ proposedTime, message })
    });
    await handleResponse(response);
};

export const toggleFollowSeller = async (token: string, sellerId: string, impersonatedUserId?: string): Promise<{ user: User, seller: Seller }> => {
    try {
        const response = await fetch(`${API_URL}/sellers/${sellerId}/follow`, {
            method: 'POST',
            headers: getAuthHeaders(token)
        });
        const data = await handleResponse(response);
        const mappedUser: User = {
            ...data.user,
            personalEmail: data.user.email || data.user.personalEmail,
            interests: data.user.interests ? {
                ...data.user.interests,
                industry: data.user.interests.industries || [],
                valueChain: data.user.interests.valueChains || [],
                geography: data.user.interests.geographies || [],
                offering: data.user.interests.offerings || [],
            } : undefined
        };
        const mappedSeller: Seller = mapSellerData(data.seller);
        return { user: mappedUser, seller: mappedSeller };
    } catch (error) {
        console.warn("Toggle follow seller failed, returning mock:", error);
        
        // Persist action
        const stored = getStored<string[]>(STORAGE_KEYS.FOLLOWS, []);
        if (!stored.includes(sellerId)) {
            saveStored(STORAGE_KEYS.FOLLOWS, [...stored, sellerId]);
        }
        
        const user = { ...db.mockUsers[0], followedSellers: [...(db.mockUsers[0].followedSellers || []), ...stored, sellerId] };
        return { user, seller: db.mockSellers.find(s => s.id === sellerId) || db.mockSellers[0] };
    }
};

export const toggleInvestmentStatus = async (token: string, sellerId: string, status: boolean): Promise<Seller> => {
    const response = await fetch(`${API_URL}/sellers/${sellerId}/investment-status`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ isOpenForInvestment: status })
    });
    const result = await handleResponse(response);

    // We only returned isOpenForInvestment from backend right now, so we will need to refetch seller or merge.
    // For now we'll fetch the full seller
    const sellerRes = await fetch(`${API_URL}/sellers/${sellerId}`, { headers: getAuthHeaders(token) });
    return await handleResponse(sellerRes);
};

export const updateDueDiligence = async (token: string, sellerId: string, data: DueDiligenceData): Promise<Seller> => {
    const response = await fetch(`${API_URL}/sellers/${sellerId}/due-diligence`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ data })
    });
    await handleResponse(response);

    // Refetch the full seller
    const sellerRes = await fetch(`${API_URL}/sellers/${sellerId}`, { headers: getAuthHeaders(token) });
    const sellerData = await handleResponse(sellerRes);
    return mapSellerData(sellerData);
};

export const updateSolutions = async (token: string, sellerId: string, solutions: Solution[]): Promise<Seller> => {
    const res = await fetch(`${API_URL}/sellers/${sellerId}/solutions`, {
        method: 'PUT',
        headers: getAuthHeaders(token),
        body: JSON.stringify({ solutions })
    });
    await handleResponse(res);

    // Refetch the full seller
    const sellerRes = await fetch(`${API_URL}/sellers/${sellerId}`, { headers: getAuthHeaders(token) });
    const sellerData = await handleResponse(sellerRes);
    return mapSellerData(sellerData);
};


export const addTestimonial = async (token: string, solutionId: string, sellerId: string, testimonial: Testimonial): Promise<Testimonial> => {
    // Mock for now
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({ ...testimonial });
        }, SIMULATED_DELAY);
    });
};


// --- ENTERPRISE --- //

export const createEnterprise = async (
    enterpriseData: Omit<Enterprise, 'id' | 'associationCode' | 'members'>,
    adminData: Omit<User, 'id'>
): Promise<{ enterprise: Enterprise, admin: User }> => {
    // Mock for now
    return new Promise((resolve) => {
        setTimeout(() => {
            const newEnterprise = { ...enterpriseData, id: 'mock-ent', associationCode: 'MOCK', members: [] } as Enterprise;
            const newAdmin = { ...adminData, id: 'mock-admin' } as User;
            resolve({ enterprise: newEnterprise, admin: newAdmin });
        }, SIMULATED_DELAY);
    });
};

// --- CONNECTIONS --- //

export const sendConnectionRequest = async (token: string, entityId: string): Promise<InboxItem> => {
    try {
        const response = await fetch(`${API_URL}/inbox/connection`, {
            method: 'POST',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ entityId }),
        });
        const res = await handleResponse(response);
        return mapInboxItem(res);
    } catch (error) {
        console.warn("Connection request failed, falling back to mock:", error);
        // Fallback mock item
        const mockItem = mapInboxItem({
            id: `mock-connection-${Date.now()}`,
            category: 'ConnectionRequest',
            content: 'wants to connect with you.',
            timestamp: new Date().toISOString(),
            status: 'Pending',
            relatedUserId: entityId.startsWith('seller-') ? undefined : entityId,
            relatedSellerId: entityId.startsWith('seller-') ? entityId : undefined,
        });
        
        // Persist action for refresh/browsing back
        const stored = getStored<InboxItem[]>(STORAGE_KEYS.INBOX, []);
        saveStored(STORAGE_KEYS.INBOX, [mockItem, ...stored]);
        
        return mockItem;
    }
};

export const respondToConnectionRequest = async (token: string, itemId: string, response: 'Accepted' | 'Declined', impersonatedUserId?: string): Promise<InboxItem> => {
    try {
        const res = await fetch(`${API_URL}/inbox/${itemId}/respond`, {
            method: 'PATCH',
            headers: getAuthHeaders(token),
            body: JSON.stringify({ response }),
        });
        const resData = await handleResponse(res);
        return mapInboxItem(resData);
    } catch (error) {
        console.warn("Respond to connection request failed, returning mock:", error);
        return mapInboxItem({
            id: itemId,
            category: 'ConnectionRequest',
            content: 'has been actioned.',
            timestamp: new Date().toISOString(),
            status: 'Actioned',
            connectionRequestDetails: response
        });
    }
};

export const updateSellerTier = async (adminToken: string, sellerId: string, tier: 'Free' | 'Basic' | 'Premium'): Promise<Seller> => {
    // Mock for now
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ ...db.mockSellers[0], subscriptionTier: tier });
        }, SIMULATED_DELAY);
    });
};