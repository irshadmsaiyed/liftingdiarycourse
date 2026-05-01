# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Requirement

**Before generating any code, Claude Code MUST first check the `docs/` directory for relevant documentation.** If a docs file exists that relates to the feature, component, or area being worked on, read it thoroughly and follow its guidance. The docs files are the authoritative source of intent and design decisions for this project:

- docs/ui.md
- docs/data-fetching.md

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # Run ESLint
```

No test suite is configured yet.

## Stack

- **Next.js 16** with App Router (`src/app/`)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4** (configured via PostCSS, no `tailwind.config.js` — uses CSS-first config)

## Architecture

This is a fresh Next.js App Router project. All routes live under `src/app/`. The root layout (`src/app/layout.tsx`) sets up Geist fonts as CSS variables (`--font-geist-sans`, `--font-geist-mono`) and applies them globally. Styling is in `src/app/globals.css`.

Tailwind v4 is configured through `postcss.config.mjs` using `@tailwindcss/postcss` — there is no separate `tailwind.config.js`.
