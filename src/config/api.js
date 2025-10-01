// config/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// API URL Configuration
const getApiUrl = () => {
  // Check if we're in development or production
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000';
  }
  
  // For production, use environment variable or current domain
  return process.env.REACT_APP_API_URL || window.location.origin;
};

export const API_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and tenant info
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant info if available - but not required for development
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      config.headers['X-Tenant-ID'] = tenant;
    }
    
    // Set proper host header for development multi-tenant testing
    if (process.env.NODE_ENV === 'development') {
      // In development, we'll rely on the backend's localhost handling
      // The backend should automatically assign demo tenant for localhost
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Bad Request - show specific error message
          if (data?.message) {
            toast.error(data.message);
          } else {
            toast.error('Invalid request. Please check your input.');
          }
          break;
          
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('tenant');
          delete api.defaults.headers.common['Authorization'];
          
          // Only show toast if not already on login page
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please login again.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          break;
          
        case 403:
          toast.error(data?.message || 'Access denied. You don\'t have permission for this action.');
          break;
          
        case 404:
          // For tenant not found, provide helpful message
          if (data?.code === 'TENANT_NOT_FOUND') {
            toast.error('Organization not found. Please check the URL.');
          } else {
            toast.error(data?.message || 'Resource not found.');
          }
          break;
          
        case 422:
          // Validation errors
          if (data?.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => toast.error(err.message || err));
          } else {
            toast.error(data?.message || 'Validation error.');
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          if (data?.message) {
            toast.error(data.message);
          } else {
            toast.error('Server error. Please try again later.');
          }
          break;
          
        default:
          toast.error(data?.message || 'An unexpected error occurred.');
      }
    } else if (error.request) {
      // Network error
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

// Export the configured axios instance
export default api;

// Utility functions for common API operations
export const apiUtils = {
  // Get auth headers manually if needed
  getAuthHeaders: () => {
    const token = localStorage.getItem('token');
    const tenant = localStorage.getItem('tenant');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenant) {
      headers['X-Tenant-ID'] = tenant;
    }
    
    return headers;
  },
  
  // Get multipart form headers for file uploads
  getFormHeaders: () => {
    const token = localStorage.getItem('token');
    const tenant = localStorage.getItem('tenant');
    
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    if (tenant) {
      headers['X-Tenant-ID'] = tenant;
    }
    
    // Don't set Content-Type for FormData - let browser set it with boundary
    return headers;
  },
  
  // Format API errors for display
  formatError: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },
  
  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response && error.request;
  },
  
  // Check if error is authentication related
  isAuthError: (error) => {
    return error.response?.status === 401;
  },
  
  // Check if error is permission related
  isPermissionError: (error) => {
    return error.response?.status === 403;
  },
  
  // Check if error is tenant related
  isTenantError: (error) => {
    const code = error.response?.data?.code;
    return ['TENANT_NOT_FOUND', 'TENANT_SUSPENDED', 'TRIAL_EXPIRED'].includes(code);
  },
};

// API endpoints constants
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
  },
  
  // Users
  USERS: {
    BASE: '/api/users',
    CREATE: '/api/users',
    UPDATE: (id) => `/api/users/${id}`,
    DELETE: (id) => `/api/users/${id}`,
    GET: (id) => `/api/users/${id}`,
  },
  
  // Roles
  ROLES: {
    BASE: '/api/roles',
    CREATE: '/api/roles',
    UPDATE: (id) => `/api/roles/${id}`,
    DELETE: (id) => `/api/roles/${id}`,
    GET: (id) => `/api/roles/${id}`,
    PERMISSIONS_MATRIX: '/api/roles/permissions-matrix',
    BULK_PERMISSIONS: '/api/roles/bulk-permissions',
    UPDATE_PERMISSIONS: (id) => `/api/roles/${id}/permissions`,
  },
  
  // Categories
  CATEGORIES: {
    BASE: '/api/categories',
    SIMPLE: '/api/categories/simple',
    CREATE: '/api/categories',
    UPDATE: (id) => `/api/categories/${id}`,
    DELETE: (id) => `/api/categories/${id}`,
    GET: (id) => `/api/categories/${id}`,
    TOGGLE_STATUS: (id) => `/api/categories/${id}/toggle-status`,
  },
  
  // Expenses
  EXPENSES: {
    BASE: '/api/expenses',
    CREATE: '/api/expenses',
    UPDATE: (id) => `/api/expenses/${id}`,
    DELETE: (id) => `/api/expenses/${id}`,
    GET: (id) => `/api/expenses/${id}`,
    STATISTICS: '/api/expenses/statistics',
    ANALYTICS: '/api/expenses/analytics',
    USERS: '/api/expenses/users',
    SUMMARY: '/api/expenses/summary',
    DASHBOARD_STATS: '/api/expenses/dashboard-stats',
    RECENT_ACTIVITY: '/api/expenses/recent-activity',
    FILE: (id, paymentIndex) => `/api/expenses/${id}/files/${paymentIndex}`,
    FILE_INFO: (id, paymentIndex) => `/api/expenses/${id}/files/${paymentIndex}/info`,
  },
  
  // Activities
  ACTIVITIES: {
    RECENT: '/api/activities/recent',
    NOTIFICATIONS: '/api/activities/notifications',
    UNREAD_COUNT: '/api/activities/unread-count',
    MARK_READ: '/api/activities/mark-read',
    ALL: '/api/activities',
  },
  
  // Tenant (for future multi-tenant support)
  TENANT: {
    PROFILE: '/api/tenant/profile',
    SETTINGS: '/api/tenant/settings',
    DASHBOARD_STATS: '/api/tenant/dashboard-stats',
    SUBSCRIPTION: '/api/tenant/subscription',
    USERS: '/api/tenant/users',
    INVITE_USER: '/api/tenant/invite-user',
  },
  
  // Seeding (development only)
  SEED: '/api/seed',
};

// Utility function to build query parameters
export const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

// Utility function for paginated requests
export const paginatedRequest = async (endpoint, params = {}) => {
  const queryString = buildQueryParams(params);
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  
  try {
    const response = await api.get(url);
    return {
      data: response.data.data || [],
      pagination: response.data.pagination || {},
      total: response.data.total || 0,
      success: true,
    };
  } catch (error) {
    return {
      data: [],
      pagination: {},
      total: 0,
      success: false,
      error: apiUtils.formatError(error),
    };
  }
};

// Development helper to seed database
export const seedDatabase = async () => {
  try {
    const response = await api.post(ENDPOINTS.SEED);
    if (response.data.success) {
      toast.success('Database seeded successfully!');
      return response.data;
    }
  } catch (error) {
    console.error('Seed error:', error);
    toast.error('Failed to seed database');
    throw error;
  }
};