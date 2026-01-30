/**
 * Job Application Controller
 * 
 * WHY: Controllers handle the business logic for each route.
 * They interact with the database and return appropriate responses.
 * All database queries are filtered by user_id to enforce RLS.
 */

import { supabaseAdmin } from '../config/supabase.js';
import { APIError, asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get all job applications for the authenticated user
 * Supports filtering by status and search query
 */
export const getAllJobs = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status, search, limit = 50, offset = 0 } = req.query;

  // Start building the query
  let query = supabaseAdmin
    .from('job_applications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('applied_date', { ascending: false })
    .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

  // Apply status filter if provided
  if (status) {
    query = query.eq('status', status);
  }

  // Apply search filter if provided (searches company and role)
  if (search) {
    query = query.or(`company_name.ilike.%${search}%,role.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching jobs:', error);
    throw new APIError('Failed to fetch job applications', 500, 'FETCH_ERROR');
  }

  res.json({
    success: true,
    data: data || [],
    pagination: {
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset),
      hasMore: (parseInt(offset) + data.length) < count
    }
  });
});

/**
 * Get a single job application by ID
 */
export const getJobById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new APIError('Job application not found', 404, 'NOT_FOUND');
    }
    console.error('Error fetching job:', error);
    throw new APIError('Failed to fetch job application', 500, 'FETCH_ERROR');
  }

  res.json({
    success: true,
    data
  });
});

/**
 * Create a new job application
 */
export const createJob = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { company_name, role, status, applied_date, notes } = req.body;

  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .insert([{
      user_id: userId,
      company_name,
      role,
      status,
      applied_date: applied_date || new Date().toISOString().split('T')[0],
      notes: notes || ''
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating job:', error);
    throw new APIError('Failed to create job application', 500, 'CREATE_ERROR');
  }

  res.status(201).json({
    success: true,
    message: 'Job application created successfully',
    data
  });
});

/**
 * Update an existing job application
 */
export const updateJob = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const updates = req.body;

  // First check if the job exists and belongs to the user
  const { data: existingJob, error: fetchError } = await supabaseAdmin
    .from('job_applications')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingJob) {
    throw new APIError('Job application not found', 404, 'NOT_FOUND');
  }

  // Perform the update
  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job:', error);
    throw new APIError('Failed to update job application', 500, 'UPDATE_ERROR');
  }

  res.json({
    success: true,
    message: 'Job application updated successfully',
    data
  });
});

/**
 * Delete a job application
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  // First check if the job exists and belongs to the user
  const { data: existingJob, error: fetchError } = await supabaseAdmin
    .from('job_applications')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (fetchError || !existingJob) {
    throw new APIError('Job application not found', 404, 'NOT_FOUND');
  }

  // Perform the delete
  const { error } = await supabaseAdmin
    .from('job_applications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting job:', error);
    throw new APIError('Failed to delete job application', 500, 'DELETE_ERROR');
  }

  res.json({
    success: true,
    message: 'Job application deleted successfully'
  });
});

/**
 * Get application statistics for the dashboard
 */
export const getJobStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get counts by status
  const { data, error } = await supabaseAdmin
    .from('job_applications')
    .select('status')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching stats:', error);
    throw new APIError('Failed to fetch statistics', 500, 'STATS_ERROR');
  }

  // Calculate statistics
  const stats = {
    total: data.length,
    applied: data.filter(j => j.status === 'Applied').length,
    interview: data.filter(j => j.status === 'Interview').length,
    rejected: data.filter(j => j.status === 'Rejected').length,
    offer: data.filter(j => j.status === 'Offer').length
  };

  // Get recent applications (last 5)
  const { data: recentJobs, error: recentError } = await supabaseAdmin
    .from('job_applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  if (recentError) {
    console.error('Error fetching recent jobs:', recentError);
  }

  res.json({
    success: true,
    data: {
      stats,
      recent: recentJobs || []
    }
  });
});

export default {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getJobStats
};
