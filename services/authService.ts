// services/authService.ts
import { mockUsers } from './api';
import type { User, Enterprise } from '../types';
import * as api from './apiService';

// --- Token Management --- //

const createToken = (userId: string) => `mock-jwt-for-user-${userId}`;

export const decodeToken = (token: string): string | null => {
    if (!token || !token.startsWith('mock-jwt-for-user-')) return null;
    return token.replace('mock-jwt-for-user-', '');
};

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
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.businessEmail.toLowerCase() === email.toLowerCase() && u.password === password);
            if (user) {
                const token = createToken(user.id);
                console.log(`Login successful for ${user.name}, token created.`);
                resolve({ token, user });
            } else {
                console.error(`Login failed for ${email}`);
                reject(new Error('Invalid credentials'));
            }
        }, 300); // Simulate network delay
    });
};

export const validateToken = async (token: string): Promise<User> => {
    console.log("Validating token...");
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userId = decodeToken(token);
            if (!userId) {
                console.error("Token validation failed: Invalid token format.");
                return reject(new Error('Invalid token'));
            }
            const user = mockUsers.find(u => u.id === userId);
            if (user) {
                console.log(`Token validated successfully for user ${user.name}.`);
                resolve(user);
            } else {
                console.error("Token validation failed: User not found.");
                reject(new Error('User not found for this token'));
            }
        }, 100);
    });
};

export const logout = async (): Promise<void> => {
    removeToken();
    return Promise.resolve();
};

export const signUp = async (newUserData: Omit<User, 'id' | 'referralCode'> & { referralCode?: string }): Promise<{ token: string; user: User }> => {
    console.log(`Signing up user ${newUserData.name}`);
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const { user: newUser } = await api.createUser(newUserData); // Use the API service to handle user creation and referral logic
                const token = createToken(newUser.id);
                console.log(`Signup successful for ${newUser.name}, token created.`);
                resolve({ token, user: newUser });
            } catch (error) {
                console.error("Signup failed:", error);
                reject(error);
            }
        }, 500);
    });
};

export const createEnterpriseAndAdmin = async (
    enterpriseData: Omit<Enterprise, 'id' | 'associationCode' | 'members'>,
    adminData: Omit<User, 'id'>
): Promise<{ token: string; user: User }> => {
    console.log(`Creating enterprise ${enterpriseData.companyName}`);
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            try {
                const { enterprise, admin } = await api.createEnterprise(enterpriseData, adminData);
                const token = createToken(admin.id);
                console.log(`Enterprise created, admin ${admin.name} logged in.`);
                resolve({ token, user: admin });
            } catch (error) {
                console.error("Enterprise creation failed:", error);
                reject(error);
            }
        }, 800);
    });
};