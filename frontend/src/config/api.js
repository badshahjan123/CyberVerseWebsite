// Use localhost for development (PC only)
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

  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log('🌐 API Request:', endpoint, config);

    const response = await fetch(url, config);

    console.log('📥 API Response:', endpoint, {
      status: response.status,
      ok: response.ok,
      data: await response.clone().json().catch(() => null)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ API Error:', endpoint, error);
    throw error;
  }
};

export default apiCall;