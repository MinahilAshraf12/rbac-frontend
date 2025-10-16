// src/apps/SuperAdmin/SuperAdminApp.jsx
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminSidebar from './components/SuperAdminSidebar';
import SuperAdminHeader from './components/SuperAdminHeader';
import DashboardPage from './pages/DashboardPage';
import TenantsPage from './pages/TenantsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SubscriptionsPage from './pages/SubscriptionsPage';
import SettingsPage from './pages/SettingsPage';

const SuperAdminApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <SuperAdminSidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SuperAdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminApp;