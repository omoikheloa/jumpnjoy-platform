import React, { useState, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import apiService from '../../services/api';

const IncidentReportForm = () => {
  const [formData, setFormData] = useState({
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
  });



  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (message.text) setMessage({ text: '', type: '' });
  };

  const sigCanvas = useRef({});

  const clearSignature = () => {
    sigCanvas.current.clear();
    setFormData(prev => ({ ...prev, first_aider_signature: null }));
  };

  const saveSignature = () => {
    if (!sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.toDataURL("image/png");
      setFormData(prev => ({ ...prev, first_aider_signature: dataUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // append all fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== '') {
        if (key === "first_aider_signature" && formData[key]) {
          // convert base64 to blob before sending
          const byteString = atob(formData[key].split(',')[1]);
          const mimeString = formData[key].split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });
          data.append("first_aider_signature", blob, "signature.png");
        } else {
          data.append(key, formData[key]);
        }
      }
    });

    try {
      await apiService.createIncident(data); // must support multipart/form-data
      alert("Report submitted!");
    } catch (err) {
      alert("Error submitting report");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Accident Report Form</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Injured Person Section */}
          <h3 className="text-xl font-semibold">Details of Injured Person</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} className="form-input" required />
            <input type="text" name="surname" placeholder="Surname" value={formData.surname} onChange={handleChange} className="form-input" required />
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} className="form-input" />
            <select name="gender" value={formData.gender} onChange={handleChange} className="form-input">
              <option value="">Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
            <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} className="form-input col-span-2" />
            <input type="text" name="postcode" placeholder="Post Code" value={formData.postcode} onChange={handleChange} className="form-input" />
            <input type="text" name="phone_home" placeholder="Phone (Home)" value={formData.phone_home} onChange={handleChange} className="form-input" />
            <input type="text" name="phone_mobile" placeholder="Phone (Mobile)" value={formData.phone_mobile} onChange={handleChange} className="form-input" />
          </div>

          <div className="flex gap-4">
            <label>
              <input type="checkbox" name="consent_to_treatment" checked={formData.consent_to_treatment} onChange={handleChange} /> Consent to Treatment
            </label>
            <label>
              <input type="checkbox" name="refusal_of_treatment" checked={formData.refusal_of_treatment} onChange={handleChange} /> Refusal of Treatment
            </label>
          </div>
          <input type="text" name="guardian_name" placeholder="Guardian / Casualty Name" value={formData.guardian_name} onChange={handleChange} className="form-input" />

          {/* Accident Details */}
          <h3 className="text-xl font-semibold">Accident Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <input type="date" name="date_of_accident" value={formData.date_of_accident} onChange={handleChange} className="form-input" required />
            <input type="time" name="time_of_accident" value={formData.time_of_accident} onChange={handleChange} className="form-input" required />
            <input type="text" name="location" placeholder="Location of Accident" value={formData.location} onChange={handleChange} className="form-input col-span-2" required />
            <textarea name="how_occurred" placeholder="How the accident occurred" value={formData.how_occurred} onChange={handleChange} className="form-input col-span-2" rows="3" />
            <textarea name="injury_details" placeholder="Details of Injury (visual injuries)" value={formData.injury_details} onChange={handleChange} className="form-input col-span-2" rows="2" />
            <input type="text" name="injury_location" placeholder="Location of Injury (e.g. Left Arm)" value={formData.injury_location} onChange={handleChange} className="form-input col-span-2" />
          </div>

          {/* Treatment */}
          <h3 className="text-xl font-semibold">Treatment / Advice</h3>
          <textarea name="treatment_given" placeholder="Treatment or Advice Given" value={formData.treatment_given} onChange={handleChange} className="form-input" rows="3" />
          <input type="text" name="hospital" placeholder="Hospital (if applicable)" value={formData.hospital} onChange={handleChange} className="form-input" />
          <input type="time" name="time_departure" placeholder="Time of Departure" value={formData.time_departure} onChange={handleChange} className="form-input" />
          <input type="text" name="destination" placeholder="Expected Destination" value={formData.destination} onChange={handleChange} className="form-input" />

          <div className="flex gap-4">
            <label>
              <input type="checkbox" name="ambulance_called" checked={formData.ambulance_called} onChange={handleChange} /> Ambulance Called
            </label>
          </div>
          <input type="time" name="ambulance_time_called" placeholder="Time Ambulance Called" value={formData.ambulance_time_called} onChange={handleChange} className="form-input" />
          <input type="text" name="ambulance_caller" placeholder="Who Called" value={formData.ambulance_caller} onChange={handleChange} className="form-input" />
          <input type="time" name="ambulance_time_arrived" placeholder="Time Arrived" value={formData.ambulance_time_arrived} onChange={handleChange} className="form-input" />

          <input type="time" name="continued_activities_time" placeholder="Time Continued Activities" value={formData.continued_activities_time} onChange={handleChange} className="form-input" />

          {/* First Aider */}
          <h3 className="text-xl font-semibold">First Aider</h3>
      <input
        type="text"
        name="first_aider_name"
        placeholder="First Aider Name"
        value={formData.first_aider_name}
        onChange={(e) => setFormData({ ...formData, first_aider_name: e.target.value })}
        className="form-input"
      />

      <div>
        <label className="block mb-2">Signature</label>
        <SignatureCanvas
          penColor="black"
          canvasProps={{ width: 400, height: 150, className: "border border-gray-300 rounded" }}
          ref={sigCanvas}
          onEnd={saveSignature}
        />
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={clearSignature} className="btn btn-sm btn-secondary">Clear</button>
          <button type="button" onClick={saveSignature} className="btn btn-sm btn-primary">Save Signature</button>
        </div>
      </div>

      <input
        type="date"
        name="first_aider_date"
        value={formData.first_aider_date}
        onChange={(e) => setFormData({ ...formData, first_aider_date: e.target.value })}
        className="form-input"
      />
      <input
        type="time"
        name="first_aider_time"
        value={formData.first_aider_time}
        onChange={(e) => setFormData({ ...formData, first_aider_time: e.target.value })}
        className="form-input"
      />

          {/* RIDDOR */}
          <h3 className="text-xl font-semibold">RIDDOR Reporting</h3>
          <div className="flex gap-4">
            <label>
              <input type="checkbox" name="riddor_reportable" checked={formData.riddor_reportable} onChange={handleChange} /> Reportable under RIDDOR?
            </label>
          </div>
          <input type="text" name="riddor_report_method" placeholder="How was this reported?" value={formData.riddor_report_method} onChange={handleChange} className="form-input" />
          <input type="text" name="riddor_reported_by" placeholder="Reported By (Name)" value={formData.riddor_reported_by} onChange={handleChange} className="form-input" />
          <input type="date" name="riddor_date_reported" value={formData.riddor_date_reported} onChange={handleChange} className="form-input" />

          {/* Submit */}
          <button
            type="submit"
            className={`w-full btn ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'btn-danger'}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Accident Report'}
          </button>

          {message.text && (
            <div
              className={`px-4 py-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
              }`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default IncidentReportForm;