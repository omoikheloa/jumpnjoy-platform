import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard/EmployeeDashboard';
import StaffAppraisalForm from './components/forms/StaffAppraisalForm';
import StaffAppraisalList from './components/appraisals/StaffAppraisalList';
import CafeChecklistView from './components/forms/CafeChecklistsView';
import WaiverDashboard from '../src/components/forms/WaiverDashboard';
import PublicWaiverSigning from '../src/components/forms/PublicWaiverSigning';

function App() {
  const [user, setUser] = useState(null);

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

  return (
    <Router>
      <Routes>
        {/* Login Page */}
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />
          }
        />

        {/* Role-aware Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard onLogout={handleLogout} user={user} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Appraisal Form (only logged in users) */}
        <Route
          path="/appraisals/new"
          element={
            user
              ? <StaffAppraisalForm />
              : <Navigate to="/" replace />
          }
        />

        <Route 
          path="/checklists/view" 
          element={<CafeChecklistView />} 
        />

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center h-screen">
              <h1 className="text-xl font-bold">404 – Page Not Found</h1>
            </div>
          }
        />
        <Route path="/waiver-dashboard" element={<WaiverDashboard />} />
        <Route path="/waiver/:token" element={<PublicWaiverSigning />} />
      </Routes>
    </Router>
  );
}

export default App;