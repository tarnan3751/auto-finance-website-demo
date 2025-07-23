import {NextApiRequest,NextApiResponse} from 'next';
import {OpenAI} from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const {articles}=req.body;
  const prompt=`You are an auto finance industry executive. Rank these articles by business importance to auto finance professionals.

HIGHEST PRIORITY (rank first):
- Auto loan delinquency rates and trends
- Industry fraud losses and risk data
- Interest rate changes affecting auto lending
- Consumer credit behavior and payment patterns
- Regulatory changes impacting auto finance

MEDIUM PRIORITY:
- Auto sales data affecting loan volumes
- Economic factors impacting lending
- Technology changes in auto finance

LOWEST PRIORITY (rank last):
- Individual company executive changes
- Marketing/promotional content about "best rates" or "deals"
- General automotive news not related to financing
- Niche regional automotive topics

Articles:
${articles.map((a:any,i:number)=>`${i+1}. ${a.title}: ${a.summary}`).join('\n')}

Rank by business impact on auto finance industry. Return ONLY a JSON array of 0-based indices: [x,y,z,...]`;
  const chat = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [{ role: 'user', content: prompt }]
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
  // Validate indices and ensure all articles are included
  const validIndices = idx.filter(i => i >= 0 && i < articles.length);
  const usedIndices = new Set(validIndices);
  
  // Add any missing indices at the end
  for (let i = 0; i < articles.length; i++) {
    if (!usedIndices.has(i)) {
      validIndices.push(i);
    }
  }
  
  // Map indices to articles
  const reorderedArticles = validIndices.map(i => articles[i]);
  
  res.json({articles: reorderedArticles});
}