import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  Coffee,
  ClipboardList,
} from 'lucide-react';

const CafeChecklistGrid = ({ checklists, loading, onViewChecklist, embedded = false }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateOptions, setDateOptions] = useState([]);

  useEffect(() => {
    if (checklists && !loading) {
      const checklistItems = checklists?.results || checklists || [];
      const uniqueDates = [...new Set(checklistItems.map(item => item.date))].sort().reverse();
      setDateOptions(uniqueDates);
    }
  }, [checklists, loading]);

  if (loading) {
    return (
      <div className={embedded ? "p-0" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100"}>
        <div className="animate-pulse">
          {!embedded && <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                {[1, 2, 3, 4].map((itemIndex) => (
                  <div key={itemIndex} className="h-12 bg-gray-200 rounded-lg"></div>
                ))}
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const checklistItems = checklists?.results || checklists || [];
  const filteredChecklists = checklistItems.filter(item => item.date === selectedDate);
  
  const groupedChecklists = filteredChecklists.reduce((groups, item) => {
    const type = item.checklist_type_display || item.checklist_type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {});

  const checklistTypes = [
    { key: 'Opening', label: 'Opening' },
    { key: 'Midday', label: 'Midday' },
    { key: 'Closing', label: 'Closing' }
  ];

  const handleViewChecklist = (checklistType) => {
    if (onViewChecklist) {
      onViewChecklist(checklistType, selectedDate);
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const isPastDate = selectedDate < new Date().toISOString().split('T')[0];

  return (
    <div className={embedded ? "space-y-4" : "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6"}>
      {/* Date Selector - Only show in non-embedded mode or when there are multiple dates */}
      {!embedded && (
        <div className="mb-4">
          <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date:
          </label>
          <select
            id="date-select"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full"
          >
            {dateOptions.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('en-GB', { 
                  weekday: 'short', 
                  day: '2-digit', 
                  month: 'short'
                })}
                {date === new Date().toISOString().split('T')[0] ? ' (Today)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {filteredChecklists.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm">No checklist items for selected date</p>
        </div>
      ) : (
        <>
          {/* Date Header - Only show in non-embedded mode */}
          {!embedded && (
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900 text-sm">
                {new Date(selectedDate).toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h4>
              {isPastDate && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  Historical
                </span>
              )}
            </div>
          )}

          {/* Grid of 3 Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {checklistTypes.map(({ key, label }) => {
              const items = groupedChecklists[key] || [];
              const completedCount = items.filter(item => item.completed).length;
              const totalCount = items.length;
              const displayItems = items.slice(0, 4); // Show only first 4 items

              return (
                <div key={key} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {/* Checklist Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-wide">
                      {label}
                    </h5>
                    <span className="text-xs bg-white px-2 py-1 rounded border">
                      {completedCount}/{totalCount}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3">
                    <div 
                      className="h-1.5 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                        backgroundColor: completedCount === totalCount ? '#10B981' : '#3B82F6'
                      }}
                    />
                  </div>

                  {/* Checklist Items (Max 4) */}
                  <div className="space-y-2 mb-3">
                    {displayItems.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-1">No items</p>
                    ) : (
                      displayItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border text-xs">
                          <div className="flex items-center space-x-2 flex-1">
                            <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                              item.completed ? 'bg-green-500 border-green-600' : 'bg-white border-gray-300'
                            }`}>
                              {item.completed && <CheckCircle className="w-2 h-2 text-white" />}
                            </div>
                            <span className={`truncate ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {item.item_name}
                            </span>
                          </div>
                          {item.completed ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Clock className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* View Checklist Button */}
                  <button
                    onClick={() => handleViewChecklist(key)}
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded py-1.5 text-xs font-medium transition-colors"
                  >
                    View {label} Checklist
                  </button>
                </div>
              );
            })}
          </div>

          {/* Overall Summary - Only show in non-embedded mode */}
          {!embedded && filteredChecklists.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Overall: {filteredChecklists.filter(item => item.completed).length} of {filteredChecklists.length} completed
                </span>
                <div className="w-20 h-1.5 bg-gray-200 rounded-full">
                  <div 
                    className="h-1.5 bg-green-500 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(filteredChecklists.filter(item => item.completed).length / filteredChecklists.length) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default CafeChecklistGrid;