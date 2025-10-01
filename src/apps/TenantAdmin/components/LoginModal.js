import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const LoginModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      onClose();
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: 'admin@example.com',
      password: 'admin123',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 py-4 sm:p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden max-h-[95vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-6 sm:px-6 sm:py-8">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">Welcome Back</h2>
            <p className="text-sm sm:text-base text-primary-100">Sign in to your admin dashboard</p>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                  placeholder="Enter your email"
                  autoComplete="email"
                  inputMode="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 sm:pl-10 pr-10 sm:pr-10 py-3 sm:py-3 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 -m-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            {/* Demo Credentials */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">
                Demo Credentials:
              </p>
              <div className="text-xs text-blue-600 dark:text-blue-400 mb-2 space-y-1">
                <div>Email: admin@example.com</div>
                <div>Password: admin123</div>
              </div>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline font-medium"
              >
                Tap to fill demo credentials
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 sm:py-3 px-4 rounded-lg transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed text-sm sm:text-base min-h-[48px] sm:min-h-[52px] touch-manipulation"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Need help? Contact your administrator
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginModal;