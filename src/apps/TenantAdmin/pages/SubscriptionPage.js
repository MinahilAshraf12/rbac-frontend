// src/apps/TenantAdmin/pages/SubscriptionPage.jsx
import React, { useState } from 'react';
import { Crown, Check, TrendingUp, Users, FileText, HardDrive, AlertCircle } from 'lucide-react';
import { useTenant } from '../../../contexts/TenantContext';
import { useSubscription } from '../../../contexts/SubscriptionContext';
import { motion } from 'framer-motion';

const SubscriptionPage = () => {
  const { tenant } = useTenant();
 const { subscription, usage, checkLimit, upgradePlan } = useSubscription();
  const [, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for trying out',
      limits: { maxUsers: 5, maxExpenses: 100, storageLimit: 1 },
      features: [
        '5 Team Members',
        '100 Expenses per month',
        '1GB Storage',
        'Basic Reports',
        'Email Support'
      ]
    },
    {
      name: 'Basic',
      price: 29,
      description: 'For small teams',
      limits: { maxUsers: 25, maxExpenses: 1000, storageLimit: 10 },
      features: [
        '25 Team Members',
        '1,000 Expenses per month',
        '10GB Storage',
        'Advanced Reports',
        'Priority Email Support',
        'Custom Categories'
      ],
      popular: true
    },
    {
      name: 'Premium',
      price: 79,
      description: 'For growing businesses',
      limits: { maxUsers: 100, maxExpenses: -1, storageLimit: 50 },
      features: [
        '100 Team Members',
        'Unlimited Expenses',
        '50GB Storage',
        'Advanced Analytics',
        'Priority Support',
        'Custom Branding',
        'API Access'
      ]
    },
    {
      name: 'Enterprise',
      price: 199,
      description: 'For large organizations',
      limits: { maxUsers: -1, maxExpenses: -1, storageLimit: 200 },
      features: [
        'Unlimited Team Members',
        'Unlimited Expenses',
        '200GB Storage',
        'White Label',
        'Dedicated Support',
        'Custom Integrations',
        'SLA Guarantee',
        'Advanced Security'
      ]
    }
  ];

  const userLimit = checkLimit('user');
  const expenseLimit = checkLimit('expense');
  const storagePercent = usage?.storageUsed 
    ? Math.round((usage.storageUsed / (subscription?.limits?.storageLimit || 1024)) * 100)
    : 0;

  const currentPlan = plans.find(p => p.name.toLowerCase() === tenant?.plan?.toLowerCase()) || plans[0];

  const handleUpgrade = async (plan) => {
  if (plan.name.toLowerCase() === tenant?.plan?.toLowerCase()) {
    return;
  }
  
  setSelectedPlan(plan);
  
  // Show confirmation
  const confirmed = window.confirm(
    `Upgrade to ${plan.name} plan for $${plan.price}/month?\n\n` +
    `You will get:\n` +
    plan.features.slice(0, 3).join('\n')
  );
  
  if (!confirmed) {
    setSelectedPlan(null);
    return;
  }
  
  // Call upgrade API
  const result = await upgradePlan(plan.name.toLowerCase());
  
  if (result.success) {
    alert(`✅ ${result.message}`);
    window.location.reload(); // Reload to show new limits
  } else {
    alert(`❌ ${result.message}`);
  }
  
  setSelectedPlan(null);
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Subscription & Billing
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your subscription plan and usage
        </p>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Current Plan: {currentPlan.name}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {currentPlan.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ${currentPlan.price}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Users */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Users</span>
              </div>
              <span className="text-sm text-gray-500">
                {userLimit.current}/{userLimit.limit === -1 ? '∞' : userLimit.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  userLimit.percentage > 90 ? 'bg-red-500' :
                  userLimit.percentage > 75 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(userLimit.percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {userLimit.remaining === Infinity ? 'Unlimited' : `${userLimit.remaining} remaining`}
            </div>
          </div>

          {/* Expenses */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">Expenses</span>
              </div>
              <span className="text-sm text-gray-500">
                {expenseLimit.current}/{expenseLimit.limit === -1 ? '∞' : expenseLimit.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  expenseLimit.percentage > 90 ? 'bg-red-500' :
                  expenseLimit.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(expenseLimit.percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {expenseLimit.remaining === Infinity ? 'Unlimited' : `${expenseLimit.remaining} remaining`}
            </div>
          </div>

          {/* Storage */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900 dark:text-white">Storage</span>
              </div>
              <span className="text-sm text-gray-500">
                {(usage?.storageUsed || 0).toFixed(0)}MB/{subscription?.limits?.storageLimit || 1024}MB
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  storagePercent > 90 ? 'bg-red-500' :
                  storagePercent > 75 ? 'bg-yellow-500' : 'bg-purple-500'
                }`}
                style={{ width: `${Math.min(storagePercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {storagePercent}% used
            </div>
          </div>
        </div>

        {/* Warning if near limit */}
        {(userLimit.percentage > 80 || expenseLimit.percentage > 80) && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                  Approaching Plan Limits
                </h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  You're using over 80% of your plan's resources. Consider upgrading to avoid interruptions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Available Plans
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.02 }}
              className={`relative border-2 rounded-lg p-6 ${
                plan.popular
                  ? 'border-blue-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700'
              } ${
                plan.name.toLowerCase() === tenant?.plan?.toLowerCase()
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleUpgrade(plan)}
                disabled={plan.name.toLowerCase() === tenant?.plan?.toLowerCase()}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.name.toLowerCase() === tenant?.plan?.toLowerCase()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700'
                    : plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                }`}
              >
                {plan.name.toLowerCase() === tenant?.plan?.toLowerCase()
                  ? 'Current Plan'
                  : 'Upgrade Now'}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enterprise Contact */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Contact our sales team for custom pricing, dedicated support, and features tailored to your organization's needs.
            </p>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;