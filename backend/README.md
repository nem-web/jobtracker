# Job Tracker Backend

Express.js REST API for the Job & Internship Tracker application.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **AI**: OpenAI API (optional, with fallback)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Run Development Server

```bash
npm run dev
```

Server starts at `http://localhost:5000`

## API Endpoints

### Health
- `GET /api/health` - Check API status

### Authentication
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify` - Verify token validity
- `DELETE /api/auth/account` - Delete account

### Job Applications
- `GET /api/jobs` - Get all applications (with filters)
- `GET /api/jobs/stats` - Get dashboard stats
- `GET /api/jobs/:id` - Get single application
- `POST /api/jobs` - Create application
- `PUT /api/jobs/:id` - Update application
- `DELETE /api/jobs/:id` - Delete application

### AI Features
- `GET /api/ai/status` - Check AI availability
- `POST /api/ai/generate-email` - Generate email

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `SUPABASE_URL` | Yes | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Yes | Supabase service role key |
| `OPENAI_API_KEY` | No | OpenAI API key (optional) |
| `FRONTEND_URL` | No | Production frontend URL |

## Project Structure

```
src/
├── config/         # Database and external service configs
├── controllers/    # Route handlers
├── middleware/     # Auth, validation, error handling
├── routes/         # API route definitions
└── index.js        # Server entry point
```

## License

MIT
