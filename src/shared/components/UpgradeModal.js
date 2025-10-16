// src/shared/components/UpgradeModal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check } from 'lucide-react';

const UpgradeModal = ({ isOpen, onClose, currentPlan = 'free', limitType }) => {
  if (!isOpen) return null;

  const plans = [
    {
      name: 'Basic',
      price: 29,
      limits: { users: 25, expenses: 1000, storage: 10 },
      features: ['25 Users', '1,000 Expenses/month', '10GB Storage', 'Basic Reports', 'Email Support']
    },
    {
      name: 'Premium',
      price: 79,
      limits: { users: 100, expenses: -1, storage: 50 },
      features: ['100 Users', 'Unlimited Expenses', '50GB Storage', 'Advanced Analytics', 'Priority Support', 'Custom Branding'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 199,
      limits: { users: -1, expenses: -1, storage: 200 },
      features: ['Unlimited Users', 'Unlimited Expenses', '200GB Storage', 'White Label', 'Dedicated Support', 'Custom Integrations', 'SLA Guarantee']
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upgrade Your Plan</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  You've reached your {limitType} limit. Choose a plan that fits your needs.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`relative border-2 rounded-lg p-6 ${
                      plan.popular
                        ? 'border-blue-500 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                        <span className="text-gray-600 dark:text-gray-400">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`w-full py-3 rounded-lg font-medium transition-colors ${
                        plan.popular
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                      }`}
                    >
                      {currentPlan === plan.name.toLowerCase() ? 'Current Plan' : 'Upgrade Now'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3">
                  <Crown className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">Need a custom solution?</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Contact our sales team for custom pricing and features tailored to your organization.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;