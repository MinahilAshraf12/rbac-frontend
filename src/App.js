// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { fetchTenantInfo } from './utils/domainUtils';
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
  const [appState, setAppState] = useState({
    type: null,      // 'public', 'tenant', 'super-admin'
    tenant: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const hostname = window.location.hostname;
      const pathname = window.location.pathname;
      
      console.log('🚀 App Init:', { hostname, pathname });

      // ============================================
      // 1. SUPER ADMIN CHECK
      // ============================================
      if (hostname === 'admin.i-expense.ikftech.com' || pathname.startsWith('/super-admin')) {
        console.log('✅ Super Admin detected');
        setAppState({ type: 'super-admin', tenant: null, loading: false, error: null });
        return;
      }

      // ============================================
      // 2. TENANT SUBDOMAIN CHECK (Production)
      // ============================================
      if (hostname.endsWith('.i-expense.ikftech.com') && 
          hostname !== 'i-expense.ikftech.com' &&
          hostname !== 'www.i-expense.ikftech.com' &&
          hostname !== 'admin.i-expense.ikftech.com') {
        
        const slug = hostname.replace('.i-expense.ikftech.com', '');
        
        console.log('🏢 Subdomain detected:', slug);
        
        // Fetch tenant info
        const tenantInfo = await fetchTenantInfo(slug);
        
        if (!tenantInfo) {
          console.log('❌ Tenant not found:', slug);
          setAppState({ 
            type: 'error', 
            tenant: null, 
            loading: false, 
            error: `Organization "${slug}" not found. Please check the URL.` 
          });
          return;
        }

        if (tenantInfo.status === 'suspended') {
          console.log('⚠️ Tenant suspended:', slug);
          setAppState({ 
            type: 'error', 
            tenant: null, 
            loading: false, 
            error: 'This account has been suspended. Please contact support.' 
          });
          return;
        }

        console.log('✅ Tenant loaded:', tenantInfo.name);
        setAppState({ 
          type: 'tenant', 
          tenant: tenantInfo, 
          loading: false, 
          error: null 
        });
        return;
      }

      // ============================================
      // 3. PATH-BASED TENANT (Development/Fallback)
      // ============================================
      const pathMatch = pathname.match(/^\/tenant\/([^\/]+)/);
      if (pathMatch) {
        const slug = pathMatch[1];
        console.log('🔍 Path-based tenant:', slug);
        
        const tenantInfo = await fetchTenantInfo(slug);
        
        if (!tenantInfo) {
          setAppState({ 
            type: 'error', 
            tenant: null, 
            loading: false, 
            error: `Organization "${slug}" not found` 
          });
          return;
        }

        if (tenantInfo.status === 'suspended') {
          setAppState({ 
            type: 'error', 
            tenant: null, 
            loading: false, 
            error: 'This account has been suspended' 
          });
          return;
        }

        console.log('✅ Tenant loaded from path:', tenantInfo.name);
        setAppState({ 
          type: 'tenant', 
          tenant: tenantInfo, 
          loading: false, 
          error: null 
        });
        return;
      }

      // ============================================
      // 4. PUBLIC SITE (Default)
      // ============================================
      console.log('✅ Public site');
      setAppState({ type: 'public', tenant: null, loading: false, error: null });

    } catch (err) {
      console.error('❌ App initialization error:', err);
      setAppState({ 
        type: 'error', 
        tenant: null, 
        loading: false, 
        error: err.message || 'Failed to load application' 
      });
    }
  };

  if (appState.loading) {
    return <LoadingScreen message="Loading..." />;
  }

  if (appState.error) {
    return <ErrorScreen error={appState.error} onRetry={initializeApp} />;
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
              {appState.type === 'super-admin' && (
                <>
                  <Route path="/super-admin/login" element={<SuperAdminLogin />} />
                  <Route 
                    path="/super-admin/*" 
                    element={
                      <ProtectedSuperAdminRoute>
                        <SuperAdminApp />
                      </ProtectedSuperAdminRoute>
                    } 
                  />
                  <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
                </>
              )}

              {/* ============================================ */}
              {/* TENANT ROUTES (Subdomain or Path-based) */}
              {/* ============================================ */}
              {appState.type === 'tenant' && appState.tenant && (
                <>
                  {/* For subdomain access */}
                  <Route 
                    path="/*" 
                    element={<TenantAdminApp initialTenant={appState.tenant} />}
                  />
                  {/* For path-based access */}
                  <Route 
                    path="/tenant/:slug/*" 
                    element={<TenantAdminApp initialTenant={appState.tenant} />}
                  />
                </>
              )}

              {/* ============================================ */}
              {/* PUBLIC ROUTES */}
              {/* ============================================ */}
              {appState.type === 'public' && (
                <>
                  <Route path="/*" element={<PublicApp />} />
                  {/* Development: Path-based tenant access */}
                  <Route 
                    path="/tenant/:slug/*" 
                    element={<TenantAdminApp />}
                  />
                </>
              )}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
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
  <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
    <div className="text-center max-w-md">
      <div className="mb-6">
        <svg
          className="w-20 h-20 mx-auto text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Oops!
      </h1>

      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
        {error}
      </p>

      <div className="space-y-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
        )}

        <a
          href="https://i-expense.ikftech.com"
          className="block w-full px-6 py-3 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
        >
          Go to Home
        </a>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Domain:{' '}
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            {window.location.hostname}
          </code>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Path:{' '}
          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
            {window.location.pathname}
          </code>
        </p>
      </div>
    </div>
  </div>
);


export default App;