import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Filter,
  Search,
  Download,
  Calendar,
  User,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  FileText,
  BarChart3,
  X
} from 'lucide-react';
import apiService from '../../services/api';

const IncidentReportsView = ({ onBack }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dateRange: 'all',   // 'all', 'today', 'week', 'month'
    severity: 'all',    // 'all', 'high', 'medium', 'low'
    status: 'all',      // 'all', 'resolved', 'reported'
    location: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState('date');      // 'date', 'severity', 'name'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    highSeverity: 0,
    withAmbulance: 0,
    thisMonth: 0
  });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getIncidents();
        // Normalize to an array
        const incidentItems = response?.results ?? response ?? [];
        const itemsArray = Array.isArray(incidentItems) ? incidentItems : [];
        setIncidents(itemsArray);

        // Calculate stats
        calculateStats(itemsArray);
      } catch (err) {
        console.error('Error fetching incidents:', err);
        setError(err?.message ?? 'Error fetching incidents');
        setIncidents([]);
        setStats({ total: 0, highSeverity: 0, withAmbulance: 0, thisMonth: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  const getSeverityLevel = (incident) => {
    if (incident.ambulance_called === true) {
      return 'high';
    }
    if (incident.hospital && incident.hospital.trim() !== '') {
      return 'medium';
    }
    return 'low';
  };

  const calculateStats = (incidentData) => {
    const total = incidentData.length;
    const withAmbulance = incidentData.filter(
      incident => incident.ambulance_called === true
    ).length;

    // Define highSeverity to match the "high" label only
    const highSeverity = incidentData.filter(
      incident => getSeverityLevel(incident) === 'high'
    ).length;

    const now = new Date();
    const thisMonth = incidentData.filter(incident => {
      const dateStr = incident.date_of_accident;
      if (!dateStr) return false;
      const incidentDate = new Date(dateStr);
      return (
        incidentDate.getMonth() === now.getMonth() &&
        incidentDate.getFullYear() === now.getFullYear()
      );
    }).length;

    setStats({ total, highSeverity, withAmbulance, thisMonth });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleSortFieldChange = (field) => {
    setSortBy(field);
    // when changing field, reset sort order to descending by default
    setSortOrder('desc');
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      severity: 'all',
      status: 'all',
      location: 'all',
      search: ''
    });
  };

  const getSeverityColor = (incident) => {
    const severity = getSeverityLevel(incident);
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (incident) => {
    if (incident.riddor_reportable) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const formatStatus = (incident) => {
    if (incident.riddor_reportable) {
      return 'RIDDOR Reported';
    }
    return 'Resolved';
  };

  const getUniqueLocations = () => {
    const locs = incidents
      .map(incident => incident.location)
      .filter(loc => loc && typeof loc === 'string' && loc.trim() !== '');
    return [...new Set(locs)];
  };

  // Apply filters
  const filteredIncidents = incidents.filter(incident => {
    // Date filter
    if (filters.dateRange !== 'all') {
      const dateStr = incident.date_of_accident;
      if (!dateStr) return false;
      const incidentDate = new Date(dateStr);
      const now = new Date();
      let startDate;

      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date();
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate = new Date();
          startDate.setMonth(now.getMonth() - 1);
          break;
        default:
          startDate = null;
      }

      if (startDate && incidentDate < startDate) {
        return false;
      }
    }

    // Severity filter
    if (filters.severity !== 'all') {
      const severity = getSeverityLevel(incident);
      if (severity !== filters.severity) {
        return false;
      }
    }

    // Status filter
    if (filters.status !== 'all') {
      const status = incident.riddor_reportable ? 'reported' : 'resolved';
      if (status !== filters.status) {
        return false;
      }
    }

    // Location filter
    if (filters.location !== 'all' && incident.location !== filters.location) {
      return false;
    }

    // Search filter
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase();
      const match = 
        (incident.first_name || '').toLowerCase().includes(searchTerm) ||
        (incident.surname || '').toLowerCase().includes(searchTerm) ||
        (incident.injury_location || '').toLowerCase().includes(searchTerm) ||
        (incident.injury_details || '').toLowerCase().includes(searchTerm) ||
        (incident.how_occurred || '').toLowerCase().includes(searchTerm) ||
        (incident.reported_by_name || '').toLowerCase().includes(searchTerm);
      if (!match) return false;
    }

    return true;
  });

  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'date':
        aValue = a.date_of_accident ? new Date(a.date_of_accident) : new Date(0);
        bValue = b.date_of_accident ? new Date(b.date_of_accident) : new Date(0);
        break;
      case 'severity':
        const severityOrder = { high: 3, medium: 2, low: 1 };
        aValue = severityOrder[getSeverityLevel(a)] || 0;
        bValue = severityOrder[getSeverityLevel(b)] || 0;
        break;
      case 'name':
        aValue = `${a.first_name || ''} ${a.surname || ''}`.toLowerCase();
        bValue = `${b.first_name || ''} ${b.surname || ''}`.toLowerCase();
        break;
      default:
        aValue = a[sortBy];
        bValue = b[sortBy];
    }

    if (sortOrder === 'asc') {
      if (aValue > bValue) return 1;
      if (aValue < bValue) return -1;
      return 0;
    } else {
      if (aValue < bValue) return 1;
      if (aValue > bValue) return -1;
      return 0;
    }
  });

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Patient Name',
      'Injury Location',
      'Injury Details',
      'Severity',
      'Status',
      'Reported By'
    ];

    const csvData = sortedIncidents.map(incident => [
      incident.date_of_accident || '',
      `${incident.first_name || ''} ${incident.surname || ''}`.trim(),
      incident.injury_location || '',
      incident.injury_details || '',
      getSeverityLevel(incident),
      formatStatus(incident),
      incident.reported_by_name || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', 'incident_reports.csv');
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(index => (
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
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h2 className="text-2xl font-bold text-gray-900">Incident Reports</h2>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total incidents: {incidents.length} | Filtered: {filteredIncidents.length}
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
              <h3 className="text-sm font-medium text-blue-800">Total Incidents</h3>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-red-800">High Severity</h3>
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.highSeverity}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-orange-800">Ambulance Called</h3>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.withAmbulance}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-purple-800">This Month</h3>
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search incidents..."
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
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
                  onChange={e => handleFilterChange('dateRange', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                <select
                  value={filters.severity}
                  onChange={e => handleFilterChange('severity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Severity</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="resolved">Resolved</option>
                  <option value="reported">RIDDOR Reported</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={filters.location}
                  onChange={e => handleFilterChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="all">All Locations</option>
                  {getUniqueLocations().map(location => (
                    <option key={location} value={location}>{location}</option>
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
          <p className="text-sm text-gray-600">{filteredIncidents.length} incidents found</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={e => handleSortFieldChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
            >
              <option value="date">Date</option>
              <option value="severity">Severity</option>
              <option value="name">Name</option>
            </select>
            <button
              onClick={toggleSortOrder}
              className="p-1 text-gray-600 hover:text-gray-800"
            >
              {sortOrder === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>

        {/* Incident List */}
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedIncidents.map(incident => (
              <div
                key={incident.id}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedIncident(incident)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {incident.first_name || ''} {incident.surname || ''}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(incident)}`}>
                        {incident.ambulance_called ? 'Ambulance Called' : getSeverityLevel(incident)}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(incident)}`}>
                        {formatStatus(incident)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{incident.injury_location || ''} • {incident.location || ''}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{incident.date_of_accident ? new Date(incident.date_of_accident).toLocaleDateString() : ''}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{incident.time_of_accident ? incident.time_of_accident.substring(0, 5) : ''}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">
                      {incident.injury_details || incident.how_occurred || ''}
                    </p>

                    <div className="flex items-center text-xs text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>Reported by: {incident.reported_by_name || ''}</span>
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

        {/* Incident Detail Modal */}
        {selectedIncident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Incident Details</h3>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Patient Information</h4>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedIncident.first_name || ''} {selectedIncident.surname || ''}
                  </p>
                  <p className="text-sm text-gray-600">Age: {selectedIncident.age ?? '—'}</p>
                  <p className="text-sm text-gray-600">
                    {(selectedIncident.address || '')}, {(selectedIncident.postcode || '')}
                  </p>
                  <p className="text-sm text-gray-600">Phone: {selectedIncident.phone_mobile || selectedIncident.phone_home || '—'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Date & Time</h4>
                  <p className="text-gray-900">
                    {selectedIncident.date_of_accident
                      ? new Date(selectedIncident.date_of_accident).toLocaleDateString()
                      : ''}
                    {selectedIncident.time_of_accident
                      ? ` at ${selectedIncident.time_of_accident.substring(0, 5)}`
                      : ''}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Injury Location</h4>
                  <p className="text-gray-900">{selectedIncident.injury_location || ''}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Park Location</h4>
                  <p className="text-gray-900">{selectedIncident.location || ''}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Severity</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${getSeverityColor(selectedIncident)}`}>
                    {selectedIncident.ambulance_called ? 'Ambulance Called' : getSeverityLevel(selectedIncident)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                  <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(selectedIncident)}`}>
                    {formatStatus(selectedIncident)}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">How It Occurred</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedIncident.how_occurred || ''}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Injury Details</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedIncident.injury_details || ''}
                </p>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Treatment Given</h4>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedIncident.treatment_given || ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Reported By</h4>
                  <p className="text-gray-900">{selectedIncident.reported_by_name || ''}</p>
                </div>

                {selectedIncident.hospital && selectedIncident.hospital.trim() !== '' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Hospital</h4>
                    <p className="text-gray-900">{selectedIncident.hospital}</p>
                  </div>
                )}

                {selectedIncident.first_aider_name && selectedIncident.first_aider_name !== 'N/A' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">First Aider</h4>
                    <p className="text-gray-900">{selectedIncident.first_aider_name}</p>
                  </div>
                )}

                {selectedIncident.guardian_name && selectedIncident.guardian_name.trim() !== '' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Guardian</h4>
                    <p className="text-gray-900">{selectedIncident.guardian_name}</p>
                  </div>
                )}
              </div>

              {selectedIncident.ambulance_called && (
                <div className="mb-6 bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-red-800 mb-2">Ambulance Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedIncident.ambulance_time_called && (
                      <div>
                        <span className="text-xs text-red-600">Time Called:</span>
                        <p className="text-red-900">{selectedIncident.ambulance_time_called}</p>
                      </div>
                    )}
                    {selectedIncident.ambulance_caller && (
                      <div>
                        <span className="text-xs text-red-600">Called By:</span>
                        <p className="text-red-900">{selectedIncident.ambulance_caller}</p>
                      </div>
                    )}
                    {selectedIncident.ambulance_time_arrived && (
                      <div>
                        <span className="text-xs text-red-600">Time Arrived:</span>
                        <p className="text-red-900">{selectedIncident.ambulance_time_arrived}</p>
                      </div>
                    )}
                    {selectedIncident.destination && (
                      <div>
                        <span className="text-xs text-red-600">Destination:</span>
                        <p className="text-red-900">{selectedIncident.destination}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Edit Details
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Add Follow-up
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentReportsView;