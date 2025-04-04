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

This project uses Supabase for authentication and database. To run locally:

1. Install Supabase CLI following [official instructions](https://supabase.com/docs/guides/cli)
2. Start the local Supabase instance:
   ```bash
   supabase start
   ```
3. Push database migrations:
   ```bash
   supabase db push
   ```

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