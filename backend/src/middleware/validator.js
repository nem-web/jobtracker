/**
 * Request Validation Middleware
 * 
 * WHY: We validate incoming data to ensure data integrity and prevent
 * SQL injection attacks. Using express-validator for declarative validation.
 */

import { body, param, query, validationResult } from 'express-validator';
import { APIError } from './errorHandler.js';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: errorMessages
    });
  }
  next();
};

/**
 * Job Application Validation Rules
 */
export const validateJobApplication = [
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name must be between 1 and 200 characters'),
  
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Role must be between 1 and 200 characters'),
  
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['Applied', 'Interview', 'Rejected', 'Offer'])
    .withMessage('Status must be one of: Applied, Interview, Rejected, Offer'),
  
  body('applied_date')
    .optional()
    .isISO8601()
    .withMessage('Applied date must be a valid date (YYYY-MM-DD)'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters'),
  
  handleValidationErrors
];

/**
 * Update Job Application Validation Rules
 */
export const validateUpdateJobApplication = [
  body('company_name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Company name cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Company name must be between 1 and 200 characters'),
  
  body('role')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Role cannot be empty')
    .isLength({ min: 1, max: 200 })
    .withMessage('Role must be between 1 and 200 characters'),
  
  body('status')
    .optional()
    .isIn(['Applied', 'Interview', 'Rejected', 'Offer'])
    .withMessage('Status must be one of: Applied, Interview, Rejected, Offer'),
  
  body('applied_date')
    .optional()
    .isISO8601()
    .withMessage('Applied date must be a valid date (YYYY-MM-DD)'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes must be less than 2000 characters'),
  
  handleValidationErrors
];

/**
 * UUID Param Validation
 */
export const validateUUID = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID format. Must be a valid UUID'),
  handleValidationErrors
];

/**
 * Query Parameter Validation for Filtering
 */
export const validateQueryParams = [
  query('status')
    .optional()
    .isIn(['Applied', 'Interview', 'Rejected', 'Offer'])
    .withMessage('Status filter must be one of: Applied, Interview, Rejected, Offer'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer'),
  
  handleValidationErrors
];

/**
 * AI Email Generation Validation
 */
export const validateEmailGeneration = [
  body('type')
    .notEmpty()
    .withMessage('Email type is required')
    .isIn(['cold', 'followup', 'referral'])
    .withMessage('Type must be one of: cold, followup, referral'),
  
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required'),
  
  body('recipient_name')
    .optional()
    .trim(),
  
  body('your_name')
    .trim()
    .notEmpty()
    .withMessage('Your name is required'),
  
  handleValidationErrors
];

export default {
  validateJobApplication,
  validateUpdateJobApplication,
  validateUUID,
  validateQueryParams,
  validateEmailGeneration,
  handleValidationErrors
};
