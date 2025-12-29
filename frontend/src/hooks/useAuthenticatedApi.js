import { useAuth } from '../contexts/AuthContext';
import { authenticatedApiCall } from '../config/api';

export const useAuthenticatedApi = () => {
  const { idToken, refreshToken } = useAuth();

  const makeAuthenticatedCall = async (url, options = {}) => {
    if (!idToken) {
      throw new Error('No authentication token available. Please sign in.');
    }

    return authenticatedApiCall(url, options, idToken, refreshToken);
  };

  return {
    makeAuthenticatedCall,
    isAuthenticated: !!idToken
  };
};