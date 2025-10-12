import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard';
import DashboardLayout from './components/layouts/DashboardLayout';
import StaffAppraisalForm from './components/forms/StaffAppraisalForm';
import StaffAppraisalList from './components/appraisals/StaffAppraisalList';
import CafeChecklistForm from './components/forms/CafeChecklistForm';
import CafeChecklistView from './components/forms/CafeChecklistsView';
import WaiverDashboard from './components/forms/WaiverDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import IncidentReportForm from './components/forms/IncidentReportForm';
import IncidentList from './components/forms/IncidentList';
import SafetyCheckForm from './components/forms/SafetyCheckForm';
import MaintenanceForm from './components/forms/MaintenanceForm';
import ShiftForm from './components/forms/ShiftForm';

// Component to handle the root route redirection logic
function RootRedirect({ user, isAdmin, onLogin }) {
  const location = useLocation();
  
  // If user is already logged in and tries to access root,
  // redirect them to their appropriate dashboard but preserve any intended path
  if (user) {
    // If user was trying to access a specific path but got redirected to root,
    // send them back to their intended path
    const from = location.state?.from?.pathname;
    
    if (from) {
      return <Navigate to={from} replace />;
    }
    
    // Otherwise redirect to appropriate dashboard based on role
    return isAdmin ? 
      <Navigate to="/dashboard" replace /> : 
      <Navigate to="/employee/dashboard" replace />;
  }
  
  return <Login onLogin={onLogin} />;
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore user from localStorage on refresh
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Check if user is admin
  const isAdmin = user && ['admin', 'owner'].includes(user.role);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Login Page - Only show if not logged in */}
        <Route
          path="/"
          element={<RootRedirect user={user} isAdmin={isAdmin} onLogin={handleLogin} />}
        />

        {/* Admin Dashboard (separate from layout) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'owner']}>
              <Dashboard onLogout={handleLogout} user={user} />
            </ProtectedRoute>
          }
        />

        {/* Employee Routes with Persistent Layout */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
              <DashboardLayout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          {/* Employee Dashboard Home */}
          <Route index element={<EmployeeDashboard user={user} onLogout={handleLogout} />} />
          <Route path="dashboard" element={<EmployeeDashboard user={user} onLogout={handleLogout} />} />

          {/* Cafe Checklists */}
          <Route 
            path="cafe" 
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <CafeChecklistForm />
              </ProtectedRoute>
            } 
          />

          {/* Maintenance Log */}
          <Route
            path="maintenance"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <MaintenanceForm />
              </ProtectedRoute>
            }
          />

          {/* Safety Inspection */}
          <Route
            path="safety"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <SafetyCheckForm />
              </ProtectedRoute>
            }
          />

          {/* Incident Reports - Updated Routes */}
          <Route
            path="incidents"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <IncidentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="incidents/new"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <IncidentReportForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="incidents/:id"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <IncidentReportForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="incidents/:id/edit"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <IncidentReportForm />
              </ProtectedRoute>
            }
          />

          {/* Shift Management */}
          <Route
            path="shift"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <ShiftForm />
              </ProtectedRoute>
            }
          />

          {/* Waiver Dashboard */}
          <Route
            path="waivers"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager', 'cafe']}>
                <WaiverDashboard />
              </ProtectedRoute>
            }
          />

          {/* Staff Appraisal */}
          <Route
            path="appraisal"
            element={
              <ProtectedRoute user={user} allowedRoles={['admin', 'manager']}>
                <StaffAppraisalForm />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Legacy /forms routes - redirect to /employee */}
        <Route path="/forms/cafe" element={<Navigate to="/employee/cafe" replace />} />
        <Route path="/forms/maintenance" element={<Navigate to="/employee/maintenance" replace />} />
        <Route path="/forms/safety" element={<Navigate to="/employee/safety" replace />} />
        <Route path="/forms/incident" element={<Navigate to="/employee/incidents" replace />} />
        <Route path="/forms/shift" element={<Navigate to="/employee/shift" replace />} />
        <Route path="/forms/waivers" element={<Navigate to="/employee/waivers" replace />} />
        <Route path="/forms/appraisal" element={<Navigate to="/employee/appraisal" replace />} />

        {/* Additional Routes */}
        <Route 
          path="/checklists/view" 
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'manager']}>
              <CafeChecklistView />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/appraisals"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'manager']}>
              <StaffAppraisalList />
            </ProtectedRoute>
          }
        />

        {/* Incident routes for admin dashboard */}
        <Route
          path="/incidents"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'owner']}>
              <IncidentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/new"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'owner']}>
              <IncidentReportForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/incidents/:id"
          element={
            <ProtectedRoute user={user} allowedRoles={['admin', 'owner']}>
              <IncidentReportForm />
            </ProtectedRoute>
          }
        />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a 
                  href={isAdmin ? "/dashboard" : "/employee/dashboard"} 
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Back to Dashboard
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;