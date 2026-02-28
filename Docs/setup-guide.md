# Photonex Setup Guide

## Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier works)
- Git

## Step 1: Clone and Setup

```bash
cd Photonex
```

## Step 2: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the schema from `Docs/database-schema.sql`
4. Go to Authentication > Providers and enable:
   - Google OAuth
   - GitHub OAuth
5. Copy your Project URL and Anon Key from Settings > API

## Step 3: Backend Setup

```bash
cd Photonex_Backend

# Create .env file
cat > .env << EOF
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
EOF

# Install dependencies
bun install

# Start development server
bun run dev
```

Backend will run on http://localhost:3001

## Step 4: Frontend Setup

```bash
cd Photonex_Frontend

# Create .env file
cat > .env << EOF
API_BASE_URL=http://localhost:3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

# Install dependencies
bun install

# Start development server
bun run dev
```

Frontend will run on http://localhost:3000

## Step 5: Configure OAuth Providers

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/login`
4. Copy Client ID and Secret to Supabase Auth settings

### GitHub OAuth

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/login`
4. Copy Client ID and Secret to Supabase Auth settings

## Step 6: Test the Application

1. Open http://localhost:3000
2. Click "Get Started" or "Login"
3. Sign in with Google or GitHub
4. Add your packages:
   - NPM: Enter URL like `https://www.npmjs.com/package/cometsight`
   - VS Code: Enter URL like `https://marketplace.visualstudio.com/items?itemName=DotJumpDot.color-flow`

## Features

- ✅ Monitor NPM packages (downloads, version, last publish)
- ✅ Monitor VS Code extensions (installs, rating, version)
- ✅ Historical data with trend charts
- ✅ Auto-refresh every 5 minutes
- ✅ OAuth authentication (Google, GitHub)
- ✅ Responsive dashboard

## Production Deployment

### Backend (e.g., Railway, Render, Fly.io)

1. Set environment variables in hosting platform
2. Deploy from `Photonex_Backend` directory

### Frontend (e.g., Vercel, Netlify)

1. Connect your Git repository
2. Set root directory to `Photonex_Frontend`
3. Set environment variables
4. Deploy

## Troubleshooting

### CORS Issues

Make sure the backend CORS is configured to allow your frontend URL.

### Database Connection

Verify Supabase credentials and that the schema was applied correctly.

### OAuth Not Working

Check that redirect URLs match exactly in both OAuth provider and Supabase settings.
