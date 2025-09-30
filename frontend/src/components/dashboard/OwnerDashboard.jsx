import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Trash2,
  Menu,
  X,
  TrendingUp,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Crown,
  Gift
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import apiService from '../../services/api';
import CafeChecklistsView from '../forms/CafeChecklistsView';
import IncidentReportsView from '../forms/IncidentReportsView';
import StaffAppraisalsView from '../forms/StaffAppraisalsView';
import CafeChecklistGrid from '../OwnerDashboardComps/CafeChecklistGrid';
import UserManagementContent from './UserManagementContent';
import StaffAppraisalGrid from '../OwnerDashboardComps/StaffAppraisalGrid';
import RecentIncidentsGrid from '../OwnerDashboardComps/RecentIncidentsGrid';

// Jump 'n Joy Logo Component
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

// Connection Status Indicator
const ConnectionStatus = ({ status }) => {
  const statusConfig = {
    connected: { icon: Wifi, color: 'text-green-600', bg: 'bg-green-100', pulse: 'animate-pulse-success' },
    disconnected: { icon: WifiOff, color: 'text-yellow-600', bg: 'bg-yellow-100', pulse: 'animate-pulse-warning' },
    error: { icon: WifiOff, color: 'text-red-600', bg: 'bg-red-100', pulse: 'animate-pulse-error' }
  };

  const config = statusConfig[status] || statusConfig.connected;
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${config.bg} ${config.pulse} transition-all duration-300`}>
      <Icon className={`w-4 h-4 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color} capitalize`}>
        {status}
      </span>
    </div>
  );
};

// Enhanced Navigation Sidebar
const AdminSidebar = ({ activeSection, setActiveSection, onLogout, navigationItems, connectionStatus, isCollapsed, setIsCollapsed }) => {
  const user = apiService.getCurrentUser();

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full bg-white shadow-2xl z-30 border-r border-gray-100 transition-all duration-300 ease-in-out ${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
      }`}>
        {/* Logo & Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-yellow-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <JumpNJoyLogo size="w-10 h-10" />
              {!isCollapsed && (
                <div className="animate-slide-in">
                  <h1 className="text-xl font-black bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                    Jump 'n Joy
                  </h1>
                  <p className="text-xs text-gray-600 font-medium">Management Portal</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          {!isCollapsed && <ConnectionStatus status={connectionStatus} />}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setIsCollapsed(true);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left group hover:shadow-md ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-yellow-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${
                  activeSection === item.id ? 'animate-bounce-gentle' : 'group-hover:scale-110'
                } transition-transform duration-300`} />
                {!isCollapsed && (
                  <>
                    <span className="font-medium animate-slide-in">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl mb-4 animate-slide-in">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
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
          )}
          <button
            onClick={onLogout}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group ${
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

// Enhanced Header with Animations
const AdminHeader = ({ alerts = [], isCollapsed, setIsCollapsed }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="animate-slide-in">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
              Welcome back! 
            </h2>
            <p className="text-gray-600">Here's what's happening at Jump 'n Joy today</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden sm:block">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
            />
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
            >
              <Bell className="w-6 h-6 group-hover:animate-bounce" />
              {alerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {alerts.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 animate-slide-down">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-yellow-50 rounded-t-2xl">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                      <div key={alert.id || index} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gradient-to-r from-red-50 to-yellow-50 px-3 py-2 rounded-xl">
            <span className="text-lg">🇬🇧</span>
            <span className="hidden sm:inline">UK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardDailyStatistics = ({ loading, dailyStats }) => {
  const [metric, setMetric] = useState("visitor_count");
  const [range, setRange] = useState(7);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const chartData = Array.isArray(dailyStats)
    ? dailyStats.map((item) => ({
        date: item.date,
        visitor_count: item.visitor_count || 0,
        revenue: parseFloat(item.total_revenue) || 0,
        cafe_sales: parseFloat(item.cafe_sales) || 0,
        bounce_time: item.bounce_time_minutes || 0,
      }))
    : [];

  const filteredData = chartData.slice(-range);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
          Daily Statistics
        </h3>
        <div className="flex items-center gap-3">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="visitor_count">Visitors</option>
            <option value="revenue">Revenue</option>
            <option value="cafe_sales">Cafe Sales</option>
            <option value="bounce_time">Bounce Time</option>
          </select>
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Chart or Empty State */}
      {filteredData.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <BarChart3 className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="font-medium">No daily statistics available</p>
          <p className="text-sm mt-1">Data will appear once recorded</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E2001A" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#E2001A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: "#555" }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              }
              stroke="#888"
            />
            <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(value) =>
                `Date: ${new Date(value).toLocaleDateString()}`
              }
              formatter={(value, name) => [
                metric === "revenue" || metric === "cafe_sales"
                  ? `£${value}`
                  : value,
                metric === "visitor_count"
                  ? "Visitors"
                  : metric === "revenue"
                  ? "Total Revenue"
                  : metric === "cafe_sales"
                  ? "Cafe Sales"
                  : metric === "bounce_time"
                  ? "Bounce Time (min)"
                  : metric,
              ]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#E2001A"
              fillOpacity={1}
              fill="url(#colorPrimary)"
              strokeWidth={2.2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Enhanced Statistics Cards
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
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div 
            key={index} 
            className={`${card.bgColor} rounded-2xl p-6 border border-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer group animate-fade-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-white/50 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <IconComponent className={`w-6 h-6 ${card.iconColor}`} />
              </div>
              {card.trend && (
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                  card.isPositive ? 'bg-green-100 text-green-700' :
                  'bg-red-100 text-red-700'
                } animate-pulse`}>
                  {card.trend}
                </span>
              )}
            </div>
            <div className={`text-3xl font-bold ${card.textColor} mb-2 group-hover:scale-105 transition-transform duration-300`}>
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

// Enhanced Dashboard Content
const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [dailyStats, setDailyStats] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [appraisals, setAppraisals] = useState(null);
  const [cafeChecklists, setCafeChecklists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  const handleViewChecklist = (checklistType, date) => {
    navigate(`/checklists/view?date=${date}`);
  };

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

  return (
    <div className="space-y-8">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-yellow-500 hover:from-red-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 disabled:opacity-50 group"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <StatisticsCards loading={loading} />
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cafe Checklist Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Daily Checklists</h3>
          </div>
          <CafeChecklistGrid 
            checklists={cafeChecklists} 
            loading={loading} 
            onViewChecklist={handleViewChecklist}
            embedded={true}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-red-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Incident Reports</h3>
          </div>
          <RecentIncidentsGrid
            incidents={incidents} 
            loading={loading} 
            onViewAll={() => navigate('/incidents')}
            embedded={true}
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Staff Appraisals</h3>
          </div>
          <StaffAppraisalGrid
            appraisals={appraisals} 
            loading={loading} 
            onViewAll={() => navigate('/appraisals')}
            embedded={true}
          />
        </div>
      </div>

      {/* Charts */}
      <DashboardDailyStatistics loading={loading} dailyStats={dailyStats} />
    </div>
  );
};

< UserManagementContent />

// Analytics Content
const AnalyticsContent = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const analytics = await apiService.getAnalytics(timeRange);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(err.message);
        
        // Enhanced mock data with more business context
        const mockAnalytics = {
          // Core Metrics
          growthRate: 12,
          targetAchievement: 87,
          satisfaction: 4.7,
          peakHours: "2-6 PM",
          monthlyRevenue: 45678,
          monthlyVisitors: 3247,
          conversionRate: 23.5,
          
          // Enhanced Business Insights
          revenuePerVisitor: 14.06, // 45678 / 3247
          repeatVisitorRate: 42,
          averageVisitDuration: 2.8, // hours
          capacityUtilization: 68,
          cafeRevenuePercentage: 28,
          partyBookings: 47,
          staffEfficiency: 4.2, // out of 5
          weatherImpact: "+15%", // revenue impact from good weather
          
          // Trends
          weekdays: { mon: 320, tue: 280, wed: 310, thu: 390, fri: 450, sat: 820, sun: 780 },
          ageGroups: { "0-5": 35, "6-12": 45, "13-17": 12, "18+": 8 },
          referralSources: { "wordOfMouth": 42, "socialMedia": 28, "website": 15, "walkIn": 15 }
        };
        
        setAnalyticsData(mockAnalytics);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  // Calculate derived insights
  const businessInsights = useMemo(() => {
    if (!analyticsData) return [];
    
    const insights = [];
    
    // Revenue Insights
    if (analyticsData.revenuePerVisitor > 15) {
      insights.push({
        type: "positive",
        icon: Crown,
        title: "High Revenue Per Visitor",
        description: `£${analyticsData.revenuePerVisitor} per person - excellent monetization`,
        action: "Consider premium packages to further increase revenue"
      });
    } else if (analyticsData.revenuePerVisitor < 10) {
      insights.push({
        type: "warning",
        icon: DollarSign,
        title: "Low Revenue Per Visitor",
        description: `Only £${analyticsData.revenuePerVisitor} per person`,
        action: "Upsell cafe items and party packages"
      });
    }
    
    // Capacity Insights
    if (analyticsData.capacityUtilization > 80) {
      insights.push({
        type: "warning",
        icon: Users,
        title: "High Capacity Utilization",
        description: `${analyticsData.capacityUtilization}% - consider expanding hours`,
        action: "Extend opening hours or increase capacity"
      });
    } else if (analyticsData.capacityUtilization < 50) {
      insights.push({
        type: "opportunity",
        icon: Target,
        title: "Underutilized Capacity",
        description: `Only ${analyticsData.capacityUtilization}% capacity used`,
        action: "Run promotions for off-peak hours"
      });
    }
    
    // Customer Loyalty Insights
    if (analyticsData.repeatVisitorRate > 40) {
      insights.push({
        type: "positive",
        icon: Sparkles,
        title: "Strong Customer Loyalty",
        description: `${analyticsData.repeatVisitorRate}% repeat visitors`,
        action: "Launch a loyalty program to capitalize on this"
      });
    }
    
    // Cafe Performance
    if (analyticsData.cafeRevenuePercentage < 20) {
      insights.push({
        type: "opportunity",
        icon: Coffee,
        title: "Cafe Revenue Opportunity",
        description: `Cafe contributes only ${analyticsData.cafeRevenuePercentage}% of revenue`,
        action: "Promote combo deals and seasonal cafe specials"
      });
    }
    
    return insights;
  }, [analyticsData]);

  // Calculate peak performance recommendations
  const peakRecommendations = useMemo(() => {
    if (!analyticsData?.weekdays) return [];
    
    const weekdays = analyticsData.weekdays;
    const entries = Object.entries(weekdays);
    const busiestDay = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const quietestDay = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    
    return [
      {
        day: busiestDay[0],
        visitors: busiestDay[1],
        type: "busiest",
        recommendation: "Ensure maximum staffing and stock levels"
      },
      {
        day: quietestDay[0],
        visitors: quietestDay[1],
        type: "quietest",
        recommendation: "Perfect for maintenance and staff training"
      }
    ];
  }, [analyticsData]);

  if (loading) {
    return (
      <div className="space-y-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
            <p className="text-gray-600">Actionable insights for business growth</p>
          </div>
          <div>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="rounded-full border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#E2001A]"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p>Using sample data for demonstration: {error}</p>
          </div>
        )}

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Growth Rate</h3>
            <p className="text-2xl font-bold text-green-600 text-center">+{analyticsData.growthRate}%</p>
            <p className="text-xs text-green-600 text-center mt-2">YoY Growth</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Target Achievement</h3>
            <p className="text-2xl font-bold text-blue-600 text-center">{analyticsData.targetAchievement}%</p>
            <p className="text-xs text-blue-600 text-center mt-2">Monthly Goal</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
            <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Satisfaction</h3>
            <p className="text-2xl font-bold text-purple-600 text-center">{analyticsData.satisfaction}/5</p>
            <p className="text-xs text-purple-600 text-center mt-2">Customer Rating</p>
          </div>
          
          <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
            <Activity className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Peak Hours</h3>
            <p className="text-xl font-bold text-orange-600 text-center">{analyticsData.peakHours}</p>
            <p className="text-xs text-orange-600 text-center mt-2">Most Active</p>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-green-600 text-center">£{analyticsData.monthlyRevenue.toLocaleString()}</p>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">Per Visitor: </span>
              <span className="text-sm font-semibold text-green-600">£{analyticsData.revenuePerVisitor?.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Monthly Visitors</h3>
            <p className="text-2xl font-bold text-blue-600 text-center">{analyticsData.monthlyVisitors.toLocaleString()}</p>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">Repeat Rate: </span>
              <span className="text-sm font-semibold text-blue-600">{analyticsData.repeatVisitorRate}%</span>
            </div>
          </div>
          
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Conversion Rate</h3>
            <p className="text-2xl font-bold text-purple-600 text-center">{analyticsData.conversionRate}%</p>
            <div className="text-center mt-2">
              <span className="text-sm text-gray-600">Capacity: </span>
              <span className="text-sm font-semibold text-purple-600">{analyticsData.capacityUtilization}%</span>
            </div>
          </div>
        </div>

        {/* Business Insights & Recommendations */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionable Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {businessInsights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'positive' 
                      ? 'bg-green-50 border-green-200' 
                      : insight.type === 'warning' 
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      insight.type === 'positive' 
                        ? 'bg-green-100 text-green-600' 
                        : insight.type === 'warning' 
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">{insight.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                      <p className="text-xs font-medium text-gray-700 mt-2">{insight.action}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Performance Analysis */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Peak Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {peakRecommendations.map((rec, index) => (
              <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    rec.type === 'busiest' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {rec.type === 'busiest' ? 'Peak Day' : 'Quiet Day'}
                  </span>
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <h4 className="font-bold text-lg text-gray-900 capitalize">{rec.day}</h4>
                <p className="text-sm text-gray-600 mt-1">{rec.visitors} visitors</p>
                <p className="text-xs text-gray-500 mt-2">{rec.recommendation}</p>
              </div>
            ))}
          </div>
          
          {/* Additional Business Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <Coffee className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">{analyticsData.cafeRevenuePercentage}%</div>
              <div className="text-xs text-gray-500">Cafe Revenue</div>
            </div>
            <div className="text-center">
              <Gift className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">{analyticsData.partyBookings}</div>
              <div className="text-xs text-gray-500">Party Bookings</div>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">{analyticsData.averageVisitDuration}h</div>
              <div className="text-xs text-gray-500">Avg. Visit</div>
            </div>
            <div className="text-center">
              <ThumbsUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-gray-900">{analyticsData.staffEfficiency}/5</div>
              <div className="text-xs text-gray-500">Staff Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Owner Dashboard Component
const OwnerDashboard = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [dashboardAlerts] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(true);

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
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'users':
        return <UserManagementContent />;
      case 'analytics':
        return <AnalyticsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-yellow-50/30">
      <AdminSidebar 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onLogout={onLogout}
        navigationItems={navigationItems}
        connectionStatus={connectionStatus}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <AdminHeader 
          alerts={dashboardAlerts} 
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <main className="p-6">
          {renderContent()}
        </main>
      </div>

      <style>{`
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes slide-in {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-down {
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes pulse-success {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes pulse-warning {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        @keyframes pulse-error {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-pulse-success {
          animation: pulse-success 2s ease-in-out infinite;
        }
        
        .animate-pulse-warning {
          animation: pulse-warning 1.5s ease-in-out infinite;
        }
        
        .animate-pulse-error {
          animation: pulse-error 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default OwnerDashboard;