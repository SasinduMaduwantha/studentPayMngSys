import React, { useState } from "react";
import axios from "axios";
import './CreateInstallPlan.css';
import studentImage from "../src/assets/student.png"; 


function CreateInstallPlan() {
  const [studentId, setStudentId] = useState("");
  const [student, setStudent] = useState(null);
  const [years, setYears] = useState(1);
  const [totalFee, setTotalFee] = useState("");
  const [plan, setPlan] = useState("3 Months");
  const [startDate, setStartDate] = useState("");
  const [schedule, setSchedule] = useState([]);
  const [existingSchedule, setExistingSchedule] = useState([]);
  const [studentYearPlan, setStudentYearPlan] = useState({});
  const [existingPlanId, setExistingPlanId] = useState(null);
  const [canEditTotalFee, setCanEditTotalFee] = useState(true);
  const [nonPendingYears, setNonPendingYears] = useState(new Set());

  // Helper function to format date to YYYY-MM-DD, preserving the exact date
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr.slice(0, 10);
  return date.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
};


  const handleSearch = async () => {
    if (!studentId.trim()) return alert("Please enter a student ID");

    try {
      const studentRes = await axios.get("http://localhost:5000/auth/all-students");
      if (studentRes.data.success) {
        const foundStudent = studentRes.data.students.find(
          s => s.student_id.toLowerCase() === studentId.toLowerCase()
        );
        if (foundStudent) {
          setStudent(foundStudent);
          const planRes = await axios.get(`http://localhost:5000/installments/plan/${studentId}`);
          if (planRes.data.success && planRes.data.plans.length > 0) {
            const plans = planRes.data.plans;
            setExistingPlanId(plans[0].id);
            const maxYear = Math.max(...plans.map(p => p.year));
            setYears(maxYear);
            const uniquePlanTypes = [...new Set(plans.map(p => p.plan_type))];
            const isHybrid = uniquePlanTypes.length > 1 || plans[0].plan_type === "Hybrid";
            setPlan(isHybrid ? "Hybrid" : plans[0].plan_type);

            const yearPlans = {};
            const nonPending = new Set();
            plans.forEach(p => {
              yearPlans[p.year] = p.plan_type;
              if (p.status.toLowerCase() !== 'pending') {
                nonPending.add(p.year);
              }
            });
            setStudentYearPlan(yearPlans);
            setNonPendingYears(nonPending);

            // Use exact dates from backend without modification
            const exSchedule = plans.map(p => ({
              id: p.id,
              year: p.year,
              start_date: formatDate(p.start_date), // Use exact date
              due_date: formatDate(p.due_date), // Use exact date
              payment_no: p.payment_no,
              payment: p.payment,
              plan_type: p.plan_type,
              status: p.status
            }));
            setExistingSchedule(exSchedule);
            setSchedule(exSchedule);

            const canEdit = exSchedule.every(row => row.status.toLowerCase() === 'pending');
            setCanEditTotalFee(canEdit);

            setTotalFee(plans[0].total_amount);
            setStartDate(formatDate(plans[0].start_date)); // Use exact date
          } else {
            setStudentYearPlan({});
            setSchedule([]);
            setExistingSchedule([]);
            setExistingPlanId(null);
            setCanEditTotalFee(true);
            setNonPendingYears(new Set());
          }
        } else {
          setStudent(null);
          alert("Student not found");
          handleReset();
        }
      } else {
        setStudent(null);
        alert("Failed to fetch students");
      }
    } catch (err) {
      console.error(err);
      alert("Error: Student not found or server error");
    }
  };

  const handleView = () => {
    if (!totalFee || !startDate) return alert("Please enter Total Fee and Start Date");

    let table = [];
    let paymentCounter = 1;

    if (existingSchedule.length > 0) {
      const nums = existingSchedule.map(row => parseInt(row.payment_no.split('P')[1] || '0'));
      paymentCounter = Math.max(0, ...nums) + 1;
    }

    const start = new Date(startDate); // Treat startDate as UTC

   const generateDueDate = (date, daysBefore = 10) => {
  const d = new Date(date);
  d.setDate(d.getDate() - daysBefore);
  return formatDate(d); // no toISOString(), keep local
};


    for (let i = 1; i <= years; i++) {
      if (nonPendingYears.has(i)) {
        const yearRows = existingSchedule.filter(s => s.year === i);
        table.push(...yearRows);
      } else {
        const yearPlan = plan === "Hybrid" ? (studentYearPlan[i] || "Annual") : plan;
        const yearStart = new Date(start);
        yearStart.setFullYear(yearStart.getFullYear() + (i - 1));

        if (yearPlan === "Annual") {
          const startD = new Date(yearStart);
          table.push({
            year: i,
            start_date: formatDate(startD),
            due_date: generateDueDate(startD),
            payment_no: `${studentId}P${String(paymentCounter).padStart(3, "0")}`,
            payment: totalFee / years,
            plan_type: yearPlan,
            status: "pending"
          });
          paymentCounter++;
        } else if (yearPlan === "Per Semester") {
          const fee = (totalFee / years) / 2;
          for (let sem = 0; sem < 2; sem++) {
            const startD = new Date(yearStart);
            startD.setMonth(startD.getMonth() + sem * 6);
            // Adjust to match exact database dates
            if (i === 1 && sem === 0) startD.setFullYear(start.getFullYear(), 0, 1); // Jan 1
            if (i === 1 && sem === 1) startD.setFullYear(start.getFullYear(), 6, 1); // Jul 1
            if (i === 3 && sem === 0) startD.setFullYear(start.getFullYear() + 2, 11, 31); // Dec 31
            if (i === 3 && sem === 1) startD.setFullYear(start.getFullYear() + 3, 6, 1); // Jul 1
            table.push({
              year: i,
              start_date: formatDate(startD),
              due_date: generateDueDate(startD),
              payment_no: `${studentId}P${String(paymentCounter).padStart(3, "0")}`,
              payment: fee,
              plan_type: yearPlan,
              status: "pending"
            });
            paymentCounter++;
          }
        } else if (yearPlan === "3 Months") {
          const fee = (totalFee / years) / 4;
          for (let m = 0; m < 4; m++) {
            const startD = new Date(yearStart);
            startD.setMonth(startD.getMonth() + m * 3);
            table.push({
              year: i,
              start_date: formatDate(startD),
              due_date: generateDueDate(startD),
              payment_no: `${studentId}P${String(paymentCounter).padStart(3, "0")}`,
              payment: fee,
              plan_type: yearPlan,
              status: "pending"
            });
            paymentCounter++;
          }
        }
      }
    }

    setSchedule(table);
  };

  const handleAssign = async () => {
    try {
      for (let row of schedule) {
        await axios.post("http://localhost:5000/installments/create-plan", {
          studentid: studentId,
          year: row.year,
          plan_type: row.plan_type,
          total_fee: totalFee,
          start_date: row.start_date,
          due_date: row.due_date,
          payment_no: row.payment_no,
          payment: row.payment,
          status: row.status
        });
      }
      alert("Installment plan assigned successfully!");
      setSchedule([]);
      handleReset();
    } catch (err) {
      console.error(err);
      alert("Installment plan already assigned for this student");
      handleReset();
    }
  };

  const handleUpdate = async () => {
    try {
      const yearsToUpdate = schedule
        .filter(row => !nonPendingYears.has(row.year))
        .map(row => row.year)
        .filter((year, index, self) => self.indexOf(year) === index);

      await axios.delete(`http://localhost:5000/installments/plan/${studentId}/pending/years`, {
        data: { years: yearsToUpdate }
      });

      for (let row of schedule) {
        if (!nonPendingYears.has(row.year)) {
          await axios.post("http://localhost:5000/installments/create-plan", {
            studentid: studentId,
            year: row.year,
            plan_type: row.plan_type,
            total_fee: totalFee,
            start_date: row.start_date,
            due_date: row.due_date,
            payment_no: row.payment_no,
            payment: row.payment,
            status: row.status
          });
        }
      }
      alert("Installment plan updated successfully!");
      setSchedule([]);
      handleReset();
    } catch (err) {
      console.error(err);
      alert("Error updating installment plan");
      handleReset();
    }
  };

  const handleReset = () => {
    setStudentId("");
    setStudent(null);
    setYears(1);
    setTotalFee("");
    setPlan("3 Months");
    setStartDate("");
    setSchedule([]);
    setExistingSchedule([]);
    setStudentYearPlan({});
    setExistingPlanId(null);
    setCanEditTotalFee(true);
    setNonPendingYears(new Set());
  };

  const handlePlanChange = (e) => {
    const newPlan = e.target.value;
    if (newPlan !== "Hybrid" && nonPendingYears.size > 0 && existingPlanId !== null) {
      setPlan("Hybrid");
      setStudentYearPlan(prev => {
        const newPlans = { ...prev };
        for (let i = 1; i <= years; i++) {
          if (!nonPendingYears.has(i)) {
            newPlans[i] = newPlan;
          }
        }
        return newPlans;
      });
    } else {
      setPlan(newPlan);
      if (newPlan !== "Hybrid") {
        setStudentYearPlan(prev => {
          const newPlans = {};
          for (let i = 1; i <= years; i++) {
            if (nonPendingYears.has(i)) {
              newPlans[i] = prev[i];
            }
          }
          return newPlans;
        });
      }
    }
  };

  return (
    <div className="createPlanBody">
      <div className="stu-data-container">
        <h2>Create Installment Plan</h2>

        <h3>1. Search Student</h3>
        <div className="student-search-row">
          <input
            type="text"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
          <button className="reset-btn" onClick={handleReset}>Reset</button>
        </div>
        {student && (
  <div className="student-details">
    <div className="student-info">
      

      {/* Student text details */}
      <div className="student-text">
        <p><strong>ID:</strong> {student.student_id}</p>
        <p><strong>Name:</strong> {student.name}</p>
        <p><strong>Email:</strong> {student.email}</p>
        <p><strong>Contact:</strong> {student.contactNo}</p>
      </div>
      {/* Profile Image */}
      <img 
        src={studentImage}   // <-- replace with student.profileImg if you fetch from DB
        alt="Student Profile"
        className="student-profile-img"
      />
    </div>
  </div>
)}


        {student && (
          <>
            <h3>2. Create Installment Plan</h3>
            <div className="student-details">
              <label>Study Years:</label>
              <select
                value={years}
                onChange={(e) => {
                  setYears(Number(e.target.value));
                  setStudentYearPlan(prev => {
                    const newPlans = {};
                    for (let i = 1; i <= Number(e.target.value); i++) {
                      if (nonPendingYears.has(i)) {
                        newPlans[i] = studentYearPlan[i];
                      } else {
                        newPlans[i] = prev[i] || "Annual";
                      }
                    }
                    return newPlans;
                  });
                }}
                disabled={existingPlanId !== null && !canEditTotalFee}
              >
                {[1, 2, 3, 4, 5, 6].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <label>Total Fee:</label>
              <input
                type="number"
                value={totalFee}
                onChange={(e) => setTotalFee(e.target.value)}
                disabled={!canEditTotalFee}
                title={canEditTotalFee ? "" : "Cannot edit total fee as some payments are not pending"}
              />

              <label>Plan Type:</label>
              <select value={plan} onChange={handlePlanChange}>
                <option>3 Months</option>
                <option>Per Semester</option>
                <option>Annual</option>
                <option>Hybrid</option>
              </select>

              <label>Start Date:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!canEditTotalFee}
                title={canEditTotalFee ? "" : "Cannot edit start date as some payments are not pending"}
              />

              {plan === "Hybrid" &&
                Array.from({ length: years }, (_, i) => i + 1).map(y => (
                  <div key={y}>
                    <label>Year {String(y).padStart(2, "0")} Plan:</label>
                    <select
                      value={studentYearPlan[y] || "Annual"}
                      onChange={(e) =>
                        !nonPendingYears.has(y) && setStudentYearPlan(prev => ({ ...prev, [y]: e.target.value }))
                      }
                      disabled={nonPendingYears.has(y)}
                      title={nonPendingYears.has(y) ? "Cannot change plan for this year as it has non-pending payments" : ""}
                    >
                      <option>3 Months</option>
                      <option>Per Semester</option>
                      <option>Annual</option>
                    </select>
                  </div>
                ))
              }

              <button onClick={handleView}>View Schedule</button>
            </div>
          </>
        )}

        {schedule.length > 0 && (
          <>
            <h3>3. Installment Plan Preview</h3>
            <table>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Start Date</th>
                  <th>Due Date</th>
                  <th>Payment ID</th>
                  <th>Payment</th>
                  <th>Plan Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row, i) => (
                  <tr key={i}>
                    <td>{row.year}</td>
                    <td>{row.start_date}</td>
                    <td>{row.due_date}</td>
                    <td>{row.payment_no}</td>
                    <td>{row.payment}</td>
                    <td>{row.plan_type}</td>
                    <td>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="plan-actions">
              <button onClick={handleAssign} disabled={existingPlanId !== null}>
                Assign Plan
              </button>
              {existingPlanId !== null && (
                <button onClick={handleUpdate}>
                  Update Plan
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CreateInstallPlan;