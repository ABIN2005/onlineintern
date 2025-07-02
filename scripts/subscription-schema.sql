-- Subscription Plans Table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Company Subscriptions Table
CREATE TABLE company_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Connect Usage Tracking
CREATE TABLE connect_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  internship_id UUID REFERENCES internships(id) ON DELETE CASCADE,
  action_type VARCHAR NOT NULL, -- 'view_profile', 'download_resume', 'contact_student'
  connects_used INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, price_monthly, price_yearly, connects_monthly, features) VALUES
('Starter', 999.00, 9990.00, 50, '{"profile_views": 50, "resume_downloads": 25, "priority_support": false, "analytics": "basic"}'),
('Professional', 2499.00, 24990.00, 150, '{"profile_views": 150, "resume_downloads": 100, "priority_support": true, "analytics": "advanced", "featured_posts": 3}'),
('Enterprise', 4999.00, 49990.00, 500, '{"profile_views": 500, "resume_downloads": 300, "priority_support": true, "analytics": "premium", "featured_posts": 10, "dedicated_manager": true}');
