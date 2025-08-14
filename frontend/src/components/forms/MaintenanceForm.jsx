import React, { useState } from 'react';
import apiService from '../../services/api';

const MaintenanceForm = () => {
  const [formData, setFormData] = useState({
    equipment_id: '',
    maintenance_type: 'routine',
    description: '',
    parts_replaced: '',
    cost: '',
    next_maintenance_date: ''
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
      await apiService.createMaintenanceLog(formData);
      setMessage({ text: 'Maintenance log submitted successfully!', type: 'success' });
      
      setFormData({
        equipment_id: '',
        maintenance_type: 'routine',
        description: '',
        parts_replaced: '',
        cost: '',
        next_maintenance_date: ''
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Error submitting maintenance log. Please try again.', 
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
          <span className="text-2xl mr-3">í´§</span>
          <h3 className="text-2xl font-bold text-gray-900">Maintenance Log</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Equipment ID */}
          <div>
            <label className="form-label" htmlFor="equipment_id">
              Equipment ID *
            </label>
            <input
              id="equipment_id"
              type="text"
              name="equipment_id"
              placeholder="e.g., TRAMP-001, PUMP-02"
              value={formData.equipment_id}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            />
          </div>
          
          {/* Maintenance Type */}
          <div>
            <label className="form-label" htmlFor="maintenance_type">
              Maintenance Type *
            </label>
            <select
              id="maintenance_type"
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleChange}
              className="form-input"
              required
              disabled={isSubmitting}
            >
              <option value="routine">Routine Maintenance</option>
              <option value="repair">Repair</option>
              <option value="emergency">Emergency Repair</option>
              <option value="inspection">Safety Inspection</option>
            </select>
          </div>
          
          {/* Description */}
          <div>
            <label className="form-label" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Describe the maintenance work performed..."
              value={formData.description}
              onChange={handleChange}
              className="form-input resize-vertical"
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          {/* Parts Replaced */}
          <div>
            <label className="form-label" htmlFor="parts_replaced">
              Parts Replaced
            </label>
            <input
              id="parts_replaced"
              type="text"
              name="parts_replaced"
              placeholder="e.g., filter, pump belt"
              value={formData.parts_replaced}
              onChange={handleChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Cost */}
          <div>
            <label className="form-label" htmlFor="cost">
              Cost (â‚¦)
            </label>
            <input
              id="cost"
              type="number"
              name="cost"
              placeholder="Enter cost in Naira"
              value={formData.cost}
              onChange={handleChange}
              className="form-input"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          {/* Next Maintenance Date */}
          <div>
            <label className="form-label" htmlFor="next_maintenance_date">
              Next Maintenance Date
            </label>
            <input
              id="next_maintenance_date"
              type="date"
              name="next_maintenance_date"
              value={formData.next_maintenance_date}
              onChange={handleChange}
              className="form-input"
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Maintenance Log'}
            </button>
          </div>

          {/* Message */}
          {message.text && (
            <p
              className={`mt-4 text-sm ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;

