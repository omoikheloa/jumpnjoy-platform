import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import trimCanvas from 'trim-canvas';
import apiService from '../../services/api';

const PublicWaiverSigning = () => {
  const { token } = useParams();
  const [session, setSession] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  
  const sigPad = useRef();

  useEffect(() => {
    loadSession();
  }, [token]);

  const loadSession = async () => {
    try {
      const data = await apiService.getPublicWaiverSession(token);
      setSession(data);
      if (data.participant_name) {
        setFullName(data.participant_name);
      }
    } catch (error) {
      setError('Invalid or expired waiver link. Please contact the organizer for a new link.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!sigPad.current || sigPad.current.isEmpty()) {
      setError('Please provide your signature');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const trimmedCanvas = trimCanvas(sigPad.current.getCanvas());
      const signature = trimmedCanvas.toDataURL('image/png');

      const data = await apiService.signPublicWaiver(token, {
        full_name: fullName.trim(),
        signature: signature
      });

      if (data.success) {
        setSubmitted(true);
        if (data.pdf_url) {
          setTimeout(() => {
            window.open(data.pdf_url, '_blank');
          }, 1000);
        }
      } else {
        setError(data.error || 'Failed to submit waiver. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading waiver...</p>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Unable to Load Waiver</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Waiver Signed Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for signing the waiver.</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p><strong>Signed by:</strong> {fullName}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            {session?.staff_name && <p><strong>Organizer:</strong> {session.staff_name}</p>}
          </div>
          <button
            onClick={() => window.close()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        {session?.staff_name && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Event Organizer:</strong> {session.staff_name}
            </p>
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Liability Waiver Agreement
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Waiver Text */}
        <div className="border border-gray-300 p-6 rounded-lg mb-6 h-80 overflow-y-auto bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Release of Liability Agreement</h2>
          
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Please read this document carefully before signing.</strong>
            </p>

            <p>
              I, the undersigned participant, hereby acknowledge and agree that I am voluntarily 
              participating in the event and related activities. I understand that these activities 
              may involve certain risks, including but not limited to physical injury, illness, 
              or property damage.
            </p>

            <p>
              <strong>Assumption of Risk:</strong> I knowingly and freely assume all such risks, 
              both known and unknown, even if arising from the negligence of the Releasees or others, 
              and assume full responsibility for my participation.
            </p>

            <p>
              <strong>Release and Waiver:</strong> I, for myself and on behalf of my heirs, 
              assigns, personal representatives and next of kin, hereby release, indemnify, 
              and hold harmless the event organizers, their officers, officials, agents, 
              and/or employees from any and all claims, demands, losses, and liability arising 
              out of or related to any injury, disability, or loss I may suffer.
            </p>

            <p>
              <strong>Medical Attention:</strong> I give my consent for emergency medical treatment 
              if needed and agree to be financially responsible for any costs incurred.
            </p>

            <p className="font-semibold">
              I HAVE READ THIS RELEASE OF LIABILITY AND ASSUMPTION OF RISK AGREEMENT, 
              FULLY UNDERSTAND ITS TERMS, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.
            </p>

            <p className="text-sm text-gray-600 mt-6">
              For participants under 18 years of age, a parent or guardian must sign this waiver.
            </p>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="flex items-center mb-6 p-4 bg-blue-50 rounded-lg">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="agree" className="ml-3 text-gray-700 font-medium">
            I have read, understood, and agree to be bound by the terms of this waiver agreement.
          </label>
        </div>

        {/* Signing Form */}
        {agreed && (
          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Legal Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name as it appears on official documents"
              />
            </div>

            {/* Signature Pad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Signature
              </label>
              <div className="border-2 border-gray-300 rounded-lg">
                <SignatureCanvas
                  ref={sigPad}
                  penColor="black"
                  canvasProps={{
                    className: "w-full h-40 bg-white rounded-lg",
                    style: { border: 'none' }
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <button
                  type="button"
                  onClick={handleClearSignature}
                  className="text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Clear Signature
                </button>
                <span className="text-sm text-gray-500">
                  Sign in the box above
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Sign and Submit Waiver'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicWaiverSigning;