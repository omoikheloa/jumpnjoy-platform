import React, { useState } from 'react';
import apiService from '../../services/api';

const Login = ({ onLogin, onError }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.login(formData.username, formData.password);
      onLogin(response.token, response.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      onError && onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="card">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Jump 'n Joy</h2>
            <p className="mt-2 text-gray-600">Staff Management System</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your username"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              className={`w-full btn ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'btn-primary'
              }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
            
            {error && (
              <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <h4 className="font-semibold mb-2">Demo Accounts:</h4>
              <div className="space-y-1">
                <p><span className="font-mono bg-white px-2 py-1 rounded">owner</span> / <span className="font-mono bg-white px-2 py-1 rounded">password123</span></p>
                <p><span className="font-mono bg-white px-2 py-1 rounded">staff1</span> / <span className="font-mono bg-white px-2 py-1 rounded">password123</span></p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
