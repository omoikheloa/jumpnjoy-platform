import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, FileText, Clock, DollarSign, Calendar, User, Settings, LogOut } from "lucide-react";
import apiService from "../../services/api";

const Sidebar = ({ activeSection, setActiveSection, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await apiService.logout(); // clears token + user from storage
      if (onLogout) {
        onLogout();
      }
      navigate("/login"); // redirect to login screen
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'timesheet', label: 'Timesheet', icon: Clock },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

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
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;