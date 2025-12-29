// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API endpoints
export const API_ENDPOINTS = {
  // Test endpoints
  TEST: {
    CORS: `${API_BASE_URL}/test-cors`,
  },
  
  // Auth endpoints
  AUTH: {
    VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
    USER_INFO: `${API_BASE_URL}/auth/user`,
  },
  
  // Proof endpoints
  PROOF: {
    CREATE_TEXT: `${API_BASE_URL}/proof/text`,
    CREATE_FILE: `${API_BASE_URL}/proof/file`,
    VERIFY_TEXT: `${API_BASE_URL}/proof/verify/text`,
    VERIFY_FILE: `${API_BASE_URL}/proof/verify/file`,
    HISTORY: `${API_BASE_URL}/proof/history`,
    STATS: `${API_BASE_URL}/proof/stats`,
  }
};

// Default fetch options with CORS and credentials
export const DEFAULT_FETCH_OPTIONS = {
  credentials: 'include',
  headers: {
    'Accept': 'application/json',
  },
};

// Helper function to make API calls with proper error handling
export const apiCall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...DEFAULT_FETCH_OPTIONS,
      ...options,
      headers: {
        ...DEFAULT_FETCH_OPTIONS.headers,
        ...options.headers,
      },
    });

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Helper function to make authenticated API calls
export const authenticatedApiCall = async (url, options = {}, token) => {
  const isFormData = options.body instanceof FormData;
  
  return apiCall(url, {
    ...options,
    headers: {
      // Don't set Content-Type for FormData, let browser set it with boundary
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
};

export default API_BASE_URL;