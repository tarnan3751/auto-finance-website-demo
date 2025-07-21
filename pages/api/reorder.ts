import {NextApiRequest,NextApiResponse} from 'next';
import {OpenAI} from 'openai';
const openai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

export default async function handler(req:NextApiRequest,res:NextApiResponse){
  if(req.method!=='POST')return res.status(405).end();
  const {articles}=req.body;
  const prompt=`You are an auto finance expert. Given these articles:\n${articles.map((a:any,i:number)=>`${i+1}. ${a.title}: ${a.summary}`).join('\n')}\nRank by relevance, return JSON array of 0-based indices.`;
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
  } catch {
    const matches = content.match(/\d+/g);
    if (!matches) {
      return res.status(500).json({ error: 'Could not parse indices from OpenAI response.' });
    }
    idx = matches.map(n => parseInt(n, 10) - 1);
  }
  res.json({articles:idx.map(i=>articles[i])});
}