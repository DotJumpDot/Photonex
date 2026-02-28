# Photonex

A monitoring dashboard for NPM packages and VS Code Marketplace extensions. Track downloads, ratings, versions, and historical trends in one place.

## Features

- 📦 **NPM Package Monitoring**
  - Weekly downloads tracking
  - Version information
  - Last publish date
  - Historical trend charts

- 🎨 **VS Code Marketplace Monitoring**
  - Install count tracking
  - Rating/average rating
  - Version tracking
  - Last update date

- 🔐 **Authentication**
  - Google OAuth via Supabase Auth
  - GitHub OAuth via Supabase Auth
  - Secure user management

- 📊 **Dashboard**
  - Add packages/extensions by URL
  - Grid view of all monitored items
  - Auto-refresh (configurable interval)
  - Manual refresh button
  - Historical data charts

- 🗄️ **Database**
  - Supabase PostgreSQL
  - Automatic data retention
  - Row Level Security (RLS)

## Tech Stack

### Backend

- **Framework:** ExpressJS 5+ with TypeScript
- **Database:** Supabase (PostgreSQL)
- **APIs:** NPM Registry, VS Code Marketplace
- **Architecture:** Layered (API → Service → SQL → DB)

### Frontend

- **Framework:** Nuxt.js 3 with TypeScript
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **Charts:** Chart.js with vue-chartjs
- **HTTP Client:** Axios

## Project Structure

```
Photonex/
├── AGENTS.md                    # Project guidelines
├── LICENSE                      # MIT License 2026 DotJumpDot
├── README.md                    # This file
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── Docs/
│   ├── database-schema.sql      # Supabase SQL schema
│   └── setup-guide.md           # Detailed setup instructions
├── Photonex_Backend/            # ExpressJS + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── main.ts              # Entry point
│       ├── db.ts                # Supabase client
│       ├── api/                 # Route handlers
│       ├── types/               # TypeScript interfaces
│       ├── sql/                 # SQL query functions
│       └── service/             # Business logic
└── Photonex_Frontend/           # Nuxt.js 3 + TypeScript
    ├── nuxt.config.ts
    ├── package.json
    └── src/
        ├── pages/               # Nuxt pages
        ├── components/          # Vue components
        ├── services/            # API services + axios config
        ├── stores/              # Pinia stores
        └── Types/               # TypeScript interfaces
```

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier works)

### 1. Clone and Navigate

```bash
cd Photonex
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the schema from `Docs/database-schema.sql`
4. Go to Authentication > Providers and enable Google & GitHub OAuth
5. Copy your Project URL and Anon Key from Settings > API

### 3. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Supabase credentials
```

### 4. Start Backend

```bash
cd Photonex_Backend
bun install
bun run dev  # Runs on http://localhost:3001
```

### 5. Start Frontend

```bash
cd Photonex_Frontend
bun install
bun run dev  # Runs on http://localhost:3000
```

### 6. Configure OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/login`
4. Copy Client ID and Secret to Supabase Auth settings

#### GitHub OAuth

1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/login`
4. Copy Client ID and Secret to Supabase Auth settings

## Usage

1. Open http://localhost:3000
2. Click "Get Started" or "Login"
3. Sign in with Google or GitHub
4. Add your packages:
   - **NPM:** Enter URL like `https://www.npmjs.com/package/cometsight`
   - **VS Code:** Enter URL like `https://marketplace.visualstudio.com/items?itemName=DotJumpDot.color-flow`

## API Endpoints

### Authentication

- `POST /api/auth/callback` - OAuth callback
- `GET /api/auth/me` - Get current user

### Packages

- `GET /api/packages` - Get all packages with stats
- `POST /api/packages` - Add new package
- `DELETE /api/packages/:id` - Delete package
- `POST /api/packages/:id/refresh` - Refresh package stats
- `POST /api/packages/refresh-all` - Refresh all packages

## Development

### Backend Development

```bash
cd Photonex_Backend
bun run dev      # Start development server
bun run build    # Build for production
bun run lint     # Run ESLint
bun run type-check  # Run TypeScript check
```

### Frontend Development

```bash
cd Photonex_Frontend
bun run dev      # Start development server
bun run build    # Build for production
bun run generate # Generate static site
```

## Production Deployment

### Backend (Railway, Render, Fly.io, etc.)

1. Set environment variables in hosting platform
2. Deploy from `Photonex_Backend` directory
3. Ensure `NODE_ENV=production`

### Frontend (Vercel, Netlify, etc.)

1. Connect your Git repository
2. Set root directory to `Photonex_Frontend`
3. Set environment variables:
   - `API_BASE_URL` - Your backend URL
   - `SUPABASE_URL` - Your Supabase URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
4. Deploy

## Environment Variables

### Backend (.env)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PORT=3001
NODE_ENV=development
```

### Frontend (.env)

```env
API_BASE_URL=http://localhost:3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Troubleshooting

### CORS Issues

Ensure the backend CORS is configured to allow your frontend URL. Default allows all origins in development.

### Database Connection

Verify Supabase credentials and that the schema was applied correctly in the SQL Editor.

### OAuth Not Working

Check that redirect URLs match exactly in both OAuth provider settings and Supabase Auth configuration.

### TypeScript Errors

Run `bun install` in both `Photonex_Backend` and `Photonex_Frontend` directories to ensure all dependencies are installed.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License 2026 DotJumpDot - see [LICENSE](LICENSE) file for details.

## Support

For detailed setup instructions, see [Docs/setup-guide.md](Docs/setup-guide.md).

For project guidelines, see [AGENTS.md](AGENTS.md).
