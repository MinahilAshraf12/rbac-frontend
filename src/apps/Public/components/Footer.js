// src/apps/Public/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        {/* Company */}
        <div>
          <h3 className="text-white font-bold text-lg mb-4">i-Expense</h3>
          <p className="text-sm">
            Modern expense management for businesses of all sizes.
          </p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-2">
            <li>
              <Link to="/features" className="hover:text-white transition-colors">
                Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-white transition-colors">
                Pricing
              </Link>
            </li>
            <li>
              <Link to="/signup" className="hover:text-white transition-colors">
                Sign Up
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-2">
            <li>
              <a href="/" className="hover:text-white transition-colors">
                About Us
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Contact
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="/" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-4">Contact</h4>
          <ul className="space-y-2">
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4" />
              <span>support@i-expense.com</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4" />
              <span>+92 300 1234567</span>
            </li>
            <li className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Lahore, Pakistan</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 text-center text-sm">
        <p>&copy; 2025 i-Expense. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;