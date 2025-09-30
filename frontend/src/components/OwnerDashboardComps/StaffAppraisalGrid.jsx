import React from 'react';
import { Star } from 'lucide-react';

const StaffAppraisalGrid = ({ appraisals, loading, onViewAll, embedded = false }) => {
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

  // Extract appraisals from results array if it exists (pagination)
  const appraisalItems = appraisals?.results || appraisals || [];

  const getStatusColor = (dateOfAppraisal) => {
    const today = new Date();
    const appraisalDate = new Date(dateOfAppraisal);
    
    // If appraisal date is in the future, it's upcoming
    if (appraisalDate > today) {
      return 'bg-blue-100 text-blue-700';
    }
    
    // If appraisal date is within the last 30 days, it's recent
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (appraisalDate >= thirtyDaysAgo) {
      return 'bg-green-100 text-green-700';
    }
    
    // Otherwise, it's older
    return 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (dateOfAppraisal) => {
    const today = new Date();
    const appraisalDate = new Date(dateOfAppraisal);
    
    if (appraisalDate > today) {
      return 'Upcoming';
    }
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (appraisalDate >= thirtyDaysAgo) {
      return 'Recent';
    }
    
    return 'Completed';
  };

  return (
    <div className={embedded ? "space-y-4" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100"}>
      {/* Header - Only show in non-embedded mode */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Staff Appraisals</h3>
          <button 
            onClick={onViewAll}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
      )}

      <div className="space-y-4">
        {appraisalItems && appraisalItems.length > 0 ? (
          appraisalItems.slice(0, 2).map((appraisal) => (
            <div key={appraisal.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {appraisal.employee_name ? appraisal.employee_name.split(' ').map(n => n[0]).join('') : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {appraisal.employee_name || 'Unknown Employee'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Appraised by: {appraisal.appraiser_name || 'Unknown Appraiser'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {appraisal.date_of_appraisal ? new Date(appraisal.date_of_appraisal).toLocaleDateString() : 'No date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {appraisal.average_rating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {appraisal.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(appraisal.date_of_appraisal)}`}>
                    {getStatusText(appraisal.date_of_appraisal)}
                  </span>
                </div>
              </div>
              
              {/* Additional details */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium text-gray-600">Achievements:</span>
                    <p className="text-gray-800 truncate">{appraisal.achievements || 'None recorded'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Goals:</span>
                    <p className="text-gray-800 truncate">{appraisal.goals || 'None set'}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No appraisals available</p>
            <p className="text-sm mt-1">Staff appraisals will appear here once conducted</p>
          </div>
        )}
      </div>

      {/* View All Button - Only show in embedded mode when there are appraisals */}
      {embedded && appraisalItems && appraisalItems.length > 0 && (
        <button
          onClick={onViewAll}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded py-2 text-sm font-medium transition-colors mt-4"
        >
          View All Appraisals
        </button>
      )}
    </div>
  );
};

export default StaffAppraisalGrid;