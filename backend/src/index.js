/**
 * Job Tracker API - Main Entry Point
 * 
 * WHY: This is the main server file that:
 * 1. Configures Express with necessary middleware
 * 2. Sets up CORS for frontend communication
 * 3. Connects all routes
 * 4. Handles errors gracefully
 * 5. Starts the server
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { testConnection } from './config/supabase.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE SETUP
// =====================================================

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Configuration
// WHY: We need to allow requests from the frontend domain
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev server
  'http://localhost:3000',  // Common React dev server
  process.env.FRONTEND_URL  // Production frontend URL from env
].filter(Boolean); // Remove undefined/null

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
  });
}

// =====================================================
// ROUTES
// =====================================================

// API Routes (prefix: /api)
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Job Tracker API',
    documentation: '/api/health',
    version: '1.0.0'
  });
});

// =====================================================
// ERROR HANDLING
// =====================================================

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last
app.use(globalErrorHandler);

// =====================================================
// SERVER STARTUP
// =====================================================

const startServer = async () => {
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('\n🚀 Job Tracker API Server');
      console.log('========================');
      console.log(`📡 Server running on port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
      console.log('========================\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
