// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const ProtectedRoute = ({ user, children, allowedRoles = [] }) => {
  // Redirect to login if no user
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. 
            Please contact an administrator if you believe this is an error.
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>Your role: <span className="font-medium capitalize">{user.role}</span></p>
            <p>Required roles: {allowedRoles.join(', ')}</p>
          </div>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-block"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;