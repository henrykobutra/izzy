# Izzy AI: An Adaptive Multi-Agent Interview Prep System

Izzy is an AI-powered interview preparation system that uses a team of specialized agents to deliver personalized interview coaching tailored to your resume and target job.

## About Izzy

Izzy AI employs four collaborative agents to provide a comprehensive interview preparation experience:

1. **Parser Agent** - Analyzes your resume and job description to extract key skills and requirements
2. **Strategist Agent** - Develops a personalized interview strategy matching your background to job needs
3. **Interviewer Agent** - Conducts realistic mock interviews based on the strategic plan
4. **Evaluator Agent** - Provides constructive feedback with scores and suggestions for improvement

## Features

- **Personalized Preparation** - Tailors questions to your specific background and target role
- **Realistic Mock Interviews** - Practice with questions similar to what you'll face in real interviews
- **Structured Feedback** - Receive scores and actionable improvement suggestions
- **Progress Tracking** - Monitor your improvement over multiple practice sessions
- **Anonymous Option** - Try the system without creating an account

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm package manager
- Supabase CLI (for local development)
- OpenAI API key
- Google Cloud Project (for Google authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/henrykobutra/izzy.git
   cd izzy
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create environment variables file:
   ```bash
   cp EXAMPLE_ENV .env
   ```

4. Add your API keys to the `.env` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<YOUR_SUPABASE_URL>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_KEY>
   OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

### Supabase Setup

This project requires Supabase for authentication (including anonymous auth and Google login) and database functionality. You have two options:

#### Option 1: Supabase Cloud (Recommended for deployment)

1. Create a free Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Add these to your `.env` file
4. Push migrations to your remote database:
   ```bash
   supabase db push
   ```

#### Option 2: Local Supabase Instance (Recommended for development)

1. Install Supabase CLI following [official instructions](https://supabase.com/docs/guides/cli)
2. Start the local Supabase instance:
   ```bash
   supabase start
   ```
3. Push database migrations:
   ```bash
   supabase db push
   ```
4. Use the local URL and key provided when you run `supabase start`

### Google Authentication Setup

For Google authentication to work properly:

1. Create a Google Cloud project and configure OAuth consent screen
2. Create OAuth credentials (Web application type)
3. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://your-domain.com/auth/callback`
4. Configure Google provider in your Supabase project settings
5. Follow the detailed instructions in the [Supabase Google Auth guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Deployment

Izzy can be deployed to any platform that supports Next.js applications. The live project uses Vercel for seamless deployment.

### Deploying to Vercel

1. Fork this repository to your GitHub account
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
5. Deploy

### Other Hosting Options

You can also deploy to Netlify, Railway, or any other platform that supports Next.js applications. Make sure to:

1. Set up the required environment variables
2. Configure build command: `pnpm build`
3. Configure output directory: `.next`

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI API, SerpAPI for web search
- **Deployment**: Vercel

## Project Structure

- `app/` - Next.js application routes and pages
- `components/` - React components
- `agents/` - Agent logic and implementation
- `lib/` - Utility functions and API wrappers
- `supabase/` - Database schema and migrations

## Development Timeline

- **March 31–April 7**: Setup and Parser agent implementation
- **April 8–14**: Strategist agent with web search integration
- **April 15–21**: Interviewer and Evaluator agents, complete interview flow
- **April 22–28**: Reinforcement Learning integration and UI refinement
- **April 29–May 5**: Testing, bug fixes, and demo preparation

## License

This project is part of academic coursework for Houston Community College's ITAI 2376: Deep Learning course.

## Author

Varit Kobutra