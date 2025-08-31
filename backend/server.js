const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import database connection
const connectDB = require('./config/db');

// Import routes
const outfitsRoutes = require('./routes/outfits');
const votesRoutes = require('./routes/votes');
const questionsRoutes = require('./routes/questions');
const wallpapersRoutes = require('./routes/wallpapers');
const fansRoutes = require('./routes/fans');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/outfits', outfitsRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/wallpapers', wallpapersRoutes);
app.use('/api/fans', fansRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Fan Hub Pro API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    // Check database connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Get some basic stats
    const stats = {
      database: dbStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
    
    res.json({
      success: true,
      data: stats,
      message: 'API Status Check'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Status check failed'
    });
  }
});

// Hello World endpoint (existing)
app.get('/api/', (req, res) => {
  res.json({
    success: true,
    message: "Fan Hub Pro API - Ready to serve Stephanie's fans! 👑✨"
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate ${field}. This ${field} already exists.`
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🌟 Fan Hub Pro API Server Started! 🌟
┌─────────────────────────────────────┐
│  Server: http://localhost:${PORT}     │
│  Environment: ${process.env.NODE_ENV || 'development'}           │
│  Database: MongoDB                   │
│  Ready to serve Stephanie's fans! 👑 │
└─────────────────────────────────────┘
  `);
});

module.exports = app;