// components/layouts/EmployeeLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavigationSidebar from '../EmployeeDashboard/EmployeeDashboard';
import TopHeader from '../EmployeeDashboard/EmployeeDashboard';

const EmployeeLayout = ({ user, onLogout, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation items for the layout
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'manager', 'staff', 'employee'] },
    { id: 'safety', label: 'Safety', icon: AlertCircle, roles: ['admin', 'manager', 'safety_officer'] },
    { id: 'incidents', label: 'Incidents', icon: FileText, roles: ['admin', 'manager'] },
    { id: 'cleaning', label: 'Cleaning', icon: Users, roles: ['admin', 'manager', 'cleaning_staff'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar, roles: ['admin', 'manager'] },
    { id: 'cafe', label: 'Cafe', icon: Coffee, roles: ['admin', 'manager', 'cafe_staff'] },
  ];

  const handleNavigation = (sectionId) => {
    switch (sectionId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'cafe':
        navigate('/forms/cafe');
        break;
      // Add other navigation cases as needed
      default:
        navigate('/dashboard');
    }
  };

  // Determine active section based on current route
  const getActiveSection = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'dashboard';
    if (path.includes('/forms/cafe')) return 'cafe';
    if (path.includes('/forms/safety')) return 'safety';
    if (path.includes('/forms/incident')) return 'incidents';
    if (path.includes('/forms/cleaning')) return 'cleaning';
    if (path.includes('/forms/stats')) return 'reports';
    if (path.includes('/forms/shift')) return 'scheduling';
    if (path.includes('/forms/appraisal')) return 'appraisals';
    if (path.includes('/forms/waivers')) return 'waivers';
    return 'dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationSidebar 
        activeSection={getActiveSection()}
        setActiveSection={handleNavigation}
        onLogout={onLogout}
        navigationItems={navigationItems}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        user={user}
      />

      <div className={`transition-all duration-300 ${
        isCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        <TopHeader 
          onSearchClick={() => {/* implement search */}}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          user={user}
          onLogout={onLogout}
        />

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;