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
- **Passwordless Auth** - Simple and secure email-based authentication

## Getting Started

### Prerequisites

- Node.js 18.x or later
- pnpm package manager
- Supabase CLI (for local development)
- OpenAI API key with Assistants API access

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
   SUPABASE_SERVICE_ROLE_KEY=<YOUR_SUPABASE_SERVICE_ROLE_KEY>
   OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
   OPENAI_RESUME_PARSER_ASSISTANT_ID=<YOUR_OPENAI_ASSISTANT_ID>
   OPENAI_STRATEGY_ASSISTANT_ID=<YOUR_OPENAI_ASSISTANT_ID>
   OPENAI_INTERVIEWER_ASSISTANT_ID=<YOUR_OPENAI_ASSISTANT_ID>
   OPENAI_EVALUATOR_ASSISTANT_ID=<YOUR_OPENAI_ASSISTANT_ID>
   ```

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) to view the application

### Supabase Setup

This project requires Supabase for authentication (including anonymous auth and email OTP) and database functionality. You have two options:

#### Option 1: Supabase Cloud (Recommended for deployment)

1. Create a free Supabase project at [https://supabase.com](https://supabase.com)
2. Get your project URL, anon key, and service role key from the project settings
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
4. Use the local URL and keys provided when you run `supabase start`

### OpenAI Assistants API Setup

This project uses OpenAI Assistants API for the agent implementation:

1. Create an OpenAI account and obtain an API key
2. Create four assistants in the OpenAI platform:
   - Parser Assistant: For resume analysis
   - Strategist Assistant: For interview strategy planning
   - Interviewer Assistant: For conducting mock interviews
   - Evaluator Assistant: For providing feedback
3. Add the assistant IDs to your `.env` file

## Deployment

Izzy can be deployed to any platform that supports Next.js applications. The live project uses Vercel for seamless deployment.

### Deploying to Vercel

1. Fork this repository to your GitHub account
2. Create a new project on [Vercel](https://vercel.com)
3. Connect your GitHub repository
4. Configure all environment variables from your `.env` file
5. Deploy

### Other Hosting Options

You can also deploy to Netlify, Railway, or any other platform that supports Next.js applications. Make sure to:

1. Set up the required environment variables
2. Configure build command: `pnpm build`
3. Configure output directory: `.next`

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (Auth, Database, Storage)
- **AI**: OpenAI Assistants API
- **Deployment**: Vercel

## Project Structure

- `app/` - Next.js application routes and pages using App Router
- `components/` - React components (UI, interviews, resume, auth)
- `agents/` - Agent logic and implementation for all four specialized agents
- `lib/` - Utility functions, hooks, and API wrappers
- `supabase/` - Database schema and migrations
- `types/` - TypeScript type definitions
- `providers/` - React context providers

## Commands

- Development: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`
- Lint: `pnpm lint`
- Supabase Local: `supabase start`
- Supabase DB Push: `supabase db push`

## License

This project is part of academic coursework for Houston Community College's ITAI 2376: Deep Learning course.

## Author

Varit Kobutra