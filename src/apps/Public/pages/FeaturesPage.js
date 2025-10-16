// src/apps/Public/pages/FeaturesPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, Users, Shield, FileText, BarChart3, 
  Clock, Settings, Globe, ArrowRight 
} from 'lucide-react';
import Footer from '../components/Footer';

const FeaturesPage = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Expense Tracking',
      description: 'Track all your expenses in real-time with detailed categorization and receipt management.',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Team Management',
      description: 'Manage multiple users with role-based access control and permissions.',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get insights with powerful analytics and customizable reports.',
      color: 'purple'
    },
    {
      icon: FileText,
      title: 'Receipt Management',
      description: 'Upload and store receipts securely with OCR text extraction.',
      color: 'orange'
    },
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: 'Your data is encrypted and stored with enterprise-grade security.',
      color: 'red'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Get instant notifications and updates on all expense activities.',
      color: 'indigo'
    },
    {
      icon: Settings,
      title: 'Custom Categories',
      description: 'Create custom expense categories tailored to your business needs.',
      color: 'pink'
    },
    {
      icon: Globe,
      title: 'Multi-Currency',
      description: 'Support for multiple currencies with automatic conversion rates.',
      color: 'teal'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            i-Expense
          </Link>
          <nav className="flex items-center space-x-6">
            <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
              Home
            </Link>
            <Link to="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
              Pricing
            </Link>
            <Link to="/login" className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4 text-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Powerful Features for
          <br />
          <span className="text-indigo-600">Modern Businesses</span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Everything you need to manage your expenses efficiently and effectively.
        </p>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/20 rounded-lg flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
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
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Start Managing Expenses Today
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of businesses already using i-Expense
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-lg"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FeaturesPage;