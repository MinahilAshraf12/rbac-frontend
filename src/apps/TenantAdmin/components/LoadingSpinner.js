import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Shield className="w-8 h-8 text-white" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-semibold text-gray-900 dark:text-white mb-2"
        >
          Loading Dashboard
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 dark:text-gray-400"
        >
          Please wait while we set things up...
        </motion.p>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mt-6 h-1 bg-primary-600 rounded-full mx-auto max-w-xs"
        />
      </div>
    </div>
  );
};

export default LoadingSpinner;