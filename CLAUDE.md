# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Development: `pnpm dev` or `npm run dev --turbopack`
- Build: `pnpm build` or `npm run build`
- Start: `pnpm start` or `npm run start`
- Lint: `pnpm lint` or `npm run lint`

## Project Context
- Izzy AI: An adaptive multi-agent interview prep system
- Four specialized agents: Parser, Strategist, Interviewer, Evaluator
- Built with Next.js, OpenAI API, Supabase, and SerpAPI

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
- **Agent Architecture**: Follow the linear handoff pattern described in project proposal

## Project Structure
- App Router pattern with pages in `app/` directory
- Components in `components/` with UI components in `components/ui/`
- Agent logic should be organized in `agents/` directory
- Database interactions in `lib/supabase.ts`
- API wrappers in `lib/api/`