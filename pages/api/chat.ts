import fs from 'fs';
import path from 'path';
import {NextApiRequest,NextApiResponse} from 'next';
import {OpenAI} from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
function cosine(a:number[],b:number[]){const dot=a.reduce((s,x,i)=>s+x*b[i],0);const magA=Math.sqrt(a.reduce((s,x)=>s+x*x,0));const magB=Math.sqrt(b.reduce((s,y)=>s+y*y,0));return dot/(magA*magB);}  
export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const {question}=req.body;
  const raw=fs.readFileSync(path.join(process.cwd(),'data','articles.json'),'utf8');
  const articles=JSON.parse(raw);
  // First, create comprehensive summaries of all articles for RAG
  const articleSummaries = await Promise.all(articles.map(async (a: Article) => {
    const summaryResponse = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{
        role: 'user',
        content: `Analyze this auto finance article and create a detailed summary for RAG purposes:
        
Title: ${a.title}
Summary: ${a.aiSummary || a.summary}

Create a comprehensive summary covering:
- Key financial metrics and data points
- Market trends and implications
- Regulatory or policy impacts
- Consumer behavior insights
- Industry risks or opportunities

Format as a detailed paragraph for RAG retrieval.`
      }]
    });
    return {
      ...a,
      ragSummary: summaryResponse.choices[0].message.content || a.summary
    };
  }));

  // Create embeddings from the enhanced RAG summaries
  const embedResponses = await Promise.all(articleSummaries.map((a) =>
    openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${a.title}: ${a.ragSummary}`
    })
  ));
  
  const vecs = embedResponses.map(r => r.data[0].embedding);
  const qv = (await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
  })).data[0].embedding;

  interface Article { title: string; summary: string; }
  interface EnhancedArticle extends Article { ragSummary: string; }
  interface ScoredArticle { score: number; art: EnhancedArticle; }
  
  const scoredArticles = articleSummaries.map((a: EnhancedArticle, i: number) => ({
    score: cosine(vecs[i], qv),
    art: a
  })).sort((x: ScoredArticle, y: ScoredArticle) => y.score - x.score);

  // Use top 3 most relevant articles for context
  const topArticles = scoredArticles.slice(0, 3).map((x: ScoredArticle) => x.art);

  const prompt = `You are an auto finance industry assistant with access to current market data and analysis.

KNOWLEDGE BASE (Retrieved Articles):
${topArticles.map((a, i) => `
Article ${i + 1}: ${a.title}
Content: ${a.ragSummary}
`).join('\n')}

INSTRUCTIONS:
- Answer ONLY questions about auto finance, automotive lending, car loans, industry trends, or the provided articles
- Base your responses primarily on the retrieved article content above
- If the question is not related to auto finance or the articles, politely decline and redirect to auto finance topics
- Provide specific data points and insights from the articles when available
- If the retrieved articles don't contain enough information, acknowledge this limitation

USER QUESTION: ${question}

RESPONSE:`;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [{ role: 'user', content: prompt }]
  });

  res.status(200).json({ response: chat.choices[0].message.content });
  }
