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
  AlertCircle,
  Star,
  Crown,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import apiService from '../../services/api';

// Constants
const USER_ROLES = [
  { value: 'staff', label: 'Staff', color: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700', icon: Users, description: 'General Staff member with regular access' },
  { value: 'admin', label: 'Administrator', color: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700  ', icon: Shield, description: 'Admin with elevated privileges' },
  { value: 'owner', label: 'Owner', color: 'bg-gradient-to-r from-yellow-100 to-orange-200 text-orange-700' , icon: Crown, description: 'Owner with full access and control' },
];

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

const generateAvatarColor = (name) => {
  const colors = [
    'from-red-500 to-pink-500',
    'from-blue-500 to-cyan-500',
    'from-green-500 to-teal-500',
    'from-purple-500 to-indigo-500',
    'from-yellow-500 to-orange-500',
    'from-pink-500 to-rose-500'
  ];
  const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

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

const CustomInput = ({ label, type = "text", required = false, error = null, icon: Icon, ...props }) => (
  <div className="space-y-2 group animate-slide-in">
    <label className="block text-sm font-semibold text-gray-700 group-focus-within:text-blue-600 transition-colors duration-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors duration-300" />
      )}
      {type === 'select' ? (
        <select
          {...props}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border ${
            error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-300'
          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400`}
        />
      ) : (
        <input
          type={type}
          {...props}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 border ${
            error ? 'border-red-300 ring-2 ring-red-100' : 'border-gray-300'
          } rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400`}
        />
      )}
    </div>
    {error && (
      <p className="text-red-500 text-sm flex items-center animate-shake">
        <AlertCircle className="w-4 h-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

// Enhanced Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Personal Info', icon: Users },
    { title: 'Account Details', icon: Key },
    { title: 'Role & Permissions', icon: Shield }
  ];

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setShowPassword(false);
    setCurrentStep(0);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
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

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen, resetForm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add New Team Member
                </h3>
                <p className="text-gray-600">Create a new user account for Jump 'n Joy</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-md rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    index <= currentStep 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
                      : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}>
                    <StepIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 transition-colors duration-300 ${
                      index < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-6 rounded-lg animate-shake">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div onSubmit={handleSubmit} className="space-y-6">
            {/* Step 0: Personal Information */}
            {currentStep === 0 && (
              <div className="animate-slide-in space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Personal Information</h4>
                  <p className="text-gray-600">Let's start with the basics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CustomInput
                    label="First Name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    error={errors.first_name}
                    placeholder="Enter first name"
                    icon={Users}
                  />
                  <CustomInput
                    label="Last Name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    error={errors.last_name}
                    placeholder="Enter last name"
                    icon={Users}
                  />
                </div>

                <CustomInput
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number (optional)"
                  icon={Phone}
                />
              </div>
            )}

            {/* Step 1: Account Details */}
            {currentStep === 1 && (
              <div className="animate-slide-in space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="w-10 h-10 text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Account Details</h4>
                  <p className="text-gray-600">Set up login credentials</p>
                </div>

                <CustomInput
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  error={errors.username}
                  placeholder="Enter username"
                  icon={Users}
                />

                <CustomInput
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="Enter email (optional)"
                  icon={Mail}
                />

                <div className="relative">
                  <CustomInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={errors.password}
                    placeholder="Enter password"
                    icon={Key}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Role & Permissions */}
            {currentStep === 2 && (
              <div className="animate-slide-in space-y-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Role & Permissions</h4>
                  <p className="text-gray-600">Define user access level</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Select Role</label>
                  {USER_ROLES.map(role => {
                    const RoleIcon = role.icon;
                    return (
                      <label
                        key={role.value}
                        className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                          formData.role === role.value
                            ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`p-2 rounded-xl mr-4 ${
                          formData.role === role.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                        } transition-colors duration-300`}>
                          <RoleIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{role.label}</div>
                          <div className="text-sm text-gray-600">{role.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Active Account</div>
                      <div className="text-sm text-gray-600">User can log in and access the system</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <button
            type="button"
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : onClose()}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <span>{currentStep === 0 ? 'Cancel' : 'Back'}</span>
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 0 && (!formData.first_name || !formData.last_name)) ||
                (currentStep === 1 && (!formData.username || !formData.password))
              }
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span>Next</span>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>{loading ? 'Creating...' : 'Create User'}</span>
            </button>
          )}
        </div>
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

  const resetForm = useCallback(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '', // Don't pre-fill password for security
        role: user.role || 'staff',
        phone: user.phone || '',
        is_active: user.is_active !== undefined ? user.is_active : true
      });
    }
    setErrors({});
    setShowPassword(false);
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For edit mode, password is optional
    const formErrors = validateForm(formData, true);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data for update - remove password if empty
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

  useEffect(() => {
    if (isOpen && user) {
      resetForm();
    }
  }, [isOpen, user, resetForm]);

  if (!isOpen || !user) return null;

  const avatarColor = generateAvatarColor(user.first_name + user.last_name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Edit Team Member
                </h3>
                <p className="text-gray-600">Update user account for Jump 'n Joy</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-md rounded-xl transition-all duration-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* User Preview */}
          <div className="flex items-center space-x-4 mt-6 p-4 bg-white rounded-2xl border border-gray-200">
            <div className={`w-16 h-16 bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center shadow-lg`}>
              <span className="text-white font-bold text-lg">
                {generateInitials(user.first_name, user.last_name)}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">
                {user.first_name} {user.last_name}
              </h4>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 m-6 rounded-lg animate-shake">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-medium">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="animate-slide-in space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Personal Information</h4>
                <p className="text-gray-600">Update basic user details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  error={errors.first_name}
                  placeholder="Enter first name"
                  icon={Users}
                />
                <CustomInput
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  error={errors.last_name}
                  placeholder="Enter last name"
                  icon={Users}
                />
              </div>

              <CustomInput
                label="Phone Number"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number (optional)"
                icon={Phone}
              />
            </div>

            {/* Account Details */}
            <div className="animate-slide-in space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-10 h-10 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Account Details</h4>
                <p className="text-gray-600">Update login credentials</p>
              </div>

              <CustomInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                error={errors.username}
                placeholder="Enter username"
                icon={Users}
              />

              <CustomInput
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter email (optional)"
                icon={Mail}
              />

              <div className="relative">
                <CustomInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Leave blank to keep current password"
                  icon={Key}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-sm text-gray-500 -mt-4">
                Only enter a new password if you want to change it
              </p>
            </div>

            {/* Role & Permissions */}
            <div className="animate-slide-in space-y-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-10 h-10 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Role & Permissions</h4>
                <p className="text-gray-600">Update user access level</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Select Role</label>
                {USER_ROLES.map(role => {
                  const RoleIcon = role.icon;
                  return (
                    <label
                      key={role.value}
                      className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                        formData.role === role.value
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={formData.role === role.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-xl mr-4 ${
                        formData.role === role.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                      } transition-colors duration-300`}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{role.label}</div>
                        <div className="text-sm text-gray-600">{role.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="bg-gray-50 rounded-2xl p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
                  />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Active Account</div>
                    <div className="text-sm text-gray-600">User can log in and access the system</div>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center space-x-2 px-6 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
          >
            <span>Cancel</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>{loading ? 'Updating...' : 'Update User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const UserDetailsModal = ({ user, isOpen, onClose, onEdit }) => {
  if (!isOpen || !user) return null;

  const roleInfo = getRoleInfo(user.role);
  const avatarColor = generateAvatarColor(user.first_name + user.last_name);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 text-center border-b border-gray-100">
          <div className={`w-24 h-24 bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-bounce-gentle`}>
            <span className="text-white font-bold text-2xl">
              {generateInitials(user.first_name, user.last_name)}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.first_name} {user.last_name}
          </h2>
          <p className="text-gray-600">@{user.username}</p>
          <div className="flex items-center justify-center mt-3 space-x-2">
            <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${roleInfo.color}`}>
              <RoleIcon className="w-4 h-4 mr-1" />
              {roleInfo.label}
            </span>
            <span className={`px-3 py-1 text-sm rounded-full ${
              user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          {user.email && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Email</div>
                <div className="text-sm text-gray-600">{user.email}</div>
              </div>
            </div>
          )}
          
          {user.phone && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="p-2 bg-green-100 rounded-lg">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Phone</div>
                <div className="text-sm text-gray-600">{user.phone}</div>
              </div>
            </div>
          )}
          
          {user.last_login && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Last Login</div>
                <div className="text-sm text-gray-600">{formatDate(user.last_login)}</div>
              </div>
            </div>
          )}

          {user.date_joined && (
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">Member Since</div>
                <div className="text-sm text-gray-600">{formatDate(user.date_joined)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300"
          >
            Close
          </button>
          <button 
            onClick={() => onEdit(user)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  user, 
  loading = false 
}) => {
  if (!isOpen || !user) return null;

  const avatarColor = generateAvatarColor(user.first_name + user.last_name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-slide-up overflow-hidden">
        {/* Header with warning gradient */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 text-center border-b border-red-100">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Team Member</h2>
          <p className="text-gray-600">This action cannot be undone</p>
        </div>

        {/* User Info */}
        <div className="p-6 text-center">
          <div className={`w-16 h-16 bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className="text-white font-bold text-lg">
              {generateInitials(user.first_name, user.last_name)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-gray-600 mb-4">@{user.username}</p>
          
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-left">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Warning: This will permanently delete</p>
                <ul className="text-sm mt-1 space-y-1">
                  <li>• User account and all associated data</li>
                  <li>• Login access for this team member</li>
                  <li>• Any permissions and settings</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex space-x-3 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-white hover:shadow-md transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                <span>Delete User</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Notification Component
const SuccessNotification = ({ message, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-2xl shadow-2xl border-l-4 border-emerald-600 max-w-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-white hover:text-green-100 transition-colors duration-300"
          >
            <X className="w-5 h-5" />
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    setDeleteLoading(true);
    try {
      await apiService.deleteUser(userToDelete.id);
      
      // Show success notification
      setShowSuccessNotification(true);
      
      // Close delete modal
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      
      // Refresh users list
      fetchUsers();
      
      // Auto-hide success notification after 3 seconds
      setTimeout(() => {
        setShowSuccessNotification(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
    setDeleteLoading(false);
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Success Notification */}
      <SuccessNotification
        message="Team member deleted successfully"
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
      />

      {/* Header */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 space-y-6 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <JumpNJoyLogo size="w-12 h-12" />
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-red-600 to-yellow-500 bg-clip-text text-transparent">
                Team Management
              </h2>
              <p className="text-gray-600 font-medium">Manage your Jump 'n Joy team members</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center space-x-3 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 text-white px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Team Member</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-blue-600">{stats.total}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Total Team</h3>
            <p className="text-sm text-blue-600">All members</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-green-600">{stats.active}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Active</h3>
            <p className="text-sm text-green-600">Ready to work</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-500 rounded-xl shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-purple-600">{stats.admin}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Admins</h3>
            <p className="text-sm text-purple-600">System managers</p>
          </div>

          <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-bold text-orange-600">{stats.owner}</span>
            </div>
            <h3 className="font-semibold text-gray-900">Owners</h3>
            <p className="text-sm text-orange-600">Full access</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400"
            />
          </div>
          
          <div className="relative">
            <Filter className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400 appearance-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white hover:border-gray-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => {
              const roleInfo = getRoleInfo(user.role);
              const avatarColor = generateAvatarColor(user.first_name + user.last_name);
              const RoleIcon = roleInfo.icon;
              
              return (
                <div 
                  key={user.id} 
                  className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-slide-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-center mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${avatarColor} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white font-bold text-lg">
                        {generateInitials(user.first_name, user.last_name)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {user.first_name} {user.last_name}
                    </h3>
                    <p className="text-gray-600 text-sm">@{user.username}</p>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-center">
                      <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full ${roleInfo.color}`}>
                        <RoleIcon className="w-4 h-4 mr-1" />
                        {roleInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-center">
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {user.email && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    )}

                    {user.phone && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{user.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600 text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Last seen: {user.last_login ? formatDate(user.last_login).split(' at')[0] : 'Never'}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleViewUser(user)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-300"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors duration-300"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' ? (
                <div className="animate-fade-in">
                  <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No team members found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setRoleFilter('all');
                      setStatusFilter('all');
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No team members yet</h3>
                  <p className="text-gray-600 mb-6">Get started by adding your first team member</p>
                  <button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="bg-gradient-to-r from-red-500 to-yellow-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-yellow-600 transition-all duration-300 font-medium transform hover:scale-105"
                  >
                    Add your first team member
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results summary */}
        {filteredUsers.length > 0 && filteredUsers.length !== users.length && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredUsers.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{users.length}</span> team members
            </p>
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
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        user={userToDelete}
        loading={deleteLoading}
      />

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
        
        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UserManagementContent;