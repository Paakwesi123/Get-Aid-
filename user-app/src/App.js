import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import SignUp from './pages/SignUp';
import MedicalForm from './pages/MedicalForm';
import SOSPanel from './pages/SOSPanel';

function App() {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes */}
        <Route 
          path="/medicalform" 
          element={isLoggedIn ? <MedicalForm /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/sospanel" 
          element={isLoggedIn ? <SOSPanel /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
