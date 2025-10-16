// src/apps/SuperAdmin/components/TenantDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, Building2, Users, FileText, HardDrive, 
  Calendar, Crown, Globe, Mail,  Activity 
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const TenantDetailsModal = ({ tenant, onClose, onEdit }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (tenant) {
      fetchTenantDetails();
    }
  },[tenant]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get(
        `${API_URL}/api/super-admin/tenants/${tenant._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setDetails(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch tenant details');
    } finally {
      setLoading(false);
    }
  };

  if (!tenant) return null;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'usage', label: 'Usage & Stats', icon: Activity },
    { id: 'settings', label: 'Settings', icon: Crown }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
              <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {tenant.name}
              </h2>
              <p className="text-sm text-gray-500">{tenant.slug}.i-expense.ikftech.com</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex space-x-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab details={details} />}
              {activeTab === 'usage' && <UsageTab details={details} />}
              {activeTab === 'settings' && <SettingsTab details={details} />}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
          <button
            onClick={() => {
              onEdit(tenant);
              onClose();
            }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Edit Tenant
          </button>
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ details }) => (
  <div className="space-y-6">
    {/* Basic Info */}
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Basic Information
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          icon={Building2}
          label="Organization"
          value={details.name}
        />
        <InfoCard
          icon={Globe}
          label="Subdomain"
          value={`${details.slug}.i-expense.ikftech.com`}
        />
        <InfoCard
          icon={Crown}
          label="Plan"
          value={details.plan.toUpperCase()}
          badge={true}
        />
        <InfoCard
          icon={Calendar}
          label="Status"
          value={details.status}
          status={details.status}
        />
        <InfoCard
          icon={Calendar}
          label="Created"
          value={new Date(details.createdAt).toLocaleDateString()}
        />
        <InfoCard
          icon={Calendar}
          label="Trial Ends"
          value={details.trialEndDate 
            ? new Date(details.trialEndDate).toLocaleDateString()
            : 'N/A'}
        />
      </div>
    </div>

    {/* Custom Domain */}
    {details.customDomain && (
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Custom Domain
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {details.customDomain}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            details.domainVerified
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {details.domainVerified ? 'Verified' : 'Pending Verification'}
          </span>
        </div>
      </div>
    )}

    {/* Owner Info */}
    {details.owner && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Owner Information
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {details.owner.name}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {details.owner.email}
                </span>
                {details.owner.lastLogin && (
                  <span>
                    Last login: {new Date(details.owner.lastLogin).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);

// Usage Tab Component
const UsageTab = ({ details }) => {
  const getPercentage = (current, limit) => {
    if (limit === -1) return 0;
    return Math.min(100, Math.round((current / limit) * 100));
  };

  const getColorClass = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      {/* Usage Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Users */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">Users</span>
            </div>
            <span className="text-sm text-gray-500">
              {details.stats?.users?.total || 0}/{details.settings?.maxUsers === -1 ? '∞' : details.settings?.maxUsers}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getColorClass(getPercentage(details.stats?.users?.total, details.settings?.maxUsers))}`}
              style={{ width: `${getPercentage(details.stats?.users?.total, details.settings?.maxUsers)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {details.stats?.users?.active || 0} active
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-900 dark:text-white">Expenses</span>
            </div>
            <span className="text-sm text-gray-500">
              {details.stats?.expenses?.total || 0}/{details.settings?.maxExpenses === -1 ? '∞' : details.settings?.maxExpenses}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getColorClass(getPercentage(details.stats?.expenses?.total, details.settings?.maxExpenses))}`}
              style={{ width: `${getPercentage(details.stats?.expenses?.total, details.settings?.maxExpenses)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            ${(details.stats?.expenses?.totalAmount || 0).toFixed(2)} total
          </p>
        </div>

        {/* Storage */}
        <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <HardDrive className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-gray-900 dark:text-white">Storage</span>
            </div>
            <span className="text-sm text-gray-500">
              {(details.stats?.storage?.used || 0).toFixed(0)}MB/{details.stats?.storage?.limit}MB
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${getColorClass(getPercentage(details.stats?.storage?.used, details.stats?.storage?.limit))}`}
              style={{ width: `${getPercentage(details.stats?.storage?.used, details.stats?.storage?.limit)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {getPercentage(details.stats?.storage?.used, details.stats?.storage?.limit)}% used
          </p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={details.stats?.users?.total || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Active Users"
          value={details.stats?.users?.active || 0}
          icon={Users}
          color="green"
        />
        <StatCard
          label="Categories"
          value={details.stats?.categories || 0}
          icon={FileText}
          color="purple"
        />
        <StatCard
          label="Avg Expense"
          value={`$${(details.stats?.expenses?.avgAmount || 0).toFixed(2)}`}
          icon={FileText}
          color="orange"
        />
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ details }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Subscription Settings
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Max Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {details.settings?.maxUsers === -1 ? '∞' : details.settings?.maxUsers}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Max Expenses</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {details.settings?.maxExpenses === -1 ? '∞' : details.settings?.maxExpenses}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Storage Limit</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {details.settings?.storageLimit}MB
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Plan</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
            {details.plan}
          </p>
        </div>
      </div>
    </div>

    {/* Features */}
    {details.settings?.features && details.settings.features.length > 0 && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {details.settings.features.map((feature, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium"
            >
              {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
);

// Helper Components
const InfoCard = ({ icon: Icon, label, value, badge, status }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        {badge ? (
          <span className="inline-block px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-bold">
            {value}
          </span>
        ) : status ? (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
            status === 'active' ? 'bg-green-100 text-green-800' :
            status === 'suspended' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {value}
          </span>
        ) : (
          <p className="font-medium text-gray-900 dark:text-white truncate">{value}</p>
        )}
      </div>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
    <div className="flex items-center justify-between mb-2">
      <Icon className={`w-5 h-5 text-${color}-500`} />
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </div>
);

export default TenantDetailsModal;