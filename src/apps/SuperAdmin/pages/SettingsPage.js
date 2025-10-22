// src/apps/SuperAdmin/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'https://rbac-dashboard-2.onrender.com' || 'http://localhost:5000';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [superAdmin, setSuperAdmin] = useState(null);
//   const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('superAdmin');
    if (stored) {
      setSuperAdmin(JSON.parse(stored));
    }
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account and system preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            {activeTab === 'profile' && <ProfileTab superAdmin={superAdmin} />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
            {activeTab === 'system' && <SystemTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Profile Tab
const ProfileTab = ({ superAdmin }) => {
  const [formData, setFormData] = useState({
    name: superAdmin?.name || '',
    email: superAdmin?.email || '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.put(
        `${API_URL}/api/super-admin/auth/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        localStorage.setItem('superAdmin', JSON.stringify(response.data.data));
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Information
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="+92 300 1234567"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{loading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
};

// Security Tab
const SecurityTab = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.put(
        `${API_URL}/api/super-admin/auth/change-password`,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Password changed successfully');
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                required
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          <Lock className="w-5 h-5" />
          <span>{loading ? 'Changing...' : 'Change Password'}</span>
        </button>
      </div>
    </form>
  );
};

// Notifications Tab
const NotificationsTab = () => {
  const [settings, setSettings] = useState({
    emailNewTenant: true,
    emailPaymentSuccess: true,
    emailPaymentFailed: true,
    emailUsageAlert: true,
    emailWeeklyReport: false,
    emailMonthlyReport: true
  });

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = () => {
    toast.success('Notification preferences saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Email Notifications
        </h3>
        
        <div className="space-y-4">
          <NotificationToggle
            label="New Tenant Registration"
            description="Receive email when a new tenant signs up"
            checked={settings.emailNewTenant}
            onChange={() => handleToggle('emailNewTenant')}
          />
          <NotificationToggle
            label="Payment Success"
            description="Receive email when a payment is successful"
            checked={settings.emailPaymentSuccess}
            onChange={() => handleToggle('emailPaymentSuccess')}
          />
          <NotificationToggle
            label="Payment Failed"
            description="Receive email when a payment fails"
            checked={settings.emailPaymentFailed}
            onChange={() => handleToggle('emailPaymentFailed')}
          />
          <NotificationToggle
            label="Usage Alerts"
            description="Receive email when tenants approach limits"
            checked={settings.emailUsageAlert}
            onChange={() => handleToggle('emailUsageAlert')}
          />
          <NotificationToggle
            label="Weekly Reports"
            description="Receive weekly summary report"
            checked={settings.emailWeeklyReport}
            onChange={() => handleToggle('emailWeeklyReport')}
          />
          <NotificationToggle
            label="Monthly Reports"
            description="Receive monthly analytics report"
            checked={settings.emailMonthlyReport}
            onChange={() => handleToggle('emailMonthlyReport')}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Save className="w-5 h-5" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
};

// System Tab
const SystemTab = () => {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowSignups: true,
    requireEmailVerification: true,
    defaultTrialDays: 14
  });

  const handleSave = () => {
    toast.success('System settings saved');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Settings
        </h3>
        
        <div className="space-y-4">
          <NotificationToggle
            label="Maintenance Mode"
            description="Put the platform in maintenance mode"
            checked={settings.maintenanceMode}
            onChange={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
          />
          <NotificationToggle
            label="Allow New Signups"
            description="Allow new tenants to register"
            checked={settings.allowSignups}
            onChange={() => setSettings({ ...settings, allowSignups: !settings.allowSignups })}
          />
          <NotificationToggle
            label="Email Verification Required"
            description="Require email verification for new signups"
            checked={settings.requireEmailVerification}
            onChange={() => setSettings({ ...settings, requireEmailVerification: !settings.requireEmailVerification })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Trial Period (days)
            </label>
            <input
              type="number"
              value={settings.defaultTrialDays}
              onChange={(e) => setSettings({ ...settings, defaultTrialDays: parseInt(e.target.value) })}
              min="0"
              max="90"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

// Helper Component
const NotificationToggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <div className="flex-1">
      <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
    </div>
    <button
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export default SettingsPage;