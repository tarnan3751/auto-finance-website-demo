import {NextApiRequest,NextApiResponse} from 'next';
import {OpenAI} from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

// Simple in-memory cache for articles
interface Article {
  title: string;
  summary?: string;
  aiSummary?: string;
  source?: string;
  publishedAt?: string;
  url: string;
}

let articlesCache: {
  data: Article[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function cosine(a:number[],b:number[]){const dot=a.reduce((s,x,i)=>s+x*b[i],0);const magA=Math.sqrt(a.reduce((s,x)=>s+x*x,0));const magB=Math.sqrt(b.reduce((s,y)=>s+y*y,0));return dot/(magA*magB);}  

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).json({ error: 'Method not allowed' });
  
  if (!process.env.OPENAI_API_KEY) {
    console.error('[Chat API] OpenAI API key not configured');
    return res.status(500).json({ 
      response: "I'm currently unavailable due to configuration issues. Please contact support." 
    });
  }
  
  const {question, articles: providedArticles}=req.body;
  
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Question is required and must be a string' });
  }
  
  console.log('[Chat API] Received question:', question);
  console.log('[Chat API] Provided articles count:', providedArticles?.length || 0);
  
  try {
    let articles = [];
    
    // Use provided articles if available, otherwise fetch from cache or API
    if (providedArticles && Array.isArray(providedArticles) && providedArticles.length > 0) {
      articles = providedArticles;
      console.log('[Chat API] Using provided articles from frontend');
      // Update cache with provided articles
      articlesCache = {
        data: articles,
        timestamp: Date.now()
      };
    } else if (articlesCache && Date.now() - articlesCache.timestamp < CACHE_DURATION) {
      articles = articlesCache.data;
      console.log('[Chat API] Using cached articles');
    } else {
      // Fetch fresh articles from our news API
      console.log('[Chat API] Fetching fresh articles from API');
      const newsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/news`);
      const newsData = await newsResponse.json();
      
      if (newsData.articles && Array.isArray(newsData.articles)) {
        articles = newsData.articles;
        console.log('[Chat API] Fetched', articles.length, 'articles from API');
        // Update cache
        articlesCache = {
          data: articles,
          timestamp: Date.now()
        };
      }
    }
    
    if (articles.length === 0) {
      return res.status(200).json({ 
        response: "I'm currently unable to access the latest auto finance news. Please try again in a moment." 
      });
    }
    
    // Create embeddings from article titles and summaries
    const embedResponses = await Promise.all(articles.map((a: Article) =>
      openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `${a.title}: ${a.aiSummary || a.summary}`
      })
    ));
    
    const vecs = embedResponses.map(r => r.data[0].embedding);
    const qv = (await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question
    })).data[0].embedding;
    
    interface ScoredArticle { score: number; art: Article; }
    
    const scoredArticles = articles.map((a: Article, i: number) => ({
      score: cosine(vecs[i], qv),
      art: a
    })).sort((x: ScoredArticle, y: ScoredArticle) => y.score - x.score);
    
    // Use articles above relevance threshold (0.3 is a good baseline for semantic similarity)
    // Also limit to max 5 articles to avoid context window issues
    const RELEVANCE_THRESHOLD = 0.3;
    const FALLBACK_THRESHOLD = 0.15; // Much lower threshold for including at least one article
    const MAX_ARTICLES = 5;
    
    const relevantArticles = scoredArticles
      .filter((x: ScoredArticle) => x.score >= RELEVANCE_THRESHOLD)
      .slice(0, MAX_ARTICLES)
      .map((x: ScoredArticle) => x.art);
    
    console.log(`[Chat API] Found ${relevantArticles.length} relevant articles (threshold: ${RELEVANCE_THRESHOLD})`);
    console.log(`[Chat API] Similarity scores:`, scoredArticles.slice(0, 5).map(x => x.score.toFixed(3)));
    
    // If no articles meet the main threshold, check if the top article meets the fallback threshold
    let topArticles = relevantArticles;
    if (relevantArticles.length === 0 && scoredArticles.length > 0) {
      const topScore = scoredArticles[0].score;
      if (topScore >= FALLBACK_THRESHOLD) {
        topArticles = [scoredArticles[0].art];
        console.log(`[Chat API] Using fallback: 1 article with score ${topScore.toFixed(3)} (fallback threshold: ${FALLBACK_THRESHOLD})`);
      } else {
        topArticles = [];
        console.log(`[Chat API] No articles relevant enough (top score: ${topScore.toFixed(3)}, fallback threshold: ${FALLBACK_THRESHOLD})`);
      }
    }
    
    const contextSection = topArticles.length > 0 
      ? `CURRENT MARKET INTELLIGENCE (Live Auto Finance News):
${topArticles.map((a: Article, i: number) => `
[${i + 1}] ${a.title}
• Source: ${a.source || 'News Source'} | ${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Recent'}
• Summary: ${a.aiSummary || a.summary}
• Link: ${a.url}
`).join('\n')}`
      : `CURRENT MARKET INTELLIGENCE: No recent articles directly relevant to your question were found in today's auto finance news.`;

    const citationGuideline = topArticles.length > 0 
      ? "2. CITE specific articles using [1], [2], etc. when referencing news"
      : "2. Draw from your general auto finance expertise since no directly relevant recent news is available";

    const prompt = `You are an expert auto finance industry analyst and advisor with deep knowledge of automotive lending, market trends, and regulatory developments.

${contextSection}

YOUR ROLE & CAPABILITIES:
- Provide expert analysis on auto finance topics including: lending rates, delinquency trends, market conditions, regulatory changes, subprime lending, EV financing, and industry forecasts
- Interpret current news in the context of broader industry trends
- Offer actionable insights for finance professionals, dealers, and lenders
- Explain complex financial concepts in clear, professional language

RESPONSE GUIDELINES:
1. START with a direct answer to the user's question
${citationGuideline}
3. PROVIDE context beyond the articles when relevant to give comprehensive answers
4. INCLUDE specific data points, percentages, and figures when available
5. SUGGEST related topics or follow-up questions that might be helpful
6. For unrelated questions: "I specialize in auto finance topics. I'd be happy to discuss [suggest relevant auto finance topic instead]."

TONE: Professional yet approachable, like a knowledgeable colleague sharing insights

USER QUESTION: ${question}

RESPONSE:`;
    
    const chat = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5, // Lower for more consistent, professional responses
      max_tokens: 600 // Slightly more space for comprehensive answers
    });
    
    res.status(200).json({ response: chat.choices[0].message.content });
    
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      response: "I apologize, but I'm having trouble accessing the information right now. Please try again later." 
    });
  }
}