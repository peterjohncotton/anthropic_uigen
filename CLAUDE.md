# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup        # First-time setup: install deps, generate Prisma client, run migrations
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest
npm run db:reset     # Reset database (destructive)
```

Set `ANTHROPIC_API_KEY` in `.env.local` for AI functionality; without it, the app falls back to `MockLanguageModel`.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in chat; Claude generates/edits code via tool calls; results render live in an iframe.

### Three-Panel Layout (`src/app/main-content.tsx`)
- **Left (35%)**: Chat interface
- **Right (65%)**: Toggle between live Preview and Code Editor (file tree + Monaco)

### Virtual File System (`src/lib/file-system.ts`)
All files are in-memory (`VirtualFileSystem` class with `FileNode` tree). Files never touch disk. The root entry point is always `/App.jsx`. Files are serialized to JSON for database persistence.

### AI Tool Calls
Two Claude tools defined in `src/lib/tools/`:
- **`str_replace_editor`**: Create, view, modify (str_replace), or insert into virtual files
- **`file_manager`**: Rename/move and delete virtual files

The API route (`src/app/api/chat/route.ts`) streams Claude responses with tool execution. `ChatContext` (`src/lib/contexts/chat-context.tsx`) handles tool call side effects against the file system.

### Live Preview (`src/components/preview/`)
`PreviewFrame` renders an iframe. `src/lib/transform/jsx-transformer.ts` uses Babel standalone to:
1. Compile JSX/TSX to JS
2. Build an import map mapping `@/` aliases and bare imports to `esm.sh` CDN URLs
3. Scaffold HTML with module loading

### AI Prompts (`src/lib/prompts/generation.tsx`)
Key constraints enforced by the system prompt:
- Every project must have `/App.jsx` as root entrypoint
- Style with Tailwind CSS only (no hardcoded styles)
- No HTML files
- Local imports use `@/` alias

### Authentication
JWT sessions via Jose library, bcrypt password hashing, httpOnly cookies (7-day expiry). Session validation is server-side. Server actions in `src/actions/` handle auth and project CRUD.

### Routes
- `/` — Home: redirects authenticated users to their latest project, shows anonymous UI otherwise
- `/[projectId]` — Protected project page loaded from Prisma database
- `/api/chat` — Streaming chat endpoint with Claude tool execution
