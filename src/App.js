// src/App.js - FIXED VERSION WITH SUBDOMAIN ROUTING
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { getDomainType, getTenantSlug, fetchTenantInfo } from './utils/domainUtils';
import LoadingScreen from './shared/components/LoadingScreen';
import ErrorBoundary from './shared/components/ErrorBoundary';

// Lazy load apps
const TenantAdminApp = React.lazy(() => import('./apps/TenantAdmin/TenantAdminApp'));
const SuperAdminLogin = React.lazy(() => import('./apps/SuperAdmin/pages/LoginPage'));
const SuperAdminApp = React.lazy(() => import('./apps/SuperAdmin/SuperAdminApp'));
const PublicApp = React.lazy(() => import('./apps/Public/PublicApp'));

const ProtectedSuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem('superAdminToken');
  
  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }
  
  return children;
};

function App() {
  const [appType, setAppType] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      
      console.log('🌐 App Init:', { hostname, pathname });

      // ============================================
      // SUPER ADMIN
      // ============================================
      if (pathname.startsWith('/super-admin') || hostname === 'admin.i-expense.ikftech.com') {
        console.log('✅ Super Admin route detected');
        setAppType('super-admin');
        setLoading(false);
        return;
      }

      // ============================================
      // SUBDOMAIN DETECTION (Production)
      // ============================================
      if (hostname !== 'localhost' && 
          hostname !== '127.0.0.1' && 
          hostname !== 'i-expense.ikftech.com' &&
          hostname !== 'www.i-expense.ikftech.com' &&
          hostname !== 'admin.i-expense.ikftech.com') {
        
        // This might be a tenant subdomain
        if (hostname.endsWith('.i-expense.ikftech.com')) {
          const tenantSlug = hostname.replace('.i-expense.ikftech.com', '');
          
          console.log('🏢 Subdomain detected:', tenantSlug);
          
          // Try to load tenant
          try {
            const tenantInfo = await fetchTenantInfo(tenantSlug);
            
            if (tenantInfo && tenantInfo.status !== 'suspended') {
              console.log('✅ Tenant loaded from subdomain:', tenantInfo.name);
              setTenant(tenantInfo);
              setAppType('tenant');
              setLoading(false);
              return;
            } else {
              // Tenant not found or suspended - show error
              setError(`Organization "${tenantSlug}" not found or is suspended`);
              setAppType('public');
              setLoading(false);
              return;
            }
          } catch (error) {
            console.log('⚠️ Subdomain tenant not found:', tenantSlug);
            setError(`Organization "${tenantSlug}" not found`);
            setAppType('public');
            setLoading(false);
            return;
          }
        }
      }

      // ============================================
      // PATH-BASED TENANT ROUTING (Fallback)
      // ============================================
      const pathMatch = pathname.match(/^\/tenant\/([^\/]+)/);
      if (pathMatch) {
        const tenantSlug = pathMatch[1];
        console.log('🏢 Tenant detected from path:', tenantSlug);
        
        const tenantInfo = await fetchTenantInfo(tenantSlug);
        
        if (!tenantInfo) {
          setError(`Organization "${tenantSlug}" not found`);
          setAppType('public');
          setLoading(false);
          return;
        }

        if (tenantInfo.status === 'suspended') {
          setError('This account has been suspended.');
          setAppType('public');
          setLoading(false);
          return;
        }

        console.log('✅ Tenant loaded from path:', tenantInfo.name);
        setTenant(tenantInfo);
        setAppType('tenant');
        setLoading(false);
        return;
      }

      // ============================================
      // PUBLIC ROUTES (Main Domain)
      // ============================================
      console.log('✅ Public domain');
      setAppType('public');
      setLoading(false);

    } catch (err) {
      console.error('❌ App initialization error:', err);
      setError(err.message || 'Failed to initialize application');
      setAppType('public');
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  // If subdomain app type with tenant, use special routing
  if (appType === 'tenant' && tenant) {
    return (
      <ErrorBoundary>
        <ThemeProvider>
          <BrowserRouter>
            <React.Suspense fallback={<LoadingScreen />}>
              {/* ✅ SUBDOMAIN TENANT APP - Routes without /tenant/:slug prefix */}
              <Routes>
                <Route path="/login" element={<PublicApp />} />
                <Route path="/*" element={<TenantAdminApp />} />
              </Routes>
            </React.Suspense>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <React.Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* ============================================ */}
              {/* SUPER ADMIN ROUTES */}
              {/* ============================================ */}
              <Route path="/super-admin/login" element={<SuperAdminLogin />} />
              <Route 
                path="/super-admin/*" 
                element={
                  <ProtectedSuperAdminRoute>
                    <SuperAdminApp />
                  </ProtectedSuperAdminRoute>
                } 
              />

              {/* ============================================ */}
              {/* TENANT ROUTES - Path-based: /tenant/:slug/* */}
              {/* ============================================ */}
              <Route 
                path="/tenant/:slug/*" 
                element={<TenantAdminApp />}
              />

              {/* ============================================ */}
              {/* PUBLIC ROUTES - Main Domain */}
              {/* ============================================ */}
              <Route path="/*" element={<PublicApp />} />

              {/* ============================================ */}
              {/* ERROR FALLBACK */}
              {/* ============================================ */}
              {error && (
                <Route path="*" element={<ErrorScreen error={error} onRetry={initializeApp} />} />
              )}
            </Routes>
          </React.Suspense>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

const ErrorScreen = ({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div className="text-center p-8 max-w-md">
      <div className="mb-4">
        <svg className="w-20 h-20 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Oops!
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {error}
      </p>
      <div className="space-y-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
        <a
          href="/"
          className="block w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Go to Home
        </a>
      </div>
      <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>Domain: {window.location.hostname}</p>
        <p>Path: {window.location.pathname}</p>
      </div>
    </div>
  </div>
);

export default App;