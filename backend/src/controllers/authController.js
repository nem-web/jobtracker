/**
 * Authentication Controller
 * 
 * WHY: While Supabase handles most auth operations on the frontend,
 * we need backend endpoints for:
 * 1. Verifying user session
 * 2. Getting user profile
 * 3. Any server-side auth operations
 */

import { supabaseAdmin } from '../config/supabase.js';
import { APIError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get current user profile
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user details from Supabase Auth
  const { data: { user }, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      email_confirmed_at: user.email_confirmed_at
    }
  });
});

/**
 * Verify token validity
 * Used by frontend to check if session is still valid
 */
export const verifyToken = asyncHandler(async (req, res) => {
  // If we reach here, the auth middleware already verified the token
  res.json({
    success: true,
    message: 'Token is valid',
    data: {
      userId: req.user.id,
      email: req.user.email
    }
  });
});

/**
 * Delete user account and all associated data
 * WARNING: This permanently deletes the user and all their job applications
 */
export const deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Delete user's job applications first (RLS will ensure only their data is deleted)
  const { error: deleteJobsError } = await supabaseAdmin
    .from('job_applications')
    .delete()
    .eq('user_id', userId);

  if (deleteJobsError) {
    console.error('Error deleting job applications:', deleteJobsError);
    throw new APIError('Failed to delete user data', 500, 'DELETE_ERROR');
  }

  // Delete the user account
  const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (deleteUserError) {
    console.error('Error deleting user:', deleteUserError);
    throw new APIError('Failed to delete user account', 500, 'DELETE_ERROR');
  }

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
});

export default {
  getCurrentUser,
  verifyToken,
  deleteAccount
};
