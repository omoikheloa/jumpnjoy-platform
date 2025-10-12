import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import apiService from '../../services/api';

// Move form components outside the main component to prevent re-renders
const FormSection = ({ title, children, columns = 2 }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
      {title}
    </h3>
    <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
      {children}
    </div>
  </div>
);

const FormInput = React.memo(({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  className = '' 
}) => (
  <div className="flex flex-col">
    {label && (
      <label className="text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
    />
  </div>
));

const FormTextarea = React.memo(({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false, 
  placeholder, 
  rows = 3,
  minLength 
}) => (
  <div className="flex flex-col md:col-span-2">
    {label && (
      <label className="text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
        {minLength && <span className="text-gray-500 text-xs ml-2">(minimum {minLength} characters)</span>}
      </label>
    )}
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      rows={rows}
      minLength={minLength}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
    />
    {minLength && value && value.length < minLength && (
      <p className="text-red-500 text-xs mt-1">
        Please enter at least {minLength} characters (currently {value.length})
      </p>
    )}
  </div>
));

const FormCheckbox = React.memo(({ label, name, checked, onChange }) => (
  <label className="flex items-center space-x-3 cursor-pointer">
    <input
      type="checkbox"
      name={name}
      checked={checked || false}
      onChange={onChange}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </label>
));

// Helper function to convert base64 to blob
const dataURLtoBlob = (dataURL) => {
  if (!dataURL) return null;
  
  try {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error('Error converting dataURL to blob:', error);
    return null;
  }
};

// Helper function to format time for server (HH:MM:SS)
const formatTimeForServer = (timeString) => {
  if (!timeString) return '';
  // If time is already in HH:MM format, add seconds
  if (timeString.length === 5) {
    return `${timeString}:00`;
  }
  return timeString;
};

const IncidentReportForm = ({ onFormSubmit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Initial form state
  const initialFormState = {
    // Injured Person Details
    first_name: '',
    surname: '',
    date_of_birth: '',
    gender: '',
    address: '',
    postcode: '',
    phone_home: '',
    phone_mobile: '',
    consent_to_treatment: false,
    refusal_of_treatment: false,
    guardian_name: '',

    // Accident Details
    date_of_accident: '',
    time_of_accident: '',
    location: '',
    how_occurred: '',
    injury_details: '',
    injury_location: '',

    // Treatment
    treatment_given: '',
    hospital: '',
    time_departure: '',
    destination: '',
    ambulance_called: false,
    ambulance_time_called: '',
    ambulance_caller: '',
    ambulance_time_arrived: '',
    continued_activities_time: '',

    // First Aider
    first_aider_name: '',
    first_aider_signature: null,
    first_aider_date: '',
    first_aider_time: '',

    // RIDDOR
    riddor_reportable: false,
    riddor_report_method: '',
    riddor_reported_by: '',
    riddor_date_reported: '',
  };

  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [mode, setMode] = useState(id ? 'edit' : 'create');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const sigCanvas = useRef(null);

  // Load incident data if editing
  useEffect(() => {
    if (id) {
      loadIncidentData(id);
    }
  }, [id]);

  const loadIncidentData = async (incidentId) => {
    setIsLoading(true);
    try {
      const response = await apiService.getIncident(incidentId);
      const incidentData = response.data || response;
      
      // Format dates and times for input fields
      const formattedData = { ...incidentData };
      
      // Format dates for date inputs (remove time part if present)
      if (formattedData.date_of_birth && formattedData.date_of_birth.includes('T')) {
        formattedData.date_of_birth = formattedData.date_of_birth.split('T')[0];
      }
      if (formattedData.date_of_accident && formattedData.date_of_accident.includes('T')) {
        formattedData.date_of_accident = formattedData.date_of_accident.split('T')[0];
      }
      if (formattedData.first_aider_date && formattedData.first_aider_date.includes('T')) {
        formattedData.first_aider_date = formattedData.first_aider_date.split('T')[0];
      }
      if (formattedData.riddor_date_reported && formattedData.riddor_date_reported.includes('T')) {
        formattedData.riddor_date_reported = formattedData.riddor_date_reported.split('T')[0];
      }
      
      // Format times for time inputs (keep only HH:MM part)
      if (formattedData.time_of_accident && formattedData.time_of_accident.includes(':')) {
        formattedData.time_of_accident = formattedData.time_of_accident.substring(0, 5);
      }
      if (formattedData.time_departure && formattedData.time_departure.includes(':')) {
        formattedData.time_departure = formattedData.time_departure.substring(0, 5);
      }
      if (formattedData.ambulance_time_called && formattedData.ambulance_time_called.includes(':')) {
        formattedData.ambulance_time_called = formattedData.ambulance_time_called.substring(0, 5);
      }
      if (formattedData.ambulance_time_arrived && formattedData.ambulance_time_arrived.includes(':')) {
        formattedData.ambulance_time_arrived = formattedData.ambulance_time_arrived.substring(0, 5);
      }
      if (formattedData.continued_activities_time && formattedData.continued_activities_time.includes(':')) {
        formattedData.continued_activities_time = formattedData.continued_activities_time.substring(0, 5);
      }
      if (formattedData.first_aider_time && formattedData.first_aider_time.includes(':')) {
        formattedData.first_aider_time = formattedData.first_aider_time.substring(0, 5);
      }
      
      setFormData(prev => ({
        ...prev,
        ...formattedData
      }));
      
      // Load signature if it exists
      if (formattedData.first_aider_signature && sigCanvas.current) {
        sigCanvas.current.fromDataURL(formattedData.first_aider_signature);
      }
      
      setMessage({ text: 'Form loaded successfully', type: 'success' });
    } catch (error) {
      console.error('Error loading incident:', error);
      setMessage({ 
        text: 'Error loading form data. Please try again.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use useCallback to prevent function recreation on every render
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    if (message.text) setMessage({ text: '', type: '' });
  }, [message.text, fieldErrors]);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setFormData(prev => ({ 
        ...prev, 
        first_aider_signature: null 
      }));
    }
  };

  const saveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      try {
        // Use toDataURL instead of getTrimmedCanvas to avoid the error
        const dataUrl = sigCanvas.current.toDataURL("image/png");
        setFormData(prev => ({ 
          ...prev, 
          first_aider_signature: dataUrl 
        }));
        setMessage({ text: 'Signature saved successfully', type: 'success' });
      } catch (error) {
        console.error('Error saving signature:', error);
        setMessage({ text: 'Error saving signature. Please try again.', type: 'error' });
      }
    } else {
      setMessage({ text: 'Please provide a signature first', type: 'error' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields
    const requiredFields = [
      'first_name', 'surname', 'date_of_accident', 
      'time_of_accident', 'location', 'first_aider_name'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = 'This field is required';
      }
    });

    // Minimum length validation
    if (formData.how_occurred && formData.how_occurred.length < 10) {
      errors.how_occurred = 'Description must be at least 10 characters long';
    }

    // Date format validation
    const dateFields = ['date_of_birth', 'date_of_accident', 'first_aider_date', 'riddor_date_reported'];
    dateFields.forEach(field => {
      if (formData[field] && !/^\d{4}-\d{2}-\d{2}$/.test(formData[field])) {
        errors[field] = 'Date must be in YYYY-MM-DD format';
      }
    });

    // Time format validation
    const timeFields = [
      'time_of_accident', 'time_departure', 'ambulance_time_called', 
      'ambulance_time_arrived', 'continued_activities_time', 'first_aider_time'
    ];
    timeFields.forEach(field => {
      if (formData[field] && !/^\d{2}:\d{2}$/.test(formData[field])) {
        errors[field] = 'Time must be in HH:MM format';
      }
    });

    // Signature validation
    if (!formData.first_aider_signature) {
      errors.first_aider_signature = 'Signature is required';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setMessage({ 
        text: 'Please fix the validation errors before submitting', 
        type: 'error' 
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for FormData submission
      const formDataToSend = new FormData();

      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key === 'first_aider_signature' && formData[key]) {
            // Convert base64 to blob for signature
            const blob = dataURLtoBlob(formData[key]);
            if (blob) {
              formDataToSend.append(key, blob, 'signature.png');
            }
          } else if (key.includes('_time') && formData[key]) {
            // Format time fields for server (add seconds)
            formDataToSend.append(key, formatTimeForServer(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      let response;
      if (mode === 'create') {
        response = await apiService.createIncident(formDataToSend);
        setMessage({ 
          text: 'Incident report created successfully!', 
          type: 'success' 
        });
        
        // Reset form after successful creation
        setFormData(initialFormState);
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
        
        // Navigate to incidents list or show success message
        setTimeout(() => {
          navigate('/employee/incidents');
        }, 2000);
        
      } else {
        response = await apiService.updateIncident(id, formDataToSend);
        setMessage({ 
          text: 'Incident report updated successfully!', 
          type: 'success' 
        });
        
        // Navigate back after short delay
        setTimeout(() => {
          navigate('/employee/incidents');
        }, 1500);
      }
      
      if (onFormSubmit) {
        onFormSubmit(response);
      }
      
    } catch (err) {
      console.error('Submission error:', err);
      
      // Handle server validation errors
      if (err.response && err.response.data) {
        const serverErrors = err.response.data;
        const fieldErrors = {};
        
        Object.keys(serverErrors).forEach(field => {
          fieldErrors[field] = serverErrors[field].join(', ');
        });
        
        setFieldErrors(fieldErrors);
        setMessage({ 
          text: 'Please fix the validation errors below', 
          type: 'error' 
        });
      } else {
        setMessage({ 
          text: `Error ${mode === 'create' ? 'creating' : 'updating'} report: ${err.message || 'Please try again'}`, 
          type: 'error' 
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                {mode === 'create' ? 'New Accident Report' : 'Edit Accident Report'}
              </h2>
              <p className="text-gray-600 mt-2">
                {mode === 'create' 
                  ? 'Complete all sections to create a new incident report' 
                  : 'Update the incident report details below'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              mode === 'create' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {mode === 'create' ? 'New Report' : 'Editing'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Injured Person Section */}
            <FormSection title="Details of Injured Person" columns={2}>
              <FormInput
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                className={fieldErrors.first_name ? 'border-red-500' : ''}
              />
              {fieldErrors.first_name && <p className="text-red-500 text-xs mt-1 col-span-2">{fieldErrors.first_name}</p>}
              
              <FormInput
                label="Surname"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                placeholder="Enter surname"
                className={fieldErrors.surname ? 'border-red-500' : ''}
              />
              {fieldErrors.surname && <p className="text-red-500 text-xs mt-1 col-span-2">{fieldErrors.surname}</p>}
              
              <FormInput
                label="Date of Birth"
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className={fieldErrors.date_of_birth ? 'border-red-500' : ''}
              />
              {fieldErrors.date_of_birth && <p className="text-red-500 text-xs mt-1">{fieldErrors.date_of_birth}</p>}
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select Gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
              
              <FormInput
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter full address"
                className="md:col-span-2"
              />
              
              <FormInput
                label="Post Code"
                name="postcode"
                value={formData.postcode}
                onChange={handleChange}
                placeholder="Enter post code"
              />
              
              <FormInput
                label="Home Phone"
                name="phone_home"
                value={formData.phone_home}
                onChange={handleChange}
                placeholder="Enter home phone number"
              />
              
              <FormInput
                label="Mobile Phone"
                name="phone_mobile"
                value={formData.phone_mobile}
                onChange={handleChange}
                placeholder="Enter mobile number"
              />
              
              <div className="flex flex-col md:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex flex-wrap gap-6">
                  <FormCheckbox
                    label="Consent to Treatment"
                    name="consent_to_treatment"
                    checked={formData.consent_to_treatment}
                    onChange={handleChange}
                  />
                  <FormCheckbox
                    label="Refusal of Treatment"
                    name="refusal_of_treatment"
                    checked={formData.refusal_of_treatment}
                    onChange={handleChange}
                  />
                </div>
                <FormInput
                  label="Guardian / Casualty Name"
                  name="guardian_name"
                  value={formData.guardian_name}
                  onChange={handleChange}
                  placeholder="Enter guardian or casualty name"
                />
              </div>
            </FormSection>

            {/* Accident Details */}
            <FormSection title="Accident Details" columns={2}>
              <FormInput
                label="Date of Accident"
                type="date"
                name="date_of_accident"
                value={formData.date_of_accident}
                onChange={handleChange}
                required
                className={fieldErrors.date_of_accident ? 'border-red-500' : ''}
              />
              {fieldErrors.date_of_accident && <p className="text-red-500 text-xs mt-1">{fieldErrors.date_of_accident}</p>}
              
              <FormInput
                label="Time of Accident"
                type="time"
                name="time_of_accident"
                value={formData.time_of_accident}
                onChange={handleChange}
                required
                className={fieldErrors.time_of_accident ? 'border-red-500' : ''}
              />
              {fieldErrors.time_of_accident && <p className="text-red-500 text-xs mt-1">{fieldErrors.time_of_accident}</p>}
              
              <FormInput
                label="Location of Accident"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Where did the accident occur?"
                className={`md:col-span-2 ${fieldErrors.location ? 'border-red-500' : ''}`}
              />
              {fieldErrors.location && <p className="text-red-500 text-xs mt-1">{fieldErrors.location}</p>}
              
              <FormTextarea
                label="How the Accident Occurred"
                name="how_occurred"
                value={formData.how_occurred}
                onChange={handleChange}
                placeholder="Describe how the accident happened..."
                rows={4}
                minLength={10}
                className={fieldErrors.how_occurred ? 'border-red-500' : ''}
              />
              {fieldErrors.how_occurred && <p className="text-red-500 text-xs mt-1">{fieldErrors.how_occurred}</p>}
              
              <FormTextarea
                label="Details of Injury"
                name="injury_details"
                value={formData.injury_details}
                onChange={handleChange}
                placeholder="Describe the visual injuries..."
                rows={3}
              />
              
              <FormInput
                label="Location of Injury"
                name="injury_location"
                value={formData.injury_location}
                onChange={handleChange}
                placeholder="e.g., Left Arm, Head, etc."
                className="md:col-span-2"
              />
            </FormSection>

            {/* Treatment Section */}
            <FormSection title="Treatment / Advice" columns={2}>
              <FormTextarea
                label="Treatment or Advice Given"
                name="treatment_given"
                value={formData.treatment_given}
                onChange={handleChange}
                placeholder="Describe the treatment or advice provided..."
                rows={4}
              />
              
              <FormInput
                label="Hospital (if applicable)"
                name="hospital"
                value={formData.hospital}
                onChange={handleChange}
                placeholder="Hospital name"
              />
              
              <FormInput
                label="Time of Departure"
                type="time"
                name="time_departure"
                value={formData.time_departure}
                onChange={handleChange}
                className={fieldErrors.time_departure ? 'border-red-500' : ''}
              />
              {fieldErrors.time_departure && <p className="text-red-500 text-xs mt-1">{fieldErrors.time_departure}</p>}
              
              <FormInput
                label="Expected Destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Where are they going?"
              />
              
              <div className="md:col-span-2 space-y-4 p-4 bg-gray-50 rounded-lg">
                <FormCheckbox
                  label="Ambulance Called"
                  name="ambulance_called"
                  checked={formData.ambulance_called}
                  onChange={handleChange}
                />
                
                {formData.ambulance_called && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormInput
                      label="Time Ambulance Called"
                      type="time"
                      name="ambulance_time_called"
                      value={formData.ambulance_time_called}
                      onChange={handleChange}
                      className={fieldErrors.ambulance_time_called ? 'border-red-500' : ''}
                    />
                    {fieldErrors.ambulance_time_called && <p className="text-red-500 text-xs mt-1 md:col-span-2">{fieldErrors.ambulance_time_called}</p>}
                    
                    <FormInput
                      label="Who Called Ambulance"
                      name="ambulance_caller"
                      value={formData.ambulance_caller}
                      onChange={handleChange}
                      placeholder="Name of person who called"
                    />
                    
                    <FormInput
                      label="Time Ambulance Arrived"
                      type="time"
                      name="ambulance_time_arrived"
                      value={formData.ambulance_time_arrived}
                      onChange={handleChange}
                      className={fieldErrors.ambulance_time_arrived ? 'border-red-500' : ''}
                    />
                    {fieldErrors.ambulance_time_arrived && <p className="text-red-500 text-xs mt-1 md:col-span-2">{fieldErrors.ambulance_time_arrived}</p>}
                  </div>
                )}
              </div>
              
              <FormInput
                label="Time Continued Activities"
                type="time"
                name="continued_activities_time"
                value={formData.continued_activities_time}
                onChange={handleChange}
                className={fieldErrors.continued_activities_time ? 'border-red-500' : ''}
              />
              {fieldErrors.continued_activities_time && <p className="text-red-500 text-xs mt-1">{fieldErrors.continued_activities_time}</p>}
            </FormSection>

            {/* First Aider Section */}
            <FormSection title="First Aider Details" columns={2}>
              <FormInput
                label="First Aider Name"
                name="first_aider_name"
                value={formData.first_aider_name}
                onChange={handleChange}
                required
                placeholder="Enter first aider's full name"
                className={fieldErrors.first_aider_name ? 'border-red-500' : ''}
              />
              {fieldErrors.first_aider_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.first_aider_name}</p>}
              
              <FormInput
                label="Date"
                type="date"
                name="first_aider_date"
                value={formData.first_aider_date}
                onChange={handleChange}
                required
                className={fieldErrors.first_aider_date ? 'border-red-500' : ''}
              />
              {fieldErrors.first_aider_date && <p className="text-red-500 text-xs mt-1">{fieldErrors.first_aider_date}</p>}
              
              <FormInput
                label="Time"
                type="time"
                name="first_aider_time"
                value={formData.first_aider_time}
                onChange={handleChange}
                required
                className={fieldErrors.first_aider_time ? 'border-red-500' : ''}
              />
              {fieldErrors.first_aider_time && <p className="text-red-500 text-xs mt-1">{fieldErrors.first_aider_time}</p>}
              
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Signature <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white">
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{ 
                      width: 500, 
                      height: 200, 
                      className: "w-full h-50 border border-gray-300 rounded bg-white signature-canvas" 
                    }}
                    ref={sigCanvas}
                    onEnd={() => {
                      // We'll save signature manually with a button to avoid the getTrimmedCanvas error
                    }}
                  />
                  <div className="flex gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={clearSignature}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear Signature
                    </button>
                    <button 
                      type="button" 
                      onClick={saveSignature}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Signature
                    </button>
                  </div>
                  {formData.first_aider_signature && (
                    <div className="mt-2 text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Signature saved
                    </div>
                  )}
                  {fieldErrors.first_aider_signature && (
                    <p className="text-red-500 text-xs mt-2">{fieldErrors.first_aider_signature}</p>
                  )}
                </div>
              </div>
            </FormSection>

            {/* RIDDOR Section */}
            <FormSection title="RIDDOR Reporting" columns={2}>
              <div className="md:col-span-2">
                <FormCheckbox
                  label="Reportable under RIDDOR?"
                  name="riddor_reportable"
                  checked={formData.riddor_reportable}
                  onChange={handleChange}
                />
              </div>
              
              {formData.riddor_reportable && (
                <>
                  <FormInput
                    label="How was this reported?"
                    name="riddor_report_method"
                    value={formData.riddor_report_method}
                    onChange={handleChange}
                    placeholder="e.g., Online, Phone, etc."
                  />
                  <FormInput
                    label="Reported By"
                    name="riddor_reported_by"
                    value={formData.riddor_reported_by}
                    onChange={handleChange}
                    placeholder="Name of person who reported"
                  />
                  <FormInput
                    label="Date Reported"
                    type="date"
                    name="riddor_date_reported"
                    value={formData.riddor_date_reported}
                    onChange={handleChange}
                    className={fieldErrors.riddor_date_reported ? 'border-red-500' : ''}
                  />
                  {fieldErrors.riddor_date_reported && <p className="text-red-500 text-xs mt-1">{fieldErrors.riddor_date_reported}</p>}
                </>
              )}
            </FormSection>

            {/* Message Display */}
            {message.text && (
              <div
                className={`p-4 rounded-lg border ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border-green-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {message.text}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/employee/incidents')}
                className="px-6 py-3 text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 text-lg font-medium text-white rounded-lg transition-colors ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'create' ? 'Creating Report...' : 'Updating Report...'}
                  </span>
                ) : (
                  mode === 'create' ? 'Create Accident Report' : 'Update Accident Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IncidentReportForm;