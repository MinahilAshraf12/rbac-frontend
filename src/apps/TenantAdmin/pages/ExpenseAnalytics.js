import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  // Calendar,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Filter,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import {
  // LineChart,
  // Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  // BarChart,
  // Bar,
  Area,
  AreaChart,
  Pie
} from 'recharts';
import api from '../../../config/api';
import { useTenant } from '../../../contexts/TenantContext';

// const API_URL = process.env.REACT_APP_API_URL;
// const API_URL = 'http://localhost:5000'; 

const ExpenseAnalytics = () => {
  const navigate = useNavigate();
   const { tenant } = useTenant(); // ✅ Get tenant from context
  const { slug } = useParams(); // ✅ Get slug from URL
   // ✅ Use slug from params or tenant context
  const currentSlug = slug || tenant?.slug;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    period: 'month',
    category: '',
    user: '',
    startDate: '',
    endDate: ''
  });

  const periodOptions = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last Month' },
    { value: '6months', label: 'Last 6 Months' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const chartColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

 

  const fetchAnalytics = useCallback(async (showRefreshing = false) => {
  try {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    // ✅ Use api.js instead of axios
    const response = await api.get(
      `/api/expenses/analytics?${params.toString()}`
    );

    setAnalytics(response.data.data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Set empty analytics if error
    setAnalytics({
      summary: { totalAmount: 0, totalCount: 0, avgAmount: 0, amountChange: 0, countChange: 0 },
      previousPeriod: { totalAmount: 0, totalCount: 0 },
      trendData: [],
      expensesByCategory: [],
      expensesByStatus: [],
      topSpenders: []
    });
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [filters]); // ✅ Remove getAuthHeaders dependency

const fetchCategories = useCallback(async () => {
  try {
    // ✅ Use api.js instead of axios
    const response = await api.get('/api/categories/simple');
    setCategories(response.data.data || response.data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    setCategories([]);
  }
}, []); // ✅ Remove getAuthHeaders dependency

const fetchUsers = useCallback(async () => {
  try {
    // ✅ Use api.js instead of axios
    const response = await api.get('/api/expenses/users');
    setUsers(response.data.data || response.data || []);
  } catch (error) {
    console.error('Error fetching users:', error);
    setUsers([]);
  }
}, []); // ✅ Remove getAuthHeaders dependency

  // Initial load
  useEffect(() => {
    Promise.all([fetchCategories(), fetchUsers()]);
  }, [fetchCategories, fetchUsers]);

  // Refetch analytics when filters change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    fetchAnalytics(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value || 0);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatMonthYear = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
  };

  const getChangeIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (change < 0) return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 sm:mt-6 text-blue-600 dark:text-blue-400 text-base sm:text-lg font-medium">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.summary.totalCount === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center p-4">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No expense data available</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">Start by adding some expenses to see analytics</p>
          <button
            onClick={() => navigate(`/tenant/${currentSlug}/add-expense`)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add Your First Expense
          </button>
        </div>
      </div>
    );
  }

  const trendChartData = analytics.trendData.map(item => ({
    date: filters.period === 'week' || filters.period === 'month' ? formatDate(item._id) : formatMonthYear(item._id),
    amount: item.totalAmount,
    count: item.count,
    average: item.avgAmount
  }));

  const categoryChartData = analytics.expensesByCategory.map((item, index) => ({
    name: item.name,
    value: item.totalAmount,
    count: item.count,
    fill: chartColors[index % chartColors.length]
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/tenant/${currentSlug}/dashboard`)}
                className="p-2 hover:bg-white/20 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  Expense Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Real-time insights and trends for your expenses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button 
               onClick={() => navigate(`/tenant/${currentSlug}/dashboard`)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <span className="hidden sm:inline">View All</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Period
              </label>
              <select
                value={filters.period}
                onChange={(e) => handleFilterChange('period', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* User Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User
              </label>
              <select
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Users</option>
                {users.map(user => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Date Range Button */}
            {filters.period === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="px-2 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(analytics.summary.totalAmount)}
                </p>
                <div className="flex items-center mt-2 space-x-1">
                  {getChangeIcon(analytics.summary.amountChange)}
                  <span className={`text-sm ${getChangeColor(analytics.summary.amountChange)}`}>
                    {analytics.summary.amountChange > 0 ? '+' : ''}{analytics.summary.amountChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {analytics.summary.totalCount}
                </p>
                <div className="flex items-center mt-2 space-x-1">
                  {getChangeIcon(analytics.summary.countChange)}
                  <span className={`text-sm ${getChangeColor(analytics.summary.countChange)}`}>
                    {analytics.summary.countChange > 0 ? '+' : ''}{analytics.summary.countChange.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Amount</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {formatCurrency(analytics.summary.avgAmount)}
                </p>
                <div className="flex items-center mt-2 space-x-1">
                  <Activity className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">per expense</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {analytics.topSpenders.length}
                </p>
                <div className="flex items-center mt-2 space-x-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">spenders</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Grid */}
        {trendChartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Trend Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Expense Trends</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                </div>
              </div>
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#6B7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6B7280"
                      fontSize={12}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'amount' ? formatCurrency(value) : value,
                        name === 'amount' ? 'Amount' : 'Count'
                      ]}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{
                        backgroundColor: '#F9FAFB',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Category Distribution */}
            {categoryChartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Expenses by Category
                </h3>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatCurrency(value), 'Amount']}
                        contentStyle={{
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Bottom Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Spenders */}
          {analytics.topSpenders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Top Spenders
              </h3>
              <div className="space-y-3">
                {analytics.topSpenders.slice(0, 5).map((spender) => (
                  <div key={spender._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {spender._id.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{spender._id}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {spender.expenseCount} expenses
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(spender.totalSpent)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Avg: {formatCurrency(spender.avgExpense)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Category Breakdown */}
          {analytics.expensesByCategory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Category Breakdown
              </h3>
              <div className="space-y-3">
                {analytics.expensesByCategory.slice(0, 5).map((category, index) => (
                  <div key={category._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: chartColors[index % chartColors.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(category.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {category.count} expenses
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Period Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Period Comparison
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Period</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(analytics.summary.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Previous Period</span>
                <span className="text-lg font-bold text-gray-600 dark:text-gray-400">
                  {formatCurrency(analytics.previousPeriod.totalAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Change</span>
                <div className="flex items-center gap-1">
                  {getChangeIcon(analytics.summary.amountChange)}
                  <span className={`text-lg font-bold ${getChangeColor(analytics.summary.amountChange)}`}>
                    {analytics.summary.amountChange > 0 ? '+' : ''}{analytics.summary.amountChange.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Status Overview if available */}
        {analytics.expensesByStatus.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Expense Status Distribution
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {analytics.expensesByStatus.map((status) => {
                const percentage = ((status.count / analytics.summary.totalCount) * 100).toFixed(1);
                const statusColors = {
                  pending: 'bg-yellow-500',
                  completed: 'bg-green-500',
                  cancelled: 'bg-red-500'
                };
                
                return (
                  <div key={status._id} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`w-12 h-12 ${statusColors[status._id] || 'bg-gray-500'} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">{status.count}</span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize mb-1">
                      {status._id}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {percentage}% of total
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(status.totalAmount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Actions
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your expenses and view detailed reports
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigate(`/tenant/${currentSlug}/add-expense`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Add Expense
              </button>
              <button 
                onClick={() => navigate(`/tenant/${currentSlug}/expenses`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                View All Expenses
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Data Summary Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>
            Showing data for {periodOptions.find(p => p.value === filters.period)?.label || 'selected period'}
            {filters.category && ` • Category: ${categories.find(c => c._id === filters.category)?.name}`}
            {filters.user && ` • User: ${filters.user}`}
            • Last updated: {new Date().toLocaleTimeString()}
          </p>
          {refreshing && (
            <p className="mt-1 text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-3 h-3 animate-spin inline mr-1" />
              Updating data...
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ExpenseAnalytics;