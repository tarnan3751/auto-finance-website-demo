# Auto Finance News Aggregation Website

A Next.js TypeScript application for real-time auto finance news aggregation with AI-powered features. Fetches live news from NewsAPI's 150,000+ sources, uses OpenAI GPT-4 for intelligent article ranking and summarization, and provides an AI chat interface with RAG using current news as context.

## Features

- **Real-time News**: Fetches live auto finance news from NewsAPI's 150,000+ sources
- **AI Article Ranking**: Sorts articles by relevance to auto finance professionals using GPT-4
- **AI Summaries**: Generates 2-3 sentence summaries for each article
- **Smart Filtering**: Excludes irrelevant content (sports, entertainment, etc.)
- **Interactive Chat**: RAG-powered chat using live news articles as context
- **Responsive Design**: Mobile-first with Tailwind CSS v4

## Tech Stack

- **Framework**: Next.js 15.4.2 with Pages Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with custom dark theme
- **AI**: OpenAI GPT-4 for chat, ranking, and summarization
- **News Source**: NewsAPI for real-time articles
- **Font**: Inter and Space Grotesk (via Google Fonts)

## Getting Started

### Prerequisites

You'll need API keys for:
- OpenAI API (for AI features)
- NewsAPI (for fetching real-time articles)

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
NEWS_API_KEY=your_news_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Optional for development
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Available Commands

```bash
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

## API Routes

- `/api/news` - Fetches real-time auto finance news from NewsAPI
- `/api/chat` - RAG-powered chat endpoint using OpenAI with live news context
- `/api/reorder` - AI article ranking by business importance
- `/api/summarize` - Generates AI-powered summaries for articles

## Project Structure

```
├── pages/              # Next.js pages and API routes
├── components/         # React components (ArticleCard, ChatBot)
├── lib/               # Utility functions and NewsAPI integration
├── styles/            # Global styles and Tailwind configuration
└── CLAUDE.md          # Development instructions for AI assistance
```

## Deployment

The application is optimized for deployment on Vercel. Simply connect your repository to Vercel and add the required environment variables.
