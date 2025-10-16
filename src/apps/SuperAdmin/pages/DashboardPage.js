// src/apps/SuperAdmin/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Users, Building2, DollarSign, TrendingUp, 
  Activity, CheckCircle, Clock, Crown, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get(
        `${API_URL}/api/super-admin/analytics/dashboard`, 
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const revenue = stats?.revenue || {};
  const topTenants = stats?.topTenants || [];
  const tenantsByStatus = stats?.growth?.tenantsByStatus || [];

  const statCards = [
    {
      title: 'Total Tenants',
      value: overview.totalTenants || 0,
      icon: Building2,
      color: 'blue',
      change: `+${overview.newTenantsThisMonth || 0} this month`,
      link: '/super-admin/tenants'
    },
    {
      title: 'Total Users',
      value: overview.totalUsers || 0,
      icon: Users,
      color: 'green',
      change: `${overview.activeUsers || 0} active`,
      link: '/super-admin/tenants'
    },
    {
      title: 'Monthly Revenue',
      value: `$${revenue.totalMonthlyRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'purple',
      change: `$${revenue.estimatedYearlyRevenue?.toLocaleString() || 0}/year`,
      link: '/super-admin/subscriptions'
    },
    {
      title: 'Total Expenses',
      value: overview.totalExpenses || 0,
      icon: Activity,
      color: 'orange',
      change: 'All time',
      link: '/super-admin/analytics'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitor your entire platform at a glance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Performing Tenants */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Top Performing Tenants
            </h3>
            <Link 
              to="/super-admin/tenants"
              className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {topTenants.length > 0 ? (
              topTenants.slice(0, 5).map((tenant, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tenant.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tenant.userCount} users · {tenant.expenseCount} expenses
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs font-medium rounded-full capitalize">
                    {tenant.plan}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No tenants yet
              </div>
            )}
          </div>
        </div>

        {/* Tenant Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Tenant Status
          </h3>
          <div className="space-y-3">
            {tenantsByStatus.length > 0 ? (
              tenantsByStatus.map((status, index) => {
                const total = tenantsByStatus.reduce((sum, s) => sum + s.count, 0);
                const percentage = Math.round((status.count / total) * 100);
                
                const statusConfig = {
                  active: { icon: CheckCircle, color: 'green', bg: 'bg-green-100', text: 'text-green-800' },
                  trial: { icon: Clock, color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-800' },
                  suspended: { icon: AlertCircle, color: 'red', bg: 'bg-red-100', text: 'text-red-800' },
                  cancelled: { icon: AlertCircle, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-800' }
                };
                
                const config = statusConfig[status._id] || statusConfig.active;
                const Icon = config.icon;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className={`w-4 h-4 text-${config.color}-600`} />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {status._id}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {status.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-${config.color}-500 transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-400">
                No status data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Revenue by Plan
          </h3>
          <Link 
            to="/super-admin/subscriptions"
            className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Manage plans
          </Link>
        </div>
        
        {revenue.byPlan && revenue.byPlan.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {revenue.byPlan.map((plan, index) => {
              const planColors = {
                free: { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'text-gray-400' },
                basic: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-400' },
                premium: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-400' },
                enterprise: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-400' }
              };
              
              const colors = planColors[plan._id] || planColors.free;
              
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg ${colors.bg} dark:bg-gray-700`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Crown className={`w-5 h-5 ${colors.icon}`} />
                    <span className={`text-xs font-bold ${colors.text} dark:text-gray-300`}>
                      {plan.count} tenants
                    </span>
                  </div>
                  <p className={`text-sm font-medium ${colors.text} dark:text-gray-300 capitalize mb-1`}>
                    {plan._id}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${plan.monthlyRevenue || 0}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            No revenue data available
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/super-admin/tenants"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <Building2 className="w-8 h-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Add New Tenant</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create a new organization</p>
          </Link>
          
          <Link
            to="/super-admin/analytics"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <Activity className="w-8 h-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">View Analytics</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed insights & reports</p>
          </Link>
          
          <Link
            to="/super-admin/subscriptions"
            className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
          >
            <Crown className="w-8 h-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Manage Plans</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure subscription plans</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;