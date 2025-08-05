# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js TypeScript application for real-time auto finance news aggregation with AI-powered features. It fetches live news from NewsAPI's 150,000+ sources, uses OpenAI GPT-4 for intelligent article ranking and summarization, and provides an AI chat interface with RAG using current news as context.

## Common Commands

```bash
# Development
npm run dev        # Start development server with Turbopack

# Production
npm run build      # Build for production
npm run start      # Start production server

# Code Quality
npm run lint       # Run ESLint
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.2 with Pages Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom dark theme
- **AI**: OpenAI GPT-4 for chat, ranking, and summarization
- **News Source**: NewsAPI for real-time articles
- **Font**: Inter and Space Grotesk (via Google Fonts)

### Key Directories
- `/pages` - Next.js pages and API routes
- `/components` - React components (ArticleCard, ChatBot)
- `/lib` - Utility functions and NewsAPI integration
- `/styles` - Global styles and Tailwind configuration

### API Routes
- `/api/news` - Fetches real-time auto finance news from NewsAPI (150k+ sources)
- `/api/chat` - RAG-powered chat endpoint using OpenAI with live news context
- `/api/reorder` - AI article ranking by business importance
- `/api/summarize` - Generates AI-powered 2-3 sentence summaries for articles

### Import Aliases
The project uses TypeScript path aliases configured in tsconfig.json:
- `@components/*` → `./components/*`
- `@lib/*` → `./lib/*`
- `@styles/*` → `./styles/*`

### Environment Variables
Required for AI features:
- `OPENAI_API_KEY` - Your OpenAI API key
- `NEWS_API_KEY` - Your NewsAPI key for fetching real-time articles

### Key Features
1. **Real-time News**: Fetches live auto finance news from NewsAPI's 150,000+ sources
2. **AI Article Ranking**: Sorts articles by relevance to auto finance professionals using GPT-4
3. **AI Summaries**: Generates 2-3 sentence summaries for each article
4. **Smart Filtering**: Excludes irrelevant content (sports, entertainment, etc.)
5. **Interactive Chat**: RAG-powered chat using live news articles as context
6. **Responsive Design**: Mobile-first with Tailwind CSS v4

### Development Notes
- No testing framework is currently set up
- Uses experimental Turbopack for faster development builds
- Deployment-ready for Vercel platform
- React Strict Mode is enabled for better development experience