const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sasindu@2002', // your MySQL password
  database: 'med_stu_payments'
});
conn.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected');
});
module.exports = conn;
