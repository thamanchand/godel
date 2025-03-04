import { User } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AuthModal from '../../components/AuthModal';
import { supabase } from '../../lib/supabase';

interface LandingPageProps {
  user?: User | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ user }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleDashboardClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <section className="relative min-h-screen">
        {/* Gradient Background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-900 via-purple-900 to-blue-900" />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-gradient-x" />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 backdrop-blur-[2px]" />
        </div>

        {/* Header */}
        <header className="relative bg-transparent z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <img src="/src/assets/logo.svg" alt="Logo" className="h-10 w-10 animate-fade-in" />
                <span className="text-xl font-bold text-white">GoDelAI</span>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-200 hover:text-white transition-all hover:scale-105"
                >
                  Features
                </a>
                <a
                  href="#pricing"
                  className="text-gray-200 hover:text-white transition-all hover:scale-105"
                >
                  Pricing
                </a>
                <a
                  href="#contact"
                  className="text-gray-200 hover:text-white transition-all hover:scale-105"
                >
                  Contact
                </a>
                {user ? (
                  <div className="flex items-center space-x-4 animate-fade-in">
                    <span className="text-gray-200">{user.email}</span>
                    <button
                      onClick={handleSignOut}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
                  >
                    Sign In
                  </button>
                )}
              </nav>
              {/* Mobile menu button */}
              <button className="md:hidden bg-gray-100/10 p-2 rounded-lg hover:bg-gray-200/20 transition-colors">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center animate-slide-up">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6">
                Optimize Your
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {' '}
                  Delivery Routes
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-8 max-w-2xl mx-auto">
                Save time and fuel with our intelligent route optimization. Perfect for local
                businesses and delivery services.
              </p>
              <button
                onClick={handleDashboardClick}
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 hover:scale-105 backdrop-blur-sm"
              >
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Route Optimization',
                description: 'Advanced algorithms to find the most efficient routes in seconds.',
                icon: '🚀',
              },
              {
                title: 'Real-time Updates',
                description: 'Adapt to traffic and new orders instantly with live updates.',
                icon: '⚡',
              },
              {
                title: 'Works Offline',
                description: 'Continue working even without internet connection.',
                icon: '🌍',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110 group-hover:rotate-12">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$19',
                features: [
                  'Up to 15 stops per route',
                  'Basic route optimization',
                  '1 driver account',
                ],
                isPopular: false,
              },
              {
                name: 'Professional',
                price: '$49',
                features: [
                  'Up to 50 stops per route',
                  'Advanced optimization',
                  '5 driver accounts',
                  'Route history (30 days)',
                ],
                isPopular: true,
              },
              {
                name: 'Enterprise',
                price: '$99',
                features: [
                  'Unlimited stops',
                  'Premium optimization',
                  '15 driver accounts',
                  'Unlimited history',
                ],
                isPopular: false,
              },
            ].map((plan, index) => (
              <div
                key={index}
                className={`group bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative ${
                  plan.isPopular ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{plan.name}</h3>
                <p className="text-4xl font-bold mb-6 text-blue-600">
                  {plan.price}
                  <span className="text-lg text-gray-500">/mo</span>
                </p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <svg
                        className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => !user && setIsAuthModalOpen(true)}
                  className={`w-full py-3 rounded-lg transition-all duration-300 hover:scale-105 ${
                    plan.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  }`}
                >
                  {user ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
          <p className="text-xl text-gray-600 mb-8">Have questions? We're here to help!</p>
          <a
            href="mailto:support@routeoptimizer.com"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg transition-all hover:scale-105 hover:shadow-lg"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Contact Us
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">GoDelAI</h3>
              <p className="text-sm">Making delivery routes smarter and more efficient.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-blue-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-blue-400 transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#contact" className="hover:text-blue-400 transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-sm text-center">
            © {new Date().getFullYear()} GoDelAI. All rights reserved.
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default LandingPage;
