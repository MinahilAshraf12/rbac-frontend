// src/shared/components/UsageLimitWarning.jsx
import React from 'react';
import { AlertTriangle, Crown } from 'lucide-react';

const UsageLimitWarning = ({ feature, current, limit, percentage, onUpgrade }) => {
  const getColorClass = () => {
    if (percentage >= 90) return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
    if (percentage >= 75) return 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
  };

  const getTextColor = () => {
    if (percentage >= 90) return 'text-red-800 dark:text-red-200';
    if (percentage >= 75) return 'text-yellow-800 dark:text-yellow-200';
    return 'text-blue-800 dark:text-blue-200';
  };

  if (percentage < 75) return null;

  return (
    <div className={`border rounded-lg p-4 ${getColorClass()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${getTextColor()}`} />
          <div>
            <h4 className={`font-medium ${getTextColor()}`}>
              {percentage >= 90 ? 'Limit Almost Reached' : 'Approaching Limit'}
            </h4>
            <p className={`text-sm mt-1 ${getTextColor()}`}>
              You're using {current} of {limit} {feature}s ({percentage}% of your plan limit)
            </p>
          </div>
        </div>
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span>Upgrade</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UsageLimitWarning;