import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Calendar, 
  Bell,
  Search,
  ChevronDown,
  LogOut,
  Home,
  AlertCircle,
  Coffee,
  ToolCase,
  X,
  Menu,
} from 'lucide-react';

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

const NavigationSidebar = ({ activeSection, setActiveSection, onLogout, navigationItems, isCollapsed, setIsCollapsed, user }) => {
  return (
    <>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:z-20"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl z-50 lg:z-30 transition-all duration-300 ease-in-out ${
        isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'
      }`}>
        <div className="p-4 lg:p-6 border-b border-gray-700 bg-gradient-to-r from-red-900/20 to-yellow-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <JumpNJoyLogo size="w-8 h-8 lg:w-10 lg:h-10" />
              {!isCollapsed && (
                <div className="animate-slide-in">
                  <h1 className="text-lg lg:text-xl font-black bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">
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
              <X className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <nav className="p-2 lg:p-4 space-y-1 lg:space-y-2 flex-1 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const hasAccess = !item.roles || item.roles.includes(user?.role);
            
            if (!hasAccess) return null;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  if (window.innerWidth < 1024) {
                    setIsCollapsed(true);
                  }
                }}
                className={`w-full flex items-center space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl transition-all duration-300 text-left group animate-slide-in ${
                  activeSection === item.id 
                    ? 'bg-gradient-to-r from-red-500 to-yellow-500 text-white shadow-lg transform scale-105' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <IconComponent className={`w-4 h-4 lg:w-5 lg:h-5 ${
                  activeSection === item.id ? 'animate-bounce-gentle' : 'group-hover:scale-110'
                } transition-transform duration-300`} />
                {!isCollapsed && (
                  <span className="font-medium text-sm lg:text-base animate-slide-in">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-4 border-t border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 lg:space-x-3 p-3 lg:p-4 bg-gray-800 rounded-lg lg:rounded-xl mb-3 lg:mb-4 animate-slide-in">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs lg:text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate text-sm lg:text-base">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-400 truncate capitalize">
                  {user?.role || 'Employee'}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className={`w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg lg:rounded-xl text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300" />
            {!isCollapsed && <span className="font-medium text-sm lg:text-base">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
};

const TopHeader = ({ onSearchClick, isCollapsed, setIsCollapsed, user, onLogout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-3 lg:py-4 sticky top-0 z-30 backdrop-blur-lg bg-white/90">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 lg:space-x-4 flex-1">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
          </button>
          
          <button
            onClick={onSearchClick}
            className="flex-1 max-w-xl flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-300 text-left group"
          >
            <Search className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            <span className="text-gray-500 text-sm lg:text-base group-hover:text-gray-700">Search...</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded hidden sm:inline">Ctrl+K</span>
          </button>
        </div>

        <div className="flex items-center space-x-3 lg:space-x-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-300">
            <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-xs lg:text-sm">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <span className="font-medium text-gray-900 text-sm lg:text-base hidden sm:inline">{user?.first_name}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-slide-down">
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  Profile Settings
                </button>
                <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-sm">
                  Notifications
                </button>
                <hr className="my-2 border-gray-100" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors text-sm"
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

const DashboardLayout = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: null },
    { id: 'cafe', label: 'Cafe Checklist', icon: Coffee, roles: ['admin', 'manager', 'cafe', 'party_host', 'marshal', 'reception'] },
    { id: 'marshal', label: 'Marshal Checklist', icon: ToolCase, roles: ['admin', 'manager', 'cafe'] },
    { id: 'safety', label: 'Safety Inspection', icon: AlertCircle, roles: ['admin', 'manager', 'cafe'] },
    { id: 'incidents', label: 'Incident Reports', icon: FileText, roles: ['owner', 'manager', 'cafe'] },
    { id: 'scheduling', label: 'Shift Management', icon: Calendar, roles: ['admin', 'manager','cafe'] },
    { id: 'waivers', label: 'Waiver Dashboard', icon: FileText, roles: ['admin', 'manager', 'cafe'] },
  ];

  const handleNavigation = (sectionId) => {
    switch (sectionId) {
      case 'dashboard':
        navigate('/employee/dashboard');
        break;
      case 'cafe':
        navigate('/employee/cafe');
        break;
      case 'marshal':
        navigate('/employee/marshal');
        break;
      case 'safety':
        navigate('/employee/safety');
        break;
      case 'incidents':
        navigate('/employee/incidents');
        break;
      case 'scheduling':
        navigate('/employee/shift');
        break;
      case 'waivers':
        navigate('/employee/waivers');
        break;
      default:
        navigate('/employee/dashboard');
    }
  };

  // Update active section based on route
  useEffect(() => {
    const path = location.pathname;
    console.log('Current path:', path);
    
    if (path === '/employee/dashboard' || path === '/employee') {
      setActiveSection('dashboard');
    } else if (path.includes('/cafe')) {
      setActiveSection('cafe');
    } else if (path.includes('/marshal')) {
      setActiveSection('marshal');
    } else if (path.includes('/maintenance')) {
      setActiveSection('maintenance');
    } else if (path.includes('/safety')) {
      setActiveSection('safety');
    } else if (path.includes('/incidents')) {
      setActiveSection('incidents');
    } else if (path.includes('/shift')) {
      setActiveSection('scheduling');
    } else if (path.includes('/waivers')) {
      setActiveSection('waivers');
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationSidebar 
        activeSection={activeSection}
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
          onSearchClick={() => {}}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          user={user}
          onLogout={onLogout}
        />

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
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
        
        @keyframes slide-in {
          0% { transform: translateX(-20px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slide-down {
          0% { transform: translateY(-10px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
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
      `}</style>
    </div>
  );
};

export default DashboardLayout;