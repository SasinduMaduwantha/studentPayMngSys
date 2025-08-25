import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './StaffDashboard.css';
import userImg from "../src/assets/user.png"; 

export default function StaffDashboard() {
  const [staff, setStaff] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get staff data from localStorage
    const storedStaff = localStorage.getItem("staff");
    if (storedStaff) {
      setStaff(JSON.parse(storedStaff));
    } else {
      // If no staff info found, redirect to login
      navigate("/staff");
    }
  }, [navigate]);

  if (!staff) {
    return <p>Loading...</p>; // Optional loading state
  }

  return (
    <div className="staff-dashboard-container">
  <header className="staff-dashboard-header">


    <div className="staff-dashboard-user">
  <img 
    src={userImg} 
    alt="User" 
    className="user-avatar"
  />
  <div className="staff-dashboard-user-text">
    <h1>Welcome, {staff.name}</h1>
    <p>ID: {staff.id}</p>
    <p>Role: {staff.role || "Staff"}</p>
  </div>
</div>

    <div>
      <Link to="/staff" onClick={() => localStorage.removeItem("staff")}>
        <button className="staff-logout-btn">Logout</button>
      </Link>
    </div>
  </header>

  <section className="staff-dashboard-cards">
    <div className="staff-dashboard-card">
      <Link to="/verify-slip" style={{ textDecoration: 'none' }}>
      <span className="icon">💰</span>
      <div>
        <h3>Pending Student Payments</h3>
        <p>12</p>
      </div>
    </Link>
    </div>

    <div className="staff-dashboard-card">
      <span className="icon">🔄</span>
      <div>
        <h3>Daily Payments</h3>
        <p>150</p>
      </div>
    </div>
     <div className="staff-dashboard-card">
      <span className="icon">⚠️</span>
      <div>
        <h3>Overdue Payments</h3>
        <p>5</p>
      </div>
    </div>
     <div className="staff-dashboard-card">
      <span className="icon">🎓</span>
      <div>
        <h3>Total Students</h3>
        <p>150</p>
      </div>
    </div>
  </section>
<section className="staff-dashboard-actions">
  <Link to="/creat-install-plan" className="staff-dashboard-action-card">
    <span className="icon">📑</span>
    <div>
      <h3>Manage Installment Plans</h3>
      <p>Create & update student payment schedules</p>
    </div>
  </Link>

  <Link to="/view-students" className="staff-dashboard-action-card">
    <span className="icon">👨‍🎓</span>
    <div>
      <h3>Generate Reports</h3>
      <p>Filter and download or print payment reports</p>
    </div>
  </Link>
</section>

<section className="staff-dashboard-extra-actions">
  <Link to="/create-manager" className="staff-dashboard-action-card small-card">
    <span className="icon">🧑‍💼</span>
    <div>
      <h3>Create Manager Account</h3>
      <p>Add new manager users</p>
    </div>
  </Link>

  <Link to="/change-settings" className="staff-dashboard-action-card small-card">
    <span className="icon">⚙️</span>
    <div>
      <h3>Change User Settings</h3>
      <p>Update username, password or email</p>
    </div>
  </Link>
</section>
</div>

  );
}
