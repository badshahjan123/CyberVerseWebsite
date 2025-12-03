// Use environment variable for API URL, fallback to localhost for development
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API helper function
export const apiCall = async (endpoint, options = {}) => {
  // Skip API calls for admin routes
  if (typeof window !== 'undefined' && 
      (window.location.pathname.startsWith('/secure-admin') || 
       window.location.pathname.startsWith('/admin'))) {
    throw new Error('API calls disabled for admin routes');
  }
  
  const token = localStorage.getItem('token');
  
  // Update activity on API calls (indicates user interaction)
  if (token && typeof window !== 'undefined') {
    import('../utils/sessionManager').then(({ default: sessionManager }) => {
      sessionManager.updateActivity();
    });
  }
  
  // Build headers properly for FormData vs JSON
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  const config = {
    headers,
    ...options,
  };

  try {
    console.log(`🌐 API Request: ${endpoint}`, {
      method: config.method || 'GET',
      headers: config.headers,
      body: config.body instanceof FormData ? 'FormData' : (config.body ? JSON.parse(config.body) : undefined)
    });

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    console.log(`📥 API Response: ${endpoint}`, {
      status: response.status,
      ok: response.ok,
      data
    });
    
    if (!response.ok) {
      // For validation errors, include the detailed errors
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages);
      }
      throw new Error(data.message || `Server returned ${response.status}: ${data.error || 'Unknown error'}`);
    }
    
    // If data is just a string, wrap it in an object
    if (typeof data === 'string') {
      return { data };
    }
    
    return data;
  } catch (error) {
    console.error(`❌ API Error (${endpoint}):`, error);
    throw error;
  }
};