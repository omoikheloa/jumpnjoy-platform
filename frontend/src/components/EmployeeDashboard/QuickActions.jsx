import React from 'react';

const QuickActions = ({ formLinks, setActiveSection, setSelectedForm }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formLinks.filter(form => form.status === 'active').slice(0, 6).map((form) => (
          <button
            key={form.id}
            onClick={() => {
              setActiveSection('forms');
              setSelectedForm(form.id);
            }}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{form.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{form.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;