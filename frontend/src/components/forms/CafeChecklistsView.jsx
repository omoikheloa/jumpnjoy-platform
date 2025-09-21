import React, { useState, useEffect } from 'react';
import { Coffee, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import apiService from '../../services/api';

const CafeChecklistsView = ({ onBack }) => {
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('all'); // Changed to 'all' by default
  const [dateOptions, setDateOptions] = useState([]);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const fetchChecklists = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCafeChecklists();
        const checklistItems = response.results || response || [];
        
        // Debug logging
        console.log('API Response:', response);
        console.log('Checklist Items:', checklistItems);
        console.log('Is Array:', Array.isArray(checklistItems));
        
        setChecklists(Array.isArray(checklistItems) ? checklistItems : []);
        
        // Extract unique dates and sort them
        if (Array.isArray(checklistItems) && checklistItems.length > 0) {
          const uniqueDates = [...new Set(checklistItems.map(item => item.date))].sort().reverse();
          console.log('Unique Dates:', uniqueDates);
          setDateOptions(uniqueDates);
        }
      } catch (err) {
        console.error('Error fetching checklists:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchChecklists();
  }, []);

  const handleToggleItem = async (itemId, currentStatus) => {
    try {
      await apiService.toggleCafeChecklistItem(itemId);
      // Refresh the checklists after toggling
      const updatedChecklists = await apiService.getCafeChecklists();
      const checklistItems = updatedChecklists.results || updatedChecklists || [];
      setChecklists(Array.isArray(checklistItems) ? checklistItems : []);
    } catch (error) {
      console.error('Error toggling checklist item:', error);
    }
  };

  // Fixed filtering logic
  const filteredChecklists = checklists.filter(item => {
    const matchesDate = selectedDate === 'all' || item.date === selectedDate;
    
    let matchesType = false;
    if (filterType === 'all') {
      matchesType = true;
    } else if (filterType === 'completed') {
      matchesType = item.completed === true;
    } else if (filterType === 'pending') {
      matchesType = item.completed === false;
    } else {
      // Check if it's a checklist type filter
      matchesType = item.checklist_type_display && 
        item.checklist_type_display.toLowerCase().includes(filterType.toLowerCase());
    }
    
    return matchesDate && matchesType;
  });

  // Debug logging for filtering
  console.log('Selected Date:', selectedDate);
  console.log('Filter Type:', filterType);
  console.log('Total Checklists:', checklists.length);
  console.log('Filtered Checklists:', filteredChecklists.length);

  // Group by date and checklist type
  const groupedChecklists = filteredChecklists.reduce((groups, item) => {
    const date = item.date;
    const type = item.checklist_type_display || item.checklist_type || 'Other';
    
    if (!groups[date]) {
      groups[date] = {};
    }
    if (!groups[date][type]) {
      groups[date][type] = [];
    }
    groups[date][type].push(item);
    return groups;
  }, {});

  const isPastDate = (date) => date < new Date().toISOString().split('T')[0];

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
              <Coffee className="w-6 h-6 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900">Cafe Checklists</h2>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Total items: {checklists.length} | Filtered: {filteredChecklists.length} | Completed: {checklists.filter(item => item.completed).length}
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Debug info */}
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm">
          <p>Debug: Total checklists loaded: {checklists.length}</p>
          <p>Debug: Filtered checklists: {filteredChecklists.length}</p>
          <p>Debug: Selected date: {selectedDate}</p>
          <p>Debug: Available dates: {dateOptions.join(', ')}</p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date:</label>
            <select
              value={selectedDate}
              onChange={(e) => {
                console.log('Date filter changed to:', e.target.value);
                setSelectedDate(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Dates</option>
              {dateOptions.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-GB', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                  {date === new Date().toISOString().split('T')[0] ? ' (Today)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status:</label>
            <select
              value={filterType}
              onChange={(e) => {
                console.log('Type filter changed to:', e.target.value);
                setFilterType(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">All Items</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedDate('all');
                setFilterType('all');
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Checklist Items */}
        {Object.keys(groupedChecklists).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No checklist items found</h3>
            <p>
              {checklists.length === 0 
                ? 'No checklist items available.' 
                : 'Try adjusting your filters or check back later.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedChecklists)
              .sort(([a], [b]) => new Date(b) - new Date(a))
              .map(([date, typeGroups]) => (
                <div key={date} className="border border-gray-200 rounded-2xl p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {new Date(date).toLocaleDateString('en-GB', { 
                        weekday: 'long', 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </h3>
                    <div className="flex items-center space-x-4">
                      {isPastDate(date) && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                          Historical
                        </span>
                      )}
                      {date === new Date().toISOString().split('T')[0] && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                  </div>

                  {Object.entries(typeGroups).map(([type, items]) => (
                    <div key={type} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800 text-lg">{type}</h4>
                        <div className="text-sm text-gray-500">
                          {items.filter(item => item.completed).length} of {items.length} completed
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {items.map((item) => (
                          <div 
                            key={item.id} 
                            className={`p-4 rounded-lg border-2 transition-all ${
                              item.completed 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  item.completed ? 'bg-green-500' : 'bg-gray-300'
                                } ${isPastDate(date) ? 'opacity-50' : 'cursor-pointer'}`}
                                onClick={() => !isPastDate(date) && handleToggleItem(item.id, item.completed)}
                                >
                                  {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <h5 className={`font-medium ${
                                    item.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                                  }`}>
                                    {item.item_name}
                                  </h5>
                                </div>
                              </div>
                              {item.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                              )}
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center justify-between">
                                <span>Assigned to:</span>
                                <span className="font-medium">{item.created_by_name || 'Unknown'}</span>
                              </div>
                              {item.completed && item.updated_at && (
                                <div className="flex items-center justify-between">
                                  <span>Completed:</span>
                                  <span className="font-medium text-green-600">
                                    {new Date(item.updated_at).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>

                            {!isPastDate(date) && !item.completed && (
                              <button
                                onClick={() => handleToggleItem(item.id, item.completed)}
                                className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Progress bar for each type */}
                      <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-medium text-gray-700">{type} Progress</span>
                          <span className="text-gray-600">
                            {Math.round((items.filter(item => item.completed).length / items.length) * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-green-500 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${(items.filter(item => item.completed).length / items.length) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CafeChecklistsView;