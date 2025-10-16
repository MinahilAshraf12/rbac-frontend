// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const tenantToken = localStorage.getItem('tenantToken');
      const storedUser = localStorage.getItem('user');
      const storedTenant = localStorage.getItem('tenant');

      if (tenantToken && storedUser && storedTenant) {
        const userData = JSON.parse(storedUser);
        // const tenantData = JSON.parse(storedTenant);

        console.log('✅ User authenticated:', userData.email); // ✅ Simplified log

        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (resource, action) => {
    if (!user || !user.permissions) {
      return false;
    }

    return user.permissions.some(permission => {
      if (permission.resource !== resource) {
        return false;
      }

      return (
        permission.actions.includes(action) || 
        permission.actions.includes('manage')
      );
    });
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    
    localStorage.removeItem('tenantToken');
    localStorage.removeItem('tenant');
    localStorage.removeItem('user');
    
    setUser(null);
    setIsAuthenticated(false);
    
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    hasPermission,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};