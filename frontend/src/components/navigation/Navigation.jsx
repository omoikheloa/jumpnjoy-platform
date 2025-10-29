import React, { useState } from 'react';

const Navigation = ({ user, currentView, setCurrentView, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'safety', label: 'Safety Check', icon: '���️', roles: ['owner', 'staff'] },
    { key: 'incident', label: 'Incident Report', icon: '⚠️', roles: ['owner', 'staff'] },
    { key: 'shift', label: 'Staff Shift', icon: '⏰', roles: ['owner', 'staff'] },
    { key: 'cleaning', label: 'Cleaning Log', icon: '���', roles: ['owner', 'staff'] },
    { key: 'stats', label: 'Daily Stats', icon: '���', roles: ['owner', 'staff'] },
    { key: 'dashboard', label: 'Dashboard', icon: '���', roles: ['owner'] },
  ];

  // Filter navigation items based on user role
  const availableNavItems = navItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo and User Info */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Jump 'n Joy</h1>
            </div>
            <div className="hidden md:block">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-gray-900">{user.first_name || user.username}</span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {availableNavItems.map(item => (
              <button
                key={item.key}
                onClick={() => setCurrentView(item.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === item.key
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Logout Button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onLogout}
              className="btn-danger"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="mb-4 px-2">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{user.first_name || user.username}</span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </div>
            </div>
            <div className="space-y-1 px-2">
              {availableNavItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => {
                    setCurrentView(item.key);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === item.key
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              ))}
              <button
                onClick={onLogout}
                className="w-full btn-danger mt-4"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
