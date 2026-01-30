/**
 * Authentication Middleware
 * 
 * WHY: We need to verify that incoming requests are from authenticated users.
 * Supabase Auth issues JWT tokens when users sign in. We verify these tokens
 * to ensure users can only access their own data.
 * 
 * The JWT contains the user's UUID in the 'sub' claim, which we use to
 * filter database queries (works with RLS policies).
 */

import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Create a Supabase client for auth verification
const supabaseAuth = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify Supabase JWT Token
 * Extracts and validates the Bearer token from Authorization header
 */
export const verifyAuth = async (req, res, next) => {
  try {
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization header provided.',
        code: 'NO_AUTH_HEADER'
      });
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Expected: Bearer <token>',
        code: 'INVALID_AUTH_FORMAT'
      });
    }

    const token = parts[1];

    // Verify the token with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (error || !user) {
      console.error('Auth verification failed:', error?.message || 'No user found');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please sign in again.',
        code: 'INVALID_TOKEN'
      });
    }

    // Attach user info to request for use in controllers
    req.user = {
      id: user.id,
      email: user.email,
      token: token
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Authentication error. Please try again.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Optional Auth Middleware
 * For routes that work with or without authentication
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      req.user = null;
      return next();
    }

    const token = parts[1];
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);

    if (!error && user) {
      req.user = {
        id: user.id,
        email: user.email,
        token: token
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default verifyAuth;
