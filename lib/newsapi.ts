interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
  code?: string;
  message?: string;
}

export interface Article {
  title: string;
  summary: string;
  image: string;
  url: string;
  publishedAt: string;
  source: string;
}

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

// Auto finance related keywords for better relevance
const AUTO_FINANCE_KEYWORDS = [
  'auto finance',
  'car loans',
  'auto lending',
  'vehicle financing',
  'automotive credit',
  'auto loan rates',
  'car financing',
  'subprime auto',
  'auto delinquency',
  'vehicle leasing',
  'auto loan default',
  'car loan fraud',
  'auto finance industry',
  'automotive financial services',
  'vehicle loan'
];

export async function fetchAutoFinanceNews(
  sortBy: 'relevancy' | 'popularity' | 'publishedAt' = 'relevancy',
  pageSize: number = 10
): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not configured');
  }

  try {
    // Build more specific search query to avoid unrelated results
    // Using more specific terms and excluding sports/entertainment
    const query = '("auto finance" OR "car loan" OR "auto loan" OR "vehicle financing" OR "automotive lending" OR "car financing" OR "auto industry" OR "car sales") NOT (NBA OR NFL OR sports OR entertainment OR celebrity)';
    
    // Calculate date for last 7 days to get fresh content
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 7);
    const fromDateStr = fromDate.toISOString().split('T')[0];

    // Fetch more articles since we'll be filtering
    const params = new URLSearchParams({
      q: query,
      language: 'en',
      sortBy,
      pageSize: (pageSize * 3).toString(), // Fetch 3x to account for filtering
      from: fromDateStr,
      apiKey: NEWS_API_KEY
    });

    const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`, {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    const data: NewsAPIResponse = await response.json();

    if (data.status !== 'ok') {
      console.error('NewsAPI Error:', data.code, data.message);
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Filter and transform NewsAPI articles to our format
    return data.articles
      .filter(article => {
        if (!article.title || !article.url || !article.description) return false;
        
        // Convert to lowercase for case-insensitive matching
        const titleLower = article.title.toLowerCase();
        const descLower = (article.description || '').toLowerCase();
        const combined = titleLower + ' ' + descLower;
        
        // Exclude articles that are clearly not about auto finance
        const excludePatterns = [
          /nba/i,
          /basketball/i,
          /football/i,
          /soccer/i,
          /baseball/i,
          /sports team/i,
          /athlete/i,
          /player/i,
          /child support/i,
          /divorce/i,
          /alimony/i,
          /celebrity/i,
          /entertainment/i,
          /movie/i,
          /music/i,
          /album/i,
          /concert/i
        ];
        
        // Check if article contains any exclude patterns
        const shouldExclude = excludePatterns.some(pattern => pattern.test(combined));
        if (shouldExclude) return false;
        
        // Require at least one auto finance keyword in title or description
        const autoFinanceTerms = [
          'auto finance',
          'car loan',
          'auto loan',
          'vehicle financ',
          'auto lend',
          'car financ',
          'automotive financ',
          'auto dealer',
          'car dealer',
          'auto industry',
          'automotive industry',
          'auto sales',
          'car sales',
          'vehicle loan',
          'auto credit',
          'subprime auto',
          'auto delinquen',
          'car payment',
          'auto payment',
          'vehicle lease',
          'auto lease',
          'car market',
          'auto market',
          'used car',
          'new car',
          'auto debt',
          'car debt',
          'auto rate',
          'car rate',
          'apr',
          'annual percentage rate',
          'car buy',
          'auto buy',
          'vehicle purchase'
        ];
        
        // Check if article contains at least one auto finance term
        const hasAutoFinanceTerm = autoFinanceTerms.some(term => combined.includes(term));
        
        return hasAutoFinanceTerm;
      })
      .map(article => ({
        title: article.title,
        summary: article.description || '',
        image: article.urlToImage || '/api/placeholder/400/300',
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name
      }))
      .slice(0, pageSize); // Limit to requested number of articles

  } catch (error) {
    console.error('Error fetching news from NewsAPI:', error);
    throw error;
  }
}

export async function fetchTopHeadlines(
  category: string = 'business',
  country: string = 'us',
  pageSize: number = 10
): Promise<Article[]> {
  if (!NEWS_API_KEY) {
    throw new Error('NEWS_API_KEY is not configured');
  }

  try {
    const params = new URLSearchParams({
      category,
      country,
      q: 'auto OR automotive OR car',
      pageSize: pageSize.toString(),
      apiKey: NEWS_API_KEY
    });

    const response = await fetch(`${NEWS_API_BASE_URL}/top-headlines?${params}`, {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    const data: NewsAPIResponse = await response.json();

    if (data.status !== 'ok') {
      console.error('NewsAPI Error:', data.code, data.message);
      throw new Error(data.message || 'Failed to fetch headlines');
    }

    return data.articles
      .filter(article => article.title && article.url)
      .map(article => ({
        title: article.title,
        summary: article.description || '',
        image: article.urlToImage || '/api/placeholder/400/300',
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name
      }));

  } catch (error) {
    console.error('Error fetching headlines from NewsAPI:', error);
    throw error;
  }
}