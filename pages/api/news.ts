import { NextApiRequest, NextApiResponse } from 'next';
import { fetchAutoFinanceNews, fetchTopHeadlines, Article } from '@lib/newsapi';

// Cache for storing articles with timestamp
let articlesCache: {
  data: Article[];
  timestamp: number;
} | null = null;

// Cache duration: 5 minutes (300000 ms)
const CACHE_DURATION = 5 * 60 * 1000;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if we have cached data that's still fresh
    if (articlesCache && Date.now() - articlesCache.timestamp < CACHE_DURATION) {
      return res.status(200).json({ articles: articlesCache.data });
    }

    // Fetch fresh articles from NewsAPI
    let articles: Article[] = [];
    
    try {
      // Try to get auto finance specific articles first
      articles = await fetchAutoFinanceNews('relevancy', 15);
      
      // If we don't get enough articles, supplement with business headlines
      if (articles.length < 10) {
        const headlines = await fetchTopHeadlines('business', 'us', 10);
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

      // Update cache
      articlesCache = {
        data: articles,
        timestamp: Date.now()
      };

      res.status(200).json({ articles });

    } catch (apiError) {
      console.error('NewsAPI Error:', apiError);
      
      // If NewsAPI fails, return cached data if available
      if (articlesCache) {
        console.log('Returning stale cache due to API error');
        return res.status(200).json({ articles: articlesCache.data });
      }
      
      // If no cache available, return error
      throw apiError;
    }

  } catch (error) {
    console.error('News API handler error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch news articles',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}