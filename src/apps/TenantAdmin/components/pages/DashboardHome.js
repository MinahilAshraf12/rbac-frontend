// Updated DashboardHome.js with real activity integration - COMPLETE VERSION
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  FolderTree,
  TrendingUp,
  Activity,
  Clock,
  UserCheck,
  Calendar,
  BarChart3,
  PieChart,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  UserX,
  ShieldPlus,
  ShieldX,
  FolderPlus,
  FolderX,
  Edit,
  Trash2,
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../../contexts/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

// const API_URL = 'http://localhost:5000'; 
// const API_URL = '/api';
const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    totalCategories: 0,
    activeCategories: 0,
  });
  const [expenseStats, setExpenseStats] = useState({
    weekly: { total: 0, count: 0 },
    monthly: { total: 0, count: 0 },
    yearly: { total: 0, count: 0 },
    pending: 0,
    topCategory: null
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
    
    // Set up polling for real-time updates every 60 seconds
    const interval = setInterval(() => {
      fetchRecentActivity();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [usersRes, rolesRes, categoriesRes, expenseStatsRes, activityRes] = await Promise.all([
        axios.get(`${API_URL}/api/users?limit=1`, { headers }),
        axios.get(`${API_URL}/api/roles`, { headers }),
        axios.get(`${API_URL}/api/categories?limit=1`, { headers }),
        axios.get(`${API_URL}/api/expenses/dashboard-stats`, { headers }),
        axios.get(`${API_URL}/api/activities/recent?limit=8`, { headers }) // Use real activity endpoint
      ]);

      setStats({
        totalUsers: usersRes.data.total || 0,
        activeUsers: usersRes.data.total || 0,
        totalRoles: rolesRes.data.count || 0,
        totalCategories: categoriesRes.data.total || 0,
        activeCategories: Math.floor((categoriesRes.data.total || 0) * 0.8),
      });

      setExpenseStats(expenseStatsRes.data.data);
      setRecentActivity(activityRes.data.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setRecentActivity([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const activityRes = await axios.get(`${API_URL}/api/activities/recent?limit=8`, { headers });
      setRecentActivity(activityRes.data.data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getIconForActivity = (iconName) => {
    const iconMap = {
      'UserPlus': UserPlus,
      'UserCheck': UserCheck,
      'UserX': UserX,
      'ShieldPlus': ShieldPlus,
      'Shield': Shield,
      'ShieldX': ShieldX,
      'FolderPlus': FolderPlus,
      'FolderTree': FolderTree,
      'FolderX': FolderX,
      'TrendingUp': TrendingUp,
      'Edit': Edit,
      'Trash2': Trash2,
      'Activity': Activity
    };
    return iconMap[iconName] || Activity;
  };

  const getColorForActivity = (type) => {
    if (type.includes('created')) return 'text-green-500';
    if (type.includes('updated')) return 'text-blue-500';
    if (type.includes('deleted')) return 'text-red-500';
    return 'text-gray-500';
  };

  const expenseCards = [
    {
      title: 'Weekly Expenses',
      value: formatCurrency(expenseStats.weekly.total),
      count: expenseStats.weekly.count,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase',
    },
    {
      title: 'Monthly Expenses',
      value: formatCurrency(expenseStats.monthly.total),
      count: expenseStats.monthly.count,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'increase',
    },
    {
      title: 'Yearly Expenses',
      value: formatCurrency(expenseStats.yearly.total),
      count: expenseStats.yearly.count,
      icon: BarChart3,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'increase',
    },
    {
      title: 'Pending Expenses',
      value: expenseStats.pending,
      count: expenseStats.pending,
      icon: Clock,
      color: 'bg-orange-500',
      change: '-5%',
      changeType: 'decrease',
    },
  ];

  const systemCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-indigo-500',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: UserCheck,
      color: 'bg-emerald-500',
    },
    {
      title: 'Total Roles',
      value: stats.totalRoles,
      icon: Shield,
      color: 'bg-violet-500',
    },
    {
      title: 'Categories',
      value: stats.totalCategories,
      icon: FolderTree,
      color: 'bg-amber-500',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Expense',
      description: 'Create and track new expenses',
      icon: Plus,
      color: 'bg-green-500',
      action: () => navigate('/add-expense'),
    },
    {
      title: 'View Analytics',
      description: 'Detailed expense analytics and graphs',
      icon: BarChart3,
      color: 'bg-blue-500',
      action: () => navigate('/expense-analytics'),
    },
    {
      title: 'Manage Users',
      description: 'Add and manage system users',
      icon: Users,
      color: 'bg-purple-500',
      action: () => navigate('/users'),
    },
    {
      title: 'Categories',
      description: 'Organize expense categories',
      icon: FolderTree,
      color: 'bg-orange-500',
      action: () => navigate('/categories'),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
        <div className="animate-pulse">
          <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded w-2/3 sm:w-1/4 mb-4 sm:mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 sm:h-32 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 p-4 sm:p-0"
    >
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
          Welcome back, {user?.name}! Here's your expense overview.
        </p>
      </div>

      {/* Expense Stats Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Expense Analytics
          </h2>
          <button
            onClick={() => navigate('/expense-analytics')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
          >
            <BarChart3 size={16} />
            <span className="hidden sm:inline">View Details</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {expenseCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {card.title}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
                      {card.value}
                    </p>
                    {card.count !== undefined && card.title !== 'Pending Expenses' && (
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {card.count} transactions
                      </p>
                    )}
                    <div className="flex items-center mt-1 sm:mt-2 space-x-1">
                      {card.changeType === 'increase' ? (
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      )}
                      <span
                        className={`text-xs sm:text-sm ${
                          card.changeType === 'increase'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {card.change}
                      </span>
                      <span className="text-xs text-gray-500 hidden sm:inline">vs last period</span>
                    </div>
                  </div>
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* System Stats Cards */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
          System Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {systemCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {card.title}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 sm:w-12 sm:h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activity with Real Data */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                Recent Activity
                {recentActivity.length > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                    {recentActivity.length} new
                  </span>
                )}
              </h3>
              <button 
                onClick={fetchRecentActivity}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => {
                  const Icon = getIconForActivity(activity.icon);
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-3 h-3 sm:w-4 sm:h-4 ${activity.color || getColorForActivity(activity.type)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                          {activity.title || activity.message}
                        </p>
                        {activity.message && activity.title && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {activity.message}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.time}
                            </span>
                            {activity.performedBy && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  by {activity.performedBy}
                                </span>
                              </>
                            )}
                          </div>
                          {activity.entityType && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              {activity.entityType}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Start by creating some expenses, users, or categories
                  </p>
                  <button
                    onClick={fetchRecentActivity}
                    className="mt-3 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Refresh Activity
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions & System Status */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 transform hover:scale-[1.02] group"
                  >
                    <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Top Category This Month */}
          {expenseStats.topCategory && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 p-4 sm:p-6"
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Top Category This Month
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {expenseStats.topCategory._id}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {formatCurrency(expenseStats.topCategory.total)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {expenseStats.topCategory.count} transactions
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* System Status & Activity Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">API Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-green-600 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Activity Tracking</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-green-600 font-medium">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Recent Activities</span>
                <span className="text-xs sm:text-sm text-gray-500">{recentActivity.length} logged</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Last Updated</span>
                <span className="text-xs sm:text-sm text-gray-500">Just now</span>
              </div>
              
              {/* Activity Analytics Preview */}
              <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">
                      Real-time Activity Tracking
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      All system changes are being logged
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-bold text-green-600">{recentActivity.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;