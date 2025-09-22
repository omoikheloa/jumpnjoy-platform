import React from "react";
import { Search, Bell, User, Settings, ChevronDown, LogOut } from "lucide-react";
import apiService from "../../services/api";

const user = apiService.getCurrentUser();
const userName = user ? user.first_name : 'User';

const Header = ({ showProfileDropdown, setShowProfileDropdown, onLogout }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Header Items */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
            >
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">{userName.charAt(0)}</span>
              </div>
              <span className="font-medium text-gray-900">{userName}</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>Profile</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Settings</span>
                </button>
                <hr className="my-1" />
                <button 
                  onClick={onLogout}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;