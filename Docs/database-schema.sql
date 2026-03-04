-- Photonex Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLEAN SETUP: Drop existing tables and recreate
-- WARNING: This will delete all existing data!
-- ============================================

-- Drop dependent tables first (CASCADE automatically drops policies)
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  provider VARCHAR(50) CHECK (provider IS NULL OR provider IN ('google', 'github', 'email')),
  provider_id VARCHAR(255),
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('npm', 'vscode')),
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats table
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  downloads INTEGER,
  version VARCHAR(100),
  rating DECIMAL(3, 2),
  installs INTEGER,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);
CREATE INDEX IF NOT EXISTS idx_stats_package_id ON stats(package_id);
CREATE INDEX IF NOT EXISTS idx_stats_recorded_at ON stats(recorded_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own packages" ON packages
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own packages" ON packages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own packages" ON packages
  FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view stats for own packages" ON stats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = stats.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert stats for own packages" ON stats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = stats.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );