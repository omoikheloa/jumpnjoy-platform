import React, { useState, useEffect } from 'react';
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
  Coffee,
  CheckCircle,
  XCircle,
  Filter,
  X,
  Pen,
  Menu,
} from 'lucide-react';
import MaintenanceForm from '../forms/MaintenanceForm';
import SafetyCheckForm from '../forms/SafetyCheckForm';
import IncidentReportForm from '../forms/IncidentReportForm';
import CleaningForm from '../forms/CleaningForm';
import DailyStatsForm from '../forms/DailyStatsForm';
import StaffAppraisalForm from '../forms/StaffAppraisalForm';
import ShiftForm from '../forms/ShiftForm';
import CafeChecklistForm from '../forms/CafeChecklistForm';
import QuickActions from './QuickActions';
import WaiverDashboard from '../forms/WaiverDashboard';
import apiService from '../../services/api';

const JumpNJoyLogo = ({ size = "w-8 h-8" }) => (
  <div className={`${size} relative`}>
    <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-yellow-400 to-red-500 rounded-full animate-pulse-gentle"></div>
    <div className="absolute inset-0.5 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full"></div>
    <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center">
      <div className="text-center transform scale-75">
        <div className="text-red-600 font-black text-xs leading-none">JUMP</div>
        <div className="text-red-600 font-black text-sm leading-none">N</div>
        <div className="text-red-600 font-black text-xs leading-none">JOY</div>
      </div>
    </div>
  </div>
);

const NavigationSidebar = ({ activeSection, setActiveSection, onLogout, navigationItems, isCollapsed, setIsCollapsed }) => {
  const user = { first_name: 'John', last_name: 'Doe', role: 'staff' };

  return (
    <>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
      }`}>
        {/* Logo & Header */}
        <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-red-900/20 to-yellow-900/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <JumpNJoyLogo size="w-10 h-10" />
              {!isCollapsed && (
                <div className="animate-slide-in">
                  <h1 className="text-xl font-black bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
                    Jump 'n Joy
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">Employee Portal</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-1 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsCollapsed(true);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group animate-slide-in ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IconComponent className={`w-5 h-5 ${
                  activeSection === item.id ? 'animate-bounce-gentle' : 'group-hover:scale-110'
                } transition-transform duration-300`} />
                {!isCollapsed && (
                  <span className="font-medium animate-slide-in">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 p-4 bg-gray-800 rounded-xl mb-4 animate-slide-in">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-sm text-gray-400 truncate capitalize">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {!isCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

// Search Modal Component
const SearchModal = ({ isOpen, onClose, formLinks }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    formType: 'all',
    dateRange: '7days',
    status: 'all'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && searchTerm.length > 2) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, filters, isOpen]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const results = await apiService.searchCompletedForms({
        query: searchTerm,
        ...filters
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      // Mock data for demonstration
      const mockResults = [
        {
          id: 1,
          type: 'maintenance-form',
          title: 'Trampoline Maintenance - Area B',
          date: '2025-01-15',
          status: 'completed',
          submittedBy: 'John Smith'
        },
        {
          id: 2,
          type: 'safety-check',
          title: 'Daily Safety Inspection',
          date: '2025-01-14',
          status: 'completed',
          submittedBy: 'Sarah Johnson'
        },
        {
          id: 3,
          type: 'incident-report',
          title: 'Minor Injury Report',
          date: '2025-01-13',
          status: 'pending_review',
          submittedBy: 'Mike Davis'
        }
      ].filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(mockResults);
    }
    setLoading(false);
  };

  const getFormIcon = (type) => {
    const iconMap = {
      'maintenance-form': Settings,
      'safety-check': AlertCircle,
      'incident-report': FileText,
      'cleaning-form': CheckCircle,
      'daily-stats': BarChart3,
      'staff-appraisal': Users,
      'shift-form': Clock,
      'cafe-checklists': Coffee,
      'waiver-dashboard': Pen,
    };
    return iconMap[type] || FileText;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'completed': 'text-green-600 bg-green-100',
      'pending_review': 'text-yellow-600 bg-yellow-100',
      'draft': 'text-gray-600 bg-gray-100'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Search Completed Forms</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search forms by title, content, or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <select
              value={filters.formType}
              onChange={(e) => setFilters({...filters, formType: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Forms</option>
              <option value="maintenance-form">Maintenance</option>
              <option value="safety-check">Safety Checks</option>
              <option value="incident-report">Incident Reports</option>
              <option value="cleaning-form">Cleaning</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="all">All time</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending_review">Pending Review</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {!loading && searchTerm.length <= 2 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Type at least 3 characters to search</p>
            </div>
          )}

          {!loading && searchTerm.length > 2 && searchResults.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No forms found matching your search criteria</p>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((result) => {
                const IconComponent = getFormIcon(result.type);
                return (
                  <div key={result.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{result.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Submitted by {result.submittedBy} on {new Date(result.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(result.status)}`}>
                        {result.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EnhancedTopHeader = ({ onSearchClick, isCollapsed, setIsCollapsed }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const user = useState(apiService.getCurrentUser());

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          
          <button
            onClick={onSearchClick}
            className="flex-1 max-w-xl flex items-center space-x-3 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 text-left group"
          >
            <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="text-gray-500 group-hover:text-gray-700">Search forms...</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded hidden sm:inline">Ctrl+K</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <span className="font-medium text-gray-900 hidden sm:inline">{user.first_name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-down">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors">
                  Notifications
                </button>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Welcome Banner Component
const WelcomeBanner = () => {
  const [user] = useState(apiService.getCurrentUser());
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-3xl p-8 text-white shadow-xl animate-slide-down overflow-hidden relative">
      {/* Animated background circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24 animate-float-delayed"></div>
      
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur rounded-2xl flex items-center justify-center animate-bounce-gentle">
            <JumpNJoyLogo size="w-12 h-12" />
          </div>
          <div>
            <h1 className="text-4xl font-black mb-2">{getGreeting()}, {user.first_name}!</h1>
            <p className="text-yellow-100 text-lg">Ready to make today amazing?</p>
          </div>
        </div>
        <div className="hidden lg:block text-right">
          <div className="text-2xl font-bold">{currentTime.toLocaleTimeString()}</div>
          <div className="text-yellow-100">{currentTime.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
        </div>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities, loading }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse flex items-start space-x-4 p-3">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No recent activity</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};

const TodaysSchedule = ({ scheduleItems, loading }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse flex items-center space-x-3 p-3">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : scheduleItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No scheduled items for today</p>
        </div>
      ) : (
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
      )}
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
const DashboardContent = ({ formLinks, setActiveSection, setSelectedForm, recentActivities, scheduleItems, loading }) => {
  return (
    <div className="space-y-6">
      <WelcomeBanner />
      <QuickActions 
        formLinks={formLinks} 
        setActiveSection={setActiveSection} 
        setSelectedForm={setSelectedForm} 
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity activities={recentActivities} loading={loading.activities} />
        <TodaysSchedule scheduleItems={scheduleItems} loading={loading.schedule} />
      </div>
    </div>
  );
};

// Main Employee Dashboard Component
const EmployeeDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState({
    activities: true,
    schedule: true
  });

  // Load real data on component mount
  useEffect(() => {
    loadRecentActivities();
    loadScheduleItems();
    
    // Keyboard shortcut for search
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadRecentActivities = async () => {
    try {
      setLoading(prev => ({ ...prev, activities: true }));
      
      // This would be your actual API calls
      const [
        recentInspections,
        recentIncidents,
        recentMaintenance,
        recentCleaning
      ] = await Promise.all([
        apiService.getRecentInspections(),
        apiService.getRecentIncidents(), 
        apiService.getRecentMaintenance(),
        apiService.getRecentCleaning()
      ]);

      // Convert API data to activity format
      const activities = [
        ...recentInspections.map(item => ({
          id: `inspection-${item.id}`,
          title: 'Daily Safety Inspection Completed',
          description: `${item.failed_items_count ? 
            `${item.failed_items_count} items failed` : 
            'All items passed'} - ${new Date(item.date).toLocaleDateString()}`,
          time: formatTimeAgo(item.created_at),
          type: item.overall_pass ? 'success' : 'warning',
          icon: item.overall_pass ? CheckCircle : AlertCircle
        })),
        ...recentIncidents.map(item => ({
          id: `incident-${item.id}`,
          title: 'Incident Report Filed',
          description: `${item.first_name} ${item.surname} - ${item.location}`,
          time: formatTimeAgo(item.created_at),
          type: 'warning',
          icon: AlertCircle
        })),
        ...recentMaintenance.map(item => ({
          id: `maintenance-${item.id}`,
          title: 'Maintenance Completed',
          description: `${item.equipment_id} - ${item.maintenance_type}`,
          time: formatTimeAgo(item.created_at),
          type: 'success',
          icon: Settings
        })),
        ...recentCleaning.map(item => ({
          id: `cleaning-${item.id}`,
          title: 'Cleaning Task Completed',
          description: `${item.area} - ${item.supplies_used || 'Standard cleaning'}`,
          time: formatTimeAgo(item.created_at),
          type: 'success',
          icon: CheckCircle
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 4);

      setRecentActivities(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
      // Fallback to empty array on error
      setRecentActivities([]);
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };

  const loadScheduleItems = async () => {
    try {
      setLoading(prev => ({ ...prev, schedule: true }));
      
      // Load today's shifts and scheduled tasks
      const [todaysShifts, todaysChecklists] = await Promise.all([
        apiService.getTodaysShifts(),
        apiService.getTodaysChecklists()
      ]);

      const schedule = [
        ...todaysShifts.map(shift => ({
          title: `${shift.role_during_shift} Shift`,
          time: `${shift.start_time} - ${shift.end_time || 'Ongoing'}`,
          icon: Clock,
          bgColor: 'bg-blue-50',
          iconColor: 'text-blue-600'
        })),
        ...todaysChecklists.map(checklist => ({
          title: `${checklist.checklist_type} Checklist`,
          time: checklist.checklist_type === 'opening' ? '8:00 AM - 8:30 AM' :
                checklist.checklist_type === 'midday' ? '12:00 PM - 12:30 PM' :
                '8:00 PM - 8:30 PM',
          icon: Coffee,
          bgColor: checklist.completed ? 'bg-green-50' : 'bg-amber-50',
          iconColor: checklist.completed ? 'text-green-600' : 'text-amber-600'
        }))
      ];

      setScheduleItems(schedule);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setScheduleItems([]);
    } finally {
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

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
    { id: 'incident-report', label: 'Incident Report', description: 'Report workplace incidents', status: 'active' },
    { id: 'cleaning-form', label: 'Cleaning Log', description: 'Record cleaning activities', status: 'active' },
    { id: 'daily-stats', label: 'Daily Statistics', description: 'Record daily performance metrics', status: 'active' },
    { id: 'staff-appraisal', label: 'Staff Appraisal', description: 'Employee performance reviews', status: 'active' },
    { id: 'shift-form', label: 'Shift Management', description: 'Manage shift schedules', status: 'active' },
    { id: 'waiver-dashboard', label: 'Waiver Dashboard', description: 'Customer waiver processing', status: 'active' },
  ];

  const renderForms = () => {
    if (selectedForm) {
      const formComponents = {
        'maintenance-form': MaintenanceForm,
        'safety-check': SafetyCheckForm,
        'incident-report': IncidentReportForm,
        'cleaning-form': CleaningForm,
        'daily-stats': DailyStatsForm,
        'staff-appraisal': StaffAppraisalForm,
        'shift-form': ShiftForm,
        'waiver-dashboard': WaiverDashboard,
      };
      
      const FormComponent = formComponents[selectedForm];
      
      if (FormComponent) {
        return (
          <FormContainer selectedForm={selectedForm} setSelectedForm={setSelectedForm}>
            <FormComponent />
          </FormContainer>
        );
      }
    }

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
            loading={loading}
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
            loading={loading}
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
        <EnhancedTopHeader 
          showProfileDropdown={showProfileDropdown}
          setShowProfileDropdown={setShowProfileDropdown}
          onLogout={onLogout}
          onSearchClick={() => setShowSearchModal(true)}
        />

        <main className="p-6">
          {renderContent()}
        </main>
      </div>
      <style jsx>{`
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        
        @keyframes slide-in {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-down {
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite 2s;
        }
      `}</style>
    </div>
  );
};

export default EmployeeDashboard;