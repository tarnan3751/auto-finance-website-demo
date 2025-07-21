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
  const embedResponses=await Promise.all(articles.map((a: Article)=>openai.embeddings.create({model:'text-embedding-3-small',input:`${a.title}: ${a.summary}`})));
  const vecs=embedResponses.map(r=>r.data[0].embedding);
  const qv=(await openai.embeddings.create({model:'text-embedding-3-small',input:question})).data[0].embedding;
  interface Article { title: string; summary: string; }
  interface ScoredArticle { score: number; art: Article; }
  const top=articles.map((a: Article, i: number)=>({score:cosine(vecs[i],qv),art:a})).sort((x: ScoredArticle,y: ScoredArticle)=>y.score-x.score).slice(0,3).map((x: ScoredArticle)=>x.art);
  const prompt=`You are a helpful assistant trained ONLY on these articles:\n${top.map((a: Article, i: number)=>`#${i+1} ${a.title}: ${a.summary}`).join('\n\n')}\nQuestion: ${question}`;
    const chat = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }]
    });
    
    res.status(200).json({ response: chat.choices[0].message.content });
  }
