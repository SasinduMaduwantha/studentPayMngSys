const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

app.use('/auth', require('./routes/auth'));
app.use('/payment', require('./routes/payment'));

app.listen(5000, () => console.log('Backend running on port 5000'));
