const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Restrict API access to known frontends
const allowedOrigins = (process.env.FRONTEND_ORIGINS || 'https://rupantara.onrender.com,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const upload = multer({
  dest: path.join(__dirname, 'uploads'),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Accept only allowed file types
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});


// API routes
app.use('/api/compress', require('./routes/compression'));
app.use('/api/pdf', require('./routes/pdf'));
app.use('/api/pdf-advanced', require('./routes/pdf-advanced'));
app.use('/api/pdf-tools', require('./routes/pdf-tools'));
app.use('/api/convert-libreoffice', require('./routes/convert-libreoffice'));
app.use('/api/image', require('./routes/image'));

app.listen(PORT, () => {
  console.log(`FileMaster Pro backend running on port ${PORT}`);
});
