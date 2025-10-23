// src/apps/TenantAdmin/TenantAdminApp.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TenantProvider } from '../../contexts/TenantContext';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import Dashboard from './Dashboard';
import api from '../../config/api';

function TenantAdminApp() {
  const { slug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // useCallback to avoid missing dependency warnings
  const loadTenantData = useCallback(async () => {
    try {
      // Priority 1: Try localStorage first
      const storedTenant = localStorage.getItem('tenant');
      if (storedTenant) {
        const tenantData = JSON.parse(storedTenant);
        
        // Verify slug matches
        if (tenantData.slug === slug) {
          console.log('✅ Tenant from storage:', tenantData.name);
          setTenant(tenantData);
          setLoading(false);
          return;
        }
      }

      // Priority 2: Fetch from API
      console.log('🔍 Fetching tenant info for slug:', slug);
      const response = await api.get(`/api/public/tenant/${slug}`);
      
      if (response.data.success) {
        const tenantData = response.data.data;
        console.log('✅ Tenant loaded from API:', tenantData.name);
        
        // Save to localStorage
        localStorage.setItem('tenant', JSON.stringify(tenantData));
        setTenant(tenantData);
        setLoading(false);
        return;
      }

      console.log('❌ No tenant found for slug:', slug);
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('❌ Error loading tenant:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [slug, navigate]);

  // Load tenant when slug changes
  useEffect(() => {
    if (slug) {
      loadTenantData();
    }
  }, [slug, loadTenantData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return null;
  }

  return (
    <TenantProvider initialTenant={tenant}>
      <AuthProvider>
        <SubscriptionProvider>
          <Dashboard tenantSlug={slug} />
        </SubscriptionProvider>
      </AuthProvider>
    </TenantProvider>
  );
}

export default React.memo(TenantAdminApp);