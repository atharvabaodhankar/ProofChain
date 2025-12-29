import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, signOutUser } from '../config/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        try {
          // Get the ID token
          const token = await firebaseUser.getIdToken();
          console.log('🎫 ID Token obtained successfully');
          
          setIdToken(token);
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            // Store the Firebase user object for token refresh
            _firebaseUser: firebaseUser
          });
        } catch (error) {
          console.error('❌ Error getting ID token:', error);
          setUser(null);
          setIdToken(null);
          toast.error('Authentication error. Please sign in again.');
        }
      } else {
        console.log('👋 User signed out');
        setUser(null);
        setIdToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Function to refresh token if needed
  const refreshToken = async () => {
    if (user && user._firebaseUser) {
      try {
        const token = await user._firebaseUser.getIdToken(true); // Force refresh
        setIdToken(token);
        console.log('🔄 Token refreshed successfully');
        return token;
      } catch (error) {
        console.error('❌ Error refreshing token:', error);
        toast.error('Session expired. Please sign in again.');
        await logout();
        return null;
      }
    }
    return null;
  };

  const login = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting Google sign-in...');
      
      const result = await signInWithGoogle();
      const token = await result.user.getIdToken();
      
      console.log('✅ Sign-in successful');
      setIdToken(token);
      toast.success('Successfully signed in!');
      return result;
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('Failed to sign in. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('👋 Signing out...');
      await signOutUser();
      setUser(null);
      setIdToken(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Failed to sign out. Please try again.');
      throw error;
    }
  };

  const getAuthHeaders = () => {
    if (idToken) {
      return {
        'Authorization': `Bearer ${idToken}`
      };
    }
    return {};
  };

  const value = {
    user,
    loading,
    idToken,
    login,
    logout,
    getAuthHeaders,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};