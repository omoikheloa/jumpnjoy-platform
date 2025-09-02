import React, { useState } from "react";
import apiService from "../../services/api";

const ratingOptions = [1, 2, 3, 4, 5];

const StaffAppraisalForm = () => {
  const [formData, setFormData] = useState({
    date_of_appraisal: "",
    appraiser: "",
    // ratings + comments
    attendance_rating: 3, attendance_comments: "",
    quality_rating: 3, quality_comments: "",
    teamwork_rating: 3, teamwork_comments: "",
    initiative_rating: 3, initiative_comments: "",
    customer_service_rating: 3, customer_service_comments: "",
    adherence_rating: 3, adherence_comments: "",
    // other sections
    achievements: "",
    development_needs: "",
    goals: "",
    employee_comments: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.createAppraisal(formData);
      setMessage("Appraisal submitted successfully!");
      setFormData({});
    } catch (error) {
      setMessage("Error submitting appraisal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 card">
      <h2 className="text-2xl font-bold mb-4">Staff Appraisal Form</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Employee Info */}
        <div>
          <label className="block font-semibold">Date of Appraisal</label>
          <input
            type="date"
            name="date_of_appraisal"
            value={formData.date_of_appraisal || ""}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="block font-semibold">Appraiser Name</label>
          <input
            type="text"
            name="appraiser"
            value={formData.appraiser || ""}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        {/* Job Performance Ratings */}
        {[
          ["attendance", "Attendance & Punctuality"],
          ["quality", "Quality of Work"],
          ["teamwork", "Teamwork & Communication"],
          ["initiative", "Initiative & Motivation"],
          ["customer_service", "Customer Service"],
          ["adherence", "Adherence to Procedures"],
        ].map(([field, label]) => (
          <div key={field} className="space-y-2">
            <label className="block font-semibold">{label}</label>
            <select
              name={`${field}_rating`}
              value={formData[`${field}_rating`] || 3}
              onChange={handleChange}
              className="form-input"
            >
              {ratingOptions.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <textarea
              name={`${field}_comments`}
              value={formData[`${field}_comments`] || ""}
              onChange={handleChange}
              placeholder="Comments..."
              className="form-input"
              rows="2"
            />
          </div>
        ))}

        {/* Achievements */}
        <div>
          <label className="block font-semibold">Achievements</label>
          <textarea
            name="achievements"
            value={formData.achievements || ""}
            onChange={handleChange}
            className="form-input"
            rows="3"
          />
        </div>

        {/* Development Needs */}
        <div>
          <label className="block font-semibold">Development Needs</label>
          <textarea
            name="development_needs"
            value={formData.development_needs || ""}
            onChange={handleChange}
            className="form-input"
            rows="3"
          />
        </div>

        {/* Goals */}
        <div>
          <label className="block font-semibold">Goals (3–6 months)</label>
          <textarea
            name="goals"
            value={formData.goals || ""}
            onChange={handleChange}
            className="form-input"
            rows="3"
          />
        </div>

        {/* Employee Comments */}
        <div>
          <label className="block font-semibold">Employee Comments</label>
          <textarea
            name="employee_comments"
            value={formData.employee_comments || ""}
            onChange={handleChange}
            className="form-input"
            rows="3"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`btn w-full ${isSubmitting ? "bg-gray-400" : "btn-primary"}`}
        >
          {isSubmitting ? "Submitting..." : "Submit Appraisal"}
        </button>

        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default StaffAppraisalForm;