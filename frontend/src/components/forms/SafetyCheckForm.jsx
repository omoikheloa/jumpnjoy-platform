import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import { format } from 'date-fns';

const SafetyCheckForm = () => {
  const navigate = useNavigate();
  const [inspectorInitials, setInspectorInitials] = useState('');
  const [managerInitials, setManagerInitials] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Get current user on component mount
  useEffect(() => {
    const user = apiService.getCurrentUser();
    setCurrentUser(user);
  }, []);

  // Check if user has already submitted today
  useEffect(() => {
    const checkSubmissionStatus = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const response = await apiService.checkDailySubmission(today);
        setHasSubmittedToday(response.hasSubmitted);
      } catch (error) {
        console.error('Error checking submission status:', error);
        // If endpoint doesn't exist yet, assume no submission
        setHasSubmittedToday(false);
      }
    };
    
    if (currentUser) {
      checkSubmissionStatus();
    }
  }, [currentUser]);

  const inspectionItems = apiService.getInspectionItems();

  const [inspectionData, setInspectionData] = useState(() => {
    const initialData = {};
    inspectionItems.forEach(item => {
      initialData[item.id] = 'pass';
    });
    return initialData;
  });

  const [remedialNotes, setRemedialNotes] = useState(() => {
    const initialNotes = {};
    inspectionItems.forEach(item => {
      initialNotes[item.id] = '';
    });
    return initialNotes;
  });

  const handleInspectionChange = (itemId, value) => {
    setInspectionData(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleRemedialNoteChange = (itemId, value) => {
    setRemedialNotes(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = async () => {
    if (hasSubmittedToday) {
      setMessage({ 
        text: 'You have already submitted an inspection for today. Only one submission per day is allowed.', 
        type: 'error' 
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    // Validate required fields
    if (!inspectorInitials.trim()) {
      setMessage({ text: 'Inspector initials are required', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    if (!managerInitials.trim()) {
      setMessage({ text: 'Manager initials are required', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    // Check if any items marked as fail/remedial have notes
    const failedItems = Object.entries(inspectionData).filter(([_, status]) => 
      status === 'fail' || status === 'remedial'
    );
    
    const missingNotes = failedItems.filter(([itemId, _]) => 
      !remedialNotes[itemId]?.trim()
    );

    if (missingNotes.length > 0) {
      setMessage({ 
        text: 'Please provide remedial notes for all failed or remedial items', 
        type: 'error' 
      });
      setIsSubmitting(false);
      return;
    }

    const formData = {
      inspector_initials: inspectorInitials,
      manager_initials: managerInitials,
      inspection_results: inspectionData,
      remedial_notes: remedialNotes,
      submission_date: format(new Date(), 'yyyy-MM-dd')
    };

    try {
      await apiService.createDailyInspection(formData);
      
      // Mark as submitted for today
      setHasSubmittedToday(true);
      
      // Show success dialog
      setShowSuccessDialog(true);
      
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting inspection. Please try again.', 
        type: 'error' 
      });
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'bg-green-100 border-green-400 text-green-800';
      case 'fail': return 'bg-red-100 border-red-400 text-red-800';
      case 'remedial': return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const failedItemsCount = Object.values(inspectionData).filter(status => status === 'fail').length;
  const remedialItemsCount = Object.values(inspectionData).filter(status => status === 'remedial').length;
  const passedItemsCount = Object.values(inspectionData).filter(status => status === 'pass').length;

  // If user has already submitted today, show message
  if (hasSubmittedToday && !showSuccessDialog) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Inspection Already Submitted
          </h1>
          <p className="text-gray-600 mb-6">
            You have already completed today's safety inspection. Only one submission per day is allowed to ensure accountability.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{format(new Date(), 'MMMM do, yyyy')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Inspector:</span>
              <span className="font-semibold">{currentUser?.username || 'Current User'}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-3xl mr-4">🏃‍♂️</span>
                <div>
                  <h1 className="text-2xl font-bold">Trampoline Park Daily Inspection Report</h1>
                  <p className="text-blue-100 mt-1">Comprehensive safety checklist for daily operations</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Inspection Date</div>
                <div className="text-lg font-semibold">
                  {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Accountability Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-amber-600 mr-3 mt-1">🔒</div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">Accountability Notice</h3>
                  <p className="text-amber-700 text-sm">
                    This form can only be submitted once per day. Your initials serve as your digital signature 
                    and make you accountable for the inspection results. All submissions are timestamped and logged.
                  </p>
                </div>
              </div>
            </div>

            {/* User Information */}
            {currentUser && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Current Inspector</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-800 font-medium">{currentUser.username}</p>
                    <p className="text-blue-600 text-sm">{currentUser.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-600 text-sm">Role: {currentUser.role || 'Inspector'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inspector Initials *
                </label>
                <input
                  type="text"
                  value={inspectorInitials}
                  onChange={(e) => setInspectorInitials(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="e.g., JD"
                  maxLength={5}
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">Your digital signature for accountability</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Submission Date
                </label>
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                  {format(new Date(), 'MMMM do, yyyy')}
                </div>
                <p className="text-xs text-gray-500 mt-1">Today's date will be recorded with your submission</p>
              </div>
            </div>

            {/* Status Summary */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspection Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-100 rounded-lg p-3 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-800">{passedItemsCount}</div>
                  <div className="text-sm text-green-600">Passed</div>
                </div>
                <div className="bg-yellow-100 rounded-lg p-3 text-center border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800">{remedialItemsCount}</div>
                  <div className="text-sm text-yellow-600">Remedial</div>
                </div>
                <div className="bg-red-100 rounded-lg p-3 text-center border border-red-200">
                  <div className="text-2xl font-bold text-red-800">{failedItemsCount}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
              </div>
            </div>

            {/* Inspection Items */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Inspection Checklist</h3>
              
              {inspectionItems.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {item.id}
                          </span>
                          <span className="font-medium text-gray-900">{index + 1}.</span>
                        </div>
                        <h4 className="text-sm font-medium text-gray-900 leading-relaxed">
                          {item.name}
                        </h4>
                      </div>
                      
                      <div className="flex space-x-2">
                        {['pass', 'fail', 'remedial'].map(status => (
                          <label key={status} className="flex items-center cursor-pointer">
                            <input
                              type="radio"
                              name={item.id}
                              value={status}
                              checked={inspectionData[item.id] === status}
                              onChange={(e) => handleInspectionChange(item.id, e.target.value)}
                              className="sr-only"
                              disabled={isSubmitting}
                            />
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all cursor-pointer ${
                              inspectionData[item.id] === status 
                                ? getStatusColor(status) 
                                : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {(inspectionData[item.id] === 'fail' || inspectionData[item.id] === 'remedial') && (
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Remedial Notes Required *
                        </label>
                        <textarea
                          value={remedialNotes[item.id]}
                          onChange={(e) => handleRemedialNoteChange(item.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          rows={2}
                          placeholder="Describe the issue and required remedial action..."
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Manager Sign Off */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Management Daily Sign Off</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manager Initials (INS019) *
                  </label>
                  <input
                    type="text"
                    value={managerInitials}
                    onChange={(e) => setManagerInitials(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., AB"
                    maxLength={5}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">Manager's digital signature for accountability</p>
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Note:</p>
                    <p>Where remedial work is required please complete the remedial sheet and highlight the issue to a manager on completion of the checking process.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={handleSubmit}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed text-white' 
                    : failedItemsCount > 0
                      ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                      : remedialItemsCount > 0
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Submitting Inspection...
                  </div>
                ) : (
                  `Submit Daily Inspection ${failedItemsCount > 0 ? '(⚠️ Items Failed)' : remedialItemsCount > 0 ? '(⚠️ Items Need Attention)' : '(✅ All Passed)'}`
                )}
              </button>
              
              {message.text && (
                <div className={`px-4 py-3 rounded-lg border transition-colors ${
                  message.type === 'success' 
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform animate-scale-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Inspection Completed!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your daily safety inspection has been successfully submitted and recorded. 
                The inspection is now officially logged with today's date.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">{format(new Date(), 'MMMM do, yyyy')}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Inspector:</span>
                  <span className="font-semibold">{inspectorInitials}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Manager:</span>
                  <span className="font-semibold">{managerInitials}</span>
                </div>
              </div>

              <button
                onClick={handleDialogClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 transform hover:-translate-y-0.5"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SafetyCheckForm;