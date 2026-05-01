/**
 * JeevanSync – Healthcare Management Platform
 * Main Express Server
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();

// ── Connect to MongoDB ──────────────────────────────────────────────────────
connectDB();

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for prescription images
app.use('/uploads', express.static('uploads'));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/health-data',   require('./routes/healthData'));
app.use('/api/reminders',     require('./routes/reminders'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/appointments',  require('./routes/appointments'));

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/ping', (req, res) => res.json({ status: 'ok', message: 'JeevanSync API is running' }));

// ── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🩺 JeevanSync API running on port ${PORT}`));
