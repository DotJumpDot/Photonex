-- Photonex Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CLEAN SETUP: Drop existing tables and recreate
-- WARNING: This will delete all existing data!
-- ============================================

-- Drop dependent tables first (CASCADE automatically drops policies)
DROP TABLE IF EXISTS package_dependencies CASCADE;
DROP TABLE IF EXISTS package_versions CASCADE;
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

-- Packages table with extended metadata
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('npm', 'vscode')),
  url TEXT NOT NULL,
  -- Package metadata (static info)
  description TEXT,
  author VARCHAR(255),
  license VARCHAR(100),
  homepage TEXT,
  repository_url TEXT,
  bugs_url TEXT,
  keywords JSONB DEFAULT '[]',
  -- NPM specific metadata
  npm_last_modified TIMESTAMP WITH TIME ZONE,
  -- VS Code specific metadata
  vscode_publisher VARCHAR(255),
  vscode_display_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats table with extended metrics (time-series data)
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  -- Download/Install metrics
  downloads INTEGER,                          -- Weekly downloads (NPM) or period downloads
  total_downloads BIGINT,                     -- All-time total downloads
  installs INTEGER,                           -- VS Code installs
  -- Version info
  version VARCHAR(100),                       -- Current/latest version
  version_count INTEGER DEFAULT 0,            -- Total number of versions available
  -- Package size metrics (NPM)
  unpacked_size BIGINT,                       -- Size in bytes
  file_count INTEGER,                         -- Number of files
  -- Dependency counts (NPM)
  dependencies_count INTEGER DEFAULT 0,       -- Number of dependencies
  dev_dependencies_count INTEGER DEFAULT 0,   -- Number of dev dependencies
  -- VS Code specific
  rating DECIMAL(3, 2),                       -- Average rating (0-5)
  rating_count INTEGER,                       -- Number of ratings
  trending_daily DECIMAL(10, 2),              -- Daily trending score
  trending_monthly DECIMAL(10, 2),            -- Monthly trending score
  -- Metadata
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Package versions table (detailed version tracking)
CREATE TABLE IF NOT EXISTS package_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  version VARCHAR(100) NOT NULL,
  -- Version specific stats
  downloads BIGINT,                           -- Downloads for this specific version
  unpacked_size BIGINT,                       -- Size in bytes
  file_count INTEGER,                         -- Number of files
  -- Timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(package_id, version)
);

-- Package dependencies table (tracks dependencies per stat snapshot)
CREATE TABLE IF NOT EXISTS package_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  dependency_name VARCHAR(255) NOT NULL,
  dependency_version VARCHAR(100),
  is_dev_dependency BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_packages_user_id ON packages(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_stats_package_id ON stats(package_id);
CREATE INDEX IF NOT EXISTS idx_stats_recorded_at ON stats(recorded_at);
CREATE INDEX IF NOT EXISTS idx_package_versions_package_id ON package_versions(package_id);
CREATE INDEX IF NOT EXISTS idx_package_versions_version ON package_versions(version);
CREATE INDEX IF NOT EXISTS idx_package_dependencies_package_id ON package_dependencies(package_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_dependencies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can view own packages" ON packages
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own packages" ON packages
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own packages" ON packages
  FOR UPDATE USING (auth.uid()::text = user_id::text);

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

CREATE POLICY "Users can view versions for own packages" ON package_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_versions.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert versions for own packages" ON package_versions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_versions.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete versions for own packages" ON package_versions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_versions.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can view dependencies for own packages" ON package_dependencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_dependencies.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert dependencies for own packages" ON package_dependencies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_dependencies.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can delete dependencies for own packages" ON package_dependencies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM packages 
      WHERE packages.id = package_dependencies.package_id 
      AND packages.user_id::text = auth.uid()::text
    )
  );
