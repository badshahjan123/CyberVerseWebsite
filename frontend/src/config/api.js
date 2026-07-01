// Use localhost for development (PC only)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Server base URL (without /api) — used for serving static files like avatars
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Build a fully-qualified avatar image URL.
 * - External URLs (http/https) are returned as-is.
 * - Relative server paths like /uploads/avatars/... are prefixed with SERVER_BASE_URL.
 * - If no avatar is set, returns a DiceBear fallback.
 */
export const getAvatarUrl = (avatar, fallbackSeed = 'user', timestamp) => {
  if (!avatar) return `https://api.dicebear.com/7.x/bottts/svg?seed=${fallbackSeed}`;
  if (avatar.startsWith('http')) return avatar;
  const ts = timestamp ? `?t=${timestamp}` : '';
  return `${SERVER_BASE_URL}${avatar}${ts}`;
};

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

  // Check if body is FormData (for file uploads)
  const isFormData = options.body instanceof FormData;

  const defaultHeaders = {};

  // Only set Content-Type if not FormData (browser will set it automatically for FormData with boundary)
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

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

  // Only stringify body if it's not FormData and is an object
  if (config.body && typeof config.body === 'object' && !isFormData) {
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