// utils/domainUtils.js
export const getDomainType = (hostname) => {
  // Development mode
  if (hostname === 'localhost' || hostname.includes('localhost:')) {
    const devMode = localStorage.getItem('devMode');
    return devMode || 'tenant'; // Default to tenant for development
  }

  // Super Admin
  if (hostname === 'admin.i-expense.ikftech.com') {
    return 'super-admin';
  }

  // Public landing
  if (hostname === 'i-expense.ikftech.com' || hostname === 'www.i-expense.ikftech.com') {
    return 'public';
  }

  // Tenant subdomain pattern
  if (hostname.includes('.i-expense.ikftech.com')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'admin') {
      return 'tenant';
    }
  }

  // Custom domain (fallback to tenant)
  return 'tenant';
};

export const getTenantSlug = (hostname) => {
  // Development mode
  if (hostname === 'localhost' || hostname.includes('localhost:')) {
    return localStorage.getItem('devTenant') || 'demo';
  }

  // Extract subdomain from production
  if (hostname.includes('.i-expense.ikftech.com')) {
    const subdomain = hostname.split('.')[0];
    if (subdomain !== 'www' && subdomain !== 'admin') {
      return subdomain;
    }
  }

  // Custom domain - return as is
  return hostname;
};

export const setDevMode = (mode, tenantSlug = 'demo') => {
  localStorage.setItem('devMode', mode);
  if (mode === 'tenant') {
    localStorage.setItem('devTenant', tenantSlug);
  }
  console.log(`Development mode set to: ${mode}${mode === 'tenant' ? ` (tenant: ${tenantSlug})` : ''}`);
  console.log('Reload the page for changes to take effect');
};

// Helper to test different modes in development
window.setDevMode = setDevMode;