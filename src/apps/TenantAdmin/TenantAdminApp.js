// src/apps/TenantAdmin/TenantAdminApp.jsx - FIXED FOR SUBDOMAIN SUPPORT
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TenantProvider } from '../../contexts/TenantContext';
import { SubscriptionProvider } from '../../contexts/SubscriptionContext';
import { AuthProvider } from '../../contexts/AuthContext';
import Dashboard from './Dashboard';
import api from '../../config/api';

function TenantAdminApp() {
  const { slug } = useParams(); // From path-based routing
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ Get slug from subdomain if not in URL params
  const getTenantSlug = useCallback(() => {
    // Priority 1: From URL params (/tenant/:slug)
    if (slug) {
      return slug;
    }

    // Priority 2: From subdomain (tenant1.i-expense.ikftech.com)
    const hostname = window.location.hostname;
    if (hostname.endsWith('.i-expense.ikftech.com') && 
        hostname !== 'i-expense.ikftech.com' &&
        hostname !== 'admin.i-expense.ikftech.com') {
      const subdomainSlug = hostname.replace('.i-expense.ikftech.com', '');
      console.log('✅ Extracted slug from subdomain:', subdomainSlug);
      return subdomainSlug;
    }

    // Priority 3: From localStorage
    try {
      const storedTenant = localStorage.getItem('tenant');
      if (storedTenant) {
        const tenantData = JSON.parse(storedTenant);
        console.log('✅ Using slug from localStorage:', tenantData.slug);
        return tenantData.slug;
      }
    } catch (e) {
      console.error('Error parsing tenant from localStorage:', e);
    }

    return null;
  }, [slug]);

  const loadTenantData = useCallback(async () => {
    try {
      const currentSlug = getTenantSlug();

      if (!currentSlug) {
        console.log('❌ No tenant slug found, redirecting to login');
        navigate('/login', { replace: true });
        return;
      }

      console.log('🔍 Loading tenant for slug:', currentSlug);

      // Priority 1: Try localStorage first
      const storedTenant = localStorage.getItem('tenant');
      if (storedTenant) {
        const tenantData = JSON.parse(storedTenant);
        
        // Verify slug matches
        if (tenantData.slug === currentSlug) {
          console.log('✅ Tenant from storage:', tenantData.name);
          setTenant(tenantData);
          setLoading(false);
          return;
        }
      }

      // Priority 2: Fetch from API
      console.log('📡 Fetching tenant info from API for:', currentSlug);
      const response = await api.get(`/api/public/tenant/${currentSlug}`);
      
      if (response.data.success) {
        const tenantData = response.data.data;
        console.log('✅ Tenant loaded from API:', tenantData.name);
        
        // Save to localStorage
        localStorage.setItem('tenant', JSON.stringify(tenantData));
        setTenant(tenantData);
        setLoading(false);
        return;
      }

      console.log('❌ No tenant found for slug:', currentSlug);
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('❌ Error loading tenant:', error);
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [getTenantSlug, navigate]);

  // Load tenant when component mounts or slug changes
  useEffect(() => {
    loadTenantData();
  }, [loadTenantData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading workspace...</p>
          <p className="text-xs text-gray-400 mt-2">{getTenantSlug()}</p>
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
          <Dashboard tenantSlug={tenant.slug} />
        </SubscriptionProvider>
      </AuthProvider>
    </TenantProvider>
  );
}

export default React.memo(TenantAdminApp);