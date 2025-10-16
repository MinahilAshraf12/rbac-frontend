// src/contexts/TenantContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchTenantInfo, getTenantSlug } from '../utils/domainUtils';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children, initialTenant }) => {
  const [tenant, setTenant] = useState(initialTenant);
  const [loading, setLoading] = useState(!initialTenant);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!initialTenant) {
      loadTenant();
    }
  }, [initialTenant]);

  const loadTenant = async () => {
    try {
      setLoading(true);
      const hostname = window.location.hostname;
      const tenantData = await fetchTenantInfo(hostname);
      setTenant(tenantData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Tenant load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTenant = (updatedData) => {
    setTenant(prev => ({ ...prev, ...updatedData }));
  };

  const value = {
    tenant,
    loading,
    error,
    refreshTenant: loadTenant,
    updateTenant,
    tenantSlug: tenant?.slug || getTenantSlug(window.location.hostname),
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};