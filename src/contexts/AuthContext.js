import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Multi-tenant API URL configuration
// const getTenantApiUrl = () => {
//   const hostname = window.location.hostname;
  
//   // For localhost development, point to demo tenant
//   if (hostname === 'localhost' || hostname === '127.0.0.1') {
//     return 'https://demo.i-expense.ikftech.com/api';
//   }
  
//   // For production, use current domain
//   return `https://${hostname}/api`;
// };

// const API_URL = getTenantApiUrl();
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
// const API_URL = process.env.REACT_APP_API_URL;

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'LOAD_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case 'AUTH_ERROR':
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set auth token in axios headers
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token && !state.user) {
      loadUser();
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.token, state.user]);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      dispatch({ type: 'LOAD_USER', payload: response.data.data });
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR' });
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password 
      });

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.data.data,
          token: response.data.token,
        },
      });
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.get(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  const hasPermission = (resource, action) => {
    if (!state.user || !state.user.role) return false;
    
    const userPermissions = state.user.role.permissions;
    return userPermissions.some(permission => 
      permission.resource === resource && 
      (permission.actions.includes(action) || permission.actions.includes('manage'))
    );
  };

  const value = {
    ...state,
    login,
    logout,
    loadUser,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};