import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../src/assets/logoM.png"; 
import './App.css';

export default function StudentLogin() {
  const [registrationNo, setRegistrationNo] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // For redirecting after login

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/student-login", {
        student_id: registrationNo,
        password: password,
      });

      if (res.data.success) {
         localStorage.setItem("studentData", JSON.stringify(res.data.student));
        navigate("/stuDashboard"); // Redirect to student dashboard
      } else {
        alert("Invalid Student Registration No or Password");
        setRegistrationNo("");
        setPassword("");


      }
    } catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  return (
    <div className="App">
       <div className="login-user">
      <nav className="login-navbar">
    <img src={logo} alt="Logo" className="login-logo" />
    <h2>Medical Faculty Student Payment Management System</h2>
    </nav>
      </div>
      <header className="App-header">
        <h1>Student Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="registrationNo">Registration No</label>
          <input
            type="text"
            id="registrationNo"
            placeholder="Enter your registration number"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
        <p>
          Are you a staff? <Link to="/staff">Login here</Link>
        </p>
        <p>
          <Link to="/">Forget Password</Link>
        </p>
      </header>
    </div>
  );
}
