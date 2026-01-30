/**
 * Job Application Routes
 * 
 * WHY: Routes define the API endpoints and connect them to controllers.
 * We apply authentication middleware to protect all job-related routes.
 */

import express from 'express';
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
} from '../controllers/jobController.js';
import { verifyAuth } from '../middleware/auth.js';
import {
  validateJobApplication,
  validateUpdateJobApplication,
  validateUUID,
  validateQueryParams
} from '../middleware/validator.js';

const router = express.Router();

// All routes require authentication
router.use(verifyAuth);

/**
 * @route   GET /api/jobs
 * @desc    Get all job applications (with optional filtering)
 * @access  Private
 */
router.get('/', validateQueryParams, getAllJobs);

/**
 * @route   GET /api/jobs/stats
 * @desc    Get application statistics
 * @access  Private
 */
router.get('/stats', getJobStats);

/**
 * @route   GET /api/jobs/:id
 * @desc    Get a single job application
 * @access  Private
 */
router.get('/:id', validateUUID, getJobById);

/**
 * @route   POST /api/jobs
 * @desc    Create a new job application
 * @access  Private
 */
router.post('/', validateJobApplication, createJob);

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update a job application
 * @access  Private
 */
router.put('/:id', validateUUID, validateUpdateJobApplication, updateJob);

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Delete a job application
 * @access  Private
 */
router.delete('/:id', validateUUID, deleteJob);

export default router;
