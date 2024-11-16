import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  onAuthStateChanged,
  signOut 
} from 'firebase/auth';
import { auth } from '../utils/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('AuthProvider mounted');
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        console.log('Auth state changed:', user ? {
          email: user.email,
          uid: user.uid,
          emailVerified: user.emailVerified
        } : 'No user');
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state change error:', {
          code: error.code,
          message: error.message
        });
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth subscriptions');
      unsubscribe();
    };
  }, []);

  const login = async () => {
    try {
      setError(null);
      console.log('Starting Google sign in...');
      
      const provider = new GoogleAuthProvider();
      
      // Add scopes
      provider.addScope('profile');
      provider.addScope('email');
      
      // Force account selection
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      console.log('Opening popup...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign in successful:', {
        email: result.user.email,
        uid: result.user.uid
      });
      
      return result.user;
    } catch (error) {
      console.error('Auth Error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to sign in with Google';
      
      switch (error.code) {
        case 'auth/popup-blocked':
          errorMessage = 'Please enable popups for this website to sign in with Google';
          break;
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled. Please try again.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = 'This domain is not authorized for Google sign in';
          break;
        case 'auth/operation-not-supported-in-this-environment':
          errorMessage = 'Google sign in is not supported in this environment';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting to sign out...');
      await signOut(auth);
      console.log('Sign out successful');
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', {
        code: error.code,
        message: error.message
      });
      setError('Failed to sign out');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
