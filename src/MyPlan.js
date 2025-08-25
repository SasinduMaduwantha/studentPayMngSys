import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './MyPlan.css';
import userImg from "../src/assets/user.png"; 

export default function MyPlan() {
  const [student, setStudent] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [uploadedSlip, setUploadedSlip] = useState(null);
  const [hasSlip, setHasSlip] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedStudent = localStorage.getItem("studentData");
    if (storedStudent) {
      const parsedStudent = JSON.parse(storedStudent);
      setStudent(parsedStudent);
      fetchPlan(parsedStudent.student_id);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const fetchPlan = async (studentId) => {
    try {
      const planRes = await axios.get(`http://localhost:5000/installments/plan/${studentId}`);
      if (planRes.data.success && planRes.data.plans.length > 0) {
        const plans = planRes.data.plans;
        const exSchedule = plans.map(p => ({
          year: p.year,
          start_date: p.start_date.slice(0, 10),
          due_date: p.due_date.slice(0, 10),
          payment_no: p.payment_no,
          payment: p.payment,
          plan_type: p.plan_type,
          status: p.status
        }));
        setSchedule(exSchedule.sort((a, b) => a.year - b.year));
        const slipChecks = await Promise.all(
          exSchedule.map(async (row) => {
            try {
              const slipRes = await axios.get(`http://localhost:5000/installments/slip/${row.payment_no}`);
              return { payment_no: row.payment_no, hasSlip: slipRes.data.success };
            } catch (err) {
              return { payment_no: row.payment_no, hasSlip: false };
            }
          })
        );
        const slipMap = slipChecks.reduce((acc, { payment_no, hasSlip }) => ({
          ...acc,
          [payment_no]: hasSlip
        }), {});
        setHasSlip(slipMap);
      } else {
        setSchedule([]);
        setHasSlip({});
      }
    } catch (err) {
      console.error(err);
      setSchedule([]);
      setHasSlip({});
      alert("Error fetching your plan. Please try again later.");
    }
  };

const handleUploadClick = (row) => {
  const currentIndex = schedule.findIndex(r => r.payment_no === row.payment_no);

  // If the current installment is rejected → allow re-upload immediately
  if (row.status.toLowerCase() === "rejected") {
    setSelectedPayment(row);
    setPaymentAmount(row.payment.toFixed(2));
    setPaymentSlip(null);
    setUploadedSlip(null);
    return;
  }

  // Check all previous installments
  for (let i = 0; i < currentIndex; i++) {
    const prevStatus = schedule[i].status.toLowerCase();
    // Only allow upload if all previous are approved
    if (prevStatus !== "approved") {
      alert(
        `You must first complete installment ${schedule[i].payment_no} before uploading slip for ${row.payment_no}`
      );
      return; // Stop here
    }
  }

  // If all previous are approved → allow upload
  setSelectedPayment(row);
  setPaymentAmount(row.payment.toFixed(2));
  setPaymentSlip(null);
  setUploadedSlip(null);
};



  const handleViewClick = async (paymentNo) => {
    try {
      const response = await axios.get(`http://localhost:5000/installments/slip/${paymentNo}`);
      if (response.data.success && response.data.slip) {
        setSelectedPayment({ payment_no: paymentNo });
        setUploadedSlip(response.data.slip);
      } else {
        alert(response.data.message || "No payment slip found for this payment number.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching payment slip details. Please try again.");
    }
  };

  const handleSlipUpload = (e) => {
    setPaymentSlip(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!paymentAmount || !paymentSlip) {
      alert("Please enter payment amount and upload a payment slip.");
      return;
    }

    const formData = new FormData();
    formData.append("paymentNo", selectedPayment.payment_no);
    formData.append("paymentAmount", paymentAmount);
    formData.append("paymentSlip", paymentSlip);

    try {
      const response = await axios.post("http://localhost:5000/installments/upload-slip", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.success) {
        alert("Payment slip uploaded successfully!");
        setHasSlip({ ...hasSlip, [selectedPayment.payment_no]: true });
        setSelectedPayment(null);
        setPaymentAmount("");
        setPaymentSlip(null);
        setUploadedSlip(null);
        fetchPlan(student.student_id); // Refresh plan to update status
      } else {
        alert(response.data.message || "Failed to upload payment slip.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error uploading payment slip. Please try again.");
    }
  };

  const handleCloseForm = () => {
    setSelectedPayment(null);
    setPaymentAmount("");
    setPaymentSlip(null);
    setUploadedSlip(null);
  };

  if (!student) {
    return <p>Loading...</p>;
  }

  return (
    <div className="my-plan-container">
      <header className="my-plan-header">
        <div className="my-plan-user">
          <img 
            src={userImg} 
            alt="User" 
            className="user-avatar"
          />
          <div className="my-plan-user-text">
            <h1>My Installment Plan</h1>
            <p>Registration No: {student.student_id}</p>
            <p>Name: {student.name}</p>
          </div>
        </div>
        <Link to="/stuDashboard">
          <button className="back-btn">Back to Dashboard</button>
        </Link>
      </header>

      {schedule.length > 0 ? (
        <section className="my-plan-schedule">
          <h3>Your Payment Schedule</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Due Date</th>
                  <th>Payment ID</th>
                  <th>Payment Amount</th>
                  <th>Plan Type</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i}>
                    <td>{row.year}</td>
                    <td>{row.due_date}</td>
                    <td>{row.payment_no}</td>
                    <td>${row.payment.toFixed(2)}</td>
                    <td>{row.plan_type}</td>
                    <td className={row.status.toLowerCase()}>{row.status}</td>
                   <td>
                    {["pending", "rejected"].includes(row.status.toLowerCase()) ? (
                      <button 
                        className="upload-btn" 
                        onClick={() => handleUploadClick(row)}
                      >
                        {row.status.toLowerCase() === "rejected" ? "Re-Upload Slip" : "Upload Slip"}
                      </button>
                    ) : hasSlip[row.payment_no] ? (
                      <button 
                        className="view-btn" 
                        onClick={() => handleViewClick(row.payment_no)}
                      >
                        View Slip
                      </button>
                    ) : (
                      <button 
                        className="upload-btn" 
                        onClick={() => handleUploadClick(row)}
                      >
                        Upload Slip
                      </button>
                    )}
                  </td>

                  </tr>
                ))}
              </tbody>
            </table>
            {selectedPayment && !uploadedSlip && (
              <div className="upload-slip-overlay">
                <div className="upload-slip-form">
                  <button className="close-btn" onClick={handleCloseForm}>✕</button>
                  <h3>Upload Payment Slip for {selectedPayment.payment_no}</h3>
                  <div className="form-group">
                    <label>Payment Amount ($):</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="Enter payment amount"
                    />
                  </div>
                  <div className="form-group">
                    <label>Upload Payment Slip:</label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleSlipUpload}
                    />
                  </div>
                  <div className="form-actions">
                    <button className="submit-btn" onClick={handleSubmit}>Submit</button>
                    <button className="cancel-btn" onClick={handleCloseForm}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
            {selectedPayment && uploadedSlip && (
              <div className="upload-slip-overlay">
                <div className="upload-slip-form">
                  <button className="close-btn" onClick={handleCloseForm}>✕</button>
                  <h3>Payment Slip Details for {selectedPayment.payment_no}</h3>
                  <div className="form-group">
                    <label>Payment Amount ($):</label>
                    <p>{uploadedSlip.amount.toFixed(2)}</p>
                  </div>
                  <div className="form-group">
                    <label>Uploaded Slip:</label>
                    {uploadedSlip.file_path.endsWith('.pdf') ? (
                      <a href={`http://localhost:5000/${uploadedSlip.file_path}`} target="_blank" rel="noopener noreferrer">
                        View PDF
                      </a>
                    ) : (
                      <img 
                        src={`http://localhost:5000/${uploadedSlip.file_path}`} 
                        alt="Payment Slip" 
                        style={{ maxWidth: '100%', maxHeight: '300px' }}
                        onError={() => alert("Failed to load payment slip image. Please check if the file exists.")}
                      />
                    )}
                  </div>
                  <div className="form-actions">
                    <button className="cancel-btn" onClick={handleCloseForm}>Close</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <p className="no-plan-message">No installment plan has been assigned to you yet. Please contact the staff for more information.</p>
      )}
    </div>
  );
}