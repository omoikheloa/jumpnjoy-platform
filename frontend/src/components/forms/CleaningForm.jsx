import React, { useState } from 'react';
import apiService from '../../services/api';

const CleaningForm = () => {
  const [formData, setFormData] = useState({
    area_cleaned: '',
    cleaning_products_used: '',
    time_spent: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const cleaningAreas = [
    'Trampoline Area',
    'Foam Pit',
    'Cafe Area',
    'Toilets',
    'Reception',
    'Equipment Storage',
    'Party Rooms',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      await apiService.createCleaningLog(formData);
      setMessage({ text: 'Cleaning log submitted successfully!', type: 'success' });
      
      setFormData({
        area_cleaned: '',
        cleaning_products_used: '',
        time_spent: '',
        notes: ''
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting cleaning log. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">í·½</span>
          <h3 className="text-2xl font-bold text-gray-900">Cleaning Log</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label" htmlFor="area_cleaned">
              Area Cleaned *
            </label>
            <select
              id="area_cleaned"
              name="area_cleaned"
              value={formData.area_cleaned}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            >
              <option value="">Select an area...</option>
              {cleaningAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="form-label" htmlFor="cleaning_products_used">
              Cleaning Products Used *
            </label>
            <input
              id="cleaning_products_used"
              type="text"
              name="cleaning_products_used"
              placeholder="List cleaning products and chemicals used"
              value={formData.cleaning_products_used}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="form-label" htmlFor="time_spent">
              Time Spent (minutes) *
            </label>
            <input
              id="time_spent"
              type="number"
              name="time_spent"
              placeholder="How many minutes did cleaning take?"
              value={formData.time_spent}
              onChange={handleChange}
              className="form-input"
              min="1"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="form-label" htmlFor="notes">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              placeholder="Any additional observations or special cleaning requirements..."
              value={formData.notes}
              onChange={handleChange}
              className="form-input resize-vertical"
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full btn ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Cleaning Log'
            )}
          </button>
          
          {message.text && (
            <div className={`px-4 py-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-success-50 border border-success-200 text-success-700'
                : 'bg-danger-50 border border-danger-200 text-danger-700'
            }`}>
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CleaningForm;
