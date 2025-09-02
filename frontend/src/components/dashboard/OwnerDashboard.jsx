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
  Shield,
  Activity,
  Target,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

// API Service
const API_BASE = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Token ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // Dashboard methods
  async getDashboardData() {
    return this.get('/dashboard/');
  }

  async getDailyStats() {
    return this.get('/daily-stats/');
  }

  async getIncidents() {
    return this.get('/incidents/');
  }

  async getAppraisals() {
    return this.get('/appraisals/');
  }

  async getSafetyChecks() {
    return this.get('/safety-checks/');
  }
}

const apiService = new ApiService();

// Navigation Sidebar Component
const AdminSidebar = ({ activeSection, setActiveSection, onLogout, navigationItems }) => {
  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-10 border-r border-gray-100">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
        </div>
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
            </button>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-6 left-4 right-4">
        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">JF</span>
          </div>
          <div>
            <p className="font-medium text-gray-900">Jaydon Frankie</p>
            <p className="text-sm text-gray-500">Administrator</p>
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

// Header Component
const AdminHeader = () => {
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
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">🇬🇧</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Statistics Cards Component
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
      title: 'Monthly Visitors',
      value: dashboardData?.summary?.total_visitors_month || 0,
      icon: '👥',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      format: (val) => val.toLocaleString()
    },
    {
      title: 'Monthly Revenue',
      value: dashboardData?.summary?.total_sales_month || 0,
      icon: '💰',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      format: (val) => `£${val.toLocaleString()}`
    },
    {
      title: 'Recent Incidents',
      value: dashboardData?.summary?.recent_incidents || 0,
      icon: '⚠️',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
      format: (val) => val.toString()
    },
    {
      title: 'Safety Checks',
      value: dashboardData?.summary?.safety_checks_today || 0,
      icon: '🛡️',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      format: (val) => val.toString()
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="text-2xl">{card.icon}</div>
          </div>
          <div className={`text-3xl font-bold ${card.textColor} mb-2`}>
            {card.format(card.value)}
          </div>
          <div className="text-gray-600 text-sm font-medium">
            {card.title}
          </div>
        </div>
      ))}
    </div>
  );
};

// Website Visits Chart
const WebsiteVisitsChart = ({ data, loading }) => {
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Daily Visitor Trend</h3>
          <p className="text-sm text-gray-500">Last 30 days</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data || []}>
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
            formatter={(value, name) => [value, name === 'visitors' ? 'Visitors' : name]}
          />
          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#3B82F6"
            fill="url(#colorVisitors)"
            strokeWidth={3}
          />
          <defs>
            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Current Visits Pie Chart
const CurrentVisitsPieChart = ({ data }) => {
  const COLORS = ['#3B82F6', '#06B6D4', '#F59E0B', '#EF4444'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Visits</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
            <span className="text-sm text-gray-600">{item.name}</span>
            <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent Incidents Component
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

  const getIncidentSeverity = (incident) => {
    // You can adjust this logic based on your incident data structure
    if (incident.severity) return incident.severity;
    if (incident.priority) return incident.priority;
    return 'medium'; // default
  };

  const getIncidentType = (incident) => {
    if (incident.incident_type) return incident.incident_type;
    if (incident.type) return incident.type;
    return 'General';
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
        {incidents && incidents.length > 0 ? (
          incidents.slice(0, 5).map((incident) => (
            <div key={incident.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg ${
                  getIncidentSeverity(incident) === 'high' ? 'bg-red-100 text-red-600' :
                  getIncidentSeverity(incident) === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {incident.description || incident.title || 'Incident reported'}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      getIncidentType(incident) === 'Safety' ? 'bg-red-100 text-red-700' :
                      getIncidentType(incident) === 'Equipment' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {getIncidentType(incident)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {incident.created_at ? new Date(incident.created_at).toLocaleDateString() : 
                       incident.date ? new Date(incident.date).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {incident.resolved || incident.status === 'resolved' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No recent incidents</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Staff Appraisals Component
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Staff Appraisals</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </button>
      </div>
      <div className="space-y-4">
        {appraisals && appraisals.length > 0 ? (
          appraisals.slice(0, 5).map((appraisal) => (
            <div key={appraisal.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {appraisal.employee_name || appraisal.employee || 'Employee'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {appraisal.department || appraisal.position || 'Staff Member'}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last review: {appraisal.review_date ? 
                      new Date(appraisal.review_date).toLocaleDateString() : 
                      appraisal.created_at ? new Date(appraisal.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-semibold text-gray-900">
                    {appraisal.overall_rating || appraisal.rating || 'N/A'}
                  </span>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                  appraisal.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  appraisal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {appraisal.status || 'pending'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No appraisals available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Daily Statistics Component
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

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Daily Customer Statistics</h3>
        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data || []}>
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
              value, 
              name === 'visitor_count' ? 'Visitors' : 
              name === 'visitors' ? 'Visitors' : 
              name
            ]}
          />
          <Bar dataKey="visitor_count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="visitors" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Main Dashboard Content
const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [appraisals, setAppraisals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard data (if your backend provides a dashboard endpoint)
      try {
        const dashData = await apiService.getDashboardData();
        setDashboardData(dashData);
      } catch (err) {
        console.warn('Dashboard endpoint not available:', err.message);
      }

      // Fetch daily stats
      try {
        const statsData = await apiService.getDailyStats();
        setDailyStats(statsData);
      } catch (err) {
        console.warn('Daily stats endpoint error:', err.message);
        setDailyStats([]);
      }

      // Fetch incidents
      try {
        const incidentsData = await apiService.getIncidents();
        setIncidents(incidentsData);
      } catch (err) {
        console.warn('Incidents endpoint error:', err.message);
        setIncidents([]);
      }

      // Fetch appraisals
      try {
        const appraisalsData = await apiService.getAppraisals();
        setAppraisals(appraisalsData);
      } catch (err) {
        console.warn('Appraisals endpoint error:', err.message);
        setAppraisals([]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(fetchAllData, 300000);
    return () => clearInterval(interval);
  }, []);

  // Generate team data from daily stats if available
  const generateTeamData = () => {
    if (!dailyStats || !Array.isArray(dailyStats) || dailyStats.length === 0) {
      return [
        { name: 'Team A', value: 25, color: '#3B82F6' },
        { name: 'Team B', value: 35, color: '#06B6D4' },
        { name: 'Team C', value: 15, color: '#F59E0B' },
        { name: 'Team D', value: 25, color: '#EF4444' }
      ];
    }

    // You can customize this logic based on your data structure
    const totalVisitors = dailyStats.reduce((sum, day) => sum + (day.visitor_count || day.visitors || 0), 0);
    return [
      { name: 'Morning Shift', value: 28, color: '#3B82F6' },
      { name: 'Afternoon Shift', value: 42, color: '#06B6D4' },
      { name: 'Evening Shift', value: 18, color: '#F59E0B' },
      { name: 'Weekend Shift', value: 12, color: '#EF4444' }
    ];
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
            <p className="mb-4">{error}</p>
          </div>
          <button 
            onClick={fetchAllData}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StatisticsCards dashboardData={dashboardData} loading={loading} />
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <WebsiteVisitsChart data={dailyStats} loading={loading} />
        <CurrentVisitsPieChart data={generateTeamData()} />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <DailyStatistics data={dailyStats} loading={loading} />
        <RecentIncidents incidents={incidents} loading={loading} />
      </div>
      
      <StaffAppraisals appraisals={appraisals} loading={loading} />
    </div>
  );
};

// Main Admin Dashboard Component
const OwnerDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">User Management</h2>
            <p className="text-gray-600">Manage user accounts and permissions.</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics</h2>
            <p className="text-gray-600">View detailed analytics and insights.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Settings</h2>
            <p className="text-gray-600">Configure system settings and preferences.</p>
          </div>
        );
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
      />

      <div className="ml-64">
        <AdminHeader />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default OwnerDashboard;