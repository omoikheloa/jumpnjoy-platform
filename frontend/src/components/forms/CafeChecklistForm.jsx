import React, { useState, useEffect, useCallback } from "react";
import { Check, Clock, User, Calendar, AlertCircle, Coffee, RefreshCw, RotateCcw } from "lucide-react";
import apiService from "../../services/api";

const CafeChecklistForm = () => {
  const [activeChecklist, setActiveChecklist] = useState("opening");
  const [checklistItems, setChecklistItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(apiService.getCurrentUser());
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Static checklist definitions
  const checklists = {
    opening: {
      title: "Opening Checklist",
      description: "Complete these tasks when opening the cafe",
      color: "green",
      items: [
        { id: "ground_coffee", label: "Ground coffee" },
        { id: "turn_on_appliances", label: "Turn on all appliances" },
        { id: "open_cafe_till", label: "Open up cafe till" },
        { id: "morning_fridge_temps", label: "Take morning fridge temps" },
        { id: "hot_dog_temps", label: "Take hot dog temps" },
        { id: "fill_cake_stand", label: "Fill up cake stand" },
      ],
    },
    midday: {
      title: "Midday Operations Checklist",
      description: "Regular tasks throughout the day",
      color: "blue",
      items: [
        { id: "check_food_temps", label: "Check food temperatures" },
        { id: "refill_coffee_beans", label: "Refill coffee beans" },
        { id: "clean_espresso_machine", label: "Clean espresso machine" },
        { id: "restock_cups_lids", label: "Restock cups and lids" },
        { id: "wipe_tables_chairs", label: "Wipe down tables and chairs" },
        { id: "check_milk_levels", label: "Check milk levels" },
        { id: "empty_bins", label: "Empty bins if needed" },
        { id: "sanitize_surfaces", label: "Sanitize high-touch surfaces" },
      ],
    },
    closing: {
      title: "Closing Checklist",
      description: "End of day tasks before closing",
      color: "red",
      items: [
        { id: "turn_off_appliances", label: "Turn off all appliances" },
        { id: "clean_coffee_machines", label: "Deep clean coffee machines" },
        { id: "close_till_count", label: "Close till and count cash" },
        { id: "final_temp_check", label: "Final temperature check" },
        { id: "store_perishables", label: "Store perishables properly" },
        { id: "wipe_all_surfaces", label: "Wipe down all surfaces" },
        { id: "sweep_mop_floors", label: "Sweep and mop floors" },
        { id: "lock_secure_premises", label: "Lock and secure premises" },
      ],
    },
  };

  // Initialize empty state structure
  const initializeEmptyState = useCallback(() => {
    const initialState = {};
    Object.keys(checklists).forEach((type) => {
      initialState[type] = {};
      checklists[type].items.forEach((item) => {
        initialState[type][item.id] = {
          completed: false,
          completedAt: null,
          completedBy: null,
          backendId: null,
        };
      });
    });
    return initialState;
  }, []);

  // Load today's checklists from backend
  const loadTodaysChecklists = useCallback(async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      setError("");
      const today = new Date().toISOString().split("T")[0];
      
      console.log("Fetching backend state for date:", today);
      const data = await apiService.getCafeChecklists({ date: today });
      console.log("Backend response:", data);

      // Always start from a clean state
      const initialState = initializeEmptyState();
      const updatedState = { ...initialState };

      if (data && data.length > 0) {
        // Map backend data to frontend state
        data.forEach((item) => {
          const type = item.checklist_type || "opening";
          const id = item.item_id;

          if (updatedState[type] && updatedState[type][id] !== undefined) {
            updatedState[type][id] = {
              completed: Boolean(item.completed),
              completedAt: item.updated_at,
              completedBy: item.updated_by?.username || item.updated_by || null,
              backendId: item.id,
            };
            console.log(`Loaded item: ${type}.${id} = ${item.completed}`, item);
          } else {
            console.warn(`Item not found in frontend definition: ${type}.${id}`);
          }
        });

        setChecklistItems(updatedState);
        setLastSyncTime(new Date());
        console.log("Frontend state updated with backend data");
        
      } else {
        console.log("No backend items found, initializing...");
        // If no backend items exist, initialize them
        await initializeTodaysItems();
        return;
      }

    } catch (err) {
      console.error("Error loading checklists:", err);
      setError(`Failed to load today's checklists: ${err.message || 'Unknown error'}`);
      
      // Set empty state on error to prevent undefined issues
      setChecklistItems(initializeEmptyState());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [initializeEmptyState]);

  // Initialize today's checklist items in backend
  const initializeTodaysItems = async () => {
    try {
      setInitializing(true);
      setError("");
      const today = new Date().toISOString().split("T")[0];

      console.log("Initializing backend items for date:", today);

      const itemsToCreate = [];
      Object.entries(checklists).forEach(([type, checklist]) => {
        checklist.items.forEach((item) => {
          itemsToCreate.push({
            checklist_type: type,
            item_id: item.id,
            item_name: item.label,
            date: today,
          });
        });
      });

      console.log("Creating items:", itemsToCreate);

      // Create all items in batch
      const createdItems = await apiService.post("/cafe-checklists/create_checklist_batch/", {
        items: itemsToCreate,
      });
      
      console.log("Backend created items:", createdItems);

      // Update local state with created items
      const updatedState = initializeEmptyState();
      createdItems.forEach((item) => {
        const type = item.checklist_type;
        const id = item.item_id;
        
        if (updatedState[type] && updatedState[type][id] !== undefined) {
          updatedState[type][id] = {
            completed: Boolean(item.completed),
            completedAt: item.updated_at,
            completedBy: item.updated_by?.username || item.updated_by || null,
            backendId: item.id,
          };
        }
      });

      setChecklistItems(updatedState);
      setLastSyncTime(new Date());
      setSuccess("Today's checklist initialized successfully");
      setTimeout(() => setSuccess(""), 3000);
      
    } catch (err) {
      console.error("Error initializing checklist:", err);
      setError(`Failed to initialize today's checklist: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(""), 5000);
    } finally {
      setInitializing(false);
    }
  };

  // Handle item toggle with backend sync
  const handleItemToggle = async (checklistType, itemId) => {
    // Validation guards
    if (!user) {
      setError("User information not loaded. Please refresh the page.");
      setTimeout(() => setError(""), 3000);
      return;
    }

    if (!checklists[checklistType] || !checklists[checklistType].items.find(item => item.id === itemId)) {
      console.warn(`Item not found in checklist definition: ${checklistType} -> ${itemId}`);
      setError("Invalid checklist item");
      setTimeout(() => setError(""), 3000);
      return;
    }

    const itemDefinition = checklists[checklistType].items.find(item => item.id === itemId);
    const currentItem = checklistItems[checklistType]?.[itemId];
    const itemExistsInBackend = currentItem && currentItem.backendId;

    console.log(`Toggling item: ${checklistType}.${itemId}`, {
      currentState: currentItem,
      existsInBackend: itemExistsInBackend
    });

    // Optimistic UI update
    const newCompletedStatus = !currentItem?.completed;
    setChecklistItems(prev => ({
      ...prev,
      [checklistType]: {
        ...prev[checklistType],
        [itemId]: {
          ...prev[checklistType][itemId],
          completed: newCompletedStatus,
          completedAt: newCompletedStatus ? new Date().toISOString() : null,
          completedBy: newCompletedStatus ? user.username : null,
        }
      },
    }));

    try {
      let updatedItem;

      if (itemExistsInBackend) {
        // CASE 1: Update existing backend item
        console.log(`Updating existing backend item ID: ${currentItem.backendId}`);
        updatedItem = await apiService.toggleCafeChecklistItem(currentItem.backendId);
        console.log("Backend toggle response:", updatedItem);
        
      } else {
        // CASE 2: Create new backend item then toggle
        const today = new Date().toISOString().split("T")[0];
        
        console.log("Creating new backend item...");
        const createdItems = await apiService.post("/cafe-checklists/create_checklist_batch/", {
          items: [{
            checklist_type: checklistType,
            item_id: itemId,
            item_name: itemDefinition.label,
            date: today,
          }]
        });

        const createdItem = createdItems[0];
        console.log("Created backend item:", createdItem);
        
        // Toggle the newly created item to completed
        updatedItem = await apiService.toggleCafeChecklistItem(createdItem.id);
        console.log("Backend toggle response for new item:", updatedItem);
      }

      // Update frontend state with backend response
      setChecklistItems(prev => ({
        ...prev,
        [checklistType]: {
          ...prev[checklistType],
          [itemId]: {
            completed: Boolean(updatedItem.completed),
            completedAt: updatedItem.updated_at,
            completedBy: updatedItem.updated_by?.username || updatedItem.updated_by || user.username,
            backendId: updatedItem.id,
          }
        },
      }));

      console.log(`Successfully ${itemExistsInBackend ? 'updated' : 'created'} item:`, 
                  `${checklistType}.${itemId} = ${updatedItem.completed}`);

      // Show success for new items
      if (!itemExistsInBackend) {
        setSuccess(`Added and completed: ${itemDefinition.label}`);
        setTimeout(() => setSuccess(""), 3000);
      }
      
    } catch (err) {
      console.error(`Error ${itemExistsInBackend ? 'updating' : 'creating'} checklist item:`, err);
      
      // Revert optimistic update on error
      setChecklistItems(prev => ({
        ...prev,
        [checklistType]: {
          ...prev[checklistType],
          [itemId]: currentItem || {
            completed: false,
            completedAt: null,
            completedBy: null,
            backendId: null,
          }
        },
      }));
      
      setError(`Failed to ${itemExistsInBackend ? 'update' : 'create'} checklist item: ${err.message || 'Unknown error'}`);
      setTimeout(() => setError(""), 5000);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    loadTodaysChecklists(true);
  };

  // Utility functions
  const getCompletionStats = (type) => {
    const items = checklists[type].items;
    const completedCount = items.filter((item) => checklistItems[type]?.[item.id]?.completed).length;
    return { completed: completedCount, total: items.length };
  };

  const formatDateTime = (str) =>
    str
      ? new Date(str).toLocaleString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  const getColorClasses = (color) => ({
    green: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      button: "bg-green-600 hover:bg-green-700",
      tab: "bg-green-100 text-green-700",
    },
    blue: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      tab: "bg-blue-100 text-blue-700",
    },
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      button: "bg-red-600 hover:bg-red-700",
      tab: "bg-red-100 text-red-700",
    },
  }[color] || {});

  // Load data on component mount
  useEffect(() => {
    console.log("Component mounted, loading checklists...");
    loadTodaysChecklists();
  }, [loadTodaysChecklists]);

  // Show loading state while user is being loaded
  if (!user && !error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-3" />
            <span>Loading user information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Coffee className="w-6 h-6 mr-3 text-amber-600" />
                Cafe Checklists
              </h1>
              <p className="text-gray-600 mt-1">Daily operational checklists for cafe management</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing || initializing}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RotateCcw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              {/* User Info */}
              {user && (
                <div className="text-sm text-gray-500 flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {user.first_name || user.username}
                </div>
              )}
            </div>
          </div>
          
          {/* Last Sync Info */}
          {lastSyncTime && (
            <div className="mt-2 text-xs text-gray-400 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Last synced: {formatDateTime(lastSyncTime.toISOString())}
            </div>
          )}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {initializing && (
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600 mr-2 flex-shrink-0" />
            <span className="text-blue-700">Initializing today's checklist...</span>
          </div>
        )}

        {/* Checklist Tabs */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex space-x-4">
            {Object.entries(checklists).map(([key, checklist]) => {
              const stats = getCompletionStats(key);
              const colors = getColorClasses(checklist.color);
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveChecklist(key)}
                  disabled={loading || initializing}
                  className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors disabled:opacity-50 ${
                    activeChecklist === key 
                      ? colors.tab
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{checklist.title}</span>
                  <span className="text-xs bg-white px-2 py-1 rounded-full">
                    {stats.completed}/{stats.total}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Checklist Content */}
        <div className="p-6">
          {loading && !refreshing ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-3" />
              <span>Loading checklist...</span>
            </div>
          ) : (
            Object.entries(checklists).map(([key, checklist]) => {
              if (key !== activeChecklist) return null;
              
              const colors = getColorClasses(checklist.color);
              const stats = getCompletionStats(key);
              
              return (
                <div key={key}>
                  <div className={`p-4 ${colors.bg} ${colors.border} border rounded-lg mb-6`}>
                    <h2 className={`text-xl font-semibold ${colors.text} mb-2`}>
                      {checklist.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{checklist.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className={`text-sm ${colors.text}`}>
                        Progress: {stats.completed} of {stats.total} completed
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date().toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="bg-white rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${colors.button}`}
                          style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-3">
                    {checklist.items.map((item) => {
                      const itemState = checklistItems[key]?.[item.id] || { 
                        completed: false, 
                        completedAt: null, 
                        completedBy: null, 
                        backendId: null 
                      };
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-4 border rounded-lg transition-colors ${
                            itemState.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => handleItemToggle(key, item.id)}
                                disabled={loading || refreshing || initializing || !user}
                                className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                                  itemState.completed
                                    ? 'bg-green-600 border-green-600 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                } ${loading || refreshing || initializing || !user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {itemState.completed && <Check className="w-4 h-4" />}
                              </button>
                              
                              <span className={`font-medium ${
                                itemState.completed ? 'text-green-700 line-through' : 'text-gray-900'
                              }`}>
                                {item.label}
                              </span>
                            </div>
                            
                            {itemState.completed && itemState.completedAt && (
                              <div className="text-sm text-gray-500 flex items-center space-x-4">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-1" />
                                  {itemState.completedBy || 'Unknown'}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {formatDateTime(itemState.completedAt)}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CafeChecklistForm;