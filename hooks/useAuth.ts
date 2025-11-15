import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Custom hook to provide access to the AppContext.
 * This is the primary way components should interact with global state and actions.
 */
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
