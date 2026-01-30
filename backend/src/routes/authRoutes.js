/**
 * Authentication Routes
 * 
 * WHY: These routes handle auth-related operations that need backend support.
 * Most auth (login, signup) happens directly on frontend with Supabase,
 * but we need backend routes for session verification and user management.
 */

import express from 'express';
import { getCurrentUser, verifyToken, deleteAccount } from '../controllers/authController.js';
import { verifyAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyAuth, getCurrentUser);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if current token is valid
 * @access  Private
 */
router.get('/verify', verifyAuth, verifyToken);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account and all data
 * @access  Private
 */
router.delete('/account', verifyAuth, deleteAccount);

export default router;
