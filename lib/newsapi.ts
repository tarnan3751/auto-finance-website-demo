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

// Premium news sources for auto finance
const PREMIUM_SOURCES = [
  'bloomberg',
  'reuters',
  'the-wall-street-journal',
  'financial-times',
  'cnbc',
  'business-insider'
];

// Trusted mainstream sources
const TRUSTED_SOURCES = [
  ...PREMIUM_SOURCES,
  'bbc-news',
  'cnn',
  'the-washington-post',
  'the-new-york-times',
  'usa-today',
  'associated-press'
];

export interface FilterOptions {
  dateRange?: string;
  country?: string;
  sourceQuality?: string;
}

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
  pageSize: number = 10,
  filters?: FilterOptions
): Promise<Article[]> {
  console.log('[fetchAutoFinanceNews] Called with:', { sortBy, pageSize, filters });
  
  if (!NEWS_API_KEY) {
    console.error('[fetchAutoFinanceNews] NEWS_API_KEY is not configured');
    throw new Error('NEWS_API_KEY is not configured');
  }

  try {
    // Build search query - adjust based on country/language
    let query = '(auto OR automotive OR car OR vehicle OR "auto finance" OR "car loan" OR "auto industry" OR tesla OR ford OR toyota OR EV) NOT (NBA OR NFL OR sports OR entertainment OR celebrity)';
    
    // Customize query for specific countries
    if (filters?.country && filters.country !== 'all') {
      switch (filters.country) {
        case 'jp':
          // Focus on Japanese automakers and market
          query = '(toyota OR nissan OR honda OR mazda OR subaru OR mitsubishi OR suzuki OR lexus OR "japan auto" OR "japanese car" OR "auto industry") NOT (sports OR entertainment)';
          console.log('[fetchAutoFinanceNews] Using Japan-specific query');
          break;
        case 'de':
          // Include German auto brands and terms
          query = '(auto OR automotive OR car OR vehicle OR "elektroauto" OR BMW OR Mercedes OR Volkswagen OR VW OR Audi OR Porsche OR Opel OR "auto finance" OR "autokredit") NOT (sport OR unterhaltung)';
          console.log('[fetchAutoFinanceNews] Using Germany-specific query');
          break;
        case 'fr':
          // Include French auto brands and terms
          query = '(auto OR automobile OR voiture OR véhicule OR Renault OR Peugeot OR Citroën OR Stellantis OR "crédit auto" OR "financement auto") NOT (sport OR divertissement)';
          console.log('[fetchAutoFinanceNews] Using France-specific query');
          break;
        case 'cn':
          // Include Chinese auto brands and terms for better results
          query = '(auto OR automotive OR car OR vehicle OR EV OR "electric vehicle" OR BYD OR "比亚迪" OR NIO OR "蔚来" OR Xpeng OR "小鹏" OR Li Auto OR "理想" OR Geely OR "吉利" OR "Great Wall" OR "长城") NOT (sports OR entertainment)';
          console.log('[fetchAutoFinanceNews] Using China-specific query');
          break;
      }
    }
    
    // Calculate date based on filter
    const fromDate = new Date();
    let fromDateStr = '';
    
    switch (filters?.dateRange) {
      case '24hours':
        // For free tier, use 48 hours to get more results
        fromDate.setDate(fromDate.getDate() - 2);
        fromDateStr = fromDate.toISOString().split('T')[0];
        break;
      case 'week':
        fromDate.setDate(fromDate.getDate() - 7);
        fromDateStr = fromDate.toISOString().split('T')[0];
        break;
      case 'month':
        // Maximum allowed for free tier
        fromDate.setDate(fromDate.getDate() - 30);
        fromDateStr = fromDate.toISOString().split('T')[0];
        break;
      case 'all':
        // For 'all', use maximum allowed (30 days)
        fromDate.setDate(fromDate.getDate() - 30);
        fromDateStr = fromDate.toISOString().split('T')[0];
        break;
      default:
        // Default to past week
        fromDate.setDate(fromDate.getDate() - 7);
        fromDateStr = fromDate.toISOString().split('T')[0];
    }
    
    console.log('[fetchAutoFinanceNews] Date range:', filters?.dateRange, 'From date:', fromDateStr);

    // Fetch more articles since we'll be filtering
    const params = new URLSearchParams({
      q: query,
      sortBy,
      pageSize: (pageSize * 3).toString(), // Fetch 3x to account for filtering
      from: fromDateStr,
      apiKey: NEWS_API_KEY
    });
    
    // Add language parameter based on country
    let language = 'en';
    if (filters?.country && filters.country !== 'all') {
      switch (filters.country) {
        case 'us':
          language = 'en';
          break;
        case 'gb':
          language = 'en';
          break;
        case 'ca':
          language = 'en';
          break;
        case 'au':
          language = 'en';
          break;
        case 'cn':
          // Don't specify language to get both Chinese and English content
          language = '';
          break;
        case 'de':
          language = 'de';
          break;
        case 'fr':
          language = 'fr';
          break;
        case 'jp':
          // Don't specify language to get both Japanese and English content
          language = '';
          break;
        default:
          language = 'en';
      }
    }
    if (language) {
      params.append('language', language);
    }
    console.log('[fetchAutoFinanceNews] Using language:', language || 'any', 'for country:', filters?.country);
    
    // Add country-specific domains for better targeting
    if (filters?.country && filters.country !== 'all') {
      let domains = '';
      switch (filters.country) {
        case 'us':
          domains = [
            // Major financial news
            'wsj.com',
            'bloomberg.com',
            'cnbc.com',
            'reuters.com',
            'marketwatch.com',
            'businessinsider.com',
            'forbes.com',
            'fortune.com',
            'barrons.com',
            'investopedia.com',
            
            // Major newspapers
            'nytimes.com',
            'washingtonpost.com',
            'usatoday.com',
            'latimes.com',
            'chicagotribune.com',
            
            // Auto industry specific
            'autonews.com',
            'automotivenews.com',
            'wardsauto.com',
            'greencarreports.com',
            'thetruthaboutcars.com',
            'carscoops.com',
            'motor1.com',
            'motortrend.com',
            'caranddriver.com',
            'roadandtrack.com',
            'autoblog.com',
            'jalopnik.com',
            'electrek.co',
            'insideevs.com',
            'teslarati.com',
            
            // Finance industry
            'americanbanker.com',
            'autofinancenews.net',
            'autoremarketing.com'
          ].join(',');
          break;
        case 'gb':
          domains = [
            // Major news sources
            'bbc.co.uk',
            'bbc.com',
            'theguardian.com',
            'telegraph.co.uk',
            'ft.com',
            'reuters.co.uk',
            'independent.co.uk',
            'thetimes.co.uk',
            'dailymail.co.uk',
            'standard.co.uk',
            
            // Business news
            'cityam.com',
            'thisismoney.co.uk',
            'proactiveinvestors.co.uk',
            
            // Auto specific
            'autoexpress.co.uk',
            'autocar.co.uk',
            'whatcar.com',
            'carmagazine.co.uk',
            'evo.co.uk',
            'topgear.com',
            'pistonheads.com',
            'honestjohn.co.uk',
            'parkers.co.uk',
            'carwow.co.uk',
            'drivingelectric.com',
            'motoringresearch.com',
            'am-online.com',
            'fleetnews.co.uk'
          ].join(',');
          break;
        case 'ca':
          domains = [
            // Major news sources
            'cbc.ca',
            'globalnews.ca',
            'ctvnews.ca',
            'financialpost.com',
            'theglobeandmail.com',
            'nationalpost.com',
            'thestar.com',
            'montrealgazette.com',
            'vancouversun.com',
            'ottawacitizen.com',
            
            // Business news
            'bnnbloomberg.ca',
            'canadianbusiness.com',
            
            // Auto specific
            'driving.ca',
            'auto123.com',
            'autotrader.ca',
            'wheels.ca',
            'canadianautodealer.ca',
            'autosphere.ca',
            'electric-vehiclenews.com',
            'fleetcarma.com'
          ].join(',');
          break;
        case 'au':
          domains = [
            // Major news sources
            'smh.com.au',
            'theaustralian.com.au',
            'afr.com',
            'news.com.au',
            'abc.net.au',
            'theage.com.au',
            'dailytelegraph.com.au',
            'heraldsun.com.au',
            'couriermail.com.au',
            'adelaidenow.com.au',
            
            // Business news
            'businessinsider.com.au',
            'stockhead.com.au',
            'theurbandeveloper.com',
            
            // Auto specific
            'drive.com.au',
            'carsales.com.au',
            'caradvice.com.au',
            'motoring.com.au',
            'whichcar.com.au',
            'carsguide.com.au',
            'goauto.com.au',
            'autotalk.com.au',
            'evcentral.com.au',
            'thedriven.io',
            'carexpert.com.au'
          ].join(',');
          break;
        case 'de':
          domains = 'handelsblatt.com,manager-magazin.de,wiwo.de,faz.net,sueddeutsche.de,spiegel.de,zeit.de,welt.de,auto-motor-und-sport.de,automobilwoche.de,focus.de,stern.de';
          break;
        case 'fr':
          domains = 'lesechos.fr,latribune.fr,lefigaro.fr,lemonde.fr,challenges.fr,usinenouvelle.com,largus.fr,caradisiac.com,automobile-magazine.fr,turbo.fr,bfmtv.com';
          break;
        case 'jp':
          // Comprehensive list of Japanese news domains including automotive, business, and general news
          domains = [
            // Major Japanese newspapers
            'asahi.com',
            'mainichi.jp',
            'yomiuri.co.jp',
            'sankei.com',
            'nikkei.com',
            'tokyo-np.co.jp',
            'chunichi.co.jp',
            'hokkaido-np.co.jp',
            'kahoku.co.jp',
            'nishinippon.co.jp',
            
            // Business and financial news
            'business.nikkei.com',
            'toyokeizai.net',
            'diamond.jp',
            'newspicks.com',
            'bloomberg.co.jp',
            'reuters.com/markets/asia',
            
            // Automotive specific
            'response.jp',
            'carview.yahoo.co.jp',
            'car.watch.impress.co.jp',
            'webcg.net',
            'autocar.jp',
            'motor-fan.jp',
            'bestcarweb.jp',
            'kuruma-news.jp',
            'carsensor.net',
            'goo-net.com',
            
            // News agencies and broadcasters
            'nhk.or.jp',
            'jiji.com',
            'kyodo-news.jp',
            'tv-asahi.co.jp',
            'tbs.co.jp',
            'ntv.co.jp',
            'fujitv.co.jp',
            
            // English language Japanese sources
            'japantimes.co.jp',
            'asia.nikkei.com',
            'english.kyodonews.net',
            'japantoday.com',
            'japannews.yomiuri.co.jp',
            'asahi.com/ajw',
            'mainichi.jp/english'
          ].join(',');
          break;
        case 'cn':
          domains = 'chinadaily.com.cn,scmp.com,caixinglobal.com,yicaiglobal.com,36kr.com,xinhuanet.com,peopledaily.com.cn,cgtn.com,globaltimes.cn,shine.cn,ecns.cn';
          break;
      }
      if (domains) {
        params.append('domains', domains);
        console.log('[fetchAutoFinanceNews] Using domains:', domains);
      }
    }

    // Add source quality filtering
    if (filters?.sourceQuality && filters.sourceQuality !== 'all' && filters.sourceQuality !== 'broad') {
      let sources: string[] = [];
      switch (filters.sourceQuality) {
        case 'premium':
          sources = PREMIUM_SOURCES;
          break;
        case 'trusted':
          sources = TRUSTED_SOURCES;
          break;
      }
      if (sources.length > 0) {
        // Don't use sources parameter as it might be too restrictive
        // Instead, we'll filter results after fetching
        console.log('[fetchAutoFinanceNews] Will filter by sources:', sources);
      }
    }

    console.log('[fetchAutoFinanceNews] Making request to:', `${NEWS_API_BASE_URL}/everything`);
    console.log('[fetchAutoFinanceNews] Request params:', Object.fromEntries(params));
    
    const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`, {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    const data: NewsAPIResponse = await response.json();
    console.log('[fetchAutoFinanceNews] Response status:', data.status);
    console.log('[fetchAutoFinanceNews] Total results:', data.totalResults);
    console.log('[fetchAutoFinanceNews] Articles received:', data.articles?.length || 0);
    
    // Log sample of Japanese articles if country is Japan
    if (filters?.country === 'jp' && data.articles?.length > 0) {
      console.log('[fetchAutoFinanceNews] Sample Japanese articles:');
      data.articles.slice(0, 3).forEach((article, index) => {
        console.log(`  Article ${index + 1}:`, {
          title: article.title.substring(0, 50) + '...',
          source: article.source.name,
          url: article.url,
          description: article.description?.substring(0, 50) + '...'
        });
      });
    }

    if (data.status !== 'ok') {
      console.error('[fetchAutoFinanceNews] NewsAPI Error:', data.code, data.message);
      console.error('[fetchAutoFinanceNews] Full error response:', data);
      // Provide more specific error messages
      if (data.code === 'apiKeyInvalid') {
        throw new Error('Invalid API key. Please check your NewsAPI configuration.');
      } else if (data.code === 'rateLimited') {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Filter and transform NewsAPI articles to our format
    console.log('[fetchAutoFinanceNews] Starting to filter articles...');
    const filteredArticles = data.articles
      .filter((article, index) => {
        if (!article.title || !article.url || !article.description) {
          console.log(`[fetchAutoFinanceNews] Article ${index} rejected - missing required fields`);
          return false;
        }
        
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
        
        // For non-English content, use language-appropriate terms
        let autoFinanceTerms = [
          // General auto terms
          'auto',
          'car',
          'vehicle',
          'automotive',
          
          // Major automakers
          'tesla',
          'ford',
          'gm',
          'general motors',
          'toyota',
          'volkswagen',
          'vw',
          'honda',
          'nissan',
          'stellantis',
          'chrysler',
          'jeep',
          'ram',
          'dodge',
          'hyundai',
          'kia',
          'mazda',
          'subaru',
          'bmw',
          'mercedes',
          'audi',
          'porsche',
          'rivian',
          'lucid',
          
          // Electric/Alternative fuel
          'ev',
          'electric vehicle',
          'hybrid',
          'phev',
          'plug-in hybrid',
          'battery electric',
          'hydrogen fuel cell',
          'charging station',
          
          // Auto finance specific terms
          'auto loan',
          'car loan',
          'vehicle financing',
          'auto finance',
          'car finance',
          'subprime auto',
          'prime auto',
          'auto lending',
          'vehicle leasing',
          'lease payment',
          'loan origination',
          'auto securitization',
          'abs',
          'asset-backed securities',
          'floorplan',
          'floor plan financing',
          'captive finance',
          'dealer financing',
          'indirect lending',
          'direct lending',
          'residual value',
          'loan-to-value',
          'ltv',
          'debt-to-income',
          'dti',
          'repossession',
          'repo',
          'charge-off',
          'delinquency',
          'default rate',
          'recovery rate',
          'credit union auto',
          'bank auto loan',
          
          // Industry terms
          'dealership',
          'dealer network',
          'franchise dealer',
          'independent dealer',
          'cpo',
          'certified pre-owned',
          'used car',
          'new car',
          'inventory financing',
          'wholesale auction',
          'retail automotive',
          'auto retail',
          'vehicle sales',
          'fleet sales',
          'fleet management',
          'rental car',
          'car rental',
          
          // Financial metrics
          'apr',
          'annual percentage rate',
          'interest rate',
          'credit score',
          'fico',
          'credit tier',
          'payment',
          'monthly payment',
          'down payment',
          'trade-in',
          'negative equity',
          'gap insurance',
          'extended warranty',
          'service contract',
          
          // Market/Industry
          'auto industry',
          'automotive sector',
          'auto sales',
          'vehicle market',
          'auto market',
          'saar',
          'seasonally adjusted annual rate',
          'market share',
          'production',
          'assembly plant',
          'manufacturing',
          'supply chain',
          'semiconductor shortage',
          'chip shortage',
          'inventory levels'
        ];
        
        // Add language-specific terms for better filtering
        switch (filters?.country) {
          case 'cn':
            autoFinanceTerms = [...autoFinanceTerms, '汽车', '车', '电动', '特斯拉', '比亚迪', 'byd', '蔚来', 'nio', '小鹏', 'xpeng', '理想', '长城'];
            break;
          case 'de':
            autoFinanceTerms = [...autoFinanceTerms, 'automobil', 'fahrzeug', 'elektroauto', 'autokredit', 'finanzierung', 'leasing', 'autohändler'];
            break;
          case 'fr':
            autoFinanceTerms = [...autoFinanceTerms, 'automobile', 'voiture', 'véhicule', 'crédit auto', 'financement', 'concessionnaire'];
            break;
          case 'jp':
            autoFinanceTerms = [...autoFinanceTerms, 
              // General auto terms
              '自動車', '車', '車両', 'クルマ', '乗用車',
              // Electric/hybrid
              '電気自動車', 'EV', 'ハイブリッド', 'HV', 'PHV', 'PHEV',
              // Auto finance terms
              '自動車ローン', 'カーローン', 'オートローン', '車両ローン',
              '自動車リース', 'カーリース', 'オートリース',
              '自動車金融', '自動車ファイナンス', 'オートファイナンス',
              '残価設定', '残クレ', '金利', '融資', '審査',
              // Automakers
              'トヨタ', 'ホンダ', '日産', 'マツダ', 'スバル', '三菱',
              'スズキ', 'ダイハツ', 'レクサス', 'インフィニティ', 'アキュラ',
              // Auto industry
              '自動車産業', '自動車業界', '自動車メーカー', 'カーディーラー',
              '中古車', '新車', '自動車販売', '自動車市場'
            ];
            break;
        }
        
        // Check if article contains at least one auto finance term
        const hasAutoFinanceTerm = autoFinanceTerms.some(term => combined.includes(term));
        
        if (!hasAutoFinanceTerm) {
          console.log(`[fetchAutoFinanceNews] Article ${index} rejected - no auto finance terms found`);
          console.log(`  Title: ${article.title.substring(0, 50)}...`);
        }
        
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
    
    console.log(`[fetchAutoFinanceNews] Filtered to ${filteredArticles.length} articles`);
    console.log('[fetchAutoFinanceNews] Returning articles');
    return filteredArticles;

  } catch (error) {
    console.error('[fetchAutoFinanceNews] Error fetching news from NewsAPI:', error);
    throw error;
  }
}


export async function fetchTopHeadlines(
  category: string = 'business',
  country: string = 'us',
  pageSize: number = 10,
  filters?: FilterOptions
): Promise<Article[]> {
  console.log('[fetchTopHeadlines] Called with:', { category, country, pageSize, filters });
  
  if (!NEWS_API_KEY) {
    console.error('[fetchTopHeadlines] NEWS_API_KEY is not configured');
    throw new Error('NEWS_API_KEY is not configured');
  }

  try {
    // Use country from filters if provided
    const selectedCountry = filters?.country && filters.country !== 'all' ? filters.country : country;
    console.log('[fetchTopHeadlines] Selected country:', selectedCountry);
    
    const params = new URLSearchParams({
      category,
      country: selectedCountry,
      pageSize: pageSize.toString(),
      apiKey: NEWS_API_KEY
    });
    
    // Don't use q parameter for top-headlines as it's too restrictive
    // We'll get business news and filter later

    console.log('[fetchTopHeadlines] Making request to:', `${NEWS_API_BASE_URL}/top-headlines`);
    console.log('[fetchTopHeadlines] Request params:', Object.fromEntries(params));
    
    const response = await fetch(`${NEWS_API_BASE_URL}/top-headlines?${params}`, {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    const data: NewsAPIResponse = await response.json();
    console.log('[fetchTopHeadlines] Response status:', data.status);
    console.log('[fetchTopHeadlines] Total results:', data.totalResults);
    console.log('[fetchTopHeadlines] Articles received:', data.articles?.length || 0);

    if (data.status !== 'ok') {
      console.error('[fetchTopHeadlines] NewsAPI Error:', data.code, data.message);
      console.error('[fetchTopHeadlines] Full error response:', data);
      // If country not supported, return empty array instead of throwing
      if (data.code === 'parameterInvalid' && data.message?.includes('country')) {
        console.log(`[fetchTopHeadlines] Country ${selectedCountry} not supported by NewsAPI`);
        return [];
      }
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