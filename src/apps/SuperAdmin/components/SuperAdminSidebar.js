// src/apps/SuperAdmin/components/SuperAdminSidebar.jsx
import React from 'react';
import { Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, BarChart3, 
  CreditCard, Shield, LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SuperAdminSidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', path: '/super-admin/dashboard', icon: LayoutDashboard },
    { name: 'Tenants', path: '/super-admin/tenants', icon: Building2 },
    { name: 'Analytics', path: '/super-admin/analytics', icon: BarChart3 },
    { name: 'Subscriptions', path: '/super-admin/subscriptions', icon: CreditCard },
     { name: 'Settings', path: '/super-admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    localStorage.removeItem('superAdmin');
    toast.success('Logged out successfully');
    navigate('/super-admin/login');
  };

  return (
    <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-indigo-900 to-purple-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-6 border-b border-indigo-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-lg">Super Admin</h1>
              <p className="text-xs text-indigo-200">Control Panel</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-indigo-900 shadow-lg'
                  : 'hover:bg-indigo-800 text-indigo-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {isOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-indigo-800">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-indigo-800 text-indigo-100 w-full transition-all"
        >
          <LogOut className="w-5 h-5" />
          {isOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default SuperAdminSidebar;