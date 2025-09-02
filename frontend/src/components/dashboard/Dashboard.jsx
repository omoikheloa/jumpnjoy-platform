// import React, { useState, useEffect } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
// import apiService from '../../services/api';

// const Dashboard = () => {
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         const data = await apiService.getDashboardData();
//         setDashboardData(data);
//         setError('');
//       } catch (err) {
//         setError(err.message || 'Failed to load dashboard data');
//         console.error('Dashboard error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
    
//     // Refresh dashboard data every 5 minutes
//     const interval = setInterval(fetchDashboardData, 300000);
//     return () => clearInterval(interval);
//   }, []);

//   const CustomTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
//           <p className="font-semibold text-gray-900">{`Date: ${label}`}</p>
//           {payload.map((entry, index) => (
//             <p key={index} style={{ color: entry.color }} className="text-sm">
//               {`${entry.dataKey === 'visitors' ? 'Visitors' : 'Sales'}: ${
//                 entry.dataKey === 'sales' ? '£' : ''
//               }${entry.value}`}
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="max-w-md mx-auto mt-20">
//         <div className="bg-danger-50 border border-danger-200 text-danger-700 px-6 py-4 rounded-lg text-center">
//           <h3 className="font-semibold mb-2">Error Loading Dashboard</h3>
//           <p className="mb-4">{error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="btn-danger"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!dashboardData) {
//     return (
//       <div className="text-center py-20">
//         <p className="text-gray-600">No dashboard data available</p>
//       </div>
//     );
//   }

//   const { summary, chart_data, recent_activity } = dashboardData;

//   return (
//     <div className="max-w-7xl mx-auto p-6 space-y-8">
//       <div className="flex items-center">
//         <span className="text-3xl mr-4">���</span>
//         <h2 className="text-3xl font-bold text-gray-900">Owner Dashboard</h2>
//       </div>
      
//       {/* Summary Statistics */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <div className="card text-center">
//           <div className="text-2xl mb-2">���</div>
//           <h4 className="text-sm font-medium text-gray-600 mb-1">Monthly Visitors</h4>
//           <div className="text-3xl font-bold text-primary-600">
//             {summary.total_visitors_month.toLocaleString()}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
//         </div>
        
//         <div className="card text-center">
//           <div className="text-2xl mb-2">���</div>
//           <h4 className="text-sm font-medium text-gray-600 mb-1">Monthly Sales</h4>
//           <div className="text-3xl font-bold text-success-600">
//             £{summary.total_sales_month.toLocaleString()}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Cafe revenue</p>
//         </div>
        
//         <div className="card text-center">
//           <div className="text-2xl mb-2">⚠️</div>
//           <h4 className="text-sm font-medium text-gray-600 mb-1">Recent Incidents</h4>
//           <div className={`text-3xl font-bold ${
//             summary.recent_incidents > 0 ? 'text-danger-600' : 'text-success-600'
//           }`}>
//             {summary.recent_incidents}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
//         </div>
        
//         <div className="card text-center">
//           <div className="text-2xl mb-2">���️</div>
//           <h4 className="text-sm font-medium text-gray-600 mb-1">Failed Safety Checks</h4>
//           <div className={`text-3xl font-bold ${
//             summary.failed_checks > 0 ? 'text-danger-600' : 'text-success-600'
//           }`}>
//             {summary.failed_checks}
//           </div>
//           <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
//         {/* Visitor Trend Chart */}
//         <div className="card">
//           <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Visitor Trend (Last 30 Days)</h4>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={chart_data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis 
//                 dataKey="date" 
//                 tick={{ fontSize: 12 }}
//                 tickFormatter={(value) => new Date(value).toLocaleDateString()}
//               />
//               <YAxis tick={{ fontSize: 12 }} />
//               <Tooltip content={<CustomTooltip />} />
//               <Line 
//                 type="monotone" 
//                 dataKey="visitors" 
//                 stroke="#2563eb" 
//                 strokeWidth={2}
//                 dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
//                 activeDot={{ r: 6 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Sales Chart */}
//         <div className="card">
//           <h4 className="text-lg font-semibold text-gray-900 mb-4">Daily Sales (Last 30 Days)</h4>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={chart_data}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis 
//                 dataKey="date" 
//                 tick={{ fontSize: 12 }}
//                 tickFormatter={(value) => new Date(value).toLocaleDateString()}
//               />
//               <YAxis tick={{ fontSize: 12 }} />
//               <Tooltip content={<CustomTooltip />} />
//               <Bar 
//                 dataKey="sales" 
//                 fill="#16a34a"
//                 radius={[4, 4, 0, 0]}
//               />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Recent Activity Feed */}
//       {recent_activity && recent_activity.length > 0 && (
//         <div className="card">
//           <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
//           <div className="max-h-80 overflow-y-auto">
//             {recent_activity.map((activity, index) => (
//               <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
//                 <div className="flex items-center">
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
//                     activity.type === 'incident' ? 'bg-danger-100 text-danger-800' : 'bg-primary-100 text-primary-800'
//                   }`}>
//                     {activity.type.replace('_', ' ').toUpperCase()}
//                   </span>
//                   <span className="text-sm text-gray-900">{activity.message}</span>
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   {new Date(activity.date).toLocaleDateString()}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Dashboard;
import React from 'react';
import EmployeeDashboard from '../EmployeeDashboard/EmployeeDashboard';
import OwnerDashboard from './OwnerDashboard';

const Dashboard = ({ user, onLogout }) => {
  if (user.role === 'owner') {
    return <OwnerDashboard onLogout={onLogout} user={user} />;
  }
  return <EmployeeDashboard onLogout={onLogout} user={user} />;
};

export default Dashboard;