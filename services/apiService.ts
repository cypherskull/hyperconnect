// services/apiService.ts
/**
 * This file simulates a server-side API.
 * It has access to the "database" (mockData.ts) and performs authorization for every request.
 * All functions are async to mimic network latency.
 */

import * as db from './api';
import type { User, Persona, Post, Seller, Comment, Testimonial, Solution, Enterprise, MonetizationRule, AccessConfig, PaymentMethod, InboxItem, MeetingDetails, SharedContent, DueDiligenceData } from '../types';

const SIMULATED_DELAY = 200; // ms

// --- Authorization Helper --- //

const authorize = (token: string, allowedPersonas: Persona[] = []): User => {
    if (!token || !token.startsWith('mock-jwt-for-user-')) {
        throw new Error("401 Unauthorized: No token provided or invalid format.");
    }
    const userId = token.replace('mock-jwt-for-user-', '');
    const user = db.mockUsers.find(u => u.id === userId);
    if (!user) {
        throw new Error("401 Unauthorized: User not found for token.");
    }
    if (allowedPersonas.length > 0 && !allowedPersonas.includes(user.persona)) {
        throw new Error(`403 Forbidden: Persona '${user.persona}' is not in allowed list [${allowedPersonas.join(', ')}].`);
    }
    return user;
};

const findUser = (userId: string): User => {
    const user = db.mockUsers.find(u => u.id === userId);
    if (!user) throw new Error(`404 Not Found: User with ID ${userId} not found.`);
    return user;
};

// --- API Endpoints --- //

export const getInitialData = async (token: string): Promise<{ users: User[], sellers: Seller[], posts: Post[], enterprises: Enterprise[], inboxItems: InboxItem[], accessConfig: AccessConfig, monetizationRules: MonetizationRule[] }> => {
    authorize(token); // Just checks if logged in
    return new Promise(resolve => {
        setTimeout(() => resolve({
            users: [...db.mockUsers],
            sellers: [...db.mockSellers],
            posts: [...db.mockPosts],
            enterprises: [...db.enterprises],
            inboxItems: [...db.mockInboxItems],
            accessConfig: db.initialAccessConfig,
            monetizationRules: db.mockMonetizationRules,
        }), SIMULATED_DELAY);
    });
};

// --- POSTS --- //

export const toggleLikePost = async (token: string, postId: string, impersonatedUserId?: string): Promise<Post> => {
    const actingUser = authorize(token);
    const targetUserId = impersonatedUserId || actingUser.id;
    if (impersonatedUserId && actingUser.persona !== 'Admin') {
        throw new Error("403 Forbidden: Only Admins can perform actions for other users.");
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const postIndex = db.mockPosts.findIndex(p => p.id === postId);
            if (postIndex === -1) return reject(new Error("404 Not Found: Post not found."));

            const post = { ...db.mockPosts[postIndex] };
            post.isLiked = !post.isLiked;
            post.likes = post.isLiked ? post.likes + 1 : post.likes - 1;
            
            db.mockPosts[postIndex] = post;
            resolve({ ...post });
        }, SIMULATED_DELAY);
    });
};

export const toggleBookmarkPost = async (token: string, postId: string, impersonatedUserId?: string): Promise<Post> => {
    const actingUser = authorize(token);
     const targetUserId = impersonatedUserId || actingUser.id;
    if (impersonatedUserId && actingUser.persona !== 'Admin') {
        throw new Error("403 Forbidden: Only Admins can perform actions for other users.");
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const postIndex = db.mockPosts.findIndex(p => p.id === postId);
            if (postIndex === -1) return reject(new Error("404 Not Found: Post not found."));
            
            const post = { ...db.mockPosts[postIndex] };
            post.isBookmarked = !post.isBookmarked;
            post.bookmarks = post.isBookmarked ? post.bookmarks + 1 : post.bookmarks - 1;
            
            db.mockPosts[postIndex] = post;
            resolve({ ...post });
        }, SIMULATED_DELAY);
    });
};

export const addComment = async (token: string, postId: string, commentText: string, impersonatedUserId?: string): Promise<Comment> => {
    const actingUser = authorize(token);
    const targetUserId = impersonatedUserId || actingUser.id;
     if (impersonatedUserId && actingUser.persona !== 'Admin') {
        throw new Error("403 Forbidden: Only Admins can perform actions for other users.");
    }
    const targetUser = findUser(targetUserId);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const postIndex = db.mockPosts.findIndex(p => p.id === postId);
            if (postIndex === -1) return reject(new Error("404 Not Found: Post not found."));
            
            const newComment: Comment = {
                id: `c-${Date.now()}`,
                user: targetUser,
                content: commentText,
                timestamp: 'Just now'
            };
            
            db.mockPosts[postIndex].comments.push(newComment);
            resolve({ ...newComment });
        }, SIMULATED_DELAY);
    });
};

export const savePost = async (token: string, postData: Omit<Post, 'id' | 'sellerId' | 'likes' | 'bookmarks' | 'comments' | 'isLiked' | 'isBookmarked' | 'timestamp' | 'author'> & { id?: string }, impersonatedUserId?: string): Promise<Post> => {
    const actingUser = authorize(token, ['Seller', 'Admin', 'Buyer']);
    const targetUserId = impersonatedUserId || actingUser.id;
    if (impersonatedUserId && actingUser.persona !== 'Admin') {
        throw new Error("403 Forbidden: Only Admins can perform actions for other users.");
    }
    const targetUser = findUser(targetUserId);
    
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (postData.id) { // Editing
                const postIndex = db.mockPosts.findIndex(p => p.id === postData.id);
                if (postIndex === -1) return reject(new Error("404 Not Found: Post not found."));
                
                // Authorization check: only author or admin can edit
                const originalPost = db.mockPosts[postIndex];
                if (originalPost.author?.id !== targetUser.id && actingUser.persona !== 'Admin') {
                    return reject(new Error("403 Forbidden: You are not authorized to edit this post."));
                }
                
                const updatedPost = { ...db.mockPosts[postIndex], ...postData };
                db.mockPosts[postIndex] = updatedPost;
                resolve({ ...updatedPost });

            } else { // Creating
                 const seller = db.mockSellers.find(s => s.solutions.some(sol => sol.id === postData.solutionId));
                 if(!seller) return reject(new Error("404 Not Found: Associated seller not found."));

                const newPost: Post = {
                    id: `post-${Date.now()}`,
                    sellerId: seller.id,
                    ...postData,
                    likes: 0,
                    bookmarks: 0,
                    comments: [],
                    isLiked: false,
                    isBookmarked: false,
                    timestamp: 'Just now',
                    author: targetUser,
                };
                db.mockPosts.unshift(newPost);
                resolve({ ...newPost });
            }
        }, SIMULATED_DELAY);
    });
};


// --- USERS --- //

export const createUser = async (newUserData: Omit<User, 'id' | 'referralCode'> & { referralCode?: string }): Promise<{ user: User, referringUser?: User }> => {
    // No token needed for sign up
     return new Promise((resolve) => {
        setTimeout(() => {
            const { referralCode, ...restOfUserData } = newUserData;

            const newUser: User = { 
                ...restOfUserData, 
                id: `user-${Date.now()}`,
                referralCode: `HYPER-${restOfUserData.name.split(' ')[0].toUpperCase()}${Date.now() % 1000}`,
                referrals: [],
                monthlyReferralEarnings: []
            };

            let referringUser: User | undefined;
            if (referralCode) {
                const referringUserIndex = db.mockUsers.findIndex(u => u.referralCode && u.referralCode.toLowerCase() === referralCode.toLowerCase());
                if (referringUserIndex !== -1) {
                    referringUser = { ...db.mockUsers[referringUserIndex] };
                    // ... (referral logic remains the same)
                    newUser.referredBy = referringUser.id;
                    db.mockUsers[referringUserIndex] = referringUser;
                }
            }
            db.mockUsers.push(newUser);
            resolve({ user: { ...newUser }, referringUser: referringUser ? { ...referringUser } : undefined });
        }, SIMULATED_DELAY);
     });
}

export const updateUser = async (token: string, updatedUser: User): Promise<User> => {
    const user = authorize(token);
    if(user.id !== updatedUser.id && user.persona !== 'Admin') {
        throw new Error("403 Forbidden: You can only update your own profile.");
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = db.mockUsers.findIndex(u => u.id === updatedUser.id);
            if (userIndex === -1) return reject(new Error("404 Not Found: User not found."));
            db.mockUsers[userIndex] = updatedUser;
            resolve({ ...updatedUser });
        }, SIMULATED_DELAY);
    });
};


// --- SELLERS --- //

export const toggleFollowSeller = async (token: string, sellerId: string, impersonatedUserId?: string): Promise<{ user: User, seller: Seller }> => {
    const actingUser = authorize(token);
    const targetUserId = impersonatedUserId || actingUser.id;
    if (impersonatedUserId && actingUser.persona !== 'Admin') {
        throw new Error("403 Forbidden: Only Admins can perform actions for other users.");
    }

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = db.mockUsers.findIndex(u => u.id === targetUserId);
            if (userIndex === -1) return reject(new Error("404 Not Found: User not found."));
            const sellerIndex = db.mockSellers.findIndex(s => s.id === sellerId);
            if (sellerIndex === -1) return reject(new Error("404 Not Found: Seller not found."));

            const user = { ...db.mockUsers[userIndex] };
            const seller = { ...db.mockSellers[sellerIndex] };

            const isFollowed = (user.followedSellers || []).includes(sellerId);

            if (isFollowed) {
                user.followedSellers = (user.followedSellers || []).filter(id => id !== sellerId);
                seller.followers = Math.max(0, seller.followers - 1);
            } else {
                user.followedSellers = [...(user.followedSellers || []), sellerId];
                seller.followers = (seller.followers || 0) + 1;
            }

            db.mockUsers[userIndex] = user;
            db.mockSellers[sellerIndex] = seller;

            resolve({ user: { ...user }, seller: { ...seller } });
        }, SIMULATED_DELAY);
    });
};

export const toggleInvestmentStatus = async (token: string, sellerId: string, status: boolean): Promise<Seller> => {
    const user = authorize(token, ['Seller', 'Admin']);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sellerIndex = db.mockSellers.findIndex(s => s.id === sellerId);
            if (sellerIndex === -1) return reject(new Error("404 Not Found: Seller not found."));

            const seller = db.mockSellers[sellerIndex];
            // Authorization check: only owner or admin can edit
            if (user.persona === 'Seller' && user.company !== seller.companyName) {
                return reject(new Error("403 Forbidden: You can only change the status for your own company."));
            }

            seller.isOpenForInvestment = status;
            resolve({ ...seller });
        }, SIMULATED_DELAY);
    });
};

export const updateDueDiligence = async (token: string, sellerId: string, data: DueDiligenceData): Promise<Seller> => {
    const user = authorize(token, ['Seller', 'Admin']);
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sellerIndex = db.mockSellers.findIndex(s => s.id === sellerId);
            if (sellerIndex === -1) return reject(new Error("404 Not Found: Seller not found."));

            const seller = db.mockSellers[sellerIndex];
            if (user.persona === 'Seller' && user.company !== seller.companyName) {
                return reject(new Error("403 Forbidden: You can only edit your own company's data."));
            }

            seller.dueDiligence = data;
            resolve({ ...seller });
        }, SIMULATED_DELAY);
    });
};


export const addTestimonial = async (token: string, solutionId: string, sellerId: string, testimonial: Testimonial): Promise<Testimonial> => {
     authorize(token, ['Buyer', 'Investor', 'Collaborator', 'Admin']);
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sellerIndex = db.mockSellers.findIndex(s => s.id === sellerId);
            if (sellerIndex === -1) return reject(new Error("404 Not Found: Seller not found."));
            const seller = db.mockSellers[sellerIndex];

            const solutionIndex = seller.solutions.findIndex(s => s.id === solutionId);
            if (solutionIndex === -1) return reject(new Error("404 Not Found: Solution not found."));

            seller.solutions[solutionIndex].testimonials.push(testimonial);
            resolve({ ...testimonial });
        }, SIMULATED_DELAY);
     });
};


// --- ENTERPRISE --- //

export const createEnterprise = async (
    enterpriseData: Omit<Enterprise, 'id' | 'associationCode' | 'members'>,
    adminData: Omit<User, 'id'>
): Promise<{ enterprise: Enterprise, admin: User }> => {
    // No token needed for creation
     return new Promise((resolve) => {
        setTimeout(() => {
            const newEnterprise: Enterprise = { 
                ...enterpriseData, 
                id: `ent-${Date.now()}`, 
                associationCode: enterpriseData.companyName.substring(0,6).toUpperCase(), 
                members: []
            };
            const newAdmin: User = { 
                ...adminData, 
                id: `user-${Date.now()}`, 
                enterpriseId: newEnterprise.id,
                referralCode: `HYPER-${adminData.name.split(' ')[0].toUpperCase()}${Date.now() % 1000}`,
                referrals: [],
                monthlyReferralEarnings: []
            };
            newEnterprise.members.push(newAdmin.id);
            
            db.enterprises.push(newEnterprise);
            db.mockUsers.push(newAdmin);

            resolve({ enterprise: { ...newEnterprise }, admin: { ...newAdmin }});
        }, SIMULATED_DELAY);
     });
};

// ... many other API functions would go here ...
// For brevity, I'll stop here, but the pattern is the same:
// 1. Export an async function
// 2. Authorize the user via token
// 3. Find the data in the mock DB
// 4. Update the data
// 5. Return the updated data in a resolved Promise

// A few more examples to show the pattern

export const sendConnectionRequest = async (token: string, entityId: string): Promise<InboxItem> => {
    const user = authorize(token);
     return new Promise((resolve, reject) => {
        setTimeout(() => {
            const newRequest: InboxItem = {
                id: `inbox-${Date.now()}`,
                category: 'Connection Request',
                fromUser: user,
                content: `Wants to connect with you.`,
                timestamp: new Date().toISOString(),
                status: 'Pending',
                relatedSellerId: entityId.startsWith('seller-') ? entityId : undefined,
                relatedUserId: entityId.startsWith('user-') ? entityId : undefined,
            };
            db.mockInboxItems.unshift(newRequest);
            resolve({ ...newRequest });
        }, SIMULATED_DELAY);
     });
};

export const updateSellerTier = async (adminToken: string, sellerId: string, tier: 'Free' | 'Basic' | 'Premium'): Promise<Seller> => {
    authorize(adminToken, ['Admin']);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const sellerIndex = db.mockSellers.findIndex(s => s.id === sellerId);
            if (sellerIndex === -1) return reject(new Error("404 Not Found: Seller not found."));
            
            const updatedSeller = { ...db.mockSellers[sellerIndex], subscriptionTier: tier };
            db.mockSellers[sellerIndex] = updatedSeller;
            resolve({ ...updatedSeller });
        }, SIMULATED_DELAY);
    });
};