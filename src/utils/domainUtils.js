// src/utils/domainUtils.js
import api from '../config/api';

/**
 * Determine domain type based on hostname
 */
export const getDomainType = (hostname) => {
  console.log('🔍 Checking domain type for:', hostname);
  
  // Development - localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'public';
  }

  // Super Admin
  if (hostname === 'admin.i-expense.ikftech.com') {
    return 'super-admin';
  }
  
  // Main domain - Public site
  if (hostname === 'i-expense.ikftech.com') {
    return 'public';
  }
  
  // Tenant subdomain - {slug}.i-expense.ikftech.com
  if (hostname.endsWith('.i-expense.ikftech.com')) {
    return 'tenant';
  }
  
  // Default to public
  return 'public';
};

/**
 * Extract tenant slug from hostname
 */
export const getTenantSlug = (hostname) => {
  console.log('🔍 Extracting slug from:', hostname);
  
  // Development - Check URL path for /tenant/slug
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const pathParts = window.location.pathname.split('/');
    if (pathParts[1] === 'tenant' && pathParts[2]) {
      console.log('✅ Extracted slug from path:', pathParts[2]);
      return pathParts[2];
    }
    return null;
  }
  
  // Production - Extract from subdomain
  if (hostname.endsWith('.i-expense.ikftech.com')) {
    const slug = hostname.replace('.i-expense.ikftech.com', '');
    
    // Skip reserved subdomains
    if (['www', 'admin', 'api', 'cdn'].includes(slug)) {
      return null;
    }
    
    console.log('✅ Extracted slug from subdomain:', slug);
    return slug;
  }
  
  return null;
};

/**
 * Fetch tenant information from backend
 */
export const fetchTenantInfo = async (slugOrHostname) => {
  try {
    // Extract slug if full hostname provided
    const slug = slugOrHostname.includes('.') 
      ? getTenantSlug(slugOrHostname) 
      : slugOrHostname;
    
    if (!slug) {
      throw new Error('Invalid tenant identifier');
    }
    
    console.log('🔍 Fetching tenant info for slug:', slug);
    
    const response = await api.get(`/api/public/tenant/${slug}`);
    
    if (response.data.success) {
      console.log('✅ Tenant found:', response.data.data.name);
      return response.data.data;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Error fetching tenant:', error);
    return null;
  }
};

/**
 * Check if slug is available
 */
export const checkSlugAvailability = async (slug) => {
  try {
    const response = await api.get(`/api/public/check-slug/${slug}`);
    return response.data.available;
  } catch (error) {
    console.error('Error checking slug:', error);
    return false;
  }
};

/**
 * Build tenant URL
 */
export const getTenantUrl = (slug) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return `https://${slug}.i-expense.ikftech.com`;
  } else {
    // Development - Use path-based routing
    return `http://localhost:3000/tenant/${slug}`;
  }
};

/**
 * Get current tenant slug from URL
 */
export const getCurrentTenantSlug = () => {
  const hostname = window.location.hostname;
  return getTenantSlug(hostname);
};