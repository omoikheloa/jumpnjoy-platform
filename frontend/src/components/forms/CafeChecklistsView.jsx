import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Calendar,
  ClipboardList,
  Coffee
} from 'lucide-react';
import apiService from '../../services/api';

const CafeChecklistView = () => {
  const { checklistType } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const dateFromParams = searchParams.get('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(dateFromParams || 'all');
  const [filterCompleted, setFilterCompleted] = useState('all'); // 'all', 'completed', 'pending'
  const [checklists, setChecklists] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Filter checklists based on all criteria
  const filteredItems = checklists.filter(item => {
    // Filter by checklist type if specified in URL params
    const matchesType = !checklistType || 
      item.checklist_type === checklistType || 
      item.checklist_type_display?.toLowerCase().includes(checklistType.toLowerCase());
    
    // Filter by date
    const matchesDate = selectedDate === 'all' || item.date === selectedDate;
    
    // Filter by search term
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by completion status
    const matchesFilter = 
      filterCompleted === 'all' ||
      (filterCompleted === 'completed' && item.completed) ||
      (filterCompleted === 'pending' && !item.completed);
    
    return matchesType && matchesDate && matchesSearch && matchesFilter;
  });

  // Group by date and checklist type
  const groupedChecklists = filteredItems.reduce((groups, item) => {
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

  const completedCount = filteredItems.filter(item => item.completed).length;
  const totalCount = filteredItems.length;
  const isPastDate = (date) => date < new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <div key={index} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Coffee className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 capitalize">
                  {checklistType ? `${checklistType} Checklist` : 'Cafe Checklists'}
                </h1>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span>Total items: {checklists.length}</span>
                  <span>Filtered: {filteredItems.length}</span>
                  <span>Completed: {checklists.filter(item => item.completed).length}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {completedCount}/{totalCount}
              </div>
              <div className="text-sm text-gray-600">Filtered Results</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-6">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-gray-900">Overall Progress</span>
              <span className="text-sm text-gray-600">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search checklist items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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

            {/* Status Filter Dropdown */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterCompleted}
                onChange={(e) => setFilterCompleted(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedDate('all');
                setFilterCompleted('all');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Checklist Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {Object.keys(groupedChecklists).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium">No checklist items found</p>
              <p className="text-sm mt-1">
                {checklists.length === 0 
                  ? 'No checklist items available.' 
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-8 p-6">
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
                                  <button
                                    onClick={() => handleToggleItem(item.id, item.completed)}
                                    disabled={isPastDate(date)}
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                      item.completed 
                                        ? 'bg-green-500 border-green-600' 
                                        : 'bg-white border-gray-300'
                                    } ${isPastDate(date) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
                                  >
                                    {item.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                  </button>
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

        {/* Summary Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          {totalCount > 0 ? (
            <p>
              Showing {filteredItems.length} of {checklists.length} total checklist items
              {completedCount < totalCount && ` • ${totalCount - completedCount} items remaining`}
            </p>
          ) : (
            <p>No checklist items available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeChecklistView;