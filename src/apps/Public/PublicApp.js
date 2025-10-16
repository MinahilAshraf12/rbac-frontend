// src/apps/Public/PublicApp.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LandingPage from './pages/LandingPage';
import TenantSignup from './pages/TenantSignup';
import TenantLogin from './pages/TenantLogin';
import PricingPage from './pages/PricingPage';
import FeaturesPage from './pages/FeaturesPage';

const PublicApp = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<TenantSignup />} />
      <Route path="/login" element={<TenantLogin />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicApp;