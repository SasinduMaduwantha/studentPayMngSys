import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentLogin from './StudentLogin';
import StaffLogin from './StaffLogin';
import StudentDashboard from './studentDashboard';
import StaffDashboard from './StaffDashboard';
import CreateInstallPlan from './CreateInstallPlan';
import MyPlan from './MyPlan';
import VerifySlip from './VerifySlip';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentLogin />} />
        <Route path="/staff" element={<StaffLogin />} />
        <Route path="/stuDashboard" element={<StudentDashboard />} />
        <Route path="/staffDashboard" element={<StaffDashboard />} />
        <Route path="/creat-install-plan" element={<CreateInstallPlan />} />
        <Route path="/my-plan" element={<MyPlan />} />
         <Route path="/verify-slip" element={<VerifySlip />} />
      </Routes>
    </Router>
  );
}

export default App;
