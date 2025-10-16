// src/utils/subscriptionUtils.js
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const calculatePercentage = (current, limit) => {
  if (limit === -1) return 0;
  return Math.min(100, Math.round((current / limit) * 100));
};

export const getUsageColor = (percentage) => {
  if (percentage >= 90) return 'text-red-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-green-600';
};

export const getLimitText = (limit) => {
  return limit === -1 ? 'Unlimited' : limit.toLocaleString();
};