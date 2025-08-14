import React, { useState } from 'react';
import apiService from '../../services/api';

const ShiftForm = () => {
  const [formData, setFormData] = useState({
    start_time: '',
    end_time: '',
    duties_completed: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

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
      await apiService.createShift(formData);
      setMessage({ text: 'Shift log submitted successfully!', type: 'success' });
      
      setFormData({
        start_time: '',
        end_time: '',
        duties_completed: '',
        notes: ''
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting shift log. Please try again.', 
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
          <span className="text-2xl mr-3">⏰</span>
          <h3 className="text-2xl font-bold text-gray-900">Staff Shift Log</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label" htmlFor="start_time">
                Shift Start Time *
              </label>
              <input
                id="start_time"
                type="datetime-local"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="form-label" htmlFor="end_time">
                Shift End Time *
              </label>
              <input
                id="end_time"
                type="datetime-local"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="form-input"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div>
            <label className="form-label" htmlFor="duties_completed">
              Duties Completed *
            </label>
            <textarea
              id="duties_completed"
              name="duties_completed"
              rows="5"
              placeholder="List all duties and tasks completed during this shift..."
              value={formData.duties_completed}
              onChange={handleChange}
              className="form-input resize-vertical"
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
              rows="3"
              placeholder="Any additional notes or observations..."
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
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Shift Log'
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

export default ShiftForm;
