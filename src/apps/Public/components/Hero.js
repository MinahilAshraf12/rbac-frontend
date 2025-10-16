// src/apps/Public/components/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Manage Expenses
          <br />
          <span className="text-indigo-600">The Smart Way</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Powerful expense management for modern businesses. Track, manage, and analyze your expenses effortlessly.
        </p>
        <div className="flex items-center justify-center space-x-4">
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
          >
            <span>Start Free Trial</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
          >
            Sign In
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          14-day free trial • No credit card required
        </p>
      </div>
    </section>
  );
};

export default Hero;