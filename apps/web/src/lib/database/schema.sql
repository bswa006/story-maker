-- StoryMaker Platform Database Schema
-- AI-Powered Personalized Children's Content Platform

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) DEFAULT 'user', -- 'user', 'educator', 'admin'
    subscription_plan VARCHAR(50) DEFAULT 'starter', -- 'starter', 'family', 'premium'
    subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    subscription_renews_at TIMESTAMP,
    stories_created INTEGER DEFAULT 0,
    stories_this_month INTEGER DEFAULT 0,
    monthly_limit INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Children profiles for personalization
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    age_group VARCHAR(10) NOT NULL, -- '3-5', '6-8', '9-12', '13+'
    photo_url TEXT,
    photo_analysis JSONB, -- AI analysis results
    interests TEXT[], -- Array of interests
    special_needs TEXT[], -- Array of special considerations
    learning_style VARCHAR(50), -- AI-detected learning style
    reading_level VARCHAR(50), -- AI-assessed reading level
    favorite_categories TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Story templates with AI prompts
CREATE TABLE story_templates (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    age_groups VARCHAR(10)[] NOT NULL,
    educational_focus VARCHAR(100)[] NOT NULL,
    difficulty VARCHAR(50) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    pages INTEGER NOT NULL,
    estimated_reading_time INTEGER NOT NULL,
    subscription_tier VARCHAR(50) NOT NULL, -- 'basic', 'premium', 'all'
    themes VARCHAR(100)[] NOT NULL,
    learning_objectives TEXT[] NOT NULL,
    therapeutic_value VARCHAR(100)[],
    ai_prompt_template TEXT NOT NULL, -- GPT-4 prompt template
    image_style_prompt TEXT NOT NULL, -- DALL-E 3 style prompt
    preview JSONB NOT NULL, -- Cover text and sample page
    cultural_adaptations TEXT[],
    parent_guide TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Generated stories
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    template_id VARCHAR(255) REFERENCES story_templates(id),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'generating', -- 'generating', 'completed', 'failed', 'draft'
    content JSONB NOT NULL, -- Story pages with text and image URLs
    metadata JSONB, -- Generation parameters, AI settings, etc.
    child_photo_url TEXT,
    personalization_data JSONB, -- How the story was personalized
    ai_generation_cost DECIMAL(10,4) DEFAULT 0.0,
    download_count INTEGER DEFAULT 0,
    reading_time_minutes INTEGER,
    completion_rate DECIMAL(3,2) DEFAULT 0.0,
    user_rating INTEGER, -- 1-5 stars
    learning_outcomes JSONB, -- Tracked learning progress
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscription plans configuration
CREATE TABLE subscription_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    monthly_price INTEGER NOT NULL, -- in paise/cents
    yearly_price INTEGER NOT NULL,
    features TEXT[] NOT NULL,
    limits JSONB NOT NULL, -- stories_per_month, children_profiles, etc.
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Educational institutions for B2B
CREATE TABLE institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'school', 'daycare', 'therapy_center', 'library'
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'basic',
    total_students INTEGER DEFAULT 0,
    total_classrooms INTEGER DEFAULT 0,
    stories_generated INTEGER DEFAULT 0,
    engagement_rate DECIMAL(3,2) DEFAULT 0.0,
    admin_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Classrooms within institutions
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    teacher VARCHAR(255) NOT NULL,
    grade VARCHAR(10) NOT NULL,
    student_count INTEGER NOT NULL,
    age_range VARCHAR(20) NOT NULL,
    focus_areas TEXT[] NOT NULL,
    stories_generated INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT NOW(),
    learning_outcomes JSONB, -- Tracked outcomes per student
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Usage analytics and tracking
CREATE TABLE usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- 'story_generated', 'page_viewed', 'download', etc.
    event_data JSONB,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    child_id UUID REFERENCES children(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI generation logs for cost tracking and optimization
CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    service_type VARCHAR(50) NOT NULL, -- 'gpt4', 'dalle3', 'vision'
    prompt_text TEXT,
    response_text TEXT,
    tokens_used INTEGER,
    cost_usd DECIMAL(10,6),
    processing_time_ms INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- User achievements and gamification
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW()
);

-- Content moderation and safety
CREATE TABLE content_moderation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL, -- 'text', 'image'
    ai_safety_score DECIMAL(3,2),
    human_reviewed BOOLEAN DEFAULT false,
    approved BOOLEAN DEFAULT true,
    flags TEXT[],
    reviewer_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_plan, subscription_status);
CREATE INDEX idx_children_user_id ON children(user_id);
CREATE INDEX idx_children_age_group ON children(age_group);
CREATE INDEX idx_stories_user_id ON stories(user_id);
CREATE INDEX idx_stories_template_id ON stories(template_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created_at ON stories(created_at);
CREATE INDEX idx_templates_category ON story_templates(category);
CREATE INDEX idx_templates_subscription_tier ON story_templates(subscription_tier);
CREATE INDEX idx_usage_analytics_user_id ON usage_analytics(user_id);
CREATE INDEX idx_usage_analytics_event_type ON usage_analytics(event_type);
CREATE INDEX idx_usage_analytics_created_at ON usage_analytics(created_at);
CREATE INDEX idx_ai_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_logs_service_type ON ai_generation_logs(service_type);
CREATE INDEX idx_ai_logs_created_at ON ai_generation_logs(created_at);

-- Sample data for testing
INSERT INTO subscription_plans (id, name, description, monthly_price, yearly_price, features, limits) VALUES
('starter', 'Story Explorer', 'Perfect for trying out personalized stories', 49900, 499000, 
 '{"Basic story templates", "Standard image quality", "PDF downloads", "Email support"}',
 '{"stories_per_month": 3, "children_profiles": 1, "story_templates": "basic", "physical_prints": 0, "priority_support": false, "advanced_personalization": false}'),
('family', 'Family Storyteller', 'Great for families with multiple children', 99900, 999000,
 '{"All story templates", "HD image quality", "Multiple children profiles", "Physical print credits", "Priority support"}',
 '{"stories_per_month": 10, "children_profiles": 4, "story_templates": "premium", "physical_prints": 2, "priority_support": true, "advanced_personalization": true}'),
('premium', 'Education Pro', 'Complete access with advanced features', 199900, 1999000,
 '{"Unlimited stories", "All premium templates", "Audio narration", "AR features", "Educational reports", "API access"}',
 '{"stories_per_month": "unlimited", "children_profiles": 10, "story_templates": "all", "physical_prints": 5, "priority_support": true, "advanced_personalization": true}');