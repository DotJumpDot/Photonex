# Photonex - Agent Guidelines

## Project Overview

Photonex is a monitoring dashboard for NPM packages and VS Code Marketplace extensions. It tracks downloads, ratings, versions, and historical trends.

## Development Rules

- **Package Manager**: ALWAYS use **Bun** (`bun install`, `bun add`, `bun run`). DO NOT use `npm` or `yarn`.
- **Runtime**: Prefer Bun runtime where applicable.

## Tech Stack

- **Frontend**: Nuxt.js 3 + TypeScript + Pinia
- **Backend**: Express.js 5+ + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: OAuth (Google, GitHub) via Supabase Auth

## Architecture

### Backend Structure

```
Photonex_Backend/src/
├── main.ts              # Entry point
├── db.ts                # Supabase client configuration
├── api/                 # Route handlers
│   ├── user_api.ts
│   └── package_api.ts
├── types/               # TypeScript interfaces
│   ├── user_type.ts
│   └── package_type.ts
├── sql/                 # SQL query functions
│   ├── user_sql.ts
│   └── package_sql.ts
└── service/             # Business logic
    ├── user_service.ts
    └── package_service.ts
```

### Frontend Structure

```
Photonex_Frontend/src/
├── services/            # API calls with axios
│   ├── auth.service.ts
│   └── package.service.ts
└── stores/              # Pinia stores
    ├── auth.store.ts
    └── package.store.ts
```

## Naming Conventions

- Files: `{item}_{category}.ts` (e.g., `user_api.ts`, `package_type.ts`)
- Types/Interfaces: PascalCase (e.g., `User`, `Package`)
- Functions: camelCase
- Database tables: snake_case, plural (e.g., `users`, `packages`)

## API Integration

- **NPM Registry**: `https://registry.npmjs.org/{package}`
- **NPM Downloads**: `https://api.npmjs.org/downloads/point/last-week/{package}`
- **VS Code Marketplace**: `https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery`

## Database Schema

### users

- id (uuid, primary key)
- email (string)
- provider (string) - 'google' | 'github'
- provider_id (string)
- created_at (timestamp)

### packages

- id (uuid, primary key)
- user_id (uuid, foreign key)
- name (string)
- type (string) - 'npm' | 'vscode'
- url (string)
- created_at (timestamp)

### stats

- id (uuid, primary key)
- package_id (uuid, foreign key)
- downloads (integer)
- version (string)
- rating (float) - for vscode only
- installs (integer) - for vscode only
- recorded_at (timestamp)

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials.

## License

MIT 2026 DotJumpDot
