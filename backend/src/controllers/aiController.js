/**
 * AI Email Generation Controller
 * 
 * WHY: This controller handles AI-powered email generation using OpenAI.
 * It's designed to gracefully handle missing API keys or quota exceeded errors.
 * If AI is unavailable, it falls back to template-based emails.
 */

import { openai, isAIAvailable } from '../config/openai.js';
import { APIError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Template emails for fallback when AI is unavailable
 */
const emailTemplates = {
  cold: (company, role, yourName) => ({
    subject: `Application for ${role} at ${company}`,
    body: `Dear Hiring Manager,

I hope this email finds you well. My name is ${yourName}, and I am writing to express my interest in the ${role} position at ${company}.

I have been following ${company}'s work and am particularly impressed by your innovative approach to the industry. I believe my skills and experience make me a strong candidate for this role.

I would welcome the opportunity to discuss how I can contribute to your team. Thank you for considering my application.

Best regards,
${yourName}`
  }),

  followup: (company, role, yourName) => ({
    subject: `Follow-up: ${role} Application at ${company}`,
    body: `Dear Hiring Manager,

I hope you are doing well. I wanted to follow up on my application for the ${role} position at ${company} that I submitted recently.

I remain very interested in this opportunity and would appreciate any update you might have regarding my application status.

Thank you for your time and consideration.

Best regards,
${yourName}`
  }),

  referral: (company, role, yourName, recipientName = 'there') => ({
    subject: `Referral Request: ${role} at ${company}`,
    body: `Hi ${recipientName},

I hope you're having a great day! I noticed that ${company} has an opening for a ${role} position, and I was wondering if you might be open to referring me.

I believe my background would be a good fit for this role, and I would greatly appreciate your support in the application process.

Please let me know if you need any additional information from me.

Best regards,
${yourName}`
  })
};

/**
 * Generate AI-powered email
 * Falls back to templates if AI is unavailable
 */
export const generateEmail = asyncHandler(async (req, res) => {
  const { type, company_name, role, recipient_name, your_name } = req.body;

  // Check if AI is available
  if (!isAIAvailable()) {
    console.log('AI not available, using template fallback');
    const template = emailTemplates[type](company_name, role, your_name, recipient_name);
    
    return res.json({
      success: true,
      data: {
        ...template,
        generated_by: 'template',
        note: 'AI generation is currently unavailable. Using template instead.'
      }
    });
  }

  try {
    // Build the prompt based on email type
    let prompt = '';
    const recipient = recipient_name || 'Hiring Manager';

    switch (type) {
      case 'cold':
        prompt = `Write a professional cold email from ${your_name} applying for the ${role} position at ${company_name}. 
Address it to "${recipient}". 
Keep it concise (150-200 words), professional, and engaging. 
Include:
- Brief introduction
- Why they're interested in the company
- Call to action

Format as:
Subject: [subject line]

[email body]`;
        break;

      case 'followup':
        prompt = `Write a professional follow-up email from ${your_name} regarding their application for the ${role} position at ${company_name}.
Address it to "${recipient}".
Keep it polite, concise (100-150 words), and professional.
Express continued interest and request an update.

Format as:
Subject: [subject line]

[email body]`;
        break;

      case 'referral':
        prompt = `Write a professional email from ${your_name} requesting a referral for the ${role} position at ${company_name}.
Address it to "${recipient}" (they work at or know someone at the company).
Keep it polite, concise (100-150 words), and make it easy for them to say yes.

Format as:
Subject: [subject line]

[email body]`;
        break;
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that writes professional job application emails. Be concise, professional, and persuasive.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400
    });

    const generatedContent = completion.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error('Empty response from OpenAI');
    }

    // Parse the generated content
    const lines = generatedContent.split('\n');
    let subject = '';
    let bodyStartIndex = 0;

    // Extract subject line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().startsWith('subject:')) {
        subject = lines[i].replace(/^subject:\s*/i, '').trim();
        bodyStartIndex = i + 2; // Skip subject line and one empty line
        break;
      }
    }

    // Extract body
    const body = lines.slice(bodyStartIndex).join('\n').trim();

    res.json({
      success: true,
      data: {
        subject: subject || `Application for ${role} at ${company_name}`,
        body: body || generatedContent,
        generated_by: 'ai'
      }
    });

  } catch (error) {
    console.error('OpenAI API error:', error.message);
    
    // Fall back to template on any AI error (quota exceeded, network, etc.)
    const template = emailTemplates[type](company_name, role, your_name, recipient_name);
    
    res.json({
      success: true,
      data: {
        ...template,
        generated_by: 'template',
        note: 'AI generation encountered an error. Using template instead.'
      }
    });
  }
});

/**
 * Check AI service status
 */
export const getAIStatus = asyncHandler(async (req, res) => {
  const available = isAIAvailable();
  
  res.json({
    success: true,
    data: {
      available,
      message: available 
        ? 'AI email generation is available'
        : 'AI email generation is unavailable - templates will be used'
    }
  });
});

export default {
  generateEmail,
  getAIStatus
};
