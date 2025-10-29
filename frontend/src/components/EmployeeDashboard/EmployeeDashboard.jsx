import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Settings, 
  Calendar, 
  Clock, 
  AlertCircle,
  Coffee,
  CheckCircle,
  Users,
} from 'lucide-react';
import QuickActions from './QuickActions';

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

const WelcomeBanner = ({ user }) => {
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
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-white shadow-xl animate-slide-down overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-white opacity-10 rounded-full -mr-24 lg:-mr-32 -mt-24 lg:-mt-32 animate-float"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 lg:w-48 lg:h-48 bg-white opacity-10 rounded-full -ml-16 lg:-ml-24 -mb-16 lg:-mb-24 animate-float-delayed"></div>
      
      <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4 lg:space-x-6">
          <div className="w-14 h-14 lg:w-20 lg:h-20 bg-white bg-opacity-20 backdrop-blur rounded-2xl flex items-center justify-center animate-bounce-gentle">
            <JumpNJoyLogo size="w-8 h-8 lg:w-12 lg:h-12" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-4xl font-black mb-1 lg:mb-2">{getGreeting()}, {user?.first_name}!</h1>
            <p className="text-yellow-100 text-sm lg:text-lg">Ready to make today amazing?</p>
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
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
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
        <div className="text-center py-6 lg:py-8 text-gray-500">
          <FileText className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm lg:text-base">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-3 lg:space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start space-x-3 lg:space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'success' ? 'bg-green-100 text-green-600' : 
                  activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm lg:text-base">{activity.title}</h3>
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
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="animate-pulse flex items-center space-x-3 p-3">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : scheduleItems.length === 0 ? (
        <div className="text-center py-6 lg:py-8 text-gray-500">
          <Calendar className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm lg:text-base">No scheduled items for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {scheduleItems.map((item, index) => (
            <div key={index} className={`flex items-center space-x-3 p-3 ${item.bgColor} rounded-lg`}>
              <item.icon className={`w-4 h-4 lg:w-5 lg:h-5 ${item.iconColor}`} />
              <div>
                <h3 className="font-medium text-gray-900 text-sm lg:text-base">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EmployeeDashboard = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [recentActivities, setRecentActivities] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [loading, setLoading] = useState({
    activities: true,
    schedule: true
  });

  // Define form links with role-based access
  const formLinks = [
    { 
      id: 'cafe', 
      label: 'Cafe Management', 
      description: 'Daily cafe checklists and operations', 
      path: '/employee/cafe',
      roles: ['admin', 'manager', 'cafe'],
      icon: Coffee
    },
    { 
      id: 'safety-check', 
      label: 'Safety Inspection', 
      description: 'Daily safety checks for trampolines', 
      path: '/employee/safety',
      roles: ['admin', 'manager', 'cafe'],
      icon: AlertCircle
    },
    { 
      id: 'incident-report', 
      label: 'Incident Report', 
      description: 'Report workplace incidents', 
      path: '/employee/incident',
      roles: ['admin', 'cafe'],
      icon: FileText
    },
    { 
      id: 'shift-management', 
      label: 'Shift Management', 
      description: 'Manage employee shifts', 
      path: '/employee/shift',
      roles: ['admin', 'manager', 'cafe'],
      icon: Calendar
    },
    { 
      id: 'waiver-dashboard', 
      label: 'Waiver Dashboard', 
      description: 'Customer waiver processing', 
      path: '/employee/waivers',
      roles: ['admin', 'manager', 'cafe'],
      icon: FileText
    },
  ];

  // Load data on component mount
  useEffect(() => {
    loadRecentActivities();
    loadScheduleItems();
  }, []);

  const loadRecentActivities = async () => {
    try {
      setLoading(prev => ({ ...prev, activities: true }));
      // Simulate API call - replace with actual API calls
      setTimeout(() => {
        setRecentActivities([
          {
            id: 1,
            title: 'Safety Inspection Completed',
            description: 'All trampolines passed inspection',
            time: '2 hours ago',
            type: 'success',
            icon: CheckCircle
          },
          {
            id: 2,
            title: 'Maintenance Request',
            description: 'Trampoline #3 needs repair',
            time: '4 hours ago',
            type: 'warning',
            icon: AlertCircle
          }
        ]);
        setLoading(prev => ({ ...prev, activities: false }));
      }, 1000);
    } catch (error) {
      console.error('Error loading activities:', error);
      setRecentActivities([]);
      setLoading(prev => ({ ...prev, activities: false }));
    }
  };

  const loadScheduleItems = async () => {
    try {
      setLoading(prev => ({ ...prev, schedule: true }));
      // Simulate API call - replace with actual API calls
      setTimeout(() => {
        setScheduleItems([
          {
            title: 'Morning Safety Check',
            time: '8:00 AM - 8:30 AM',
            icon: AlertCircle,
            bgColor: 'bg-blue-50',
            iconColor: 'text-blue-600'
          },
          {
            title: 'Staff Meeting',
            time: '9:00 AM - 9:30 AM',
            icon: Users,
            bgColor: 'bg-purple-50',
            iconColor: 'text-purple-600'
          }
        ]);
        setLoading(prev => ({ ...prev, schedule: false }));
      }, 1000);
    } catch (error) {
      console.error('Error loading schedule:', error);
      setScheduleItems([]);
      setLoading(prev => ({ ...prev, schedule: false }));
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <WelcomeBanner user={user} />
      <QuickActions formLinks={formLinks} navigate={navigate} user={user} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <RecentActivity activities={recentActivities} loading={loading.activities} />
        <TodaysSchedule scheduleItems={scheduleItems} loading={loading.schedule} />
      </div>

      <style>{`
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.4; }
        }
        
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
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