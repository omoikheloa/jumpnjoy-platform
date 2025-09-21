import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  Clock,
  Plus,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff,
  Save,
  UserPlus,
  Mail,
  Phone,
  Key,
  Briefcase,
  Calendar,
  Search,
  Filter,
  AlertCircle
} from 'lucide-react';
import apiService from '../../services/api';

// Constants
const USER_ROLES = [
  { value: 'staff', label: 'Staff', color: 'bg-gray-100 text-gray-700' },
  { value: 'admin', label: 'Administrator', color: 'bg-purple-100 text-purple-700' },
  { value: 'owner', label: 'Owner', color: 'bg-blue-100 text-blue-700' },
];

const INITIAL_FORM_DATA = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  password: '',
  role: 'staff',
  phone: '',
  is_active: true
};

// Utility functions
const getRoleInfo = (roleValue) => {
  return USER_ROLES.find(role => role.value === roleValue) || USER_ROLES[0];
};

const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const generateInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '??';
};

// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateForm = (formData, isEdit = false) => {
  const errors = {};
  
  if (!formData.username?.trim()) {
    errors.username = 'Username is required';
  } else if (formData.username.length < 3) {
    errors.username = 'Username must be at least 3 characters';
  }
  
  if (formData.email?.trim() && !validateEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!formData.first_name?.trim()) {
    errors.first_name = 'First name is required';
  }
  
  if (!formData.last_name?.trim()) {
    errors.last_name = 'Last name is required';
  }
  
  if (!isEdit && !formData.password) {
    errors.password = 'Password is required';
  } else if (formData.password && formData.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }
  
  return errors;
};

// Enhanced Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setShowPassword(false);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear specific error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    try {
      await apiService.createUser(formData);
      onUserAdded();
      onClose();
      resetForm();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Add New User</h3>
              <p className="text-sm text-gray-500">Create a new user account</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full border ${errors.first_name ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full border ${errors.last_name ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter email address (optional)"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Role</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {USER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number (optional)"
              />
            </div>
          </div>

          {/* Account Status */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-3 block text-sm text-gray-900">
                Active Account
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Inactive accounts cannot log in to the system
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{loading ? 'Creating...' : 'Create User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, isOpen, onClose, onUserUpdated }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '', // Don't pre-fill password
        role: user.role || 'staff',
        phone: user.phone || '',
        is_active: user.is_active || true
      });
      setErrors({});
      setShowPassword(false);
    }
  }, [user, isOpen]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear specific error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm(formData, true);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    try {
      // Create update data object, excluding password if it's empty
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }
      
      await apiService.updateUser(user.id, updateData);
      onUserUpdated();
      onClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to update user' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Edit className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit User</h3>
              <p className="text-sm text-gray-500">Update user account information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full border ${errors.first_name ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full border ${errors.last_name ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Account Information</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full border ${errors.username ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  placeholder="Enter email address (optional)"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password (leave blank to keep current)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Role</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {USER_ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter phone number (optional)"
              />
            </div>
          </div>

          {/* Account Status */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-3 block text-sm text-gray-900">
                Active Account
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Inactive accounts cannot log in to the system
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{loading ? 'Updating...' : 'Update User'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced User Details Modal
const UserDetailsModal = ({ user, isOpen, onClose, onEdit}) => {
  if (!isOpen || !user) return null;

  const roleInfo = getRoleInfo(user.role);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4 shadow-lg">
            <span className="text-white font-bold text-2xl">
              {generateInitials(user.first_name, user.last_name)}
            </span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-gray-500">@{user.username}</p>
            <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
              user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {user.email && (
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-900">{user.email}</span>
            </div>
          )}
          
          {user.phone && (
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-900">{user.phone}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
          
          {user.last_login && (
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-900">
                Last login: {formatDate(user.last_login)}
              </span>
            </div>
          )}

          {user.date_joined && (
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-gray-900">
                Joined: {formatDate(user.date_joined)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={() => onEdit(user)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

// Main User Management Component
const UserManagementContent = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      // Extracts results array from the API response
      const usersData = response.results || [];
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserAdded = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserUpdated = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(userId);
    try {
      await apiService.deleteUser(userId);
      // Show success message
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(false);
    setIsEditUserModalOpen(true);
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      `${user.first_name} ${user.last_name} ${user.username} ${user.email}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admin: users.filter(u => u.role === 'admin').length,
    owner: users.filter(u => u.role === 'owner').length
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
          </div>
          <button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2 font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add User</span>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Error: {error}</span>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 text-center">{stats.total}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <UserCheck className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Active Users</h3>
            <p className="text-3xl font-bold text-green-600 text-center">{stats.active}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Administrators</h3>
            <p className="text-3xl font-bold text-purple-600 text-center">{stats.admin}</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl">
            <Clock className="w-8 h-8 text-red-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2 text-center">Inactive</h3>
            <p className="text-3xl font-bold text-red-600 text-center">{stats.inactive}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Roles</option>
              {USER_ROLES.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const roleInfo = getRoleInfo(user.role);
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
                              <span className="text-white font-semibold text-sm">
                                {generateInitials(user.first_name, user.last_name)}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-xs text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || 'No email'}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-500">{user.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${roleInfo.color}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.last_login)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button 
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user)}
                              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteLoading === user.id}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete User"
                            >
                              {deleteLoading === user.id ? (
                                <div className="w-4 h-4 border-t-2 border-r-2 border-red-600 rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                          <>
                            <Search className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500 mb-4">
                              Try adjusting your search or filter criteria
                            </p>
                            <button
                              onClick={() => {
                                setSearchTerm('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Clear filters
                            </button>
                          </>
                        ) : (
                          <>
                            <Users className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No users yet</h3>
                            <p className="text-gray-500 mb-4">
                              Get started by adding your first user to the system
                            </p>
                            <button 
                              onClick={() => setIsAddUserModalOpen(true)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                            >
                              Add your first user
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results summary */}
        {filteredUsers.length > 0 && filteredUsers.length !== users.length && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Modals */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={handleUserAdded}
      />

      <EditUserModal
        user={selectedUser}
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        onUserUpdated={handleUserUpdated}
      />

      <UserDetailsModal
        user={selectedUser}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UserManagementContent;