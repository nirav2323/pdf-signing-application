const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const PORT = process.env.PORT || 5001;
dotenv.config();

const connectDB = require('./config/db');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});