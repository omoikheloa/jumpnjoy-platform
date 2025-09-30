import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';

const RecentIncidentsGrid = ({ incidents, loading, onViewAll, embedded = false }) => {
  if (loading) {
    return (
      <div className={embedded ? "p-0" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100"}>
        <div className="animate-pulse">
          {!embedded && <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>}
          <div className="space-y-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Extract incidents from results array if it exists (pagination)
  const incidentItems = incidents?.results || incidents || [];

  const getSeverityIcon = (injuryDetails, ambulanceCalled) => {
    if (ambulanceCalled) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('serious')) {
      return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('minor')) {
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
    return <AlertCircle className="w-4 h-4 text-blue-600" />;
  };

  const getSeverityText = (injuryDetails, ambulanceCalled) => {
    if (ambulanceCalled) {
      return 'High';
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('serious')) {
      return 'High';
    }
    if (injuryDetails && injuryDetails.toLowerCase().includes('minor')) {
      return 'Medium';
    }
    return 'Low';
  };

  const getStatusColor = (ambulanceCalled, hospital) => {
    if (ambulanceCalled) {
      return 'bg-red-100 text-red-700';
    }
    if (hospital) {
      return 'bg-yellow-100 text-yellow-700';
    }
    return 'bg-green-100 text-green-700';
  };

  const getStatusText = (ambulanceCalled, hospital) => {
    if (ambulanceCalled) {
      return 'Ambulance Called';
    }
    if (hospital) {
      return 'Hospital Visit';
    }
    return 'First Aid Only';
  };

  // Helper function to get patient name
  const getPatientName = (incident) => {
    if (incident.first_name && incident.surname) {
      return `${incident.first_name} ${incident.surname}`;
    }
    return 'Unknown Patient';
  };

  // Helper function to format date and time
  const formatDateTime = (date, time) => {
    if (!date) return 'Unknown date';
    
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    if (time) {
      return `${formattedDate} at ${time.substring(0, 5)}`;
    }
    
    return formattedDate;
  };

  return (
    <div className={embedded ? "space-y-4" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100"}>
      {/* Header - Only show in non-embedded mode */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Incident Reports</h3>
          <button 
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
      )}

      <div className="space-y-4">
        {incidentItems && incidentItems.length > 0 ? (
          incidentItems.slice(0, 5).map((incident) => (
            <div key={incident.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 rounded-lg bg-white shadow-sm">
                    {getSeverityIcon(incident.injury_details, incident.ambulance_called)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">
                      {getPatientName(incident)} - {incident.injury_location || 'Unknown location'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      {incident.injury_details || 'No details provided'}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{incident.location || 'Unknown location'}</span>
                      <span>•</span>
                      <span>{formatDateTime(incident.date_of_accident, incident.time_of_accident)}</span>
                      <span>•</span>
                      <span>Reported by: {incident.reported_by_name || 'Unknown'}</span>
                    </div>
                    {incident.hospital && (
                      <div className="mt-2 text-xs text-blue-600">
                        Hospital: {incident.hospital}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(incident.ambulance_called, incident.hospital)}`}>
                    {getStatusText(incident.ambulance_called, incident.hospital)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    getSeverityText(incident.injury_details, incident.ambulance_called) === 'High' ? 'bg-red-100 text-red-700' :
                    getSeverityText(incident.injury_details, incident.ambulance_called) === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {getSeverityText(incident.injury_details, incident.ambulance_called)} severity
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No recent incidents</p>
            <p className="text-sm mt-1">Incident reports will appear here when created</p>
          </div>
        )}
      </div>

      {/* View All Button - Only show in embedded mode when there are incidents */}
      {embedded && incidentItems && incidentItems.length > 0 && (
        <button
          onClick={onViewAll}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded py-2 text-sm font-medium transition-colors mt-4"
        >
          View All Incidents
        </button>
      )}
    </div>
  );
};

export default RecentIncidentsGrid;