import React, { useState, useEffect, useCallback } from 'react'; // UPDATED
import { Crown,  Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
// import toast from 'react-hot-toast';

const API_URL = 'https://rbac-dashboard-2.onrender.com' || 'http://localhost:5000';

const SubscriptionsPage = () => {
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => { // WRAPPED
    try {
      setLoading(true);
      const token = localStorage.getItem('superAdminToken');
      
      const [plansRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/super-admin/subscriptions/plans`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/super-admin/subscriptions/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setPlans(plansRes.data.data || getDefaultPlans());
      setStats(statsRes.data.data || getDefaultStats());
    } catch (error) {
      console.error('Error fetching data:', error);
      setPlans(getDefaultPlans());
      setStats(getDefaultStats());
    } finally {
      setLoading(false);
    }
  }, []); // ADDED

  useEffect(() => {
    fetchData();
  }, [fetchData]); // UPDATED


  const getDefaultPlans = () => [
    { 
      _id: '1',
      name: 'Free', 
      slug: 'free',
      price: { monthly: 0 }, 
      limits: { users: 5, expenses: 100, storage: 1024 },
      features: ['file_uploads'],
      isActive: true
    },
    { 
      _id: '2',
      name: 'Basic', 
      slug: 'basic',
      price: { monthly: 29 }, 
      limits: { users: 25, expenses: 1000, storage: 10240 },
      features: ['file_uploads', 'custom_categories', 'advanced_analytics'],
      isActive: true
    },
    { 
      _id: '3',
      name: 'Premium', 
      slug: 'premium',
      price: { monthly: 79 }, 
      limits: { users: 100, expenses: -1, storage: 51200 },
      features: ['file_uploads', 'custom_categories', 'advanced_analytics', 'api_access'],
      isActive: true
    },
    { 
      _id: '4',
      name: 'Enterprise', 
      slug: 'enterprise',
      price: { monthly: 199 }, 
      limits: { users: -1, expenses: -1, storage: 204800 },
      features: ['file_uploads', 'custom_categories', 'advanced_analytics', 'api_access', 'priority_support'],
      isActive: true
    }
  ];

  const getDefaultStats = () => ({
    totalRevenue: 12450,
    activeSubscriptions: 127,
    trialUsers: 23,
    churnRate: 2.3,
    byPlan: [
      { _id: 'free', count: 45, revenue: 0 },
      { _id: 'basic', count: 62, revenue: 1798 },
      { _id: 'premium', count: 18, revenue: 1422 },
      { _id: 'enterprise', count: 2, revenue: 398 }
    ]
  });

  const getPlanColor = (slug) => {
    const colors = {
      free: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
      basic: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
      premium: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
      enterprise: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' }
    };
    return colors[slug] || colors.free;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage plans, pricing, and features
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            <Plus className="w-5 h-5" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          label="Total MRR"
          value={`$${stats?.totalRevenue || 0}`}
          change="+12.5%"
          color="green"
        />
        <StatCard
          label="Active Subscriptions"
          value={stats?.activeSubscriptions || 0}
          change="+8.2%"
          color="blue"
        />
        <StatCard
          label="Trial Users"
          value={stats?.trialUsers || 0}
          change="+15.3%"
          color="purple"
        />
        <StatCard
          label="Churn Rate"
          value={`${stats?.churnRate || 0}%`}
          change="-2.1%"
          color="red"
          isNegativeGood={true}
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const colors = getPlanColor(plan.slug);
          const planStats = stats?.byPlan?.find(p => p._id === plan.slug);
          
          return (
            <div
              key={plan._id}
              className={`bg-white dark:bg-gray-800 p-6 rounded-xl border-2 ${colors.border} dark:border-gray-700 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <Crown className="w-8 h-8 text-gray-400" />
                <span className={`px-3 py-1 ${colors.bg} ${colors.text} text-xs font-bold rounded-full`}>
                  {planStats?.count || 0} tenants
                </span>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {plan.name}
              </h3>
              
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                ${plan.price?.monthly || 0}
                <span className="text-sm text-gray-500">/mo</span>
              </p>

              <div className="mt-4 space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Users:</strong> {plan.limits?.users === -1 ? '∞' : plan.limits?.users}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Expenses:</strong> {plan.limits?.expenses === -1 ? '∞' : plan.limits?.expenses}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Storage:</strong> {plan.limits?.storage === -1 ? '∞' : `${Math.round(plan.limits?.storage / 1024)}GB`}
                </div>
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {plan.features.length} features included
                  </p>
                </div>
              )}

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <Trash2 className="w-4 h-4 mx-auto text-red-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Distribution */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Plan Distribution
        </h3>
        <div className="space-y-3">
          {stats?.byPlan?.map((plan) => {
            const total = stats.byPlan.reduce((sum, p) => sum + p.count, 0);
            const percentage = Math.round((plan.count / total) * 100);
            const colors = getPlanColor(plan._id);
            
            return (
              <div key={plan._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {plan._id}
                  </span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {plan.count} tenants
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${plan.revenue}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colors.bg}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, change, color, isNegativeGood = false }) => {
  const isPositive = change.startsWith('+');
  const shouldBeGreen = isNegativeGood ? !isPositive : isPositive;
  
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
        {label}
      </p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <p className={`text-sm mt-2 ${shouldBeGreen ? 'text-green-600' : 'text-red-600'}`}>
        {change} from last month
      </p>
    </div>
  );
};

export default SubscriptionsPage;