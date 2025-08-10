const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/upload', require('./routes/uploaderRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/sign', require('./routes/signerRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));


app.use(errorHandler);


// if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));

  app.get('/', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
// }

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
