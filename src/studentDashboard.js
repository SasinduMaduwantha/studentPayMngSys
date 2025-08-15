import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import './StudentDashboard.css';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);

useEffect(() => {
  const storedStudent = localStorage.getItem("studentData");

  if (storedStudent) {
    setStudent(JSON.parse(storedStudent));
  } else {
    // No student found, redirect to login
    window.location.href = "/";
  }
}, []);



  if (!student) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard-container">
      <header>
        <h1>Welcome, {student.name}</h1>
        <p>Registration No: {student.student_id}</p>
        <p>Email: {student.email}</p>
        <p>Contact: {student.contactNo}</p>
      </header>

      <section className="dashboard-cards">
        <div className="card">
          <h3>Payment Status</h3>
          <p>{student.paymentStatus || "Pending"}</p>
        </div>

        <div className="card">
          <h3>Next Installment</h3>
          <p>{student.nextInstallmentDate || "Not Set"}</p>
        </div>
      </section>

      <section className="dashboard-actions">
        <Link to="/upload-slip">
          <button>Upload Payment Slip</button>
        </Link>

        <Link to="/view-history">
          <button>View Payment History</button>
        </Link>

        <Link to="/">
          <button>Logout</button>
        </Link>
      </section>
    </div>
  );
}
