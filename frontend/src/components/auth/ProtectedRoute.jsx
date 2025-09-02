import React from 'react';
import { Navigate } from 'react-router-dom';
import apiService from '../../services/api';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const token = localStorage.getItem('authToken');
//   const user = apiService.getCurrentUserFromStorage();

//   // Not logged in → send to login
//   if (!token || !user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Logged in but role not allowed → block
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

export default ProtectedRoute;
