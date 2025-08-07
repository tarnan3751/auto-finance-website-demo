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
    
    // Use top 3 most relevant articles for context
    const topArticles = scoredArticles.slice(0, 3).map((x: ScoredArticle) => x.art);
    
    const prompt = `You are an expert auto finance industry analyst and advisor with deep knowledge of automotive lending, market trends, and regulatory developments.

CURRENT MARKET INTELLIGENCE (Live Auto Finance News):
${topArticles.map((a: Article, i: number) => `
[${i + 1}] ${a.title}
• Source: ${a.source || 'News Source'} | ${a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'Recent'}
• Summary: ${a.aiSummary || a.summary}
• Link: ${a.url}
`).join('\n')}

YOUR ROLE & CAPABILITIES:
- Provide expert analysis on auto finance topics including: lending rates, delinquency trends, market conditions, regulatory changes, subprime lending, EV financing, and industry forecasts
- Interpret current news in the context of broader industry trends
- Offer actionable insights for finance professionals, dealers, and lenders
- Explain complex financial concepts in clear, professional language

RESPONSE GUIDELINES:
1. START with a direct answer to the user's question
2. CITE specific articles using [1], [2], etc. when referencing news
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