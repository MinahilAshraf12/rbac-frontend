// src/apps/Public/pages/TenantLogin.js - FIXED VERSION WITH SUBDOMAIN SUPPORT
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { API_URL } from '../../../config/api';
import toast from 'react-hot-toast';

const TenantLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slugFromUrl = searchParams.get('slug');
  const isNewAccount = searchParams.get('new') === 'true';
  
  const [tenantSlug, setTenantSlug] = useState('');
  const [tenantInfo, setTenantInfo] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(true);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ DETECT SUBDOMAIN OR SLUG FROM URL
  useEffect(() => {
    const detectTenant = async () => {
      try {
        const hostname = window.location.hostname;
        let slug = null;

        // Method 1: Subdomain detection (tenant1.i-expense.ikftech.com)
        if (hostname.endsWith('.i-expense.ikftech.com')) {
          slug = hostname.replace('.i-expense.ikftech.com', '');
          console.log('✅ Detected slug from subdomain:', slug);
        }
        
        // Method 2: URL parameter (?slug=tenant1)
        else if (slugFromUrl) {
          slug = slugFromUrl;
          console.log('✅ Detected slug from URL param:', slug);
        }

        // Method 3: Path-based (/login?tenant=xyz)
        else if (searchParams.get('tenant')) {
          slug = searchParams.get('tenant');
          console.log('✅ Detected slug from tenant param:', slug);
        }

        if (slug) {
          setTenantSlug(slug);
          
          // Fetch tenant info
          const response = await fetch(`${API_URL}/api/public/tenant/${slug}`);
          const data = await response.json();
          
          if (data.success) {
            setTenantInfo(data.data);
            console.log('✅ Tenant loaded:', data.data.name);
          } else {
            setError(`Organization "${slug}" not found`);
          }
        }
      } catch (err) {
        console.error('Error detecting tenant:', err);
      } finally {
        setLoadingTenant(false);
      }
    };

    detectTenant();
  }, [slugFromUrl, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login with:', { 
        email: formData.email,
        detectedSlug: tenantSlug 
      });
      
      // ✅ Use native fetch
      const response = await fetch(`${API_URL}/api/public/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      console.log('📥 Login response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.success) {
        console.log('✅ Login successful');
        
        const { token, tenant, user } = data;
        
        if (!token || !tenant || !user) {
          throw new Error('Invalid response from server');
        }
        
        // Clear existing auth data
        localStorage.removeItem('tenantToken');
        localStorage.removeItem('tenant_token');
        localStorage.removeItem('tenant');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        
        // Save new auth data
        localStorage.setItem('tenantToken', token);
        localStorage.setItem('tenant', JSON.stringify(tenant));
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('✅ Saved to localStorage');
        console.log('🔑 Token:', token.substring(0, 20) + '...');
        console.log('🏢 Tenant:', tenant.name, '(' + tenant.slug + ')');
        console.log('👤 User:', user.name, '(' + user.email + ')');
        
        toast.success('Login successful!');
        
        // ✅ FIXED: Redirect based on subdomain or path
        const hostname = window.location.hostname;
        
        if (hostname.endsWith('.i-expense.ikftech.com') && hostname !== 'i-expense.ikftech.com') {
          // Already on subdomain, just go to dashboard
          setTimeout(() => {
            window.location.href = `/dashboard`;
          }, 500);
        } else {
          // On main domain, redirect to tenant path
          setTimeout(() => {
            window.location.href = `/tenant/${tenant.slug}/dashboard`;
          }, 500);
        }
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      
      const message = err.message || 'Login failed';
      setError(message);
      toast.error(message);
      
      // Clear partial auth data
      localStorage.removeItem('tenantToken');
      localStorage.removeItem('tenant');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while detecting tenant
  if (loadingTenant && (slugFromUrl || window.location.hostname.includes('.i-expense.ikftech.com'))) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading organization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {tenantInfo ? `Welcome to ${tenantInfo.name}` : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {tenantInfo ? 'Sign in to your workspace' : 'Sign in to your account'}
          </p>
          {tenantSlug && (
            <div className="mt-3 inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
              <CheckCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm text-indigo-700 dark:text-indigo-300 font-medium">
                {tenantSlug}.i-expense.ikftech.com
              </span>
            </div>
          )}
        </div>

        {isNewAccount && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Account created successfully! Please sign in with your credentials.
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  disabled={loading}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-800 dark:text-red-200 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 hover:underline font-medium">
            Sign up
          </Link>
        </p>

        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
            <p><strong>Debug Info:</strong></p>
            <p>Hostname: {window.location.hostname}</p>
            <p>Detected Slug: {tenantSlug || 'None'}</p>
            <p>Tenant Info: {tenantInfo ? tenantInfo.name : 'Not loaded'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantLogin;