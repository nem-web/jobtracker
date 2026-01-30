/**
 * Route Index
 * 
 * WHY: Centralizes all route definitions and applies common middleware.
 * Makes it easy to add new routes and maintain the API structure.
 */

import express from 'express';
import jobRoutes from './jobRoutes.js';
import authRoutes from './authRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = express.Router();

// Health check endpoint (public)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Job Tracker API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/ai', aiRoutes);

export default router;
