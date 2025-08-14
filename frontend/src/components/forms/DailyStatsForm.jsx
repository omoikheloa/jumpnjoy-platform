import React, { useState } from 'react';
import apiService from '../../services/api';

const DailyStatsForm = () => {
  const [formData, setFormData] = useState({
    visitor_count: '',
    cafe_sales: '',
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
      await apiService.createDailyStats(formData);
      setMessage({ text: 'Daily statistics submitted successfully!', type: 'success' });
      
      setFormData({
        visitor_count: '',
        cafe_sales: '',
        notes: ''
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting daily stats. Please try again.', 
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
          <span className="text-2xl mr-3">í³Š</span>
          <h3 className="text-2xl font-bold text-gray-900">Daily Statistics Entry</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label" htmlFor="visitor_count">
              Total Visitor Count *
            </label>
            <input
              id="visitor_count"
              type="number"
              name="visitor_count"
              placeholder="Number of visitors today"
              value={formData.visitor_count}
              onChange={handleChange}
              className="form-input"
              min="0"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="form-label" htmlFor="cafe_sales">
              Cafe Sales Total (Â£) *
            </label>
            <input
              id="cafe_sales"
              type="number"
              name="cafe_sales"
              placeholder="0.00"
              value={formData.cafe_sales}
              onChange={handleChange}
              className="form-input"
              step="0.01"
              min="0"
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
              placeholder="Any notable events or observations from today..."
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
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Daily Stats'
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

export default DailyStatsForm;
