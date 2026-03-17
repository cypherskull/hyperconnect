// services/authService.ts
import type { User, Enterprise } from '../types';
import * as api from './apiService'; 
import { mockUsers } from './api';

const API_URL = '/api/auth';

// --- Token Management --- //

export const getToken = (): string | null => {
    try {
        return localStorage.getItem('authToken');
    } catch (error) {
        console.error("Could not access localStorage:", error);
        return null;
    }
};

export const setToken = (token: string) => {
    try {
        localStorage.setItem('authToken', token);
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
};

export const removeToken = () => {
    try {
        localStorage.removeItem('authToken');
    } catch (error) {
        console.error("Could not access localStorage:", error);
    }
};

// --- Authentication API --- //

export const login = async (email: string, password: string): Promise<{ token: string; user: User }> => {
    console.log(`Attempting login for ${email}`);
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data = await response.json();
        const { token, user } = data;

        // Map backend response to frontend User type
        // Backend returns 'email', frontend expects 'personalEmail' or 'businessEmail'
        // For simplicity, we'll map to personalEmail as primary
        const mappedUser: User = {
            ...user,
            personalEmail: user.email,
            isPersonalEmailVerified: false,
            businessEmail: user.businessEmail || '',
            isBusinessEmailVerified: false,
            wantsEmailNotifications: true,
        };

        setToken(token);
        console.log(`Login successful for ${mappedUser.name}`);
        return { token, user: mappedUser };
    } catch (error) {
        console.error(`Login failed for ${email}:`, error);
        
        // Fallback to mock data during migration or if backend is down
        const mockUser = mockUsers.find(u => (u.personalEmail === email || u.businessEmail === email) && u.password === password);
        if (mockUser) {
            console.log(`Fallback login successful for mock user: ${mockUser.name}`);
            const mockToken = `mock-jwt-for-user-${mockUser.id}`;
            setToken(mockToken);
            return { token: mockToken, user: mockUser };
        }
        
        throw error;
    }
};

export const validateToken = async (token: string): Promise<User> => {
    // Check for mock token first
    if (token.startsWith('mock-jwt-for-user-')) {
        const userId = token.replace('mock-jwt-for-user-', '');
        const mockUser = mockUsers.find(u => u.id === userId);
        if (mockUser) return mockUser;
        throw new Error('Invalid mock token');
    }

    try {
        const response = await fetch(`${API_URL}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Token validation failed');
        }

        const data = await response.json();
        if (!data.valid || !data.user) {
            throw new Error('Invalid token');
        }

        const user = data.user;
        const mappedUser: User = {
            ...user,
            personalEmail: user.personalEmail || user.email, // backend verify returns personalEmail directly? let's check auth.ts verify endpoint again if needed. 
            // auth.ts verify returns: id, name, personalEmail, persona, avatarUrl, role.
            isPersonalEmailVerified: false,
            businessEmail: user.businessEmail || '',
            isBusinessEmailVerified: false,
            wantsEmailNotifications: true,
        };

        return mappedUser;
    } catch (error) {
        console.error("Token validation failed:", error);
        throw error;
    }
};

export const logout = async (): Promise<void> => {
    removeToken();
    return Promise.resolve();
};

export const signUp = async (newUserData: Omit<User, 'id' | 'referralCode'> & { referralCode?: string }): Promise<{ token: string; user: User }> => {
    console.log(`Signing up user ${newUserData.name}`);
    try {
        // Send all signup fields to the backend so they are persisted
        const payload = {
            email: newUserData.personalEmail || newUserData.businessEmail,
            password: newUserData.password,
            name: newUserData.name,
            persona: newUserData.persona,
            designation: newUserData.designation,
            company: newUserData.company,
            businessEmail: newUserData.businessEmail || null,
            phone: newUserData.phone || null,
            interests: newUserData.interests || null,
        };

        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data = await response.json();
        const { token, user } = data;

        const mappedUser: User = {
            ...user,
            personalEmail: user.personalEmail || user.email,
            isPersonalEmailVerified: false,
            businessEmail: user.businessEmail || newUserData.businessEmail || '',
            phone: user.phone || newUserData.phone,
            isBusinessEmailVerified: false,
            wantsEmailNotifications: true,
            referralCode: user.referralCode || 'PENDING',
            interests: user.interests || newUserData.interests,
        };

        setToken(token);
        return { token, user: mappedUser };
    } catch (error) {
        console.error("Signup failed:", error);

        // Fallback to mock behavior for testing — spread newUserData to preserve all fields
        const mockUser: User = {
            id: `user-${Date.now()}`,
            role: 'Member',
            isPersonalEmailVerified: true,
            isBusinessEmailVerified: true,
            wantsEmailNotifications: true,
            referralCode: generateReferralCode(newUserData.name),
            ...newUserData,
        };
        const mockToken = `mock-jwt-for-user-${mockUser.id}`;
        setToken(mockToken);
        return { token: mockToken, user: mockUser };
    }
};

const generateReferralCode = (name: string): string => {
    return `HYPER-${name.toUpperCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
};

export const createEnterpriseAndAdmin = async (
    enterpriseData: Omit<Enterprise, 'id' | 'associationCode' | 'members'>,
    adminData: Omit<User, 'id'>
): Promise<{ token: string; user: User }> => {
    // This endpoint might not exist yet in backend.
    // We will throw error or mock it for now if needed.
    // For now, let's keep it somewhat abstract or throw "Not Implemented"
    console.warn("createEnterpriseAndAdmin not implemented in real backend yet.");
    throw new Error("Enterprise creation is not yet supported in the backend.");
};