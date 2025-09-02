import React, { useState } from 'react';
import apiService from '../../services/api';

const SafetyCheckForm = () => {
  const [formData, setFormData] = useState({
    trampoline_id: '',
    springs_ok: true,
    nets_ok: true,
    foam_pits_ok: true,
    overall_pass: true,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => {
      const updated = { ...prev, [name]: newValue };
      
      // Auto-calculate overall pass based on individual checks
      if (name === 'springs_ok' || name === 'nets_ok' || name === 'foam_pits_ok') {
        updated.overall_pass = updated.springs_ok && updated.nets_ok && updated.foam_pits_ok;
      }
      
      return updated;
    });
    
    // Clear message when user interacts with form
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await apiService.createSafetyCheck(formData);
      setMessage({ text: 'Safety check submitted successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        trampoline_id: '',
        springs_ok: true,
        nets_ok: true,
        foam_pits_ok: true,
        overall_pass: true,
        notes: ''
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting safety check. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">🛡️</span>
          <h3 className="text-2xl font-bold text-gray-900">Daily Safety Inspection</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="trampoline_id">
              Trampoline ID
            </label>
            <input
              id="trampoline_id"
              type="text"
              name="trampoline_id"
              placeholder="e.g., TRAMP-001"
              value={formData.trampoline_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-gray-900">Equipment Checks</h4>
            
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="springs_ok"
                  checked={formData.springs_ok}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Springs in good condition</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="nets_ok"
                  checked={formData.nets_ok}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Safety nets intact and secure</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="foam_pits_ok"
                  checked={formData.foam_pits_ok}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">Foam pits properly maintained</span>
              </label>
              
              <label className="flex items-center border-t border-gray-200 pt-3">
                <input
                  type="checkbox"
                  name="overall_pass"
                  checked={formData.overall_pass}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-semibold text-gray-900">Overall safety check passed</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="notes">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              placeholder="Any additional observations or concerns..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full py-2 px-4 rounded-lg font-medium ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Safety Check'
            )}
          </button>
          
          {message.text && (
            <div className={`px-4 py-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SafetyCheckForm;
