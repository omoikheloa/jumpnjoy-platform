import React, { useState, useEffect } from 'react';
import {
  User,
  Star,
  Filter,
  Search,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  BarChart3,
  X,
  Target,
  Award,
  Clock,
  UserCheck
} from 'lucide-react';
import apiService from '../../services/api';

const StaffAppraisalsView = ({ onBack }) => {
  const [appraisals, setAppraisals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    rating: 'all',
    employee: 'all',
    appraiser: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    averageRating: 0,
    highPerformers: 0,
    thisMonth: 0
  });

  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAppraisals();
        const appraisalItems = response.results || response || [];
        setAppraisals(Array.isArray(appraisalItems) ? appraisalItems : []);
        
        // Calculate statistics
        calculateStats(appraisalItems);
      } catch (err) {
        console.error('Error fetching appraisals:', err);
        setError(err.message);
        
        // Fallback mock data for demonstration
        const mockAppraisals = [
          {
            id: 1,
            employee_name: 'Sarah Johnson',
            appraiser_name: 'Michael Brown',
            date_of_appraisal: '2023-06-15',
            average_rating: 4.7,
            achievements: 'Exceeded safety targets, received positive customer feedback',
            goals: 'Complete advanced safety training, mentor new staff members',
            status: 'completed',
            department: 'Operations'
          },
          {
            id: 2,
            employee_name: 'Mike Chen',
            appraiser_name: 'Lisa Thompson',
            date_of_appraisal: '2023-06-10',
            average_rating: 3.8,
            achievements: 'Improved cafe sales by 15%, implemented new inventory system',
            goals: 'Increase sales by another 10%, reduce waste by 5%',
            status: 'completed',
            department: 'Cafe'
          },
          {
            id: 3,
            employee_name: 'Emma Wilson',
            appraiser_name: 'James Wilson',
            date_of_appraisal: '2023-06-05',
            average_rating: 4.2,
            achievements: 'Maintained perfect safety record, trained 3 new team members',
            goals: 'Develop leadership skills, take on supervisory responsibilities',
            status: 'completed',
            department: 'Safety'
          },
          {
            id: 4,
            employee_name: 'Alex Thompson',
            appraiser_name: 'Michael Brown',
            date_of_appraisal: '2023-05-28',
            average_rating: 4.9,
            achievements: 'Highest customer satisfaction ratings, implemented new booking system',
            goals: 'Cross-train in operations, develop customer service training program',
            status: 'completed',
            department: 'Front Desk'
          },
          {
            id: 5,
            employee_name: 'James Wilson',
            appraiser_name: 'Lisa Thompson',
            date_of_appraisal: '2023-05-20',
            average_rating: 3.5,
            achievements: 'Reduced maintenance costs by 10%, improved equipment uptime',
            goals: 'Complete advanced maintenance certification, implement preventive maintenance schedule',
            status: 'completed',
            department: 'Maintenance'
          }
        ];
        setAppraisals(mockAppraisals);
        calculateStats(mockAppraisals);
      } finally {
        setLoading(false);
      }
    };

    fetchAppraisals();
  }, []);

  const calculateStats = (appraisalData) => {
    const total = appraisalData.length;
    const averageRating = appraisalData.reduce((sum, appraisal) => sum + (appraisal.average_rating || 0), 0) / total;
    const highPerformers = appraisalData.filter(appraisal => appraisal.average_rating >= 4.5).length;
    const thisMonth = appraisalData.filter(appraisal => {
      const appraisalDate = new Date(appraisal.date_of_appraisal);
      const now = new Date();
      return appraisalDate.getMonth() === now.getMonth() && 
             appraisalDate.getFullYear() === now.getFullYear();
    }).length;

    setStats({ 
      total, 
      averageRating: parseFloat(averageRating.toFixed(1)), 
      highPerformers, 
      thisMonth 
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      rating: 'all',
      employee: 'all',
      appraiser: 'all',
      search: ''
    });
  };

  const filteredAppraisals = appraisals.filter(appraisal => {
    // Date filter
    if (filters.dateRange !== 'all') {
      const appraisalDate = new Date(appraisal.date_of_appraisal);
      const now = new Date();
      let startDate;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'quarter':
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== 'all' && appraisalDate < startDate) {
        return false;
      }
    }
    
    // Rating filter
    if (filters.rating !== 'all') {
      const ratingValue = parseFloat(filters.rating);
      if (appraisal.average_rating < ratingValue || appraisal.average_rating >= ratingValue + 1) {
        return false;
      }
    }
    
    // Employee filter
    if (filters.employee !== 'all' && appraisal.employee_name !== filters.employee) {
      return false;
    }
    
    // Appraiser filter
    if (filters.appraiser !== 'all' && appraisal.appraiser_name !== filters.appraiser) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch = 
        (appraisal.employee_name && appraisal.employee_name.toLowerCase().includes(searchTerm)) ||
        (appraisal.appraiser_name && appraisal.appraiser_name.toLowerCase().includes(searchTerm)) ||
        (appraisal.achievements && appraisal.achievements.toLowerCase().includes(searchTerm)) ||
        (appraisal.goals && appraisal.goals.toLowerCase().includes(searchTerm)) ||
        (appraisal.department && appraisal.department.toLowerCase().includes(searchTerm));
      
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  const sortedAppraisals = [...filteredAppraisals].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.date_of_appraisal);
        bValue = new Date(b.date_of_appraisal);
        break;
      case 'rating':
        aValue = a.average_rating;
        bValue = b.average_rating;
        break;
      case 'employee':
        aValue = a.employee_name.toLowerCase();
        bValue = b.employee_name.toLowerCase();
        break;
      case 'appraiser':
        aValue = a.appraiser_name.toLowerCase();
        bValue = b.appraiser_name.toLowerCase();
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-green-100 text-green-800 border-green-200';
    if (rating >= 3.5) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (rating >= 2.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getStatusColor = (status) => {
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'scheduled') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUniqueEmployees = () => {
    const employees = appraisals.map(appraisal => appraisal.employee_name).filter(Boolean);
    return [...new Set(employees)];
  };

  const getUniqueAppraisers = () => {
    const appraisers = appraisals.map(appraisal => appraisal.appraiser_name).filter(Boolean);
    return [...new Set(appraisers)];
  };

  const getUniqueDepartments = () => {
    const departments = appraisals.map(appraisal => appraisal.department).filter(Boolean);
    return [...new Set(departments)];
  };

  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ['Date', 'Employee', 'Appraiser', 'Rating', 'Department', 'Status'];
    const csvData = sortedAppraisals.map(appraisal => [
      appraisal.date_of_appraisal,
      appraisal.employee_name,
      appraisal.appraiser_name,
      appraisal.average_rating,
      appraisal.department,
      appraisal.status
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'staff_appraisals.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key={fullStars} className="w-4 h-4 text-yellow-500 fill-current" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={fullStars + i + 1} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center space-x-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Staff Appraisals</h2>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total appraisals: {appraisals.length} | Filtered: {filteredAppraisals.length}
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-blue-800">Total Appraisals</h3>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-green-800">Avg. Rating</h3>
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.averageRating}/5</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-purple-800">High Performers</h3>
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.highPerformers}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-orange-800">This Month</h3>
              <BarChart3 className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search appraisals..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="quarter">Past Quarter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Ratings</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  value={filters.employee}
                  onChange={(e) => handleFilterChange('employee', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Employees</option>
                  {getUniqueEmployees().map(employee => (
                    <option key={employee} value={employee}>{employee}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Appraiser</label>
                <select
                  value={filters.appraiser}
                  onChange={(e) => handleFilterChange('appraiser', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Appraisers</option>
                  {getUniqueAppraisers().map(appraiser => (
                    <option key={appraiser} value={appraiser}>{appraiser}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sorting */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">{filteredAppraisals.length} appraisals found</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="date">Date</option>
              <option value="rating">Rating</option>
              <option value="employee">Employee</option>
              <option value="appraiser">Appraiser</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-600 hover:text-gray-800"
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
          </div>
        </div>

        {/* Appraisal List */}
        {filteredAppraisals.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appraisals found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppraisals.map((appraisal) => (
              <div 
                key={appraisal.id} 
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedAppraisal(appraisal)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {appraisal.employee_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Appraised by: {appraisal.appraiser_name}
                        </p>
                      </div>
                      <div className="flex items-center mt-2 md:mt-0">
                        <div className="flex items-center mr-4">
                          {renderStars(appraisal.average_rating)}
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {appraisal.average_rating.toFixed(1)}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(appraisal.status)}`}>
                          {appraisal.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(appraisal.date_of_appraisal).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>{appraisal.department}</span>
                      </div>
                      <div className="flex items-center">
                        {appraisal.average_rating >= 4 ? (
                          <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-2 text-red-600" />
                        )}
                        <span className={appraisal.average_rating >= 4 ? 'text-green-600' : 'text-red-600'}>
                          {appraisal.average_rating >= 4 ? 'Exceeding' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Achievements</h4>
                        <p className="text-gray-600 line-clamp-2">
                          {appraisal.achievements || 'No achievements recorded'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Goals</h4>
                        <p className="text-gray-600 line-clamp-2">
                          {appraisal.goals || 'No goals set'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Appraisal Detail Modal */}
        {selectedAppraisal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Appraisal Details</h3>
                <button 
                  onClick={() => setSelectedAppraisal(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Employee</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedAppraisal.employee_name}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Appraiser</h4>
                  <p className="text-gray-900">{selectedAppraisal.appraiser_name}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Date</h4>
                  <p className="text-gray-900">
                    {new Date(selectedAppraisal.date_of_appraisal).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Department</h4>
                  <p className="text-gray-900">{selectedAppraisal.department}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Rating</h4>
                  <div className="flex items-center">
                    {renderStars(selectedAppraisal.average_rating)}
                    <span className="ml-2 text-lg font-semibold text-gray-900">
                      {selectedAppraisal.average_rating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedAppraisal.status)}`}>
                    {selectedAppraisal.status}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Achievements</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedAppraisal.achievements || 'No achievements recorded'}
                </p>
              </div>
              
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Goals</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedAppraisal.goals || 'No goals set'}
                </p>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Edit Appraisal
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Schedule Follow-up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffAppraisalsView;