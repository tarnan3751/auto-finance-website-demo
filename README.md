# ExeterHub - AI-Powered Auto Finance Intelligence Platform

A Next.js-based real-time automotive finance news aggregator with AI-powered analysis, intelligent content curation, and interactive chat capabilities.

## 🚀 Features

- **Real-Time News Aggregation**: Fetches automotive finance news from 150,000+ global sources via NewsAPI
- **AI-Powered Content Curation**: Uses OpenAI to rank articles by relevance to industry professionals
- **Intelligent Summaries**: Generates concise AI summaries for quick insights
- **Advanced Filtering**: Multi-dimensional filters (date range, country, source quality)
- **Global Coverage**: Supports multiple countries with localized content
- **Interactive AI Chat**: Context-aware chatbot for discussing current market trends
- **Modern UI**: Dark-themed interface with glassmorphism effects

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.2 with Turbopack
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4.1 with PostCSS
- **AI Integration**: OpenAI GPT-4o for content analysis
- **Data Source**: NewsAPI for real-time market news
- **UI Components**: Custom React components with error boundaries
- **State Management**: React hooks and local state

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key for AI features
- NewsAPI key for news aggregation

## 🚀 Getting Started

### Environment Setup

Create a `.env.local` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key
NEWS_API_KEY=your_newsapi_key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/auto-finance-website-demo.git

# Navigate to project directory
cd auto-finance-website-demo

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build
npm run start        # Production server
npm run lint         # Linting
npm run clean        # Clean build cache
npm run clean:build  # Clean and rebuild
```

## 📁 Project Structure

```
├── components/      # React components
│   ├── ArticleCard.tsx
│   ├── ChatBot.tsx
│   ├── ChatWidget.tsx
│   ├── FilterDropdown.tsx
│   └── LoadingSpinner.tsx
├── lib/            # NewsAPI integration & utilities
│   └── newsapi.ts
├── pages/          # Next.js pages & API routes
│   ├── api/        # Backend endpoints
│   │   ├── chat.ts
│   │   ├── news.ts
│   │   ├── reorder.ts
│   │   └── summarize.ts
│   └── index.tsx   # Main application page
├── public/         # Static assets
└── styles/         # Global styles & Tailwind config
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/news` | GET | Fetches filtered automotive finance news |
| `/api/chat` | POST | AI-powered chat with news context |
| `/api/reorder` | POST | Ranks articles by relevance |
| `/api/summarize` | POST | Generates AI summaries |

## 🎯 Core Features in Detail

### 1. Article Filtering & Multi-Language System

#### Multi-Dimensional Filtering
- **Date Range**: Past 24 hours, week, month, or all time (with API delay compensation)
- **Geographic Coverage**: 10 countries (US, UK, Canada, Australia, Germany, France, Japan, China, India)
- **Source Quality**: Premium, trusted, or broad coverage options
- **Cache-Aware**: Separate caching for each filter combination

#### Intelligent Relevance Scoring
- **Tiered Scoring System**: 
  - Auto terms (8-20 points based on compound vs. single terms)
  - Finance context (12 points with title bonus)
  - Brand mentions (8 points with recognition boost)
  - Business context (5 points for market/industry terms)
- **Combination Bonuses**:
  - Auto + Finance: +15 points (ideal match)
  - Auto + Business: +8 points (good match)
  - Brand + Context: +5 points (relevant news)
- **Exclusion Patterns**:
  - Strong exclusions: Auto-immune, sports games, entertainment (-1000 points)
  - Soft exclusions: Individual sports/entertainment terms (-30 points)

#### Multi-Language Localization
- **Comprehensive Language Support**
  - English (US, UK, Canada, Australia)
  - German (Full term translation)
  - French (Complete localization)
  - Japanese (Kanji, Katakana, Hiragana)
  - Chinese (Simplified Chinese)
  - Hindi/English Mix (India-specific)

- **Country-Specific Features**
  - Localized search queries under 500 chars
  - 20-40 country-specific news domains per region
  - Native script brand names and local manufacturers
  - Cultural context for exclusions

### 2. Intelligent Chatbot System

#### Core Capabilities
- **Context-Aware Responses**: Real-time article context with RAG integration
- **Session Management**: Saves up to 20 chat sessions with smart titling
- **User Experience**: Suggested questions, keyboard shortcuts, auto-scroll
- **Professional UI**: Glassmorphism design with dark theme

#### Technical Features
- React Hooks for state management
- TypeScript interfaces for type safety
- Robust error handling and JSON parsing
- localStorage for session persistence
- Memory-efficient history management

### 3. RAG (Retrieval-Augmented Generation) System

#### Processing Pipeline
1. **Article Collection & Caching**
   - 5-minute cache for performance optimization
   - Shared cache between chat sessions

2. **Embedding Generation**
   - OpenAI's text-embedding-3-small model
   - Semantic representation of articles and queries

3. **Semantic Search**
   - Cosine similarity calculation
   - Dual-threshold system (0.3 primary, 0.15 fallback)
   - Top 5 article selection

4. **Response Generation**
   - GPT-4o-mini with 0.5 temperature
   - Article citations with [1], [2] notation
   - 600 token limit for concise answers

5. **Intelligent Fallback**
   - Graceful handling when no relevant articles found
   - General expertise provision as backup

## 🧩 Key Components

### Frontend Components
- **ArticleCard**: Displays news articles with AI summaries
- **ChatBot**: Interactive AI assistant with market context
- **ChatWidget**: Floating chat launcher
- **FilterDropdown**: Advanced filtering controls
- **LoadingSpinner**: Loading states with context
- **ErrorBoundary**: Graceful error handling

### Backend Services
- **News API Integration**: Real-time news fetching with caching
- **OpenAI Integration**: Content analysis and chat responses
- **Relevance Scoring**: Sophisticated article ranking algorithm
- **Multi-language Support**: Comprehensive localization system

## 🚀 Deployment

The application is optimized for Vercel deployment:

1. Fork or clone the repository
2. Connect to Vercel via GitHub
3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `NEWS_API_KEY`
4. Deploy with automatic builds on push

## 🔧 Configuration

### Customization Options
- Adjust relevance scoring thresholds in `lib/newsapi.ts`
- Modify cache duration in `pages/api/news.ts`
- Customize UI theme in `tailwind.config.js`
- Update suggested questions in `components/ChatBot.tsx`

### Performance Optimization
- 5-minute article caching
- Filter-specific cache keys
- Efficient embedding generation
- Optimized API calls with batching

## 📝 License

This project is proprietary and confidential.

## 🤝 Contributing

Please reach out to the development team for contribution guidelines.

## 📧 Support

For support and questions, please contact the development team.