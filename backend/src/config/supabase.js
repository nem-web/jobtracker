/**
 * Supabase Configuration
 * 
 * WHY: We need two Supabase clients:
 * 1. supabaseAdmin - Service role client for database operations (bypasses RLS)
 * 2. supabaseAuth - For verifying JWT tokens from frontend
 * 
 * The service role key should NEVER be exposed to the frontend.
 * It's only used server-side to perform operations on behalf of users.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  console.error('   Get these from: Supabase Dashboard > Project Settings > API');
  process.exit(1);
}

// Admin client - used for database operations
// This bypasses RLS, so we MUST verify user identity in middleware
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test connection on startup
export const testConnection = async () => {
  try {
    const { data, error } = await supabaseAdmin.from('job_applications').select('count').limit(0);
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
};

export default supabaseAdmin;
