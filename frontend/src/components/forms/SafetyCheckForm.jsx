import React, { useState } from 'react';
import apiService from '../../services/api';

const SafetyCheckForm = () => {
  const [inspectorInitials, setInspectorInitials] = useState('');
  const [managerInitials, setManagerInitials] = useState('');
  const [wcNumber, setWcNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const inspectionItems = [
    { id: 'INS001', name: 'Framework Stability & Security' },
    { id: 'INS002', name: 'Perimeter Netting' },
    { id: 'INS003', name: 'Protective Wall Padding' },
    { id: 'INS004', name: 'Protective Walkway Padding' },
    { id: 'INS005', name: 'Coverall Pads' },
    { id: 'INS006', name: 'Trampoline Beds' },
    { id: 'INS007', name: 'Trampoline Safety Netting' },
    { id: 'INS008', name: 'Trampoline Springs' },
    { id: 'INS009', name: 'Fire Doors Functioning Correctly & Routes Free from Obstruction' },
    { id: 'INS010', name: 'Fire Extinguishing Equipment In Place' },
    { id: 'INS011', name: 'Electrical Cables Safely Routed and Secured in Position' },
    { id: 'INS012', name: 'Electrical plugs and sockets in good condition with unused sockets protected by childproof covers' },
    { id: 'INS013', name: 'First-aid box on hand and fully stocked in accordance with its contents list' },
    { id: 'INS014', name: 'Signage in place and clearly visible' },
    { id: 'INS015', name: 'Area clean and ready for use' },
    { id: 'INS016', name: 'Gates, closing and locking devices are operational' },
    { id: 'INS017', name: 'Area is free of trip/slip hazards' },
    { id: 'INS018', name: 'Minimum required staff always available, including first aid requirements' }
  ];

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
    
    // Clear message when user interacts with form
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleRemedialNoteChange = (itemId, value) => {
    setRemedialNotes(prev => ({
      ...prev,
      [itemId]: value
    }));
  };

  const handleSubmit = async () => {
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
      wc_number: wcNumber,
      inspector_initials: inspectorInitials,
      manager_initials: managerInitials,
      inspection_results: inspectionData,
      remedial_notes: remedialNotes
    };

    try {
      await apiService.createDailyInspection(formData);
      
      setMessage({ text: 'Daily inspection submitted successfully!', type: 'success' });
      
      // Reset form
      setInspectorInitials('');
      setManagerInitials('');
      setWcNumber('');
      const resetData = {};
      const resetNotes = {};
      inspectionItems.forEach(item => {
        resetData[item.id] = 'pass';
        resetNotes[item.id] = '';
      });
      setInspectionData(resetData);
      setRemedialNotes(resetNotes);
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting inspection. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-xl">
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
              <div className="text-lg font-semibold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WC Number
              </label>
              <input
                type="text"
                value={wcNumber}
                onChange={(e) => setWcNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter WC number"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspector Initials *
              </label>
              <input
                type="text"
                value={inspectorInitials}
                onChange={(e) => setInspectorInitials(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., JD"
                maxLength={5}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Status Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Inspection Summary</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-800">{passedItemsCount}</div>
                <div className="text-sm text-green-600">Passed</div>
              </div>
              <div className="bg-yellow-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-800">{remedialItemsCount}</div>
                <div className="text-sm text-yellow-600">Remedial</div>
              </div>
              <div className="bg-red-100 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-800">{failedItemsCount}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
            </div>
          </div>

          {/* Inspection Items */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Inspection Checklist</h3>
            
            {inspectionItems.map((item, index) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
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
                              : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400'
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., AB"
                  maxLength={5}
                  required
                  disabled={isSubmitting}
                />
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
              className={`w-full py-3 px-6 rounded-lg font-semibold text-lg ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : failedItemsCount > 0
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : remedialItemsCount > 0
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
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
              <div className={`px-4 py-3 rounded-lg border ${
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
  );
};

export default SafetyCheckForm;