-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with role-based access
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  role VARCHAR CHECK (role IN ('super_admin', 'company', 'student')) NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_name VARCHAR NOT NULL,
  official_email VARCHAR NOT NULL,
  website VARCHAR,
  description TEXT,
  logo_url VARCHAR,
  company_size VARCHAR,
  industry VARCHAR,
  location VARCHAR,
  verification_status VARCHAR DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents JSONB,
  stripe_customer_id VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  date_of_birth DATE,
  gender VARCHAR,
  resume_url VARCHAR,
  profile_picture_url VARCHAR,
  skills TEXT[],
  education JSONB,
  experience JSONB,
  projects JSONB,
  certifications JSONB,
  resume_score INTEGER DEFAULT 0,
  ats_score INTEGER DEFAULT 0,
  location VARCHAR,
  preferred_locations TEXT[],
  bio TEXT,
  linkedin_url VARCHAR,
  github_url VARCHAR,
  portfolio_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2) NOT NULL,
  connects_monthly INTEGER NOT NULL,
  features JSONB NOT NULL,
  stripe_price_id_monthly VARCHAR,
  stripe_price_id_yearly VARCHAR,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Company subscriptions
CREATE TABLE company_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  connects_remaining INTEGER DEFAULT 0,
  connects_used INTEGER DEFAULT 0,
  billing_cycle VARCHAR DEFAULT 'monthly',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Internships table
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[],
  skills_required TEXT[],
  duration VARCHAR,
  stipend_min INTEGER,
  stipend_max INTEGER,
  location VARCHAR,
  work_type VARCHAR CHECK (work_type IN ('remote', 'onsite', 'hybrid')),
  application_deadline DATE,
  start_date DATE,
  positions_available INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'closed')),
  is_featured BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status VARCHAR DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'rejected', 'selected')),
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(internship_id, student_id)
);

-- Connect usage tracking
CREATE TABLE connect_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  action_type VARCHAR NOT NULL,
  connects_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Resume feedback table
CREATE TABLE resume_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  resume_url VARCHAR NOT NULL,
  overall_score INTEGER,
  ats_score INTEGER,
  feedback_data JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, connects_monthly, features) VALUES
('Starter', 999.00, 9990.00, 50, '{"profile_views": 50, "resume_downloads": 25, "priority_support": false, "analytics": "basic"}'),
('Professional', 2499.00, 24990.00, 150, '{"profile_views": 150, "resume_downloads": 100, "priority_support": true, "analytics": "advanced", "featured_posts": 3}'),
('Enterprise', 4999.00, 49990.00, 500, '{"profile_views": 500, "resume_downloads": 300, "priority_support": true, "analytics": "premium", "featured_posts": 10, "dedicated_manager": true}');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_companies_verification_status ON companies(verification_status);
CREATE INDEX idx_internships_status ON internships(status);
CREATE INDEX idx_internships_company_id ON internships(company_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_internship_id ON applications(internship_id);
CREATE INDEX idx_students_skills ON students USING GIN(skills);
