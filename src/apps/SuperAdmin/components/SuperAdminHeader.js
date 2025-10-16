// src/apps/SuperAdmin/components/SuperAdminHeader.jsx
import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

const SuperAdminHeader = ({ onMenuClick }) => {
//   const superAdmin = JSON.parse(localStorage.getItem('superAdmin') || '{}');

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {/* {superAdmin.name || 'Admin'} */}
              </p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SuperAdminHeader;