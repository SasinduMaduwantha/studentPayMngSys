import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="dashboard-container">
      <header>
        <h1>Welcome, {staff.name}</h1>
        <p>ID: {staff.id}</p>
        <p>Role: {staff.role || "Staff"}</p>
      </header>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Pending Student Payments</h3>
          <p>12</p>
        </div>

        <div className="card">
          <h3>Total Students</h3>
          <p>150</p>
        </div>

        <div className="card">
          <h3>Overdue Payments</h3>
          <p>5</p>
        </div>
      </section>

      <section className="dashboard-actions">
        <Link to="/manage-installments">
          <button>Manage Installment Plans</button>
        </Link>

        <Link to="/view-students">
          <button>View Students</button>
        </Link>

        <Link to="/" onClick={() => localStorage.removeItem("staff")}>
          <button>Logout</button>
        </Link>
      </section>
    </div>
  );
}
