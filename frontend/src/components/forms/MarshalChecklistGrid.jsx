import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  ClipboardList,
  ChevronRight,
  Shield,
} from 'lucide-react';

const MarshalChecklistGrid = ({ checklists, loading, onViewAll, embedded = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    if (checklists && !loading) {
      const checklistItems = checklists?.results || checklists || [];
      console.log('Raw marshal checklist items:', checklistItems);
      
      // Extract unique dates from the checklist items
      const uniqueDates = [...new Set(checklistItems
        .filter(item => item && item.date)
        .map(item => item.date)
      )].sort().reverse();
      
      console.log('Available marshal dates:', uniqueDates);
      setDateOptions(uniqueDates);
      
      // If current selected date is not in available dates, set to first available date
      if (uniqueDates.length > 0 && !uniqueDates.includes(selectedDate)) {
        setSelectedDate(uniqueDates[0]);
      }
    }
  }, [checklists, loading, selectedDate]);

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

  // Safely get checklist items
  const checklistItems = checklists?.results || checklists || [];
  console.log('Total marshal checklist items:', checklistItems.length);
  
  // Filter items for selected date
  const filteredChecklists = checklistItems.filter(item => item && item.date === selectedDate);
  console.log(`Marshal items for ${selectedDate}:`, filteredChecklists);

  // Group by checklist type - FIXED: Use the actual display names from backend
  const groupedChecklists = filteredChecklists.reduce((groups, item) => {
    if (!item) return groups;
    
    // Use the display type from backend (this matches what's actually in your data)
    const type = item.checklist_type_display || item.checklist_type || 'Unknown';
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});

  console.log('Grouped marshal checklists:', groupedChecklists);

  // FIXED: Updated checklist types to match backend display names
  const checklistTypes = [
    { 
      key: 'Pre-Shift Marshal Checklist', 
      label: 'Pre-Shift Marshal', 
      icon: '🛡️',
      color: 'green'
    },
    { 
      key: 'Shift Operations Checklist', 
      label: 'Shift Operations', 
      icon: '🔍',
      color: 'blue'
    },
    { 
      key: 'Post-Shift Marshal Checklist', 
      label: 'Post-Shift Marshal', 
      icon: '📋',
      color: 'purple'
    }
  ];

  const getCompletionStatus = (items) => {
    const completedCount = items.filter(item => item.completed).length;
    const totalCount = items.length;
    
    if (totalCount === 0) return { status: 'Not Started', color: 'bg-gray-100 text-gray-700', progress: 0 };
    if (completedCount === totalCount) return { status: 'Completed', color: 'bg-green-100 text-green-700', progress: 100 };
    if (completedCount > 0) return { status: 'In Progress', color: 'bg-yellow-100 text-yellow-700', progress: (completedCount / totalCount) * 100 };
    return { status: 'Not Started', color: 'bg-gray-100 text-gray-700', progress: 0 };
  };

  const getColorClasses = (checklistType) => {
    const type = checklistTypes.find(t => t.key === checklistType);
    const color = type?.color || 'gray';
    
    return {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        progress: 'bg-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        progress: 'bg-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        progress: 'bg-purple-600'
      },
      gray: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        progress: 'bg-gray-600'
      }
    }[color];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  };

  // Check if we have any checklists for the selected date
  const hasChecklistsForDate = checklistTypes.some(type => {
    const items = groupedChecklists[type.key] || [];
    return items.length > 0;
  });

  return (
    <div className={embedded ? "space-y-4" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100"}>
      {/* Header - Only show in non-embedded mode */}
      {!embedded && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Marshal Checklists
          </h3>
          <div className="flex items-center space-x-4">
            {/* Date Selector */}
            {dateOptions.length > 0 && (
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                {dateOptions.map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            )}
            <button 
              onClick={onViewAll}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
        </div>
      )}

      {/* Embedded Mode Header */}
      {embedded && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            Marshal Checklists
          </h3>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      )}

      <div className="space-y-4">
        {!hasChecklistsForDate ? (
          <div className="text-center py-8 text-gray-500">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No marshal checklist items for {formatDate(selectedDate)}</p>
            <p className="text-sm mt-1">Marshal checklists will appear here when created</p>
          </div>
        ) : (
          checklistTypes.map(({ key, label, icon }) => {
            const items = groupedChecklists[key] || [];
            const completion = getCompletionStatus(items);
            const colors = getColorClasses(key);
            const displayItems = items.slice(0, 3); // Show only first 3 items for preview

            // Don't show checklist type if there are no items for it
            if (items.length === 0) {
              return null;
            }

            return (
              <div key={key} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-white shadow-sm text-lg">
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {label}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                        <div 
                          className="h-1.5 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${completion.progress}%`,
                            backgroundColor: colors.progress
                          }}
                        />
                      </div>

                      {/* Checklist Items Preview */}
                      <div className="space-y-1 mb-2">
                        {displayItems.length === 0 ? (
                          <p className="text-xs text-gray-500">No items in this checklist</p>
                        ) : (
                          displayItems.map((item) => (
                            <div key={item.id} className="flex items-center space-x-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${
                                item.completed ? 'bg-green-500' : 'bg-gray-300'
                              }`} />
                              <span className={`truncate ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {item.item_name || 'Unnamed Item'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Completion Stats */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{items.filter(item => item.completed).length} of {items.length} completed</span>
                        <span>•</span>
                        <span>{formatDate(selectedDate)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Status Badges */}
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${completion.color}`}>
                      {completion.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {items.length} items
                    </span>
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean) // Remove null values
        )}
      </div>

      {/* View All Button - Only show in embedded mode when there are checklists */}
      {embedded && hasChecklistsForDate && (
        <button
          onClick={onViewAll}
          className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded py-2 text-sm font-medium transition-colors mt-4"
        >
          View All Marshal Checklists
        </button>
      )}
    </div>
  );
};

export default MarshalChecklistGrid;