import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../src/assets/logoM.png";
import './App.css';

export default function StaffLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/staff/staff-login', {
        username: username,
        password: password,
      });

      if (res.data.success) {
        
        localStorage.setItem('staff', JSON.stringify(res.data.staff));
        navigate('/staffDashboard');
      }
    } catch (err) {
      // If server returned a message (like invalid credentials)
      if (err.response && err.response.data.message) {
        alert(err.response.data.message); // show error as alert
      } else {
        alert('Something went wrong. Please try again.');
      }

      // Clear input fields
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className="App">
       <nav className="login-navbar">
          <img src={logo} alt="Logo" className="login-logo" />
          <h2>Medical Faculty Student Payment Management System</h2>
          </nav>
      <header className="App-header">
        <h1>Staff Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
        <p>
          Are you a student? <Link to="/">Login here</Link>
        </p>
        <p>
          <Link to="/">Forget Password</Link>
        </p>
      </header>
    </div>
  );
}
