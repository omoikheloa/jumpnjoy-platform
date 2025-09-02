import React from "react";

const DashboardPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
          <div className="space-y-2">
            <button className="block w-full text-left px-4 py-2 bg-green-500 text-white rounded-lg">
              Submit Leave Request
            </button>
            <button className="block w-full text-left px-4 py-2 bg-blue-500 text-white rounded-lg">
              Upload Timesheet
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>✔️ Leave Request Approved - Aug 18</li>
            <li>📄 Timesheet Submitted - Aug 15</li>
          </ul>
        </div>

        {/* Schedule */}
        <div className="p-6 bg-white rounded-xl shadow-md md:col-span-2">
          <h2 className="text-lg font-semibold mb-3">Upcoming Schedule</h2>
          <p className="text-gray-600">Team Meeting - Aug 20, 10:00 AM</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;