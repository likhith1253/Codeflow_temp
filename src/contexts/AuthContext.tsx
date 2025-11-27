import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signup: (email: string, password: string, displayName?: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    async function signup(email: string, password: string, displayName?: string) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Update display name if provided
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }

            toast({
                title: 'Success!',
                description: 'Your account has been created.',
            });
        } catch (error: any) {
            toast({
                title: 'Signup Failed',
                description: error.message,
                variant: 'destructive',
            });
            throw error;
        }
    }

    async function login(email: string, password: string) {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast({
                title: 'Welcome back!',
                description: 'You have successfully logged in.',
            });
        } catch (error: any) {
            toast({
                title: 'Login Failed',
                description: error.message,
                variant: 'destructive',
            });
            throw error;
        }
    }

    async function loginWithGoogle() {
        try {
            await signInWithPopup(auth, googleProvider);
            toast({
                title: 'Welcome!',
                description: 'You have successfully logged in with Google.',
            });
        } catch (error: any) {
            toast({
                title: 'Google Login Failed',
                description: error.message,
                variant: 'destructive',
            });
            throw error;
        }
    }

    async function logout() {
        try {
            await signOut(auth);
            toast({
                title: 'Logged out',
                description: 'You have been successfully logged out.',
            });
        } catch (error: any) {
            toast({
                title: 'Logout Failed',
                description: error.message,
                variant: 'destructive',
            });
            throw error;
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value: AuthContextType = {
        currentUser,
        loading,
        signup,
        login,
        logout,
        loginWithGoogle,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
