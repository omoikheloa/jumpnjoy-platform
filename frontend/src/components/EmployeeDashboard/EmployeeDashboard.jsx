import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Home,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Heart,
  Coffee
} from 'lucide-react';
import MaintenanceForm from '../forms/MaintenanceForm';
import SafetyCheckForm from '../forms/SafetyCheckForm';
import IncidentReportForm from '../forms/IncidentReportForm';
import CleaningForm from '../forms/CleaningForm';
import DailyStatsForm from '../forms/DailyStatsForm';
import StaffAppraisalForm from '../forms/StaffAppraisalForm';
import ShiftForm from '../forms/ShiftForm';
import CafeChecklistForm from '../forms/CafeChecklistForm';
import TopHeader from './Header';
import QuickActions from './QuickActions';
import WaiverSigning from '../forms/WaiverSigning';

// Navigation Sidebar Component
const NavigationSidebar = ({ activeSection, setActiveSection, onLogout, navigationItems }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-10">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Employee Portal</h1>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === item.id 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

// Top Header Component
<TopHeader />

// Welcome Banner Component
const WelcomeBanner = ({ userName = "Jenna" }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-blue-100 text-lg">How are you today? Ready to make it a productive day?</p>
        </div>
      </div>
    </div>
  );
};

// Quick Actions Component
<QuickActions />

// Recent Activity Component
const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => {
          const IconComponent = activity.icon;
          return (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50">
              <div className={`p-2 rounded-lg ${
                activity.type === 'success' ? 'bg-green-100 text-green-600' : 
                activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                'bg-gray-100 text-gray-600'
              }`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{activity.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-2">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Today's Schedule Component
const TodaysSchedule = ({ scheduleItems }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
      <div className="space-y-3">
        {scheduleItems.map((item, index) => (
          <div key={index} className={`flex items-center space-x-3 p-3 ${item.bgColor} rounded-lg`}>
            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
            <div>
              <h3 className="font-medium text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Forms List Component
const FormsList = ({ formLinks, setSelectedForm }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Forms & Requests</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formLinks.map((form) => (
          <div key={form.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <FileText className={`w-8 h-8 ${form.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-xs px-2 py-1 rounded ${
                form.status === 'active' 
                  ? 'text-green-600 bg-green-100' 
                  : 'text-gray-500 bg-gray-100'
              }`}>
                {form.status === 'active' ? 'Available' : 'Coming Soon'}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{form.label}</h3>
            <p className="text-gray-600 text-sm mb-4">{form.description}</p>
            <button 
              onClick={() => form.status === 'active' ? setSelectedForm(form.id) : null}
              className={`w-full py-2 px-4 rounded-lg font-medium ${
                form.status === 'active'
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
              disabled={form.status !== 'active'}
            >
              {form.status === 'active' ? 'Open Form' : 'Coming Soon'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Form Container Component
const FormContainer = ({ selectedForm, setSelectedForm, children }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button 
          onClick={() => setSelectedForm(null)}
          className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
        >
          ← Back to Forms
        </button>
      </div>
      {children}
    </div>
  );
};

// Placeholder Section Component
const PlaceholderSection = ({ icon: IconComponent, title, description }) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
      <IconComponent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Main Dashboard Content Component
const DashboardContent = ({ formLinks, setActiveSection, setSelectedForm, recentActivities, scheduleItems }) => {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <QuickActions 
        formLinks={formLinks} 
        setActiveSection={setActiveSection} 
        setSelectedForm={setSelectedForm} 
      />
      <RecentActivity activities={recentActivities} />
      <TodaysSchedule scheduleItems={scheduleItems} />
    </div>
  );
};

// Form Components
<MaintenanceForm />,
<SafetyCheckForm />,
<IncidentReportForm />,
<CleaningForm />,
<DailyStatsForm />,
<ShiftForm />

// Main Employee Dashboard Component
const EmployeeDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'cafe-checklists', label: 'Cafe Checklists', icon: Coffee },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const formLinks = [
    { id: 'maintenance-form', label: 'Maintenance Log', description: 'Log equipment maintenance activities', status: 'active' },
    { id: 'safety-check', label: 'Safety Inspection', description: 'Daily safety checks for trampolines', status: 'active' },
    { id: 'daily-inspection', label: 'Daily Inspection', description: 'Inspections on equipment on a day to day basis', status: 'active' },
    { id: 'expense-report', label: 'Expense Report', description: 'File expense claims', status: 'active' },
    { id: 'performance-review', label: 'Performance Review', description: 'Self-assessment forms', status: 'active' },
    { id: 'incident-report', label: 'Incident Report', description: 'Report workplace incidents', status: 'active' },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'Leave Request Approved',
      description: 'Your vacation request for Dec 20-25 has been approved',
      time: '2 hours ago',
      type: 'success',
      icon: Calendar
    },
    {
      id: 2,
      title: 'Cafe Opening Checklist Completed',
      description: 'All 6 items completed for today\'s opening checklist',
      time: '4 hours ago',
      type: 'success',
      icon: Coffee
    },
    {
      id: 3,
      title: 'Expense Report Pending',
      description: 'Your expense report #ER-2025-001 is under review',
      time: '1 day ago',
      type: 'warning',
      icon: DollarSign
    },
    {
      id: 4,
      title: 'Training Completed',
      description: 'Successfully completed "Workplace Safety" training',
      time: '3 days ago',
      type: 'success',
      icon: Users
    }
  ];

  const scheduleItems = [
    {
      title: 'Cafe Opening Checklist',
      time: '8:00 AM - 8:30 AM',
      icon: Coffee,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600'
    },
    {
      title: 'Team Meeting',
      time: '10:00 AM - 11:00 AM',
      icon: Clock,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Project Review',
      time: '2:00 PM - 3:30 PM',
      icon: Users,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: 'Training Session',
      time: '4:00 PM - 5:00 PM',
      icon: Calendar,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const renderForms = () => {
    // If a specific form is selected, render it
    if (selectedForm === 'maintenance-form') {
      return (
        <FormContainer selectedForm={selectedForm} setSelectedForm={setSelectedForm}>
          <MaintenanceForm />
        </FormContainer>
      );
    }
    
    if (selectedForm === 'safety-check') {
      return (
        <FormContainer selectedForm={selectedForm} setSelectedForm={setSelectedForm}>
          <SafetyCheckForm />
        </FormContainer>
      );
    }

    if (selectedForm === 'daily-inspection') {
      return (
        <FormContainer selectedForm={selectedForm} setSelectedForm={setSelectedForm}>
          <IncidentReportForm />
        </FormContainer>
      );
    }

    if (selectedForm === 'expense-report') {
      return (
        <FormContainer selectedForm={selectedForm} setSelectedForm={setSelectedForm}>
          <StaffAppraisalForm />
        </FormContainer>
      );
    }

    if (selectedForm === 'performance-review') {
      return (
        <FormContainer selectedForm={selectedForm} setSelectedForm={setSelectedForm}>
          <WaiverSigning />
        </FormContainer>
      );
    }


    // Default forms listing
    return <FormsList formLinks={formLinks} setSelectedForm={setSelectedForm} />;
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <DashboardContent 
            formLinks={formLinks} 
            setActiveSection={setActiveSection} 
            setSelectedForm={setSelectedForm}
            recentActivities={recentActivities}
            scheduleItems={scheduleItems}
          />
        );
      case 'forms':
        return renderForms();
      case 'cafe-checklists':
        return <CafeChecklistForm />;
      case 'profile':
        return <PlaceholderSection icon={User} title="Profile Management" description="Update your personal information and preferences." />;
      case 'settings':
        return <PlaceholderSection icon={Settings} title="Settings" description="Configure your account settings and preferences." />;
      default:
        return (
          <DashboardContent 
            formLinks={formLinks} 
            setActiveSection={setActiveSection} 
            setSelectedForm={setSelectedForm}
            recentActivities={recentActivities}
            scheduleItems={scheduleItems}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        navigationItems={navigationItems}
      />

      <div className="ml-64">
        <TopHeader 
          showProfileDropdown={showProfileDropdown}
          setShowProfileDropdown={setShowProfileDropdown}
          onLogout={onLogout}
          userName="Jenna"
        />

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;