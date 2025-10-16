// src/apps/Public/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, Users, Shield } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Track Expenses',
      description: 'Monitor all your expenses in real-time with detailed analytics'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Manage multiple users with role-based access control'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your data is encrypted and stored securely'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">i-Expense</div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/features" className="text-gray-600 hover:text-primary-600">Features</Link>
            <Link to="/pricing" className="text-gray-600 hover:text-primary-600">Pricing</Link>
            <Link to="/login" className="text-gray-600 hover:text-primary-600">Login</Link>
            <Link 
              to="/signup" 
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Manage Expenses
            <br />
            <span className="text-primary-600">The Smart Way</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Powerful expense management for modern businesses. Track, manage, and analyze your expenses effortlessly.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-semibold text-lg"
            >
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            14-day free trial • No credit card required
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage expenses
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful features built for modern teams
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of businesses managing their expenses smarter
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold text-lg shadow-lg"
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2025 i-Expense. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;