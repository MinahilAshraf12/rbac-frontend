// src/apps/TenantAdmin/Dashboard.js - FIXED FOR SUBDOMAIN ROUTING
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import DashboardHome from './pages/DashboardHome';
import ExpensesPage from './pages/ExpensesPage';
import AddExpensePage from './pages/AddExpensePage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import CategoriesPage from './pages/CategoriesPage';
import LoadingScreen from '../../shared/components/LoadingScreen';
import ExpenseAnalytics from './pages/ExpenseAnalytics';
import SubscriptionPage from './pages/SubscriptionPage';

const Dashboard = ({ tenantSlug }) => {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (!loading && !isAuthenticated && !hasCheckedAuth.current) {
      console.log('❌ Not authenticated, redirecting to login');
      hasCheckedAuth.current = true;
      
      // ✅ FIXED: Determine login URL based on subdomain or path
      const hostname = window.location.hostname;
      if (hostname.endsWith('.i-expense.ikftech.com') && hostname !== 'i-expense.ikftech.com') {
        // Already on subdomain, just redirect to /login on same domain
        window.location.href = '/login';
      } else {
        // On main domain, redirect to main login with slug
        window.location.href = `/login?slug=${tenantSlug}`;
      }
    }
  }, [loading, isAuthenticated, tenantSlug]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="flex h-screen overflow-hidden">
        <Sidebar 
          isOpen={sidebarOpen} 
          onToggle={setSidebarOpen}
          onItemClick={() => setSidebarOpen(false)}
          tenantSlug={tenantSlug}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 sm:p-4 md:p-6"
            >
              <Routes>
                {/* ✅ FIXED: Simplified routes for subdomain support */}
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="add-expense" element={<AddExpensePage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="roles" element={<RolesPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="expense-analytics" element={<ExpenseAnalytics />} />
                <Route path="subscription" element={<SubscriptionPage />} />
                {/* ✅ FIXED: Redirect unknown routes to dashboard */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </motion.div>
          </main>
        </div>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
