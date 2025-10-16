// src/config/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// API URL Configuration

const getApiUrl = () => {
  // Force production URL if not in development
  const apiUrl =  'https://i-expense.ikftech.com';
  
  // Debug log to check which URL is being used
  console.log('🌐 API URL:', apiUrl);
  
  return apiUrl;
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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Priority: tenant_token > tenantToken > superAdminToken > token (legacy)
    const tenantToken = localStorage.getItem('tenant_token') ||  // ✅ ADD THIS
                        localStorage.getItem('tenantToken');
    const superAdminToken = localStorage.getItem('superAdminToken');
    const legacyToken = localStorage.getItem('token');
    
    const token = tenantToken || superAdminToken || legacyToken;
    
    // console.log('🔑 API Request:', {
    //   url: config.url,
    //   hasToken: !!token,
    //   tokenPreview: token ? `${token.substring(0, 20)}...` : null
    // });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add tenant ID header if available (for tenant-scoped requests)
    const tenantData = localStorage.getItem('tenant_data') ||  // ✅ ADD THIS
                       localStorage.getItem('tenant');
    if (tenantData) {
      try {
        const tenant = JSON.parse(tenantData);
        if (tenant._id) {
          config.headers['X-Tenant-ID'] = tenant._id;
        }
      } catch (e) {
        console.error('Error parsing tenant data:', e);
      }
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
          // Unauthorized - clear auth and redirect to appropriate login
          const isSuperAdmin = !!localStorage.getItem('superAdminToken');
          
          if (isSuperAdmin) {
            localStorage.removeItem('superAdminToken');
            localStorage.removeItem('superAdmin');
            
            if (!window.location.pathname.includes('/super-admin/login')) {
              toast.error('Session expired. Please login again.');
              setTimeout(() => {
                window.location.href = '/super-admin/login';
              }, 1000);
            }
          } else {
            localStorage.removeItem('tenantToken');
            localStorage.removeItem('tenant');
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // Legacy
            
            if (!window.location.pathname.includes('/login')) {
              toast.error('Session expired. Please login again.');
              setTimeout(() => {
                window.location.href = '/login';
              }, 1000);
            }
          }
          break;
          
        case 403:
          // Forbidden - check for specific tenant errors
          if (data?.code === 'TENANT_SUSPENDED') {
            toast.error('Your account has been suspended. Please contact support.');
          } else if (data?.code === 'TRIAL_EXPIRED') {
            toast.error('Your trial has expired. Please upgrade your plan.');
          } else {
            toast.error(data?.message || 'Access denied. You don\'t have permission for this action.');
          }
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
    const tenantToken = localStorage.getItem('tenantToken');
    const superAdminToken = localStorage.getItem('superAdminToken');
    const legacyToken = localStorage.getItem('token');
    
    const token = tenantToken || superAdminToken || legacyToken;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      try {
        const tenantData = JSON.parse(tenant);
        if (tenantData._id) {
          headers['X-Tenant-ID'] = tenantData._id;
        }
      } catch (e) {
        console.error('Error parsing tenant data:', e);
      }
    }
    
    return headers;
  },
  
  // Get multipart form headers for file uploads
  getFormHeaders: () => {
    const tenantToken = localStorage.getItem('tenantToken');
    const superAdminToken = localStorage.getItem('superAdminToken');
    const legacyToken = localStorage.getItem('token');
    
    const token = tenantToken || superAdminToken || legacyToken;
    
    const headers = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const tenant = localStorage.getItem('tenant');
    if (tenant) {
      try {
        const tenantData = JSON.parse(tenant);
        if (tenantData._id) {
          headers['X-Tenant-ID'] = tenantData._id;
        }
      } catch (e) {
        console.error('Error parsing tenant data:', e);
      }
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
  // Public endpoints (no auth required)
  PUBLIC: {
    SIGNUP: '/api/public/signup',
    LOGIN: '/api/public/login',
    CHECK_SLUG: (slug) => `/api/public/check-slug/${slug}`,
    TENANT_INFO: (slug) => `/api/public/tenant/${slug}`,
    PLANS: '/api/public/plans',
  },
  
  // Super Admin endpoints
  SUPER_ADMIN: {
    LOGIN: '/api/super-admin/auth/login',
    ME: '/api/super-admin/auth/me',
    DASHBOARD: '/api/super-admin/auth/dashboard',
    TENANTS: '/api/super-admin/tenants',
    ANALYTICS: '/api/super-admin/analytics',
    SUBSCRIPTIONS: '/api/super-admin/subscriptions',
  },
  
  // Auth (tenant users)
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
  
  // Subscription
  SUBSCRIPTION: {
    USAGE: '/api/subscription/usage',
    CHECK_LIMIT: (resource) => `/api/subscription/check/${resource}`,
    PLANS: '/api/subscription/plans',
    UPGRADE: '/api/subscription/upgrade',
  },
  
  // Tenant
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

// Tenant authentication helpers
export const tenantAuth = {
  // Save tenant auth data
  saveAuthData: (data) => {
    if (data.token) {
      localStorage.setItem('tenantToken', data.token);
    }
    if (data.tenant) {
      localStorage.setItem('tenant', JSON.stringify(data.tenant));
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  },
  
  // Clear tenant auth data
  clearAuthData: () => {
    localStorage.removeItem('tenantToken');
    localStorage.removeItem('tenant');
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Legacy
  },
  
  // Get current tenant
  getTenant: () => {
    try {
      const tenant = localStorage.getItem('tenant');
      return tenant ? JSON.parse(tenant) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Get current user
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('tenantToken');
  },
};

// Super Admin authentication helpers
export const superAdminAuth = {
  // Save super admin auth data
  saveAuthData: (data) => {
    if (data.token) {
      localStorage.setItem('superAdminToken', data.token);
    }
    if (data.superAdmin) {
      localStorage.setItem('superAdmin', JSON.stringify(data.superAdmin));
    }
  },
  
  // Clear super admin auth data
  clearAuthData: () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdmin');
  },
  
  // Get current super admin
  getSuperAdmin: () => {
    try {
      const superAdmin = localStorage.getItem('superAdmin');
      return superAdmin ? JSON.parse(superAdmin) : null;
    } catch (e) {
      return null;
    }
  },
  
  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('superAdminToken');
  },
};