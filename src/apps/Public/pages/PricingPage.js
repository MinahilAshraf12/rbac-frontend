// src/apps/Public/pages/PricingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      features: [
        '5 users',
        '100 expenses per month',
        '1GB storage',
        'Basic reporting',
        'Email support'
      ],
      cta: 'Get Started',
      highlighted: false
    },
    {
      name: 'Basic',
      price: 29,
      period: 'month',
      description: 'Great for small teams',
      features: [
        '25 users',
        '1,000 expenses per month',
        '10GB storage',
        'Advanced reporting',
        'Priority email support',
        'Custom categories'
      ],
      cta: 'Start Free Trial',
      highlighted: true
    },
    {
      name: 'Premium',
      price: 79,
      period: 'month',
      description: 'For growing businesses',
      features: [
        '100 users',
        'Unlimited expenses',
        '50GB storage',
        'Advanced analytics',
        'Priority support',
        'Custom categories',
        'API access',
        'Custom integrations'
      ],
      cta: 'Start Free Trial',
      highlighted: false
    },
    {
      name: 'Enterprise',
      price: 199,
      period: 'month',
      description: 'For large organizations',
      features: [
        'Unlimited users',
        'Unlimited expenses',
        '200GB storage',
        'Advanced analytics',
        'Dedicated support',
        'Custom categories',
        'API access',
        'Custom integrations',
        'SSO & SAML',
        'Custom domain'
      ],
      cta: 'Contact Sales',
      highlighted: false
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
            <Link to="/features" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
              Features
            </Link>
            <Link to="/login" className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose the plan that works best for your business. Start with a 14-day free trial.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 ${
                plan.highlighted
                  ? 'ring-2 ring-indigo-600 shadow-2xl scale-105'
                  : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-2">
                    /{plan.period}
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                  plan.highlighted
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <FAQItem
              question="Can I change my plan later?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
            />
            <FAQItem
              question="Is there a free trial?"
              answer="Yes, all paid plans come with a 14-day free trial. No credit card required."
            />
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, debit cards, and PayPal."
            />
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. No questions asked."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Ready to get started?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Start your 14-day free trial today. No credit card required.
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

const FAQItem = ({ question, answer }) => (
  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
      {question}
    </h3>
    <p className="text-gray-600 dark:text-gray-400">
      {answer}
    </p>
  </div>
);

export default PricingPage;