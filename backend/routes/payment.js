const express = require('express');
const router = express.Router();

// example route
router.get('/', (req, res) => {
  res.send('Payment route works');
});

module.exports = router;
