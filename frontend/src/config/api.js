// API Configuration
const isDevelopment = import.meta.env.MODE === 'development';
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// In development, use relative URLs (Vite proxy will handle them)
// In production, use the full backend URL
const API_BASE_URL = isDevelopment && isLocalhost 
  ? '/api'  // Use relative URL for Vite proxy in development
  : import.meta.env.VITE_API_URL || 'https://proof-of-existence.onrender.com/api';

// Log which backend is being used
console.log('🔗 API Backend:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);
console.log('🏠 Hostname:', window.location.hostname);
console.log('🔧 Is Development:', isDevelopment);
console.log('🏠 Is Localhost:', isLocalhost);

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
    VERIFY_HASH: `${API_BASE_URL}/proof/hash`, // Base URL for hash verification
    HISTORY: `${API_BASE_URL}/proof/history`,
    STATS: `${API_BASE_URL}/proof/stats`,
    STATUS: `${API_BASE_URL}/proof/status`,
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
    console.log('🚀 Making API call to:', url);
    console.log('📋 Options:', options);
    
    const isFormData = options.body instanceof FormData;
    
    const response = await fetch(url, {
      ...DEFAULT_FETCH_OPTIONS,
      ...options,
      headers: {
        ...DEFAULT_FETCH_OPTIONS.headers,
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response:', text);
      throw new Error(`Server returned ${response.status}: ${response.statusText}. Response: ${text.substring(0, 200)}`);
    }

    const data = await response.json();
    console.log('📦 Response data:', data);

    if (!response.ok) {
      throw new Error(data.error || data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    console.error('🔗 URL:', url);
    console.error('📋 Options:', options);
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