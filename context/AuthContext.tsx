import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { User, Persona, AccessConfig, PlatformSettings, FeatureKey } from '../types';
import * as auth from '../services/authService';
import * as api from '../services/apiService';
import { mockPlatformSettings, initialAccessConfig } from '../services/api';
import { useToast } from './ToastContext';

interface AuthContextState {
    currentUser: User | null;
    impersonatingUser: User | null;
    currentPersona: Persona;
    accessConfig: AccessConfig;
    platformSettings: PlatformSettings | null;
}

interface AuthContextActions {
    handleLogin: (email: string, password: string) => boolean;
    handleSignUp: (user: Omit<User, 'id'>) => Promise<void>;
    handleLogout: () => void;
    handleChangePersona: (persona: Persona) => void;
    setCurrentUser: (user: User) => void;
    updateUserState: (user: User) => void;
    handleUpdateUser: (updatedUser: User) => Promise<void>;
    handleUpdatePlatformSettings: (settings: PlatformSettings) => Promise<void>;
    setAccessConfig: React.Dispatch<React.SetStateAction<AccessConfig>>;
    refreshAuthData: () => Promise<void>;
}

interface AuthContextValue {
    state: AuthContextState;
    token: string;
    effectiveUser: User | null;
    personasForCurrentUser: Persona[];
    userAccessConfig: Record<string, boolean>;
    actions: AuthContextActions;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [impersonatingUser, setImpersonatingUser] = useState<User | null>(null);
    const [currentPersona, setCurrentPersona] = useState<Persona>('Browser');
    const [accessConfig, setAccessConfig] = useState<AccessConfig>(initialAccessConfig);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(mockPlatformSettings);
    const { showToast } = useToast();

    const effectiveUser = impersonatingUser || currentUser;
    const [token, setTokenState] = useState<string>(() => auth.getToken() || '');

    // Helper to set token in both state and localStorage
    const persistToken = useCallback((t: string) => {
        auth.setToken(t);
        setTokenState(t);
    }, []);

    const clearToken = useCallback(() => {
        auth.removeToken();
        setTokenState('');
    }, []);

    const refreshAuthData = useCallback(async () => {
        const currentToken = auth.getToken(); // Always read fresh from storage
        if (currentToken) {
            try {
                const data = await api.getInitialData(currentToken);
                setAccessConfig(data.accessConfig);
                setPlatformSettings(data.platformSettings);
                if (data.currentUser) {
                    setCurrentUser((prev) => prev ? { ...prev, ...data.currentUser } : data.currentUser);
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const storedToken = auth.getToken();
            if (storedToken) {
                try {
                    const user = await auth.validateToken(storedToken);
                    setCurrentUser(user);
                    setCurrentPersona(user.persona);
                    await refreshAuthData();
                } catch (error) {
                    console.error("Session invalid", error);
                    auth.removeToken();
                }
            }
        };
        init();
    }, [refreshAuthData]);

    const handleLogin = useCallback((email: string, password: string) => {
        auth.login(email, password).then(({ user, token: newToken }) => {
            persistToken(newToken);
            setCurrentUser(user);
            setCurrentPersona(user.persona);
            refreshAuthData();
        }).catch(err => {
            console.error(err);
            showToast('error', 'Login Failed', "Invalid email or password.");
        });
        return true;
    }, [persistToken, refreshAuthData]);

    const handleSignUp = useCallback(async (userData: Omit<User, 'id'>) => {
        try {
            const { user, token: newToken } = await auth.signUp(userData);
            persistToken(newToken);
            setCurrentUser(user);
            setCurrentPersona(user.persona);
        } catch (e) {
            console.error(e);
            showToast('error', 'Signup Failed', "Could not create your account. Please try again.");
        }
    }, [persistToken]);

    const handleLogout = useCallback(() => {
        auth.logout();
        clearToken();
        setCurrentUser(null);
        setImpersonatingUser(null);
    }, [clearToken]);

    const handleChangePersona = useCallback((persona: Persona) => {
        setCurrentPersona(persona);
    }, []);

    const updateUserState = useCallback((user: User) => {
        if (impersonatingUser && impersonatingUser.id === user.id) {
            setImpersonatingUser(user);
        } else if (currentUser?.id === user.id) {
            setCurrentUser(user);
        }
    }, [currentUser, impersonatingUser]);

    const handleUpdateUser = useCallback(async (updatedUser: User) => {
        try {
            const result = await api.updateUser(token, updatedUser);
            updateUserState(result);
        } catch (e) {
            console.error(e);
            showToast('error', 'Update Failed', "Failed to update user profile.");
        }
    }, [token, currentUser, impersonatingUser]);

    const handleUpdatePlatformSettings = useCallback(async (settings: PlatformSettings) => {
        try {
            const result = await api.updatePlatformSettings(token, settings);
            setPlatformSettings(result);
        } catch (e) {
            console.error(e);
            showToast('error', 'Update Failed', "Failed to update platform settings.");
        }
    }, [token]);

    const personasForCurrentUser = useMemo(() => {
        if (!currentUser) return [];
        const base: Persona[] = [currentUser.persona];
        if (currentUser.role === 'Admin') return ['Admin', ...base];
        return base;
    }, [currentUser]);

    const userAccessConfig = useMemo(() => {
        return accessConfig[currentPersona] || {
            canViewFeed: false,
            canUseInbox: false,
            canUseFavourites: false,
        } as Record<FeatureKey, boolean>;
    }, [accessConfig, currentPersona]);

    const value: AuthContextValue = useMemo(() => ({
        state: { currentUser, impersonatingUser, currentPersona, accessConfig, platformSettings },
        token,
        effectiveUser,
        personasForCurrentUser,
        userAccessConfig,
        actions: {
            handleLogin, handleSignUp, handleLogout, handleChangePersona, setImpersonatingUser, setCurrentUser, updateUserState, handleUpdateUser, handleUpdatePlatformSettings, setAccessConfig, refreshAuthData
        }
    }), [token, currentUser, impersonatingUser, currentPersona, accessConfig, platformSettings, effectiveUser, personasForCurrentUser, userAccessConfig, handleLogin, handleSignUp, handleLogout, handleChangePersona, handleUpdateUser, handleUpdatePlatformSettings, refreshAuthData]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
