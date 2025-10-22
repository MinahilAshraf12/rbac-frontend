// src/apps/SuperAdmin/pages/AnalyticsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Users, DollarSign, Activity,
  Download, RefreshCw, Calendar, Crown
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'https://rbac-dashboard-2.onrender.com' || 'http://localhost:5000';

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      
      const [dashboardRes, revenueRes, tenantRes] = await Promise.all([
        axios.get(`${API_URL}/api/super-admin/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/super-admin/analytics/revenue?period=12m`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/super-admin/analytics/tenants?period=${timeRange}&limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setAnalytics({
        dashboard: dashboardRes.data.data,
        revenue: revenueRes.data.data,
        tenants: tenantRes.data.data
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, fetchAnalytics]);

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('superAdminToken');
      const response = await axios.get(
        `${API_URL}/api/super-admin/analytics/export?type=tenants&format=csv`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Analytics exported successfully');
    } catch (error) {
      toast.error('Failed to export analytics');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Extract data from API responses
  const overview = analytics?.dashboard?.overview || {};
  const revenue = analytics?.revenue?.current || {};
  const revenueHistory = analytics?.revenue?.history || [];
  const topTenants = analytics?.dashboard?.topTenants || [];
  const revenueByPlan = revenue?.revenueByPlan || [];

  // Format plan distribution for pie chart
  const planDistribution = revenueByPlan.map(plan => {
    const colors = {
      free: '#6B7280',
      basic: '#3B82F6', 
      premium: '#8B5CF6',
      enterprise: '#F59E0B'
    };
    
    return {
      name: plan.plan.charAt(0).toUpperCase() + plan.plan.slice(1),
      value: plan.tenantCount,
      color: colors[plan.plan] || '#6B7280'
    };
  });

  // Growth data
  const tenantGrowth = analytics?.dashboard?.growth?.tenantGrowth || [];
  const growthData = tenantGrowth.map(item => ({
    date: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    tenants: item.count
  }));

  const metrics = [
    {
      label: 'Total MRR',
      value: `$${revenue?.totalMonthlyRevenue || 0}`,
      change: '+12.5%',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Active Tenants',
      value: overview?.activeTenants || 0,
      change: `+${overview?.newTenantsThisMonth || 0} this month`,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Total Users',
      value: overview?.totalUsers || 0,
      change: `${overview?.activeUsers || 0} active`,
      icon: Users,
      color: 'purple'
    },
    {
      label: 'Total Expenses',
      value: overview?.totalExpenses || 0,
      change: 'All time',
      icon: Activity,
      color: 'orange'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time platform performance and insights
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button
            onClick={fetchAnalytics}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {metric.value}
                </p>
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {metric.change}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/20`}>
                <metric.icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Revenue Trends (Last 12 Months)
            </h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          {revenueHistory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No revenue data available
            </div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Plan Distribution
          </h3>
          {planDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {planDistribution.map((plan, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: plan.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.name}: {plan.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No plan data available
            </div>
          )}
        </div>

        {/* Tenant Growth */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Daily Tenant Registrations (Last 30 Days)
          </h3>
          {growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="tenants" fill="#10B981" radius={[8, 8, 0, 0]} name="New Tenants" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No growth data available
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Tenants */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Top Performing Tenants
          </h3>
        </div>
        <div className="overflow-x-auto">
          {topTenants.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Users
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Expenses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topTenants.map((tenant, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                          <Crown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {tenant.name}
                          </p>
                          <p className="text-xs text-gray-500">{tenant.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 text-xs font-medium rounded capitalize">
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {tenant.userCount}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {tenant.expenseCount}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                      ${tenant.totalAmount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                        tenant.status === 'active' ? 'bg-green-100 text-green-800' :
                        tenant.status === 'trial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tenant.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-400">
              No tenant data available yet. Create some tenants to see analytics!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;