-- =====================================================
-- Job & Internship Tracker - Database Schema
-- For Supabase PostgreSQL
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: job_applications
-- Stores all job/internship applications for each user
-- =====================================================
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Applied', 'Interview', 'Rejected', 'Offer')),
    applied_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE job_applications IS 'Stores job and internship applications for users';
COMMENT ON COLUMN job_applications.status IS 'Application status: Applied, Interview, Rejected, or Offer';

-- =====================================================
-- INDEXES for performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_applied_date ON job_applications(applied_date);

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Critical: Users can ONLY access their own data
-- =====================================================

-- Enable RLS on the table
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only SELECT their own applications
CREATE POLICY "Users can view own applications" ON job_applications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can only INSERT their own applications
CREATE POLICY "Users can create own applications" ON job_applications
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only UPDATE their own applications
CREATE POLICY "Users can update own applications" ON job_applications
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only DELETE their own applications
CREATE POLICY "Users can delete own applications" ON job_applications
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- VIEW: Application Statistics
-- Provides aggregated stats per user
-- =====================================================
CREATE OR REPLACE VIEW user_application_stats AS
SELECT 
    user_id,
    COUNT(*) as total_applications,
    COUNT(*) FILTER (WHERE status = 'Applied') as applied_count,
    COUNT(*) FILTER (WHERE status = 'Interview') as interview_count,
    COUNT(*) FILTER (WHERE status = 'Rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status = 'Offer') as offer_count,
    MAX(applied_date) as last_application_date
FROM job_applications
GROUP BY user_id;

-- RLS for the view (users can only see their own stats)
ALTER VIEW user_application_stats OWNER TO postgres;

-- Note: Views inherit RLS from underlying table in Supabase
-- The stats will automatically filter based on the user's applications

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- Uncomment below to add sample data after creating a user
-- =====================================================

-- -- First, manually replace 'YOUR_USER_ID' with an actual user UUID from auth.users
-- INSERT INTO job_applications (user_id, company_name, role, status, applied_date, notes) VALUES
-- ('YOUR_USER_ID', 'Google', 'Software Engineering Intern', 'Applied', '2024-01-15', 'Applied through university portal'),
-- ('YOUR_USER_ID', 'Microsoft', 'Frontend Developer Intern', 'Interview', '2024-01-10', 'First round scheduled for next week'),
-- ('YOUR_USER_ID', 'Amazon', 'SDE Intern', 'Rejected', '2024-01-05', 'Received rejection email after OA'),
-- ('YOUR_USER_ID', 'Meta', 'Product Design Intern', 'Offer', '2023-12-20', 'Accepted offer! Starting in June');
