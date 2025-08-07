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

// Comprehensive domain lists by country
const getDomainsByCountry = (country: string): string => {
  switch (country) {
    case 'us':
      return [
        // Major financial news
        'wsj.com', 'bloomberg.com', 'cnbc.com', 'reuters.com', 'marketwatch.com',
        'businessinsider.com', 'forbes.com', 'fortune.com', 'barrons.com', 'investopedia.com',
        // Major newspapers
        'nytimes.com', 'washingtonpost.com', 'usatoday.com', 'latimes.com', 'chicagotribune.com',
        // Auto industry specific
        'autonews.com', 'automotivenews.com', 'wardsauto.com', 'greencarreports.com',
        'thetruthaboutcars.com', 'carscoops.com', 'motor1.com', 'motortrend.com',
        'caranddriver.com', 'roadandtrack.com', 'autoblog.com', 'jalopnik.com',
        'electrek.co', 'insideevs.com', 'teslarati.com', 'cleantechnica.com',
        // Finance industry
        'americanbanker.com', 'autofinancenews.net', 'autoremarketing.com'
      ].join(',');
      
    case 'gb':
      return [
        // Major news sources
        'bbc.co.uk', 'bbc.com', 'theguardian.com', 'telegraph.co.uk', 'ft.com',
        'reuters.co.uk', 'independent.co.uk', 'thetimes.co.uk', 'dailymail.co.uk',
        'standard.co.uk', 'mirror.co.uk', 'thesun.co.uk',
        // Business news
        'cityam.com', 'thisismoney.co.uk', 'proactiveinvestors.co.uk', 'businessinsider.co.uk',
        // Auto specific
        'autoexpress.co.uk', 'autocar.co.uk', 'whatcar.com', 'carmagazine.co.uk',
        'evo.co.uk', 'topgear.com', 'pistonheads.com', 'honestjohn.co.uk',
        'parkers.co.uk', 'carwow.co.uk', 'drivingelectric.com', 'motoringresearch.com',
        'am-online.com', 'fleetnews.co.uk', 'carmag.co.uk'
      ].join(',');
      
    case 'ca':
      return [
        // Major news sources
        'cbc.ca', 'globalnews.ca', 'ctvnews.ca', 'financialpost.com',
        'theglobeandmail.com', 'nationalpost.com', 'thestar.com', 'montrealgazette.com',
        'vancouversun.com', 'ottawacitizen.com', 'torontosun.com', 'calgaryherald.com',
        // Business news
        'bnnbloomberg.ca', 'canadianbusiness.com', 'moneysense.ca',
        // Auto specific
        'driving.ca', 'auto123.com', 'autotrader.ca', 'wheels.ca',
        'canadianautodealer.ca', 'autosphere.ca', 'electric-vehiclenews.com',
        'fleetcarma.com', 'caamagazine.ca', 'autojournal.ca'
      ].join(',');
      
    case 'au':
      return [
        // Major news sources
        'smh.com.au', 'theaustralian.com.au', 'afr.com', 'news.com.au',
        'abc.net.au', 'theage.com.au', 'dailytelegraph.com.au', 'heraldsun.com.au',
        'couriermail.com.au', 'adelaidenow.com.au', 'perthnow.com.au',
        // Business news
        'businessinsider.com.au', 'stockhead.com.au', 'theurbandeveloper.com',
        // Auto specific
        'drive.com.au', 'carsales.com.au', 'caradvice.com.au', 'motoring.com.au',
        'whichcar.com.au', 'carsguide.com.au', 'goauto.com.au', 'autotalk.com.au',
        'evcentral.com.au', 'thedriven.io', 'carexpert.com.au', 'streetmachine.com.au',
        'motorex.com.au', 'zoommag.com.au'
      ].join(',');
      
    case 'de':
      return [
        // Major news sources
        'bild.de', 'faz.net', 'welt.de', 'zeit.de', 'sueddeutsche.de',
        'spiegel.de', 'stern.de', 'focus.de', 'tagesspiegel.de', 'handelsblatt.com',
        // Business news
        'manager-magazin.de', 'wiwo.de', 'capital.de', 'boersen-zeitung.de',
        'finance-magazin.de', 'rp-online.de',
        // Auto specific
        'auto-motor-und-sport.de', 'autobild.de', 'autozeitung.de', 'automobilwoche.de',
        'adac.de', 'motor-talk.de', 'autoscout24.de', 'mobile.de',
        'elektroauto-news.net', 'efahrer.com', 'auto-service.de', 'kfz-betrieb.de',
        'autohaus.de', 'firmenauto.de', 'atz-magazine.com'
      ].join(',');
      
    case 'fr':
      return [
        // Major news sources
        'lemonde.fr', 'lefigaro.fr', 'liberation.fr', 'lexpress.fr', 'lepoint.fr',
        'lobs.com', 'france24.com', 'bfmtv.com', '20minutes.fr', 'leparisien.fr',
        // Business news
        'lesechos.fr', 'latribune.fr', 'challenges.fr', 'capital.fr',
        'usinenouvelle.com', 'boursorama.com',
        // Auto specific
        'largus.fr', 'caradisiac.com', 'automobile-magazine.fr', 'turbo.fr',
        'autoplus.fr', 'auto-moto.com', 'automobile-propre.com', 'avem.fr',
        'lacentrale.fr', 'autosphere.fr', 'elite-auto.fr', 'motorlegend.com',
        'sportauto.fr', 'leblogauto.com'
      ].join(',');
      
    case 'jp':
      return [
        // Major newspapers
        'asahi.com', 'mainichi.jp', 'yomiuri.co.jp', 'sankei.com', 'nikkei.com',
        'tokyo-np.co.jp', 'chunichi.co.jp', 'hokkaido-np.co.jp', 'kahoku.co.jp',
        'nishinippon.co.jp', 'kyoto-np.co.jp',
        // Business and financial news
        'business.nikkei.com', 'toyokeizai.net', 'diamond.jp', 'newspicks.com',
        'bloomberg.co.jp', 'reuters.com', 'forbesjapan.com', 'president.jp',
        // Automotive specific
        'response.jp', 'carview.yahoo.co.jp', 'car.watch.impress.co.jp', 'webcg.net',
        'autocar.jp', 'motor-fan.jp', 'bestcarweb.jp', 'kuruma-news.jp',
        'carsensor.net', 'goo-net.com', 'gazoo.com', 'dime.jp',
        'clicccar.com', 'carme.jp', 'automesseweb.jp',
        // News agencies and broadcasters
        'nhk.or.jp', 'jiji.com', 'kyodo-news.jp', 'tv-asahi.co.jp',
        'tbs.co.jp', 'ntv.co.jp', 'fujitv.co.jp',
        // English language Japanese sources
        'japantimes.co.jp', 'asia.nikkei.com', 'english.kyodonews.net',
        'japantoday.com', 'japannews.yomiuri.co.jp', 'asahi.com',
        'mainichi.jp'
      ].join(',');
      
    case 'cn':
      return [
        // Major news sources
        'chinadaily.com.cn', 'scmp.com', 'globaltimes.cn', 'shine.cn',
        'ecns.cn', 'xinhuanet.com', 'peopledaily.com.cn', 'cgtn.com',
        'china.org.cn', 'english.news.cn',
        // Business and financial
        'caixinglobal.com', 'yicaiglobal.com', '36kr.com', 'technode.com',
        'kr-asia.com', 'jiemian.com', 'cls.cn', 'stcn.com',
        // Auto specific
        'carnewschina.com', 'chinaautoweb.com', 'gasgoo.com', 'd1ev.com',
        'autoinfo.com.cn', 'autohome.com.cn', 'bitauto.com', 'pcauto.com.cn',
        'xcar.com.cn', 'cheshi.com', 'cheyun.com'
      ].join(',');
      
    case 'in':
      return [
        // Major English newspapers
        'timesofindia.indiatimes.com', 'economictimes.indiatimes.com', 'hindustantimes.com',
        'indianexpress.com', 'thehindu.com', 'deccanherald.com', 'dnaindia.com',
        'business-standard.com', 'livemint.com', 'financialexpress.com', 'moneycontrol.com',
        'ndtv.com', 'india.com', 'news18.com', 'republic.world', 'zeenews.india.com',
        
        // Major Hindi newspapers
        'navbharattimes.indiatimes.com', 'amarujala.com', 'jagran.com', 'bhaskar.com',
        'patrika.com', 'livehindustan.com', 'prabhatkhabar.com', 'rajasthanpatrika.com',
        'punjabkesari.in', 'hindi.news18.com', 'aajtak.in', 'zeenews.india.com',
        
        // Business and financial news
        'businesstoday.in', 'cnbctv18.com', 'bloombergquint.com', 'thequint.com',
        'inc42.com', 'entrackr.com', 'yourstory.com', 'vccircle.com',
        'forbesindia.com', 'exchange4media.com', 'brand-equity.com',
        
        // Auto industry specific
        'autocarindia.com', 'cardekho.com', 'carwale.com', 'carandbike.com',
        'rushlane.com', 'motorbeam.com', 'gaadiwaadi.com', 'indianautosblog.com',
        'autocar.co.uk', 'overdrive.in', 'zigwheels.com', 'team-bhp.com',
        'autoportal.com', 'cartoq.com', 'motoroids.com', 'autoheadlines.com',
        
        // Regional and local sources
        'hindustantimes.com', 'mumbaimirror.com', 'tribuneindia.com', 'thestatesman.com',
        'asianage.com', 'newindianexpress.com', 'greatandhra.com', 'sakshi.com',
        'eenadu.net', 'dinamalar.com', 'mathrubhumi.com', 'malayalamanorama.com',
        
        // Technology and startup focused
        'medianama.com', 'nextbigwhat.com', 'factordaily.com', 'trak.in',
        'indianweb2.com', 'dazeinfo.com', 'pluginindia.com', 'indianstartupnews.com'
      ].join(',');
      
    default:
      return '';
  }
};

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
    // Build balanced search query - more inclusive while still filtering obvious non-auto content
    let query = '((auto OR automotive OR car OR vehicle OR "electric vehicle" OR EV OR SUV OR truck OR dealership) AND (finance OR loan OR sales OR market OR industry OR business OR manufacturer OR production OR dealer)) OR (Tesla OR Ford OR GM OR "General Motors" OR Toyota OR Volkswagen OR Honda OR Nissan OR Stellantis OR Hyundai OR BMW OR Mercedes) NOT (NBA OR NFL OR "video game" OR celebrity OR entertainment OR divorce)';
    
    // Customize query for specific countries with comprehensive terms
    if (filters?.country && filters.country !== 'all') {
      switch (filters.country) {
        case 'jp':
          // Japanese query - comprehensive terms
          query = '((自動車 OR 車 OR クルマ OR 乗用車 OR EV OR 電気自動車 OR ハイブリッド) AND (ローン OR 金融 OR 販売 OR 市場 OR 産業 OR ビジネス OR ディーラー OR リース)) OR (トヨタ OR ホンダ OR 日産 OR マツダ OR スバル OR 三菱 OR スズキ OR ダイハツ OR レクサス) NOT (スポーツ OR 芸能 OR ゲーム OR エンタメ)';
          console.log('[fetchAutoFinanceNews] Using Japan-specific comprehensive query');
          break;
          
        case 'de':
          // German query - comprehensive terms
          query = '((Auto OR Automobil OR Fahrzeug OR PKW OR Kraftfahrzeug OR Elektroauto OR E-Auto OR Hybrid) AND (Kredit OR Finanzierung OR Leasing OR Verkauf OR Markt OR Industrie OR Geschäft OR Händler OR Autohaus)) OR (BMW OR Mercedes OR Volkswagen OR VW OR Audi OR Porsche OR Opel OR Ford OR Tesla) NOT (Sport OR Fußball OR Unterhaltung OR Spiel OR Promi)';
          console.log('[fetchAutoFinanceNews] Using Germany-specific comprehensive query');
          break;
          
        case 'fr':
          // French query - comprehensive terms
          query = '((automobile OR voiture OR véhicule OR auto OR électrique OR hybride) AND (crédit OR prêt OR financement OR leasing OR LOA OR LLD OR vente OR marché OR industrie OR concessionnaire)) OR (Renault OR Peugeot OR Citroën OR Stellantis OR Dacia OR Alpine) NOT (sport OR football OR divertissement OR jeu OR célébrité)';
          console.log('[fetchAutoFinanceNews] Using France-specific comprehensive query');
          break;
          
        case 'cn':
          // Chinese query - comprehensive terms
          query = '((汽车 OR 车 OR 轿车 OR 车辆 OR 电动车 OR 新能源 OR 混动) AND (贷款 OR 金融 OR 融资 OR 租赁 OR 销售 OR 市场 OR 产业 OR 商业 OR 经销商)) OR (比亚迪 OR BYD OR 蔚来 OR NIO OR 小鹏 OR 理想 OR 吉利 OR 长城 OR 长安 OR 上汽 OR 广汽) NOT (体育 OR 娱乐 OR 游戏 OR 明星)';
          console.log('[fetchAutoFinanceNews] Using China-specific comprehensive query');
          break;
          
        case 'in':
          // Optimized Hindi/English query for India - under 500 chars
          query = '((कार OR गाड़ी OR वाहन OR auto OR car OR vehicle) AND (लोन OR वित्त OR loan OR finance OR EMI OR market OR sales)) OR (मारुति OR टाटा OR महिंद्रा OR Maruti OR Tata OR Mahindra OR Bajaj OR Hero) NOT (खेल OR sports OR cricket OR मनोरंजन OR entertainment OR bollywood)';
          console.log('[fetchAutoFinanceNews] Using India-specific optimized query (under 500 chars)');
          break;
          
        case 'us':
        case 'gb':
        case 'ca':
        case 'au':
          // English-speaking countries - optimized query under 500 chars
          query = '((auto OR automotive OR car OR vehicle OR EV) AND (finance OR loan OR lease OR credit OR sales OR market)) OR ((Ford OR GM OR Tesla OR Toyota OR Stellantis OR Honda OR Nissan OR Hyundai) AND (sales OR market OR finance OR production)) NOT (NBA OR NFL OR NHL OR "video game" OR celebrity OR crime)';
          console.log('[fetchAutoFinanceNews] Using optimized English query (under 500 chars)');
          break;
      }
    }
    
    // Calculate date based on filter - accounting for NewsAPI free tier 1-day delay
    const fromDate = new Date();
    let fromDateStr = '';
    
    switch (filters?.dateRange) {
      case '24hours':
        // Free tier has 1-day delay, so "24 hours" means articles from 2-3 days ago
        // Set to 3 days ago to ensure we capture articles from "yesterday" (which are actually 2 days old)
        fromDate.setDate(fromDate.getDate() - 3);
        fromDateStr = fromDate.toISOString().split('T')[0];
        console.log('[fetchAutoFinanceNews] 24-hour filter: fetching from 3 days ago to account for API delay');
        break;
      case 'week':
        // For week filter, extend to 8 days to account for delay
        fromDate.setDate(fromDate.getDate() - 8);
        fromDateStr = fromDate.toISOString().split('T')[0];
        console.log('[fetchAutoFinanceNews] Week filter: fetching from 8 days ago to account for API delay');
        break;
      case 'month':
        // Maximum allowed for free tier (30 days) - no need to extend further
        fromDate.setDate(fromDate.getDate() - 30);
        fromDateStr = fromDate.toISOString().split('T')[0];
        console.log('[fetchAutoFinanceNews] Month filter: fetching from 30 days ago (API maximum)');
        break;
      case 'all':
        // For 'all', use maximum allowed (30 days) - this is the API limit
        fromDate.setDate(fromDate.getDate() - 30);
        fromDateStr = fromDate.toISOString().split('T')[0];
        console.log('[fetchAutoFinanceNews] All time filter: fetching from 30 days ago (API maximum)');
        break;
      default:
        // Default to past week with delay adjustment
        fromDate.setDate(fromDate.getDate() - 8);
        fromDateStr = fromDate.toISOString().split('T')[0];
        console.log('[fetchAutoFinanceNews] Default filter: fetching from 8 days ago to account for API delay');
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
        case 'gb':
        case 'ca':
        case 'au':
          language = 'en';
          break;
        case 'cn':
          // For China, don't specify language to get both Chinese and English content
          language = '';
          break;
        case 'jp':
          // For Japan, don't specify language to get both Japanese and English content
          language = '';
          break;
        case 'de':
          language = 'de';
          break;
        case 'fr':
          language = 'fr';
          break;
        case 'in':
          // For India, don't specify language to get both Hindi and English content
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
    
    // Add comprehensive country-specific domains
    if (filters?.country && filters.country !== 'all') {
      const domains = getDomainsByCountry(filters.country);
      if (domains) {
        params.append('domains', domains);
        console.log('[fetchAutoFinanceNews] Using comprehensive domains for country:', filters.country);
      }
    }

    // Add source quality filtering if specified
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
        console.log('[fetchAutoFinanceNews] Will filter by source quality:', filters.sourceQuality);
      }
    }

    console.log('[fetchAutoFinanceNews] Making request to:', `${NEWS_API_BASE_URL}/everything`);
    
    const response = await fetch(`${NEWS_API_BASE_URL}/everything?${params}`, {
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    const data: NewsAPIResponse = await response.json();
    console.log('[fetchAutoFinanceNews] Response status:', data.status);
    console.log('[fetchAutoFinanceNews] Total results:', data.totalResults);
    console.log('[fetchAutoFinanceNews] Articles received:', data.articles?.length || 0);

    if (data.status !== 'ok') {
      console.error('[fetchAutoFinanceNews] NewsAPI Error:', data.code, data.message);
      if (data.code === 'apiKeyInvalid') {
        throw new Error('Invalid API key. Please check your NewsAPI configuration.');
      } else if (data.code === 'rateLimited') {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error(data.message || 'Failed to fetch news');
    }

    // Filter and transform NewsAPI articles to our format
    console.log('[fetchAutoFinanceNews] Starting to filter articles...');
    
    // Helper function to check whole word boundaries
    const hasWholeWord = (text: string, word: string): boolean => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    };
    
    // Helper function to calculate relevance score
    const calculateRelevanceScore = (article: NewsAPIArticle, country?: string): number => {
      const title = article.title.toLowerCase();
      const description = (article.description || '').toLowerCase();
      const combined = title + ' ' + description;
      let score = 0;
      
      // Get terms based on country
      const financeContext = getFinanceContextTerms(country);
      const autoTerms = getAutoTerms(country);
      const brandTerms = getBrandTerms(country);
      const exclusionTerms = getExclusionTerms(country);
      const businessContext = getBusinessContextTerms(country);
      
      // First, check for strong exclusion patterns (immediate disqualification)
      const strongExclusions = getStrongExclusionPatterns();
      for (const pattern of strongExclusions) {
        if (pattern.test(combined)) {
          return -1000; // Immediate disqualification
        }
      }
      
      // Check for soft exclusion terms (negative scoring but not disqualifying)
      for (const term of exclusionTerms) {
        if (typeof term === 'string' && hasWholeWord(combined, term)) {
          score -= 30; // Moderate penalty
        } else if (term instanceof RegExp && term.test(combined)) {
          score -= 30;
        }
      }
      
      // TIERED SCORING SYSTEM
      let hasAutoTerm = false;
      let hasFinanceContext = false;
      let hasBrandMention = false;
      let hasBusinessContext = false;
      let autoScore = 0;
      let financeScore = 0;
      
      // Score automotive terms
      for (const term of autoTerms) {
        if (term.includes(' ')) {
          // Compound terms (e.g., "auto loan") get higher score
          if (combined.includes(term)) {
            autoScore += 20;
            hasAutoTerm = true;
            if (title.includes(term)) {
              autoScore += 15;
            }
          }
        } else if (hasWholeWord(combined, term)) {
          autoScore += 8;
          hasAutoTerm = true;
          if (hasWholeWord(title, term)) {
            autoScore += 7;
          }
        }
      }
      
      // Score finance context
      for (const term of financeContext) {
        if (hasWholeWord(combined, term)) {
          financeScore += 12;
          hasFinanceContext = true;
          if (hasWholeWord(title, term)) {
            financeScore += 8;
          }
        }
      }
      
      // Score brand mentions
      let brandScore = 0;
      for (const brand of brandTerms) {
        if (hasWholeWord(combined, brand)) {
          brandScore += 8;
          hasBrandMention = true;
          if (hasWholeWord(title, brand)) {
            brandScore += 5;
          }
        }
      }
      
      // Score business context (sales, market, industry, etc.)
      let businessScore = 0;
      for (const term of businessContext) {
        if (hasWholeWord(combined, term)) {
          businessScore += 5;
          hasBusinessContext = true;
        }
      }
      
      // Calculate base score
      score += autoScore + financeScore + brandScore + businessScore;
      
      // INCLUSIVE SCORING RULES
      if (hasAutoTerm && hasFinanceContext) {
        score += 15; // Ideal combination
      } else if (hasAutoTerm && hasBusinessContext) {
        score += 8; // Good combination
      } else if (hasBrandMention && (hasFinanceContext || hasBusinessContext)) {
        score += 5; // Brand with context
      } else if (hasAutoTerm && autoScore >= 15) {
        score -= 5; // Strong auto-only content
      } else if (hasBrandMention && brandScore >= 10) {
        score -= 10; // Strong brand focus
      } else if (!hasAutoTerm && !hasBrandMention) {
        score -= 50; // No auto or brand content
      }
      
      // Special boost for highly relevant phrases
      const highValuePhrases = getHighValuePhrases(country);
      for (const phrase of highValuePhrases) {
        if (combined.includes(phrase.toLowerCase())) {
          score += 30;
        }
      }
      
      // Additional context bonuses
      if (combined.includes('electric vehicle') || combined.includes('ev ') || hasWholeWord(combined, 'ev')) {
        score += 10;
      }
      if (combined.includes('dealership') || combined.includes('dealer')) {
        score += 8;
      }
      if (combined.includes('auto industry') || combined.includes('automotive industry')) {
        score += 12;
      }
      
      return score;
    };
    
    // Comprehensive term getters with full translations for all countries
    const getFinanceContextTerms = (country?: string): string[] => {
      const baseTerms = [
        'loan', 'financing', 'finance', 'credit', 'lending', 'lender', 'borrowing',
        'apr', 'interest', 'rate', 'payment', 'lease', 'leasing', 'rental',
        'bank', 'financial', 'debt', 'delinquency', 'default', 'repossession',
        'securitization', 'underwriting', 'origination', 'portfolio', 'asset',
        'subprime', 'prime', 'risk', 'insurance', 'warranty', 'coverage',
        'refinance', 'refinancing', 'approval', 'application', 'qualify'
      ];
      
      switch (country) {
        case 'de':
          return [...baseTerms,
            'kredit', 'darlehen', 'finanzierung', 'kreditgeber', 'zinsen', 'zinssatz',
            'rate', 'zahlung', 'leasing', 'miete', 'bank', 'sparkasse', 'volksbank',
            'versicherung', 'garantie', 'schulden', 'verzug', 'ausfall', 'pfändung',
            'verbriefung', 'risikoprüfung', 'kreditwürdigkeit', 'bonität', 'schufa',
            'refinanzierung', 'umschuldung', 'genehmigung', 'antrag', 'qualifikation',
            'effektivzins', 'sollzins', 'tilgung', 'laufzeit', 'anzahlung'
          ];
          
        case 'fr':
          return [...baseTerms,
            'crédit', 'prêt', 'emprunt', 'financement', 'prêteur', 'taux', 'intérêt',
            'mensualité', 'paiement', 'versement', 'leasing', 'loa', 'lld', 'location',
            'banque', 'financier', 'dette', 'défaut', 'défaillance', 'saisie',
            'titrisation', 'souscription', 'origination', 'portefeuille', 'actif',
            'subprime', 'prime', 'risque', 'assurance', 'garantie', 'couverture',
            'refinancement', 'rachat', 'approbation', 'demande', 'qualification',
            'taeg', 'teg', 'remboursement', 'durée', 'apport', 'acompte'
          ];
          
        case 'jp':
          return [...baseTerms,
            'ローン', 'ロン', '融資', 'ゆうし', '貸付', 'かしつけ', '借入', 'かりいれ',
            '金利', 'きんり', '利息', 'りそく', '利率', 'りりつ', '支払い', 'しはらい',
            'リース', 'りーす', 'レンタル', 'れんたる', '賃貸', 'ちんたい',
            '銀行', 'ぎんこう', '金融', 'きんゆう', '債務', 'さいむ', '延滞', 'えんたい',
            'デフォルト', 'でふぉると', '差し押さえ', 'さしおさえ', '回収', 'かいしゅう',
            '証券化', 'しょうけんか', '引受', 'ひきうけ', '審査', 'しんさ',
            'サブプライム', 'さぶぷらいむ', 'プライム', 'ぷらいむ', 'リスク', 'りすく',
            '保険', 'ほけん', '保証', 'ほしょう', 'カバー', 'かばー',
            '借り換え', 'かりかえ', '承認', 'しょうにん', '申請', 'しんせい',
            '金融機関', 'きんゆうきかん', '信用', 'しんよう', '与信', 'よしん',
            '残価設定', 'ざんかせってい', '残クレ', 'ざんくれ', '頭金', 'あたまきん'
          ];
          
        case 'cn':
          return [...baseTerms,
            '贷款', '贷', '融资', '借款', '借贷', '信贷', '放贷', '贷方',
            '利率', '利息', '年利率', '月供', '还款', '支付', '付款',
            '租赁', '融资租赁', '经营租赁', '出租', '承租',
            '银行', '金融', '金融机构', '债务', '违约', '拖欠', '逾期',
            '资产证券化', '承销', '发放', '组合', '资产',
            '次贷', '次级', '优质', '风险', '保险', '保修', '保障',
            '再融资', '转贷', '审批', '申请', '资质', '资格',
            '首付', '月付', '年化', '征信', '信用', '评级', '担保'
          ];
          
        case 'in':
          return [...baseTerms,
            // Hindi finance terms
            'लोन', 'ऋण', 'कर्ज', 'वित्त', 'फाइनेंस', 'वित्तपोषण', 'फंडिंग',
            'ब्याज', 'दर', 'ब्याज दर', 'किस्त', 'EMI', 'मासिक किस्त',
            'भुगतान', 'पेमेंट', 'चुकाना', 'अदायगी', 'लीज', 'किराया',
            'बैंक', 'बैंकिंग', 'वित्तीय', 'कर्ज', 'डिफॉल्ट', 'चूक',
            'सिक्यूरिटी', 'गारंटी', 'जमानत', 'रिस्क', 'जोखिम', 'बीमा',
            'रिफाइनेंसिंग', 'एप्रूवल', 'अनुमोदन', 'आवेदन', 'योग्यता',
            'डाउन पेमेंट', 'अग्रिम', 'सब्सिडी', 'क्रेडिट', 'CIBIL', 'स्कोर',
            // Mixed Hindi-English terms commonly used
            'कार लोन', 'ऑटो लोन', 'व्हीकल लोन', 'बाइक लोन', 'टू व्हीलर लोन',
            'कमर्शियल व्हीकल', 'इंश्योरेंस', 'रजिस्ट्रेशन', 'RTO', 'RC'
          ];
          
        default:
          return baseTerms;
      }
    };
    
    const getBusinessContextTerms = (country?: string): string[] => {
      const baseTerms = [
        'sales', 'market', 'industry', 'business', 'revenue', 'earnings', 'income',
        'profit', 'growth', 'demand', 'supply', 'production', 'manufacturing',
        'quarterly', 'annual', 'forecast', 'outlook', 'analysis', 'report', 'study',
        'investment', 'stock', 'shares', 'valuation', 'acquisition', 'merger',
        'partnership', 'expansion', 'strategy', 'innovation', 'technology',
        'startup', 'venture', 'funding', 'capital', 'ipo', 'listing'
      ];
      
      switch (country) {
        case 'de':
          return [...baseTerms,
            'verkauf', 'absatz', 'markt', 'industrie', 'geschäft', 'umsatz', 'erlös',
            'gewinn', 'wachstum', 'nachfrage', 'angebot', 'produktion', 'herstellung',
            'quartal', 'jährlich', 'prognose', 'ausblick', 'analyse', 'bericht',
            'investition', 'aktie', 'anteil', 'bewertung', 'übernahme', 'fusion',
            'partnerschaft', 'expansion', 'strategie', 'innovation', 'technologie',
            'startup', 'kapital', 'börsengang', 'notierung'
          ];
          
        case 'fr':
          return [...baseTerms,
            'ventes', 'marché', 'industrie', 'affaires', 'revenus', 'bénéfices',
            'profit', 'croissance', 'demande', 'offre', 'production', 'fabrication',
            'trimestriel', 'annuel', 'prévision', 'perspectives', 'analyse', 'rapport',
            'investissement', 'action', 'parts', 'valorisation', 'acquisition', 'fusion',
            'partenariat', 'expansion', 'stratégie', 'innovation', 'technologie',
            'startup', 'capital', 'introduction', 'cotation'
          ];
          
        case 'jp':
          return [...baseTerms,
            '販売', 'はんばい', '売上', 'うりあげ', '市場', 'しじょう', '産業', 'さんぎょう',
            'ビジネス', 'びじねす', '収益', 'しゅうえき', '利益', 'りえき',
            '成長', 'せいちょう', '需要', 'じゅよう', '供給', 'きょうきゅう',
            '生産', 'せいさん', '製造', 'せいぞう', '四半期', 'しはんき',
            '年間', 'ねんかん', '予測', 'よそく', '見通し', 'みとおし',
            '分析', 'ぶんせき', 'レポート', 'れぽーと', '投資', 'とうし',
            '株式', 'かぶしき', '評価', 'ひょうか', '買収', 'ばいしゅう',
            '合併', 'がっぺい', '提携', 'ていけい', '拡大', 'かくだい',
            '戦略', 'せんりゃく', 'イノベーション', 'いのべーしょん',
            'スタートアップ', 'すたーとあっぷ', '資本', 'しほん', '上場', 'じょうじょう'
          ];
          
        case 'cn':
          return [...baseTerms,
            '销售', '销量', '市场', '市场', '产业', '行业', '业务', '商业',
            '营收', '收入', '盈利', '利润', '增长', '需求', '供应', '供给',
            '生产', '制造', '季度', '年度', '预测', '展望', '分析', '报告',
            '投资', '股票', '股份', '估值', '收购', '并购', '兼并',
            '合作', '伙伴', '扩张', '战略', '创新', '技术', '科技',
            '创业', '初创', '融资', '资本', '上市', 'IPO'
          ];
          
        case 'in':
          return [...baseTerms,
            // Hindi business terms
            'बिक्री', 'सेल्स', 'बाजार', 'मार्केट', 'उद्योग', 'इंडस्ट्री', 'व्यापार', 'बिज़नेस',
            'आय', 'कमाई', 'रेवेन्यू', 'मुनाफा', 'लाभ', 'प्रॉफिट', 'वृद्धि', 'ग्रोथ',
            'मांग', 'डिमांड', 'आपूर्ति', 'सप्लाई', 'उत्पादन', 'प्रोडक्शन', 'निर्माण',
            'तिमाही', 'क्वार्टर', 'वार्षिक', 'सालाना', 'पूर्वानुमान', 'फोरकास्ट',
            'विश्लेषण', 'एनालिसिस', 'रिपोर्ट', 'निवेश', 'इन्वेस्टमेंट', 'शेयर',
            'स्टॉक', 'वैल्यूएशन', 'अधिग्रहण', 'एक्विज़िशन', 'विलय', 'मर्जर',
            'साझेदारी', 'पार्टनरशिप', 'विस्तार', 'एक्सपेंशन', 'रणनीति', 'स्ट्रैटेजी',
            'नवाचार', 'इनोवेशन', 'तकनीक', 'टेक्नोलॉजी', 'स्टार्टअप', 'कैपिटल',
            // Common mixed terms
            'IPO', 'BSE', 'NSE', 'SEBI', 'FDI', 'GDP', 'GST', 'MSME'
          ];
          
        default:
          return baseTerms;
      }
    };
    
    const getAutoTerms = (country?: string): string[] => {
      const baseTerms = [
        'auto', 'car', 'cars', 'automotive', 'automobile', 'vehicle', 'vehicles',
        'dealership', 'dealer', 'dealers', 'automaker', 'automakers', 'manufacturer',
        'suv', 'suvs', 'sedan', 'sedans', 'truck', 'trucks', 'pickup', 'crossover',
        'minivan', 'van', 'coupe', 'convertible', 'hatchback', 'wagon',
        'electric', 'hybrid', 'phev', 'bev', 'fuel cell', 'ev', 'evs', 'battery',
        'fleet', 'rental', 'used car', 'used cars', 'certified', 'cpo', 'new car',
        'new cars', 'pre-owned', 'driving', 'driver', 'drivers', 'motor', 'engine'
      ];
      
      // Add specific compound terms that should match exactly
      const compoundTerms = [
        'auto loan', 'car loan', 'vehicle loan', 'auto loans', 'car loans',
        'auto finance', 'car finance', 'vehicle finance', 'automotive finance',
        'auto lending', 'car lending', 'vehicle lending', 'auto lender',
        'auto dealer', 'car dealer', 'vehicle dealer', 'auto dealers', 'car dealers',
        'auto sales', 'car sales', 'vehicle sales', 'auto sale', 'car sale',
        'auto industry', 'car industry', 'automotive industry', 'auto sector',
        'auto market', 'car market', 'vehicle market', 'automotive market',
        'car manufacturer', 'auto manufacturer', 'vehicle manufacturer',
        'car company', 'auto company', 'automotive company',
        'car buying', 'car shopping', 'vehicle purchase', 'auto insurance'
      ];
      
      switch (country) {
        case 'de':
          return [...baseTerms, ...compoundTerms,
            'automobil', 'auto', 'wagen', 'fahrzeug', 'pkw', 'kraftfahrzeug', 'kfz',
            'autohaus', 'autohändler', 'händler', 'hersteller', 'automobilhersteller',
            'geländewagen', 'suv', 'limousine', 'kombi', 'kleinwagen', 'transporter',
            'elektroauto', 'e-auto', 'hybrid', 'hybridfahrzeug', 'elektrofahrzeug',
            'batterie', 'akku', 'brennstoffzelle', 'wasserstoff',
            'gebrauchtwagen', 'neuwagen', 'jahreswagen', 'vorführwagen',
            'flotte', 'fuhrpark', 'mietwagen', 'leihwagen',
            'autokredit', 'kfz-finanzierung', 'autoleasing', 'autoversicherung',
            'automobilwirtschaft', 'automarkt', 'automobilindustrie', 'automobilbranche'
          ];
          
        case 'fr':
          return [...baseTerms, ...compoundTerms,
            'automobile', 'auto', 'voiture', 'véhicule', 'berline', 'break',
            'concessionnaire', 'garage', 'garagiste', 'constructeur', 'fabricant',
            'suv', '4x4', 'monospace', 'citadine', 'utilitaire', 'fourgon',
            'électrique', 'hybride', 'hybride rechargeable', 'thermique',
            'batterie', 'pile à combustible', 'hydrogène',
            'occasion', 'neuf', 'neuve', 'démonstration',
            'flotte', 'parc', 'location', 'crédit auto', 'prêt auto',
            'financement automobile', 'leasing', 'loa', 'lld',
            'industrie automobile', 'marché automobile', 'secteur automobile'
          ];
          
        case 'jp':
          return [...baseTerms, ...compoundTerms,
            '自動車', 'じどうしゃ', '車', 'くるま', '車両', 'しゃりょう',
            'クルマ', 'くるま', '乗用車', 'じょうようしゃ', '軽自動車', 'けいじどうしゃ',
            'ディーラー', 'でぃーらー', '販売店', 'はんばいてん', 'メーカー', 'めーかー',
            '自動車メーカー', 'じどうしゃめーかー', '製造業', 'せいぞうぎょう',
            'SUV', 'セダン', 'せだん', 'ワゴン', 'わごん', 'ミニバン', 'みにばん',
            'トラック', 'とらっく', 'バン', 'ばん', 'クーペ', 'くーぺ',
            '電気自動車', 'でんきじどうしゃ', 'EV', 'ハイブリッド', 'はいぶりっど',
            'HV', 'PHV', 'PHEV', 'FCV', '燃料電池', 'ねんりょうでんち',
            'バッテリー', 'ばってりー', '電池', 'でんち', '水素', 'すいそ',
            '中古車', 'ちゅうこしゃ', '新車', 'しんしゃ', '認定中古車', 'にんていちゅうこしゃ',
            'レンタカー', 'れんたかー', 'カーシェア', 'かーしぇあ',
            '自動車ローン', 'じどうしゃろーん', 'カーローン', 'かーろーん',
            'オートローン', 'おーとろーん', '自動車リース', 'じどうしゃりーす',
            '自動車産業', 'じどうしゃさんぎょう', '自動車業界', 'じどうしゃぎょうかい',
            '自動車市場', 'じどうしゃしじょう'
          ];
          
        case 'cn':
          return [...baseTerms, ...compoundTerms,
            '汽车', '车', '轿车', '车辆', '乘用车', '商用车', '客车',
            '经销商', '4S店', '车商', '制造商', '车企', '主机厂', '整车厂',
            'SUV', '越野车', '轿车', '面包车', '皮卡', 'MPV', '跑车',
            '电动车', '电动汽车', '新能源', '新能源车', '混动', '混合动力',
            '插电混动', '纯电', '氢能源', '燃料电池', '电池', '动力电池',
            '二手车', '新车', '认证二手车', '平行进口', '进口车',
            '租车', '汽车租赁', '车队', '网约车', '共享汽车',
            '汽车贷款', '车贷', '汽车金融', '汽车融资', '融资租赁',
            '汽车保险', '车险', '汽车产业', '汽车行业', '汽车市场',
            '造车新势力', '传统车企'
          ];
          
        case 'in':
          return [...baseTerms, ...compoundTerms,
            // Hindi auto terms
            'ऑटो', 'कार', 'गाड़ी', 'वाहन', 'मोटर', 'गाड़ी', 'सवारी',
            'ऑटोमोबाइल', 'मोटरसाइकिल', 'बाइक', 'स्कूटर', 'दोपहिया',
            'चारपहिया', 'ट्रक', 'बस', 'लॉरी', 'टेम्पो', 'ऑटो रिक्शा',
            // Vehicle types in Hindi
            'सेडान', 'हैचबैक', 'SUV', 'MUV', 'कॉम्पैक्ट', 'लग्जरी',
            'इलेक्ट्रिक', 'हाइब्रिड', 'पेट्रोल', 'डीजल', 'CNG', 'LPG',
            // Dealers and industry
            'डीलर', 'डीलरशिप', 'शोरूम', 'गैराज', 'सर्विस सेंटर',
            'निर्माता', 'मेकर', 'कंपनी', 'ब्रांड', 'मॉडल',
            // Vehicle conditions and services
            'नई', 'नया', 'पुराना', 'सेकंड हैंड', 'प्री ओन्ड', 'यूज्ड',
            'सर्टिफाइड', 'वारंटी', 'गारंटी', 'सर्विसिंग', 'मेंटेनेंस',
            'स्पेयर पार्ट्स', 'एक्सेसरीज', 'टायर', 'बैटरी', 'इंजन',
            // Financial terms specific to auto
            'कार लोन', 'बाइक लोन', 'ऑटो लोन', 'व्हीकल फाइनेंस',
            'टू व्हीलर लोन', 'कमर्शियल व्हीकल लोन', 'रेंटल', 'लीज',
            'इंश्योरेंस', 'बीमा', 'रजिस्ट्रेशन', 'RC', 'PUC', 'RTO',
            'फास्टैग', 'नंबर प्लेट', 'चालान', 'लाइसेंस', 'ड्राइविंग',
            // Industry and market terms
            'ऑटो इंडस्ट्री', 'वाहन उद्योग', 'कार मार्केट', 'ऑटो सेक्टर',
            'सेल्स', 'बिक्री', 'लॉन्च', 'फेसलिफ्ट', 'अपडेट'
          ];
          
        default:
          return [...baseTerms, ...compoundTerms];
      }
    };
    
    const getBrandTerms = (country?: string): string[] => {
      const globalBrands = [
        'toyota', 'ford', 'general motors', 'gm', 'stellantis', 'volkswagen', 'vw',
        'honda', 'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'mitsubishi',
        'bmw', 'mercedes', 'mercedes-benz', 'audi', 'porsche', 'volvo',
        'tesla', 'rivian', 'lucid', 'polestar', 'nio', 'xpeng', 'byd',
        'chrysler', 'jeep', 'ram', 'dodge', 'chevrolet', 'buick', 'cadillac', 'gmc',
        'lexus', 'acura', 'infiniti', 'genesis', 'alfa romeo', 'maserati', 'ferrari',
        'lamborghini', 'bentley', 'rolls-royce', 'aston martin', 'jaguar', 'land rover'
      ];
      
      // Add country-specific brands
      switch (country) {
        case 'de':
          return [...globalBrands, 'opel', 'smart', 'maybach', 'borgward', 'alpina'];
          
        case 'fr':
          return [...globalBrands, 'renault', 'peugeot', 'citroën', 'dacia', 'alpine', 'ds'];
          
        case 'jp':
          return [...globalBrands,
            'トヨタ', 'ホンダ', '日産', 'マツダ', 'スバル', '三菱', 'スズキ',
            'ダイハツ', 'レクサス', 'インフィニティ', 'アキュラ', 'いすゞ', '日野'
          ];
          
        case 'cn':
          return [...globalBrands,
            '比亚迪', 'byd', '蔚来', 'nio', '小鹏', 'xpeng', '理想', 'li auto',
            '吉利', 'geely', '长城', 'great wall', '长安', 'changan', '上汽', 'saic',
            '广汽', 'gac', '一汽', 'faw', '东风', 'dongfeng', '奇瑞', 'chery',
            '哈弗', 'haval', '红旗', 'hongqi', '五菱', 'wuling', '宝骏', 'baojun'
          ];
          
        case 'in':
          return [...globalBrands,
            // Major Indian auto brands
            'maruti', 'maruti suzuki', 'suzuki', 'tata', 'tata motors', 'mahindra',
            'bajaj', 'bajaj auto', 'hero', 'hero motocorp', 'tvs', 'tvs motor',
            'ashok leyland', 'eicher', 'force motors', 'mahindra mahindra',
            'royal enfield', 'indian motorcycles', 'ola electric', 'ather',
            // Hindi brand names
            'मारुति', 'टाटा', 'महिंद्रा', 'बजाज', 'हीरो', 'टीवीएस',
            'अशोक लीलैंड', 'आइचर', 'रॉयल एनफील्ड', 'ओला', 'अदर',
            // Luxury and international brands popular in India
            'mercedes benz', 'bmw', 'audi', 'jaguar', 'land rover', 'volvo',
            'skoda', 'volkswagen', 'renault', 'nissan', 'ford', 'chevrolet',
            'fiat', 'jeep', 'mini cooper', 'porsche', 'lamborghini', 'ferrari',
            // Commercial vehicle brands
            'bharat benz', 'man', 'scania', 'volvo trucks', 'tata ace',
            'mahindra bolero', 'mahindra scorpio', 'maruti swift', 'hyundai creta'
          ];
          
        default:
          return globalBrands;
      }
    };
    
    // Strong exclusions that immediately disqualify an article
    const getStrongExclusionPatterns = (): RegExp[] => {
      return [
        // Healthcare - very specific patterns
        /\bauto-?immune\s+(disease|disorder|condition)/i,
        /\bauto-?injector\s+(pen|device|medication)/i,
        /\bautomatic\s+insulin/i,
        
        // Pure sports content
        /\b(nba|nfl|mlb|nhl)\s+(game|player|team|season|playoff)/i,
        /\b(basketball|football|baseball|soccer)\s+(player|team|game|match)/i,
        
        // Pure entertainment
        /\b(movie|film|album|concert)\s+(review|release|premiere)/i,
        /\bcelebrity\s+(news|gossip|scandal)/i,
        
        // Crime/Legal (non-business)
        /\b(murder|assault|robbery|theft)\s+(case|charge|arrest)/i,
        /\bdivorce\s+(settlement|custody|proceedings)/i,
      ];
    };
    
    const getExclusionTerms = (country?: string): (string | RegExp)[] => {
      // Softer exclusions - penalize but don't disqualify
      const baseExclusions = [
        // Sports (individual terms)
        'quarterback', 'touchdown', 'pitcher', 'homerun', 'goalkeeper',
        
        // Entertainment (individual terms)
        'oscar', 'grammy', 'emmy', 'broadway', 'netflix',
        
        // Technology (when clearly not auto-related)
        /\bapp\s+(store|download|update)/i,
        /\bsoftware\s+(update|patch|bug)/i,
        
        // Gaming
        'fortnite', 'minecraft', 'call of duty', 'playstation', 'xbox',
        
        // Food
        'restaurant review', 'recipe', 'cooking show',
        
        // Fashion
        'fashion week', 'runway show', 'designer collection'
      ];
      
      // Add country-specific exclusions
      switch (country) {
        case 'de':
          return [...baseExclusions,
            'fußball', 'bundesliga', 'spieler', 'mannschaft', 'torwart',
            'schauspieler', 'musik', 'film', 'serie', 'kino',
            'rezept', 'restaurant', 'kochen', 'mode', 'kollektion'
          ];
          
        case 'fr':
          return [...baseExclusions,
            'football', 'ligue 1', 'joueur', 'équipe', 'gardien',
            'acteur', 'musique', 'film', 'cinéma', 'série',
            'recette', 'restaurant', 'cuisine', 'mode', 'collection'
          ];
          
        case 'jp':
          return [...baseExclusions,
            'サッカー', '野球', 'プロ野球', 'Jリーグ', '選手', 'チーム',
            '映画', '音楽', '俳優', '女優', 'ドラマ', 'アニメ',
            'ゲーム', 'プレステ', 'ニンテンドー', 'レシピ', '料理',
            'ファッション', 'コレクション'
          ];
          
        case 'cn':
          return [...baseExclusions,
            '足球', '篮球', '中超', 'CBA', '球员', '球队',
            '电影', '音乐', '演员', '明星', '电视剧', '综艺',
            '游戏', '王者荣耀', '原神', '食谱', '餐厅', '美食',
            '时装', '时尚', '秀场'
          ];
          
        case 'in':
          return [...baseExclusions,
            // Hindi sports terms
            'फुटबॉल', 'क्रिकेट', 'हॉकी', 'टेनिस', 'बैडमिंटन', 'कबड्डी',
            'खिलाड़ी', 'टीम', 'मैच', 'टूर्नामेंट', 'IPL', 'ISL', 'PKL',
            // Entertainment in Hindi
            'फिल्म', 'सिनेमा', 'बॉलीवूड', 'टॉलीवूड', 'अभिनेता', 'अभिनेत्री',
            'संगीत', 'गीत', 'नाचना', 'डांस', 'टीवी', 'सीरियल', 'शो',
            // Gaming and technology (non-auto)
            'गेम', 'गेमिंग', 'मोबाइल गेम', 'PUBG', 'फ्री फायर', 'कॉल ऑफ ड्यूटी',
            // Food and lifestyle
            'खाना', 'रेसिपी', 'रेस्टोरेंट', 'व्यंजन', 'स्वादिष्ट', 'पकाना',
            'फैशन', 'कपड़े', 'ड्रेस', 'शादी', 'त्योहार',
            // Politics (when not related to policy affecting auto industry)
            'चुनाव', 'राजनीति', 'पार्टी', 'नेता', 'मंत्री',
            // Mixed terms commonly used
            'bollywood', 'cricket', 'IPL', 'entertainment', 'celebrity', 'actor', 'actress'
          ];
          
        default:
          return baseExclusions;
      }
    };
    
    const getHighValuePhrases = (country?: string): string[] => {
      const basePhrases = [
        'auto loan rate', 'car financing rate', 'vehicle loan apr',
        'auto finance company', 'car loan provider', 'vehicle financing program',
        'delinquency rate', 'default rate', 'repossession rate',
        'subprime auto', 'prime auto loan', 'auto lending market',
        'dealer financing', 'captive finance', 'floor plan financing',
        'auto securitization', 'asset-backed securities', 'auto abs',
        'credit union auto', 'bank auto loan', 'online auto lending',
        'ev financing', 'electric vehicle loan', 'green auto loan'
      ];
      
      switch (country) {
        case 'de':
          return [...basePhrases,
            'autokredit', 'kfz finanzierung', 'händlerfinanzierung', 'leasingrate',
            'autokreditzinsen', 'restschuldversicherung', 'ballonfinanzierung',
            'drei-wege-finanzierung', 'vario-finanzierung', 'elektroauto förderung'
          ];
          
        case 'fr':
          return [...basePhrases,
            'crédit auto', 'prêt automobile', 'financement véhicule', 'taux crédit auto',
            'loa', 'lld', 'crédit ballon', 'location avec option d\'achat',
            'location longue durée', 'financement électrique', 'bonus écologique'
          ];
          
        case 'jp':
          return [...basePhrases,
            '自動車ローン', 'カーローン', 'オートローン', '残価設定', 'ディーラーローン',
            '残価設定ローン', '残クレ', 'マイカーローン', '新車ローン', '中古車ローン',
            '自動車リース', 'カーリース', 'オートリース', '個人リース', '法人リース',
            'EV補助金', '電気自動車ローン'
          ];
          
        case 'cn':
          return [...basePhrases,
            '汽车贷款', '车贷', '汽车金融', '经销商融资', '厂家金融',
            '汽车消费贷款', '新车贷款', '二手车贷款', '融资租赁',
            '以租代购', '汽车分期', '零首付', '低首付', '贴息贷款',
            '新能源补贴', '电动车贷款', '绿色金融'
          ];
          
        case 'in':
          return [...basePhrases,
            // Hindi auto finance phrases
            'कार लोन दर', 'ऑटो लोन रेट', 'गाड़ी की किस्त', 'वाहन वित्त',
            'बाइक लोन', 'टू व्हीलर फाइनेंसिंग', 'कमर्शियल व्हीकल लोन',
            'ऑटो लोन EMI', 'कार लोन एप्रूवल', 'व्हीकल इंश्योरेंस',
            'जीरो डाउन पेमेंट', 'कम ब्याज दर', 'फास्ट लोन एप्रूवल',
            'प्री अप्रूव्ड लोन', 'इंस्टेंट कार लोन', 'ऑनलाइन लोन',
            'बैंक ऑफ इंडिया कार लोन', 'SBI ऑटो लोन', 'HDFC कार लोन',
            'ICICI व्हीकल लोन', 'एक्सिस बैंक लोन', 'बजाज फाइनेंस',
            // Government schemes and subsidies
            'FAME स्कीम', 'इलेक्ट्रिक व्हीकल सब्सिडी', 'PLI स्कीम',
            'वाहन स्क्रैपेज पॉलिसी', 'BS6 नॉर्म्स', 'GST रेट',
            'रोड टैक्स', 'RTO चार्जेस', 'इंश्योरेंस प्रीमियम',
            // Mixed commonly used phrases
            'car loan interest rate', 'vehicle finance company', 'auto loan eligibility',
            'used car financing', 'commercial vehicle finance', 'two wheeler loan EMI'
          ];
          
        default:
          return basePhrases;
      }
    };
    
    // Score and filter articles
    const scoredArticles = data.articles
      .filter(article => article.title && article.url && article.description)
      .map(article => ({
        article,
        score: calculateRelevanceScore(article, filters?.country)
      }))
      .filter(item => {
        // Log rejected articles for debugging
        if (item.score < 5) {
          console.log(`[fetchAutoFinanceNews] Article rejected - score: ${item.score}`);
          console.log(`  Title: ${item.article.title.substring(0, 60)}...`);
        }
        return item.score >= 5; // Lower threshold for more inclusive filtering
      })
      .sort((a, b) => b.score - a.score) // Sort by relevance score
      .slice(0, pageSize); // Limit to requested number
    
    const filteredArticles = scoredArticles
      .map(item => ({
        title: item.article.title,
        summary: item.article.description || '',
        image: item.article.urlToImage || '/api/placeholder/400/300',
        url: item.article.url,
        publishedAt: item.article.publishedAt,
        source: item.article.source.name
      }));
    
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