import React from "react";

const PlaceholderPage = ({ title }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600 mt-2">Content coming soon...</p>
    </div>
  );
};

export default PlaceholderPage;