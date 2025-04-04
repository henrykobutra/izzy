# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Development: `pnpm dev`
- Build: `pnpm build`
- Start: `pnpm start`
- Lint: `pnpm lint`
- Supabase Local: `supabase start`
- Supabase DB Push: `supabase db push`

## Project Context
- Izzy AI: An adaptive multi-agent interview prep system
- Four specialized agents: Parser, Strategist, Interviewer, Evaluator
- Built with Next.js, OpenAI API, Supabase, and SerpAPI
- Agent collaboration follows linear handoff pattern: Parser → Strategist → Interviewer → Evaluator

## Code Style Guidelines
- **Formatting**: Follow Next.js conventions with TypeScript strict mode
- **Components**: PascalCase for component names, camelCase for props
- **Path Aliases**: Use `@/` imports (e.g., `@/components`, `@/lib/utils`)
- **Styling**: Tailwind CSS with `cn()` utility for class merging
- **Component Library**: shadcn/ui with "new-york" style variant
- **Imports**: Group by: 1) React/Next, 2) External libs, 3) Internal components
- **Icons**: Use Lucide React for icons
- **Types**: Use explicit typing with TypeScript interfaces for complex objects
- **Error Handling**: Implement try/catch for async operations, especially API calls
- **Package Manager**: Always use pnpm, never npm or yarn
- **Environment Variables**: Use the EXAMPLE_ENV template for required variables

## Project Structure
- App Router pattern with pages in `app/` directory
- Components in `components/` with UI components in `components/ui/`
- Agent logic organized in `agents/` directory
- Database schema in `supabase/migrations/`
- Database interactions in `lib/supabase.ts`
- API wrappers in `lib/api/`

## Agent Implementation
- **Parser Agent**: Processes resume and job description inputs, extracting skills and requirements
- **Strategist Agent**: Maps skills to job needs and plans interview questions
- **Interviewer Agent**: Generates and asks mock questions based on the strategy
- **Evaluator Agent**: Scores answers and suggests improvements

## Database Schema
- User profiles with support for both registered and anonymous users
- Resume and job posting storage with parsed skills/requirements
- Interview sessions, questions, answers, and evaluations
- Agent logs for debugging and improvement