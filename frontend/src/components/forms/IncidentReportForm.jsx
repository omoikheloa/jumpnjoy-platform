import React, { useState } from 'react';
import apiService from '../../services/api';

const IncidentReportForm = () => {
  const [formData, setFormData] = useState({
    incident_type: 'injury',
    description: '',
    location: '',
    injured_person: '',
    action_taken: ''
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
      await apiService.createIncident(formData);
      setMessage({ text: 'Incident report submitted successfully!', type: 'success' });
      
      // Reset form
      setFormData({
        incident_type: 'injury',
        description: '',
        location: '',
        injured_person: '',
        action_taken: ''
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting incident report. Please try again.', 
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
          <span className="text-2xl mr-3">⚠️</span>
          <h3 className="text-2xl font-bold text-gray-900">Incident/Accident Report</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label" htmlFor="incident_type">
              Incident Type
            </label>
            <select
              id="incident_type"
              name="incident_type"
              value={formData.incident_type}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            >
              <option value="injury">Injury</option>
              <option value="equipment_fault">Equipment Fault</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="form-label" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Provide a detailed description of what happened..."
              value={formData.description}
              onChange={handleChange}
              className="form-input resize-vertical"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="form-label" htmlFor="location">
              Location *
            </label>
            <input
              id="location"
              type="text"
              name="location"
              placeholder="Where did the incident occur?"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="form-label" htmlFor="injured_person">
              Injured Person (if applicable)
            </label>
            <input
              id="injured_person"
              type="text"
              name="injured_person"
              placeholder="Name of injured person"
              value={formData.injured_person}
              onChange={handleChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="form-label" htmlFor="action_taken">
              Action Taken *
            </label>
            <textarea
              id="action_taken"
              name="action_taken"
              rows="4"
              placeholder="What actions were taken in response to this incident?"
              value={formData.action_taken}
              onChange={handleChange}
              className="form-input resize-vertical"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            className={`w-full btn ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'btn-danger'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Submitting...
              </div>
            ) : (
              'Submit Incident Report'
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

export default IncidentReportForm;
