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
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center mb-6">
          <span className="text-2xl mr-3">🔧</span>
          <h3 className="text-2xl font-bold text-gray-900">Maintenance Log</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="equipment_id">
              Equipment ID *
            </label>
            <input
              id="equipment_id"
              type="text"
              name="equipment_id"
              placeholder="e.g., TRAMP-001, PUMP-02"
              value={formData.equipment_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="maintenance_type">
              Maintenance Type *
            </label>
            <select
              id="maintenance_type"
              name="maintenance_type"
              value={formData.maintenance_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isSubmitting}
            >
              <option value="routine">Routine Maintenance</option>
              <option value="repair">Repair</option>
              <option value="emergency">Emergency Repair</option>
              <option value="inspection">Safety Inspection</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              rows="5"
              placeholder="Describe the maintenance work performed..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              required
              disabled={isSubmitting}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="parts_replaced">
              Parts Replaced
            </label>
            <input
              id="parts_replaced"
              type="text"
              name="parts_replaced"
              placeholder="e.g., filter, pump belt"
              value={formData.parts_replaced}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="cost">
              Cost (₦)
            </label>
            <input
              id="cost"
              type="number"
              name="cost"
              placeholder="Enter cost in Naira"
              value={formData.cost}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="next_maintenance_date">
              Next Maintenance Date
            </label>
            <input
              id="next_maintenance_date"
              type="date"
              name="next_maintenance_date"
              value={formData.next_maintenance_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Maintenance Log'}
            </button>
          </div>

          {message.text && (
            <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default MaintenanceForm;

