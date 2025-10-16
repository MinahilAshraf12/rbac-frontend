// src/contexts/SubscriptionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTenant } from './TenantContext';
import api from '../config/api';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { tenant } = useTenant();
  const [subscription, setSubscription] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tenant) {
      loadSubscriptionData();
    }
  });

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      
      // Fetch REAL usage from backend
      const response = await api.get('/api/subscription/usage');
      
      if (response.data.success) {
        const data = response.data.data;
        
        setSubscription({
          plan: tenant.plan || 'free',
          status: tenant.status || 'active',
          limits: {
            maxUsers: data.users.limit,
            maxExpenses: data.expenses.limit,
            storageLimit: data.storage.limit,
          },
          features: tenant.settings?.features || [],
        });
        
        setUsage({
          currentUsers: data.users.current,
          currentExpenses: data.expenses.current,
          storageUsed: data.storage.current,
        });
        
        // console.log('✅ Real usage loaded:', data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
      // Fallback to tenant data
      setSubscription({
        plan: tenant.plan || 'free',
        status: tenant.status || 'active',
        limits: {
          maxUsers: tenant.settings?.maxUsers || 5,
          maxExpenses: tenant.settings?.maxExpenses || 100,
          storageLimit: tenant.settings?.storageLimit || 1024,
        },
        features: tenant.settings?.features || [],
      });
      
      setUsage({
        currentUsers: tenant.usage?.currentUsers || 0,
        currentExpenses: tenant.usage?.currentExpenses || 0,
        storageUsed: tenant.usage?.storageUsed || 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = (feature) => {
    if (!subscription?.limits || !usage) {
      return { 
        canUse: true, 
        remaining: Infinity, 
        percentage: 0,
        current: 0,
        limit: Infinity
      };
    }

    const limitKey = `max${feature.charAt(0).toUpperCase() + feature.slice(1)}s`;
    const usageKey = `current${feature.charAt(0).toUpperCase() + feature.slice(1)}s`;
    
    const limit = subscription.limits[limitKey];
    const current = usage[usageKey] || 0;

    if (!limit || limit === -1) {
      return { 
        canUse: true, 
        remaining: Infinity, 
        percentage: 0,
        current,
        limit: -1
      };
    }

    const percentage = Math.min(100, Math.round((current / limit) * 100));

    return {
      canUse: current < limit,
      remaining: Math.max(0, limit - current),
      percentage,
      current,
      limit,
    };
  };

  const upgradePlan = async (planId) => {
    try {
      const response = await api.post('/api/subscription/upgrade', { planId });
      
      if (response.data.success) {
        await loadSubscriptionData(); // Reload data
        return { success: true, message: response.data.message };
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to upgrade plan' 
      };
    }
  };

  const isFeatureAvailable = (feature) => {
    return subscription?.features?.includes(feature) || false;
  };

  const value = {
    subscription,
    usage,
    loading,
    checkLimit,
    isFeatureAvailable,
    upgradePlan,
    refresh: loadSubscriptionData,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

