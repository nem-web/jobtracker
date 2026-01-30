# Job Tracker Frontend

React frontend for the Job & Internship Tracker application.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Auth**: Supabase Auth
- **Icons**: Lucide React

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

Server starts at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `VITE_API_URL` | Yes | Backend API URL |

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts (Auth)
├── hooks/          # Custom React hooks
├── pages/          # Page components
├── config/         # Configuration files
├── App.tsx         # Main app component
└── main.tsx        # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT
