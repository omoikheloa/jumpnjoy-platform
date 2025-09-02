import React from "react";

const FormsPage = () => {
  const forms = ["Leave Request", "Expense Reimbursement", "Travel Request"];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Forms</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {forms.map((form, idx) => (
          <div key={idx} className="p-6 bg-white rounded-xl shadow-md">
            <h2 className="text-lg font-semibold">{form}</h2>
            <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg">
              Fill Form
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FormsPage;