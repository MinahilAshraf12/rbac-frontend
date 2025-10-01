import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import LoginModal from './LoginModal';
import DashboardHome from './pages/DashboardHome';
import ExpensesPage from './pages/ExpensesPage';
import AddExpensePage from './pages/AddExpensePage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import CategoriesPage from './pages/CategoriesPage';
import LoadingSpinner from './LoadingSpinner';
import ExpenseAnalytics from './pages/ExpenseAnalytics';

const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true);
    } else {
      setShowLoginModal(false);
    }
  }, [isAuthenticated, loading]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <LoginModal onClose={() => setShowLoginModal(false)} />
        )}
      </AnimatePresence>

      {/* Main Dashboard Layout */}
      {isAuthenticated && (
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar - Mobile optimized */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={setSidebarOpen}
            onItemClick={() => setSidebarOpen(false)} // Close on item click for mobile
          />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header - Mobile optimized */}
            <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            
            {/* Page Content - Mobile optimized */}
            <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="p-3 sm:p-4 md:p-6" // Responsive padding
              >
                <Routes>
                  <Route path="/" element={<DashboardHome />} />
                  <Route path="/dashboard" element={<DashboardHome />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/add-expense" element={<AddExpensePage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/roles" element={<RolesPage />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/expense-analytics" element={<ExpenseAnalytics />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </motion.div>
            </main>
          </div>

          {/* Mobile Sidebar Overlay - Enhanced */}
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

          {/* Bottom Navigation for Mobile (Optional) */}
          {/* Uncomment if you want a bottom tab bar for mobile */}
          {/* 
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2 z-30">
            <div className="flex justify-around items-center">
              <button className="flex flex-col items-center p-2 text-xs">
                <Home className="w-5 h-5 mb-1" />
                <span>Home</span>
              </button>
              <button className="flex flex-col items-center p-2 text-xs">
                <Receipt className="w-5 h-5 mb-1" />
                <span>Expenses</span>
              </button>
              <button className="flex flex-col items-center p-2 text-xs">
                <Plus className="w-5 h-5 mb-1" />
                <span>Add</span>
              </button>
              <button className="flex flex-col items-center p-2 text-xs">
                <Users className="w-5 h-5 mb-1" />
                <span>Users</span>
              </button>
            </div>
          </div>
          */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;