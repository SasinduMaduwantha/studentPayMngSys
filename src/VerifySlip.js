import React, { useEffect, useState } from "react";
import axios from "axios";
import './VerifySlip.css';

export default function VerifySlip() {
  const [slips, setSlips] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [remarks, setRemarks] = useState(""); // for rejected reason
  const [showRemarksOverlay, setShowRemarksOverlay] = useState(false);
  const [currentRejectPaymentNo, setCurrentRejectPaymentNo] = useState(null);

  useEffect(() => {
    fetchSlips();
  }, []);

  const fetchSlips = async () => {
    try {
      const response = await axios.get("http://localhost:5000/installments/slip");
      if (response.data.success) {
        setSlips(response.data.slips);
      } else {
        setSlips([]);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching payment slips.");
    }
  };

  const handleViewSlip = async (paymentNo) => {
    try {
      const response = await axios.get(`http://localhost:5000/installments/slip/${paymentNo}`);
      if (response.data.success && response.data.slip) {
        setSelectedSlip({ payment_no: paymentNo, ...response.data.slip });
      } else {
        alert(response.data.message || "No slip found for this payment.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching slip details.");
    }
  };

  const handleCloseOverlay = () => setSelectedSlip(null);

  const handleStatusChange = (paymentNo, value) => {
    setStatusUpdates({ ...statusUpdates, [paymentNo]: value });
    if (value === "Rejected") {
      setCurrentRejectPaymentNo(paymentNo);
      setShowRemarksOverlay(true);
    }
  };

  const handleSaveStatus = async (paymentNo) => {
    const newStatus = statusUpdates[paymentNo];
    if (!newStatus) {
      alert("Please select a status before saving.");
      return;
    }

    // if Rejected, make sure remarks is filled
    let payload = { status: newStatus };
    if (newStatus === "Rejected") {
      if (!remarks.trim()) {
        alert("Please enter reason for rejection.");
        return;
      }
      payload.remarks = remarks.trim();
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/installments/slip/verify/${paymentNo}`,
        payload
      );
      if (response.data.success) {
        alert("Status updated successfully!");
        setSlips(slips.map(slip =>
          slip.payment_no === paymentNo ? { ...slip, status: newStatus, remarks: remarks } : slip
        ));
        setStatusUpdates({ ...statusUpdates, [paymentNo]: "" });
        setRemarks("");
        setSelectedSlip(null);
        setShowRemarksOverlay(false);
      } else {
        alert(response.data.message || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    }
  };

  return (
    <div className="verify-slip-container">
      <h1>Verify Payment Slips</h1>
      {slips.length > 0 ? (
        <table className="slip-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Payment No</th>
              <th>Amount to be Paid</th>
              <th>Amount Paid</th>
              <th>Date</th>
              <th>Time</th>
              <th>View</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slips.map((slip, idx) => (
              <tr key={idx}>
                <td>{slip.studentid}</td>
                <td>{slip.payment_no}</td>
                <td>${slip.amount_to_be_paid?.toFixed(2) || "0.00"}</td>
                <td>${slip.amount_paid?.toFixed(2) || "0.00"}</td>
                <td>{slip.date || ""}</td>
                <td>{slip.time || ""}</td>
                <td>
                  <button onClick={() => handleViewSlip(slip.payment_no)}>View</button>
                </td>
                <td>
                  <select
                    value={statusUpdates[slip.payment_no] || slip.status}
                    onChange={(e) => handleStatusChange(slip.payment_no, e.target.value)}
                  >
                    <option value="Uploaded">Uploaded</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleSaveStatus(slip.payment_no)}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No uploaded payment slips found.</p>
      )}

      {/* Slip overlay */}
      {selectedSlip && (
        <div className="overlay">
          <div className="overlay-content">
            <button className="close-btn" onClick={handleCloseOverlay}>✕</button>
            <h3>Payment Slip: {selectedSlip.payment_no}</h3>
            <p>Amount Paid: ${selectedSlip.amount !== undefined ? selectedSlip.amount.toFixed(2) : "0.00"}</p>
            {selectedSlip.file_path && selectedSlip.file_path.endsWith('.pdf') ? (
              <a href={`http://localhost:5000/${selectedSlip.file_path}`} target="_blank" rel="noopener noreferrer">
                View PDF
              </a>
            ) : (
              <img
                src={`http://localhost:5000/${selectedSlip.file_path}`}
                alt="Payment Slip"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            )}
          </div>
        </div>
      )}

      {/* Remarks overlay for rejected */}
      {showRemarksOverlay && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Reason for Rejection</h3>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={5}
              style={{ width: "100%", padding: "10px" }}
              placeholder="Enter rejection reason here..."
            />
            <button
              onClick={() => {
                handleSaveStatus(currentRejectPaymentNo);
              }}
              style={{ marginTop: "10px" }}
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowRemarksOverlay(false);
                setRemarks("");
              }}
              style={{ marginTop: "10px", marginLeft: "10px", backgroundColor: "#e74c3c", color: "#fff" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
