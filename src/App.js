import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import StudentLogin from './StudentLogin';
import StaffLogin from './StaffLogin';
import StudentDashboard from './studentDashboard';
import StaffDashboard from './StaffDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/staff" element={<StaffLogin />} />
        <Route path="/stuDashboard" element={<StudentDashboard />} />
        <Route path="/staffDashboard" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
