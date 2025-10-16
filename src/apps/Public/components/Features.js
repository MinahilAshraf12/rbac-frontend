// src/apps/Public/components/Features.jsx
import React from 'react';
import { TrendingUp, Users, Shield } from 'lucide-react';

const Features = () => {
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
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
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
  );
};

export default Features;