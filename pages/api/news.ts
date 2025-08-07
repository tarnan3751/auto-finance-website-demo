import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAutoFinanceNews, fetchTopHeadlines, Article, FilterOptions } from '@lib/newsapi';

// Cache for storing articles with timestamp by filter key
interface CacheEntry {
  data: Article[];
  timestamp: number;
}

// Use a Map to store different cache entries for different filter combinations
const articlesCache = new Map<string, CacheEntry>();

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

// Function to clean old cache entries
function cleanCache() {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  articlesCache.forEach((entry, key) => {
    if (now - entry.timestamp > CACHE_DURATION) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => {
    articlesCache.delete(key);
    console.log('[/api/news] Cleaned expired cache for key:', key);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for required environment variables
  if (!process.env.NEWS_API_KEY) {
    console.error('[/api/news] NEWS_API_KEY environment variable is not set');
    return res.status(500).json({ 
      error: 'Server configuration error',
      message: 'NEWS_API_KEY is not configured. Please check your environment variables.'
    });
  }

  try {
    // Clean old cache entries periodically
    cleanCache();
    
    // Parse filter parameters from query
    const filters: FilterOptions = {
      dateRange: req.query.dateRange as string || 'all',
      country: req.query.country as string || 'all',
      sourceQuality: req.query.sourceQuality as string || 'all'
    };

    const filterKey = JSON.stringify(filters);
    console.log('[/api/news] Called with filters:', filters);
    console.log('[/api/news] Filter key:', filterKey);
    
    // Check for force refresh parameter
    const forceRefresh = req.query.forceRefresh === 'true';
    
    // Get cached entry for this filter combination
    const cachedEntry = articlesCache.get(filterKey);
    const shouldUseCache = !forceRefresh &&
                          cachedEntry &&
                          Date.now() - cachedEntry.timestamp < CACHE_DURATION;
    
    console.log('[/api/news] Cache check:', {
      forceRefresh,
      hasCache: !!cachedEntry,
      cacheAge: cachedEntry ? Date.now() - cachedEntry.timestamp : null,
      shouldUseCache,
      totalCacheEntries: articlesCache.size
    });

    if (shouldUseCache && cachedEntry) {
      console.log('[/api/news] Returning cached articles for filter key:', filterKey);
      return res.status(200).json({ articles: cachedEntry.data });
    }
    
    console.log('[/api/news] Cache miss or expired, fetching fresh data...');

    // Fetch fresh articles from NewsAPI
    let articles: Article[] = [];
    
    console.log('[/api/news] Starting to fetch articles...');
    
    try {
      // Always use the everything endpoint for better results
      console.log('[/api/news] Fetching news with filters...');
      articles = await fetchAutoFinanceNews('relevancy', 15, filters);
      
      // If we got no results and a country was specified, try without country filter
      if (articles.length === 0 && filters.country && filters.country !== 'all') {
        console.log('[/api/news] No results for country filter, trying international search...');
        const internationalFilters = { ...filters, country: 'all' };
        articles = await fetchAutoFinanceNews('relevancy', 15, internationalFilters);
      }
      
      // If we don't get enough articles, supplement with more
      if (articles.length < 10 && (!filters.country || filters.country === 'all')) {
        const headlines = await fetchTopHeadlines('business', 'us', 10, filters);
        // Filter headlines to only include auto-related content
        const autoHeadlines = headlines.filter(article => 
          article.title.toLowerCase().includes('auto') ||
          article.title.toLowerCase().includes('car') ||
          article.title.toLowerCase().includes('vehicle') ||
          article.title.toLowerCase().includes('automotive')
        );
        
        // Combine and deduplicate based on URL
        const urlSet = new Set(articles.map(a => a.url));
        autoHeadlines.forEach(article => {
          if (!urlSet.has(article.url)) {
            articles.push(article);
          }
        });
      }

      // Limit to top 10 articles
      articles = articles.slice(0, 10);
      
      console.log(`[/api/news] Final article count: ${articles.length}`);
      
      if (articles.length === 0) {
        console.log('[/api/news] WARNING: No articles found after all filtering');
      }

      // Update cache for this filter combination
      articlesCache.set(filterKey, {
        data: articles,
        timestamp: Date.now()
      });
      
      console.log('[/api/news] Updated cache for filter key:', filterKey);
      console.log('[/api/news] Total cache entries:', articlesCache.size);
      console.log('[/api/news] Sending response with articles:', articles.length);
      
      res.status(200).json({ articles });

    } catch (apiError) {
      console.error('[/api/news] NewsAPI Error:', apiError);
      
      // If NewsAPI fails, return cached data if available for this filter
      const cachedEntry = articlesCache.get(filterKey);
      if (cachedEntry) {
        console.log('[/api/news] Returning stale cache due to API error for filter key:', filterKey);
        return res.status(200).json({ articles: cachedEntry.data });
      }
      
      // If no cache available, return error
      throw apiError;
    }

  } catch (error) {
    console.error('News API handler error:', error);
    
    // Ensure we always return JSON even if headers are already sent
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to fetch news articles',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}