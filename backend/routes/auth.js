const express = require('express');
const router = express.Router();
const conn = require('../db'); // import your db.js connection

// Student Login API
router.post('/student-login', (req, res) => {
  const { student_id, password } = req.body;

  if (!student_id || !password) {
    return res.status(400).json({ success: false, message: 'Please enter all fields' });
  }

  const sql = "SELECT * FROM users WHERE student_id = ? AND password = ? AND role = 'student'";
  conn.query(sql, [student_id, password], (err, result) => {
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (result.length > 0) {
      res.json({ success: true, message: 'Login successful', student: result[0] });
    } else {
      res.json({ success: false, message: 'Invalid Student Registration No or Password' });
    }
  });
});

// Example route
router.get('/', (req, res) => {
  res.send('Auth route works');
});

module.exports = router;
