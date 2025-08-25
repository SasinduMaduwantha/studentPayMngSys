import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./StudentDashboard.css";
import userImg from "../src/assets/user.png";


export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [lastPaymentNo, setLastPaymentNo] = useState("N/A");
  const [remarks, setRemarks] = useState(""); // ✅ remarks from manager
  const [nextInstallment, setNextInstallment] = useState({
    paymentNo: "N/A",
    dueDate: "Not Set",
  });
  const [showRemarks, setShowRemarks] = useState(false); // ✅ overlay toggle
  
  const navigate = useNavigate();

  // --- helpers ---
  const formatDate = (value) => {
    if (!value) return "Not Set";
    const parts = value.split("T")[0].split("-");
    if (parts.length !== 3) return "Not Set";
    const [year, month, day] = parts;
    return `${day}-${month}-${year}`;
  };

  const parseTs = (value) => {
    if (!value) return NaN;
    const d = new Date(value);
    const ts = d.getTime();
    return Number.isFinite(ts) ? ts : NaN;
  };

const fetchStatus = useCallback(async (studentId) => {
  try {
    const res = await axios.get(
      `http://localhost:5000/installments/plan/${studentId}`
    );

    if (!res.data?.success || !Array.isArray(res.data?.plans)) {
      setPaymentStatus("Pending");
      setLastPaymentNo("N/A");
      setRemarks("");
      setNextInstallment({ paymentNo: "N/A", dueDate: "Not Set" });
      return;
    }

    const plans = res.data.plans.map((p) => {
      const dueTs = parseTs(p.due_date);
      const startTs = parseTs(p.start_date);
      const sortTs = Number.isFinite(dueTs)
        ? dueTs
        : Number.isFinite(startTs)
        ? startTs
        : NaN;
      return { ...p, _sortTs: sortTs };
    });

    // ----- last completed payment (Approved / Rejected / Uploaded) -----
    const lastPlan = plans
      .filter((p) => ["Approved", "Uploaded", "Rejected"].includes(p.status))
      .sort((a, b) => (b._sortTs || 0) - (a._sortTs || 0))[0];

    if (lastPlan) {
      setPaymentStatus(lastPlan.status);
      setLastPaymentNo(lastPlan.payment_no);
      setRemarks(lastPlan.status === "Rejected" ? lastPlan.remarks || "No remarks provided" : "");
    } else {
      setPaymentStatus("Pending");
      setLastPaymentNo("N/A");
      setRemarks("");
    }

  // ----- next installment (first Pending) -----
const nextPending = plans.find((p) => p.status === "pending");

setNextInstallment(
  nextPending
    ? {
        paymentNo: nextPending.payment_no,
        dueDate: formatDate(nextPending.due_date || nextPending.start_date),
      }
    : { paymentNo: "N/A", dueDate: "Not Set" }
);
  } catch (err) {
    console.error("Error fetching dashboard status:", err);
    setPaymentStatus("Error");
    setLastPaymentNo("Error");
    setRemarks("Error fetching remarks");
    setNextInstallment({ paymentNo: "Error", dueDate: "Error" });
  }
}, []);



  // Load student + fetch status
  useEffect(() => {
    const storedStudent = localStorage.getItem("studentData");
    if (!storedStudent) {
      navigate("/");
      return;
    }
    const parsedStudent = JSON.parse(storedStudent);
    setStudent(parsedStudent);
    fetchStatus(parsedStudent.student_id);
  }, [navigate, fetchStatus]);

  if (!student) return <p>Loading...</p>;

  return (
    <div className="student-dashboard-container">
      {/* HEADER */}
      <header className="student-dashboard-header">
        <div className="student-dashboard-user">
          <img src={userImg} alt="User" className="user-avatar" />
          <div className="student-dashboard-user-text">
            <h1>Welcome, {student.name}</h1>
            <p>Registration No: {student.student_id}</p>
          </div>
        </div>
        <div>
          <Link to="/" onClick={() => localStorage.removeItem("studentData")}>
            <button className="student-logout-btn">Logout</button>
          </Link>
        </div>
      </header>

      {/* CARDS */}
      <section className="student-dashboard-cards">
        {/* Payment Status Card */}
        <div className="student-dashboard-card">
          <span className="icon">💳</span>
          <div>
            <h3>Payment Status</h3>
            <p>
              {paymentStatus} <strong>(Payment No: {lastPaymentNo})</strong>
              {paymentStatus === "Rejected" && (
              <span
      className="remarks-icon"
      onClick={() => setShowRemarks(true)}
      title="View Remarks"
    >
      ⚠️
    </span>
              )}
            </p>
          </div>
        </div>

        {/* Next Installment Card */}
        <div className="student-dashboard-card">
          <span className="icon">📅</span>
          <div>
            <h3>Next Installment</h3>
            <p>
              <strong>Payment No:</strong> {nextInstallment.paymentNo} |{" "}
              <strong>Due:</strong> {nextInstallment.dueDate}
            </p>
          </div>
        </div>
      </section>

      {/* ACTIONS */}
      <section className="student-dashboard-actions">
        <Link to="/my-plan" className="student-dashboard-action-card">
          <span className="icon">📑</span>
          <div>
            <h3>My Plan</h3>
            <p>View and manage your payment plan</p>
          </div>
        </Link>

        <Link to="/view-history" className="student-dashboard-action-card">
          <span className="icon">📜</span>
          <div>
            <h3>View Payment History</h3>
            <p>Check your past payments</p>
          </div>
        </Link>

        <Link to="/passwordChange" className="student-dashboard-action-card">
          <span className="icon">⚙️</span>
          <div>
            <h3>Settings</h3>
            <p>Change your password</p>
          </div>
        </Link>
      </section>

      {/* ✅ Remarks Overlay Modal */}
      {showRemarks && (
        <div className="remarks-overlay">
          <div className="remarks-modal">
            <h3>Remarks from Manager</h3>
            <p>{remarks}</p>
            <button
              className="close-remarks-btn"
              onClick={() => setShowRemarks(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
