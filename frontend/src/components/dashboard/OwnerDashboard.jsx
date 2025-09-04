import React, { useState, useEffect, useCallback } from 'react';
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
  Shield,
  Activity,
  Target,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  RefreshCw,
  Coffee,
  ClipboardList,
  Lock,
  Wifi,
  WifiOff,
  Edit,
  Trash2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import apiService from '../../services/api';

// Connection Status Indicator
const ConnectionStatus = ({ status }) => {
  const statusConfig = {
    connected: { icon: Wifi, color: 'text-green-600', bg: 'bg-green-100' },
    disconnected: { icon: WifiOff, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    error: { icon: WifiOff, color: 'text-red-600', bg: 'bg-red-100' }
  };

  const config = statusConfig[status] || statusConfig.connected;
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg}`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color} capitalize`}>
        {status}
      </span>
    </div>
  );
};

// Enhanced Navigation Sidebar
const AdminSidebar = ({ activeSection, setActiveSection, onLogout, navigationItems, connectionStatus }) => {
  const user = apiService.getCurrentUser();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10 border-r border-gray-100">
      {/* Logo & Connection Status */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TP</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Trampoline Admin</h1>
          </div>
        </div>
        <ConnectionStatus status={connectionStatus} />
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-1">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left ${
                activeSection === item.id 
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-gray-500 truncate capitalize">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Header with Alerts
const AdminHeader = ({ alerts = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hi, Welcome back</h2>
          <p className="text-gray-600">Here's what's happening at your trampoline park today</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600"
            >
              <Bell className="w-6 h-6" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div key={alert.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg ${
                            alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            alert.type === 'error' ? 'bg-red-100 text-red-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <AlertCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{alert.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Priority: {alert.priority}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🇬🇧</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Statistics Cards with More Metrics
const StatisticsCards = ({ dashboardData, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-gray-100 rounded-2xl p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Today\'s Visitors',
      value: dashboardData?.todayVisitors || 0,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      format: (val) => val.toLocaleString(),
      trend: '+0%' // Placeholder trend
    },
    // {
    //   title: 'Monthly Revenue',
    //   value: dashboardData?.monthlyRevenue || 0,
    //   icon: DollarSign,
    //   bgColor: 'bg-green-50',
    //   iconColor: 'text-green-600',
    //   textColor: 'text-green-600',
    //   format: (val) => `£${val.toLocaleString()}`,
    //   trend: '+0%' // Placeholder trend
    // },
    {
      title: 'Recent Incidents',
      value: dashboardData?.recentIncidents || 0,
      icon: AlertTriangle,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      textColor: 'text-red-600',
      format: (val) => val.toString(),
      trend: dashboardData?.recentIncidents > 0 ? 'Attention' : 'All clear'
    },
    {
      title: 'Safety Checks Today',
      value: dashboardData?.safetyChecksToday || 0,
      icon: Shield,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600',
      format: (val) => val.toString(),
      trend: dashboardData?.safetyChecksToday > 0 ? 'On track' : 'Pending'
    },
    // {
    //   title: 'Pending Maintenance',
    //   value: dashboardData?.pendingMaintenance || 0,
    //   icon: Settings,
    //   bgColor: 'bg-orange-50',
    //   iconColor: 'text-orange-600',
    //   textColor: 'text-orange-600',
    //   format: (val) => val.toString(),
    //   trend: dashboardData?.pendingMaintenance > 0 ? 'Needs attention' : 'Up to date'
    // },
    {
      title: 'Staff On Duty',
      value: dashboardData?.staffOnDuty || 0,
      icon: UserCheck,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      textColor: 'text-cyan-600',
      format: (val) => val.toString(),
      trend: dashboardData?.staffOnDuty > 0 ? 'Active' : 'None scheduled'
    }
    // {
    //   title: 'Recent Appraisals',
    //   value: dashboardData?.recentAppraisals || 0,
    //   icon: Star,
    //   bgColor: 'bg-pink-50',
    //   iconColor: 'text-pink-600',
    //   textColor: 'text-pink-600',
    //   format: (val) => val.toString(),
    //   trend: dashboardData?.recentAppraisals > 0 ? 'Completed' : 'Pending'
    // }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className={`${card.bgColor} rounded-2xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              {card.trend && (
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  card.trend.includes('+') ? 'bg-green-100 text-green-700' :
                  card.trend.includes('Attention') || card.trend.includes('Needs attention') ? 'bg-red-100 text-red-700' :
                  card.trend.includes('Pending') || card.trend.includes('None scheduled') ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {card.trend}
                </span>
              )}
            </div>
            <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
              {card.format(card.value)}
            </div>
            <div className="text-gray-600 text-sm font-medium">
              {card.title}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Cafe Checklist Component with Date Selector
const CafeChecklist = ({ checklists, loading, onToggleItem }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    if (checklists && !loading) {
      // Extract unique dates from checklists
      const checklistItems = checklists?.results || checklists || [];
      const uniqueDates = [...new Set(checklistItems.map(item => item.date))].sort().reverse();
      setDateOptions(uniqueDates);
    }
  }, [checklists, loading]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-12 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Extract checklist items from results array if it exists (pagination)
  const checklistItems = checklists?.results || checklists || [];
  
  // Filter for selected date's checklist items
  const filteredChecklists = checklistItems.filter(item => item.date === selectedDate);
  
  // Group by checklist type
  const groupedChecklists = filteredChecklists.reduce((groups, item) => {
    const type = item.checklist_type_display || item.checklist_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});

  const handleToggle = async (itemId, currentStatus) => {
    try {
      await onToggleItem(itemId, !currentStatus);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isPastDate = selectedDate < new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Coffee className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cafe Checklist</h3>
        </div>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </button>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date:
        </label>
        <select
          id="date-select"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
        >
          {dateOptions.map(date => (
            <option key={date} value={date}>
              {new Date(date).toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })}
              {date === new Date().toISOString().split('T')[0] ? ' (Today)' : ''}
            </option>
          ))}
        </select>
      </div>

      {filteredChecklists.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No checklist items for selected date</p>
          <p className="text-sm mt-1">Checklists are created daily at opening time</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Date Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">
              {new Date(selectedDate).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </h4>
            {isPastDate && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                Historical View
              </span>
            )}
          </div>

          {Object.entries(groupedChecklists).map(([checklistType, items]) => (
            <div key={checklistType}>
              <h5 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide">
                {checklistType}
              </h5>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.completed ? 'bg-green-500' : 'bg-gray-300'
                      } ${isPastDate ? 'opacity-50' : ''}`}>
                        {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {item.item_name}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Assigned to: {item.created_by_name || 'Unknown'}
                          </span>
                          {item.completed && item.updated_at && (
                            <span className="text-xs text-gray-500">
                              Completed: {new Date(item.updated_at).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show summary if there are items */}
      {filteredChecklists.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {filteredChecklists.filter(item => item.completed).length} of {filteredChecklists.length} completed
              {isPastDate && ' (Historical)'}
            </span>
            <div className="w-24 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(filteredChecklists.filter(item => item.completed).length / filteredChecklists.length) * 100}%` 
                }}
              />
            </div>
          </div>
          
          {/* Completion status */}
          <div className="mt-2 text-xs text-gray-500">
            {filteredChecklists.filter(item => item.completed).length === filteredChecklists.length ? (
              <span className="text-green-600">✓ All tasks completed</span>
            ) : isPastDate ? (
              <span className="text-yellow-600">Historical data - cannot be modified</span>
            ) : (
              <span className="text-blue-600">In progress</span>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Today
        </button>
        <span className="text-gray-400">•</span>
        <button
          onClick={() => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            setSelectedDate(yesterday.toISOString().split('T')[0]);
          }}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          View Yesterday
        </button>
      </div>
    </div>
  );
};

// Enhanced Recent Incidents with better status handling
const RecentIncidents = ({ incidents, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Extract incidents from results array if it exists (pagination)
  const incidentItems = incidents?.results || incidents || [];

  const getSeverityIcon = (injuryDetails, ambulanceCalled) => {
    if (ambulanceCalled) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('serious')) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('minor')) {
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-blue-600" />;
  };

  const getSeverityText = (injuryDetails, ambulanceCalled) => {
    if (ambulanceCalled) {
      return 'High';
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('serious')) {
      return 'High';
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('minor')) {
      return 'Medium';
    }
    return 'Low';
  };

  const getStatusColor = (ambulanceCalled, hospital) => {
    if (ambulanceCalled) {
      return 'bg-red-100 text-red-700';
    }
    if (hospital) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (ambulanceCalled, hospital) => {
    if (ambulanceCalled) {
      return 'Ambulance Called';
    }
    if (hospital) {
      return 'Hospital Visit';
    }
    return 'First Aid Only';
  };

  // Helper function to get patient name
  const getPatientName = (incident) => {
    if (incident.first_name && incident.surname) {
      return `${incident.first_name} ${incident.surname}`;
    }
    return 'Unknown Patient';
  };

  // Helper function to format date and time
  const formatDateTime = (date, time) => {
    if (!date) return 'Unknown date';
    
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    if (time) {
      return `${formattedDate} at ${time.substring(0, 5)}`;
    }
    
    return formattedDate;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Incident Reports</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {incidentItems && incidentItems.length > 0 ? (
          incidentItems.slice(0, 5).map((incident) => (
            <div key={incident.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    {getSeverityIcon(incident.injury_details, incident.ambulance_called)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {getPatientName(incident)} - {incident.injury_location || 'Unknown location'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {incident.injury_details || 'No details provided'}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{incident.location || 'Unknown location'}</span>
                      <span>•</span>
                      <span>{formatDateTime(incident.date_of_accident, incident.time_of_accident)}</span>
                      <span>•</span>
                      <span>Reported by: {incident.reported_by_name || 'Unknown'}</span>
                    </div>
                    {incident.hospital && (
                      <div className="mt-2 text-xs text-blue-600">
                        Hospital: {incident.hospital}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(incident.ambulance_called, incident.hospital)}`}>
                    {getStatusText(incident.ambulance_called, incident.hospital)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    getSeverityText(incident.injury_details, incident.ambulance_called) === 'High' ? 'bg-red-100 text-red-700' :
                    getSeverityText(incident.injury_details, incident.ambulance_called) === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {getSeverityText(incident.injury_details, incident.ambulance_called)} severity
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No recent incidents</p>
            <p className="text-sm mt-1">Incident reports will appear here when created</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Staff Appraisals with better layout
const StaffAppraisals = ({ appraisals, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Extract appraisals from results array if it exists (pagination)
  const appraisalItems = appraisals?.results || appraisals || [];

  const getStatusColor = (dateOfAppraisal) => {
    const today = new Date();
    const appraisalDate = new Date(dateOfAppraisal);
    
    // If appraisal date is in the future, it's upcoming
    if (appraisalDate > today) {
      return 'bg-blue-100 text-blue-700';
    }
    
    // If appraisal date is within the last 30 days, it's recent
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (appraisalDate >= thirtyDaysAgo) {
      return 'bg-green-100 text-green-700';
    }
    
    // Otherwise, it's older
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (dateOfAppraisal) => {
    const today = new Date();
    const appraisalDate = new Date(dateOfAppraisal);
    
    if (appraisalDate > today) {
      return 'Upcoming';
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (appraisalDate >= thirtyDaysAgo) {
      return 'Recent';
    }
    
    return 'Completed';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Staff Appraisals</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {appraisalItems && appraisalItems.length > 0 ? (
          appraisalItems.slice(0, 5).map((appraisal) => (
            <div key={appraisal.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {appraisal.employee_name ? appraisal.employee_name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appraisal.employee_name || 'Unknown Employee'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Appraised by: {appraisal.appraiser_name || 'Unknown Appraiser'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {appraisal.date_of_appraisal ? new Date(appraisal.date_of_appraisal).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {appraisal.average_rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {appraisal.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(appraisal.date_of_appraisal)}`}>
                    {getStatusText(appraisal.date_of_appraisal)}
                  </span>
                </div>
              </div>
              
              {/* Additional details */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Achievements:</span>
                    <p className="text-gray-800 truncate">{appraisal.achievements || 'None recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Goals:</span>
                    <p className="text-gray-800 truncate">{appraisal.goals || 'None set'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No appraisals available</p>
            <p className="text-sm mt-1">Staff appraisals will appear here once conducted</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Daily Statistics Chart
const DailyStatistics = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Transform the data for the chart
  const chartData = Array.isArray(data) ? data.map(item => ({
    date: item.date,
    visitor_count: item.visitor_count || 0,
    revenue: parseFloat(item.total_revenue) || 0,
    cafe_sales: parseFloat(item.cafe_sales) || 0,
    bounce_time: item.bounce_time_minutes || 0
  })) : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Statistics</h3>
        <div className="flex items-center space-x-2">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Visitors</option>
            <option>Revenue</option>
            <option>Cafe Sales</option>
            <option>Bounce Time</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No daily statistics data available</p>
          <p className="text-sm mt-1">Data will appear once recorded</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              stroke="#666"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
              formatter={(value, name) => [
                name === 'revenue' || name === 'cafe_sales' ? `£${value}` : value,
                name === 'visitor_count' ? 'Visitors' : 
                name === 'revenue' ? 'Total Revenue' :
                name === 'cafe_sales' ? 'Cafe Sales' :
                name === 'bounce_time' ? 'Bounce Time (min)' : name
              ]}
            />
            <Area
              type="monotone"
              dataKey="visitor_count"
              stroke="#3B82F6"
              fillOpacity={1}
              fill="url(#colorVisitors)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10B981"
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Visitor Trends Chart
const VisitorTrendsChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Transform the data for the chart
  const chartData = Array.isArray(data) ? data.map(item => ({
    date: item.date,
    visitor_count: item.visitor_count || 0
  })) : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Visitor Trends</h3>
          <p className="text-sm text-gray-500">Daily visitor count over time</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Period:</span>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No visitor data available</p>
          <p className="text-sm mt-1">Visitor data will appear once recorded</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              stroke="#666"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={(value) => `Date: ${new Date(value).toLocaleDateString()}`}
              formatter={(value) => [value, 'Daily Visitors']}
            />
            <Line
              type="monotone"
              dataKey="visitor_count"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: '#1D4ED8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Revenue vs Visitors Chart
const RevenueChart = ({ data }) => {
  // Transform the data for the chart
  const chartData = Array.isArray(data) ? data.map(item => ({
    date: item.date,
    visitor_count: item.visitor_count || 0,
    revenue: parseFloat(item.total_revenue) || 0,
    cafe_sales: parseFloat(item.cafe_sales) || 0
  })) : [];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Tracking</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Total Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Visitors</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Cafe Sales</span>
          </div>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p>No revenue data available</p>
          <p className="text-sm mt-1">Revenue data will appear once recorded</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              stroke="#666"
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} stroke="#666" />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value, name) => [
                name === 'revenue' || name === 'cafe_sales' ? `£${value}` : value,
                name === 'revenue' ? 'Total Revenue' :
                name === 'visitor_count' ? 'Visitors' :
                name === 'cafe_sales' ? 'Cafe Sales' : name
              ]}
            />
            <Bar yAxisId="left" dataKey="revenue" fill="#10B981" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="left" dataKey="cafe_sales" fill="#F59E0B" radius={[2, 2, 0, 0]} />
            <Bar yAxisId="right" dataKey="visitor_count" fill="#3B82F6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Enhanced Dashboard Content with Error Handling
const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [appraisals, setAppraisals] = useState(null);
  const [cafeChecklists, setCafeChecklists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      const [
        dashData,
        statsData,
        incidentsData,
        appraisalsData,
        cafeData
      ] = await Promise.allSettled([
        apiService.getDashboardData(),
        apiService.getDailyStats(),
        apiService.getIncidents(),
        apiService.getAppraisals(),
        apiService.getCafeChecklists()
      ]);

      // Handle results
      if (dashData.status === 'fulfilled') setDashboardData(dashData.value);
      if (statsData.status === 'fulfilled') {
      const statsItems = statsData.value.results || statsData.value;
      setDailyStats(Array.isArray(statsItems) ? statsItems : []);
        }
      // Extract incidents from results array
      if (incidentsData.status === 'fulfilled') {
        const incidentsItems = incidentsData.value.results || incidentsData.value;
        setIncidents(Array.isArray(incidentsItems) ? incidentsItems : []);
      }
      // Extract appraisals from results array
      if (appraisalsData.status === 'fulfilled') {
        const appraisalsItems = appraisalsData.value.results || appraisalsData.value;
        setAppraisals(Array.isArray(appraisalsItems) ? appraisalsItems : []);
      }
      if (cafeData.status === 'fulfilled') {
      // Handle paginated response for cafe checklists
      const cafeItems = cafeData.value.results || cafeData.value;
      setCafeChecklists(Array.isArray(cafeItems) ? cafeItems : []);
    }

      // Check for any failures
      const failures = [dashData, statsData, incidentsData, appraisalsData, cafeData]
        .filter(result => result.status === 'rejected');
      
      if (failures.length > 0) {
        console.warn('Some API calls failed:', failures.map(f => f.reason?.message));
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  const handleToggleChecklistItem = async (itemId, completed) => {
    try {
      await apiService.toggleCafeChecklistItem(itemId);
      // Refresh the checklists after toggling
      const updatedChecklists = await apiService.getCafeChecklists();
      setCafeChecklists(updatedChecklists);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  useEffect(() => {
    fetchAllData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  if (error && !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">Dashboard Error</h3>
            </div>
            <p className="mb-4">{error}</p>
            <p className="text-sm">This might be due to:</p>
            <ul className="text-sm list-disc list-inside mt-2 space-y-1">
              <li>API authentication issues (check your token)</li>
              <li>Backend server not running</li>
              <li>Network connectivity problems</li>
              <li>CORS configuration issues</li>
            </ul>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Retrying...' : 'Retry'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards dashboardData={dashboardData} loading={loading} />
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <VisitorTrendsChart data={dailyStats} loading={loading} />
        <RevenueChart data={dailyStats} />
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DailyStatistics data={dailyStats} loading={loading} />
        <CafeChecklist 
          checklists={cafeChecklists} 
          loading={loading} 
          onToggleItem={handleToggleChecklistItem}
        />
      </div>
      
      {/* Incidents and Appraisals */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <RecentIncidents incidents={incidents} loading={loading} />
        <StaffAppraisals appraisals={appraisals} loading={loading} />
      </div>
    </div>
  );
};

// User Management Content - Updated to handle the correct API response structure
const UserManagementContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await apiService.getUsers();
        // Extract users from response.results
        const usersData = response.results || response;
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message);
        
        // Fallback mock data if API fails with some inactive users for testing
        const mockUsers = [
          { 
            id: 1, 
            username: 'admin123',
            first_name: 'Sarah', 
            last_name: 'Johnson', 
            role: 'safety_coordinator', 
            is_active: true, 
            last_login: '2023-06-15T10:30:00Z' 
          },
          { 
            id: 2, 
            username: 'mikechen',
            first_name: 'Mike', 
            last_name: 'Chen', 
            role: 'floor_supervisor', 
            is_active: true, 
            last_login: '2023-06-14T15:45:00Z' 
          },
          { 
            id: 3, 
            username: 'emmaw',
            first_name: 'Emma', 
            last_name: 'Wilson', 
            role: 'front_desk', 
            is_active: false, 
            last_login: null 
          }
        ];
        
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Debug: Log the users data to see what we're working with
  console.log('Users data:', users);

  // Safe filtering with array check - using is_active instead of status
  const activeUsers = Array.isArray(users) ? users.filter(user => user.is_active === true).length : 0;
  const adminUsers = Array.isArray(users) ? users.filter(user => 
    user.role && (user.role.toLowerCase() === 'owner' || user.role.toLowerCase() === 'admin')
  ).length : 0;
  const inactiveUsers = Array.isArray(users) ? users.filter(user => user.is_active === false).length : 0;
  const totalUsers = Array.isArray(users) ? users.length : 0;

  // Helper function to get display name
  const getDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.full_name) {
      return user.full_name;
    }
    return user.username || 'Unknown User';
  };

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'owner': 'Owner',
      'admin': 'Administrator',
      'staff': 'Staff',
      'safety_coordinator': 'Safety Coordinator',
      'floor_supervisor': 'Floor Supervisor',
      'front_desk': 'Front Desk',
      'maintenance': 'Maintenance',
      'cafe_manager': 'Cafe Manager'
    };
    return roleMap[role] || role || 'No role';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Debug info
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-600">
            Loaded {totalUsers} users | Active: {activeUsers} | Inactive: {inactiveUsers} | Admin: {adminUsers}
          </p>
        </div> */}
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-blue-50 rounded-xl">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Total Users</h3>
            <p className="text-2xl font-bold text-blue-600 text-center">{totalUsers}</p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl">
            <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Active Users</h3>
            <p className="text-2xl font-bold text-green-600 text-center">{activeUsers}</p>
          </div>
          <div className="p-6 bg-purple-50 rounded-xl">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Admin Users</h3>
            <p className="text-2xl font-bold text-purple-600 text-center">{adminUsers}</p>
          </div>
          <div className="p-6 bg-yellow-50 rounded-xl">
            <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Inactive</h3>
            <p className="text-2xl font-bold text-yellow-600 text-center">{inactiveUsers}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(users) && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {getDisplayName(user).split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getDisplayName(user)}</div>
                          <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.username || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getRoleDisplayName(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        <Edit className="w-4 h-4 inline mr-1" />
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Analytics Content - Updated to use real data
const AnalyticsContent = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await apiService.getAnalytics();
        setAnalyticsData(analytics);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
        
        // Fallback mock data if API fails
        const mockAnalytics = {
          growthRate: 12,
          targetAchievement: 87,
          satisfaction: 4.7,
          peakHours: '2-6 PM',
          monthlyRevenue: 45678,
          monthlyVisitors: 3247,
          conversionRate: 23.5
        };
        
        setAnalyticsData(mockAnalytics);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
            <p className="text-gray-600">Detailed insights and performance metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Last 30 days</option>
              <option>Last 60 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
        </div>
        
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p>Using mock data: {error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-purple-50 rounded-xl">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Growth Rate</h3>
            <p className="text-2xl font-bold text-purple-600 text-center">+{analyticsData.growthRate}%</p>
          </div>
          <div className="p-6 bg-indigo-50 rounded-xl">
            <Target className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Target Achievement</h3>
            <p className="text-2xl font-bold text-indigo-600 text-center">{analyticsData.targetAchievement}%</p>
          </div>
          <div className="p-6 bg-pink-50 rounded-xl">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Satisfaction</h3>
            <p className="text-2xl font-bold text-pink-600 text-center">{analyticsData.satisfaction}/5</p>
          </div>
          <div className="p-6 bg-cyan-50 rounded-xl">
            <Activity className="w-8 h-8 text-cyan-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Peak Hours</h3>
            <p className="text-xl font-bold text-cyan-600 text-center">{analyticsData.peakHours}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-blue-50 rounded-xl">
            <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-blue-600 text-center">£{analyticsData.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Monthly Visitors</h3>
            <p className="text-2xl font-bold text-green-600 text-center">{analyticsData.monthlyVisitors.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-orange-50 rounded-xl">
            <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Conversion Rate</h3>
            <p className="text-2xl font-bold text-orange-600 text-center">{analyticsData.conversionRate}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings Content
const SettingsContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="text-center">
          <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">System Settings</h2>
          <p className="text-gray-600 mb-6">Configure system preferences and integrations.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="p-6 bg-gray-50 rounded-xl text-left">
              <Bell className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-600 text-sm">Manage alert settings and notification preferences.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl text-left">
              <Lock className="w-8 h-8 text-gray-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600 text-sm">Configure security settings and access controls.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Admin Dashboard Component
const OwnerDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [dashboardAlerts, setDashboardAlerts] = useState([]);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = () => {
      // This would check the actual API connection status
      setConnectionStatus('connected');
    };

    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Get navigation items with badges
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home 
    },
    { 
      id: 'users', 
      label: 'User Management', 
      icon: Users
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings 
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagementContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        navigationItems={navigationItems}
        connectionStatus={connectionStatus}
      />

      <div className="ml-64">
        <AdminHeader alerts={dashboardAlerts} />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;