import React, { useState } from 'react';
import { 
  Bell,
  Search,
  AlertCircle,
  Menu,
  X,
} from 'lucide-react';

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

export default AdminHeader;