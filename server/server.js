const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const trainingRoutes = require('./routes/trainingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const seedRoutes = require('./routes/seedRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database on local/standalone initialization
if (process.env.NODE_ENV !== 'production' || require.main === module) {
  connectDB().catch((err) => {
    console.error('[Database Startup Error]:', err.message);
  });
}

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Normalize URL for Vercel Serverless Function rewrites
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace('/api/index.js', '') || '/';
  }
  next();
});

// Serverless DB connection middleware ensuring readyState
app.use(async (req, res, next) => {
  // Allow health check to pass even if DB is reconnecting
  if (req.path === '/api/health' || req.path === '/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('[DB Connection Middleware Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is properly configured in Vercel environment variables and Atlas IP access is enabled.',
      details: error.message,
    });
  }
});

// Unified API Router
const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/employees', employeeRoutes);
apiRouter.use('/leaves', leaveRoutes);
apiRouter.use('/attendance', attendanceRoutes);
apiRouter.use('/announcements', announcementRoutes);
apiRouter.use('/training', trainingRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/seed', seedRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    status: 'healthy',
    system: 'StaffSync HRM API',
    version: '1.0.0',
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: dbState === 1,
    },
    timestamp: new Date().toISOString(),
  });
});

// API Root Index
apiRouter.get('/', (req, res) => {
  res.status(200).json({
    system: 'StaffSync HRM API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      health: '/api/health',
      seed: '/api/seed',
      auth: '/api/auth',
      employees: '/api/employees',
      leaves: '/api/leaves',
      attendance: '/api/attendance',
      training: '/api/training',
      announcements: '/api/announcements',
      reports: '/api/reports',
    },
  });
});

// Mount router on both /api (standard) and / (fallback for rewrites)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// 404 Route handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server only when executed directly (not when required by Vercel serverless functions)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`  StaffSync HRM Server Running on Port ${PORT} `);
    console.log(`  Health Check: http://localhost:${PORT}/api/health `);
    console.log(`=========================================`);
  });
  module.exports.server = server;
}

module.exports = app;
module.exports.app = app;
