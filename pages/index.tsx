import fs from 'fs';
import path from 'path';
import {useEffect,useState} from 'react';
import ArticleCard from '@components/ArticleCard';
import ChatBot from '@components/ChatBot';

export async function getStaticProps(){
  const filePath=path.join(process.cwd(),'data','articles.json');
  const json=fs.readFileSync(filePath,'utf8');
  return {props:{articles:JSON.parse(json)}};
}

export default function Home({articles}:{articles:any[]}){
  const [sorted,setSorted]=useState(articles);
  useEffect(()=>{
    fetch('/api/reorder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({articles})})
      .then(r=>r.json())
      .then(d=>setSorted(d.articles));
  },[articles]);
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Top Auto Finance News</h1>
      <div className="space-y-4">{sorted.map((a,i)=><ArticleCard key={i} rank={i+1} {...a}/>)}
      </div>
      <ChatBot />
    </div>
  );
}
