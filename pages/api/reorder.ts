import {NextApiRequest,NextApiResponse} from 'next';
import {OpenAI} from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const {articles}=req.body;
  const prompt=`You are a senior auto finance executive responsible for risk management and strategic planning. Rank these articles by their immediate business impact and actionable insights for auto finance professionals.

RANKING CRITERIA (in order of importance):

TIER 1 - CRITICAL BUSINESS IMPACT (rank 1st-3rd):
Articles with immediate financial implications or risk indicators:
- Delinquency rates, default trends, credit loss data with specific percentages
- Fraud exposure with dollar amounts (e.g., "$8.5B fraud losses")
- Regulatory changes or compliance requirements
- Major shifts in consumer credit behavior or payment patterns
- Industry-wide risk metrics and forecasts

TIER 2 - STRATEGIC IMPORTANCE (rank 4th-6th):
Market trends affecting business strategy:
- Auto sales volume changes impacting loan origination
- Interest rate environment and APR trends
- Used car market pricing affecting collateral values
- Technology disruptions in auto lending
- Economic indicators affecting the lending environment

TIER 3 - OPERATIONAL RELEVANCE (rank 7th-8th):
Industry updates with indirect impact:
- General automotive industry news with finance implications
- Executive changes at major auto finance companies
- Regional market variations
- EV market trends affecting future lending

TIER 4 - CONSUMER/PROMOTIONAL (rank 9th-10th):
Consumer-focused or promotional content:
- "Best deals" or "0% APR offers" articles
- Consumer shopping guides
- Dealership promotions
- Marketing-focused content

EVALUATION APPROACH:
1. Look for hard data, percentages, and dollar amounts
2. Prioritize systemic risks over individual company news
3. Value forward-looking indicators over historical reports
4. Rank actionable intelligence over general market commentary

Articles to rank:
${articles.map((a:any,i:number)=>`${i+1}. ${a.title}: ${a.summary}`).join('\n')}

Analyze each article's business impact and return a JSON array of 0-based indices ordered from highest to lowest priority: [x,y,z,...]`;
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert in auto finance risk assessment and portfolio management. Focus on ranking articles by their immediate business value to professionals managing auto loan portfolios, assessing credit risk, and making strategic lending decisions. Prioritize actionable data and risk indicators.'
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  });
  let idx:number[];
  const content = chat.choices[0].message.content;
  if (typeof content !== 'string') {
    return res.status(500).json({ error: 'No content returned from OpenAI.' });
  }
  try {
    idx = JSON.parse(content);
    console.log('AI returned indices:', idx);
  } catch {
    console.log('Failed to parse JSON, trying regex fallback. Content:', content);
    const matches = content.match(/\d+/g);
    if (!matches) {
      console.error('No indices found in AI response:', content);
      return res.status(500).json({ error: 'Could not parse indices from OpenAI response.' });
    }
    idx = matches.map(n => parseInt(n, 10) - 1);
    console.log('Regex fallback indices:', idx);
  }
  // Validate indices and ensure uniqueness
  const usedIndices = new Set<number>();
  const validIndices: number[] = [];
  
  // First, add all valid indices from AI response (no duplicates)
  for (const i of idx) {
    if (i >= 0 && i < articles.length && !usedIndices.has(i)) {
      validIndices.push(i);
      usedIndices.add(i);
    }
  }
  
  // Add any missing indices at the end
  for (let i = 0; i < articles.length; i++) {
    if (!usedIndices.has(i)) {
      validIndices.push(i);
      usedIndices.add(i);
    }
  }
  
  // Map indices to articles
  const reorderedArticles = validIndices.map(i => articles[i]);
  
  console.log('Total articles:', articles.length, 'Reordered:', reorderedArticles.length);
  
  res.json({articles: reorderedArticles});
}