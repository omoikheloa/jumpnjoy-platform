import React, { useState } from "react";
import trimCanvas from "trim-canvas";
import SignatureCanvas from "react-signature-canvas";

const WaiverSigning = () => {
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [sigPad, setSigPad] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleClear = () => sigPad.clear();

  const handleSubmit = async () => {
    if (!fullName || sigPad.isEmpty()) {
        alert("Please enter your full name and sign before submitting.");
        return;
    }

  const token = localStorage.getItem("authToken");
  
  // Check if token exists
  if (!token) {
    alert("You need to be logged in to sign the waiver.");
    // Redirect to login page if needed
    // window.location.href = "/login";
    return;
  }

  const signatureImage = trimCanvas(sigPad.getCanvas()).toDataURL("image/png");

    try {
        const response = await fetch("/api/waivers/sign/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                full_name: fullName,
                signature: signatureImage,
            }),
        });

        // Check if the response status is OK (i.e., in the 200-299 range)
        if (response.ok) {
            setSubmitted(true);
        } else if (response.status === 401) {
            // Handle unauthorized error
            alert("You are not authorized. Please log in.");
            localStorage.removeItem("authToken");
            // Optionally redirect to login page
            // window.location.href = "/login";
        } else {
            // Handle other errors
            const errorData = await response.json();
            alert(`Submission failed: ${errorData.message || 'Unknown error'}`);
        }
    } catch (error) {
        // Handle network errors
        alert("An error occurred. Please check your network connection.");
        console.error("API call failed:", error);
    }
};
  if (submitted) {
    return (
      <div className="p-6 bg-green-100 rounded-lg text-center">
        <h2 className="text-xl font-bold text-green-700 mb-2">
          ✅ Waiver Signed Successfully!
        </h2>
        <p className="text-gray-700">Thank you for signing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Event Waiver Agreement</h1>

      {/* Waiver text */}
      <div className="border p-4 rounded mb-4 h-64 overflow-y-auto bg-gray-50 text-gray-700">
        <p>
          Please read the following carefully before signing:
        </p>
        <p className="mt-2">
          By participating in this event, you agree to release the organizers
          from any liability for injuries or damages sustained during the
          activity. You confirm you are in good health and voluntarily assume
          all risks associated with participation.
        </p>
        <p className="mt-2">
          If you are under 18, a guardian must sign on your behalf.
        </p>
      </div>

      {/* Agreement checkbox */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="agree"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
          className="mr-2"
        />
        <label htmlFor="agree" className="text-gray-700">
          I have read and agree to the terms of this waiver.
        </label>
      </div>

      {/* Show signing form only if agreed */}
      {agreed && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Signature
            </label>
            <SignatureCanvas
              ref={(ref) => setSigPad(ref)}
              penColor="black"
              canvasProps={{
                className: "border w-full h-32 rounded"
              }}
            />
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Clear Signature
            </button>
          </div>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit Waiver
          </button>
        </div>
      )}
    </div>
  );
};

export default WaiverSigning;