/**
 * OpenAI Configuration
 * 
 * WHY: AI email generation is OPTIONAL. The app must work perfectly
 * without an OpenAI key. We provide graceful fallbacks.
 * 
 * If the key is missing or quota is exceeded, we return friendly
 * template emails instead of crashing.
 */

import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI only if API key is provided
export const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Check if AI is available
export const isAIAvailable = () => {
  return !!openai && !!apiKey && apiKey.startsWith('sk-');
};

// Log status on startup
if (isAIAvailable()) {
  console.log('✅ OpenAI API configured - AI email generation enabled');
} else {
  console.log('⚠️  OpenAI API not configured - AI features will use templates');
  console.log('   To enable AI: Add OPENAI_API_KEY to your .env file');
}

export default openai;
