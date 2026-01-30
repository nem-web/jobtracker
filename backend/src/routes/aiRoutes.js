/**
 * AI Routes
 * 
 * WHY: These routes handle AI-powered features like email generation.
 * All routes are protected and require authentication.
 */

import express from 'express';
import { generateEmail, getAIStatus } from '../controllers/aiController.js';
import { verifyAuth } from '../middleware/auth.js';
import { validateEmailGeneration } from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

/**
 * @route   GET /api/ai/status
 * @desc    Check if AI service is available
 * @access  Private
 */
router.get('/status', getAIStatus);

/**
 * @route   POST /api/ai/generate-email
 * @desc    Generate email using AI (with template fallback)
 * @access  Private
 */
router.post('/generate-email', validateEmailGeneration, generateEmail);

export default router;
