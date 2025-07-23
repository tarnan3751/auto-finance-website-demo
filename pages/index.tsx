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
  const [loading,setLoading]=useState(true);
  
  useEffect(()=>{
    fetch('/api/reorder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({articles})})
      .then(r=>r.json())
      .then(d=>{
        if (d.articles && Array.isArray(d.articles)) {
          setSorted(d.articles);
        } else {
          console.warn('Reorder API returned invalid data, using original articles');
          setSorted(articles);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Reorder API failed:', err);
        setSorted(articles);
        setLoading(false);
      });
  },[articles]);
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a2818' }}>
      <div className="relative">
        <header style={{ backgroundColor: 'rgba(10, 40, 24, 0.95)', borderBottom: '1px solid rgba(20, 64, 40, 0.5)' }} className="backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Auto Finance <span className="text-blue-400">News Hub</span>
                </h1>
              </div>
              <div className="text-sm text-gray-400">
                <span className="flex items-center" style={{ gap: '8px' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'translateX(-10px)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ transform: 'translateX(-10px)' }}>Live Updates</span>
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-12">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '25px' }}>
            <h2 className="text-5xl font-bold text-white mb-2" style={{ textAlign: 'center', marginLeft: '100px' }}>
              Stay Informed <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-500">Auto Finance</span>
            </h2>
            <p className="text-xl text-gray-300" style={{ textAlign: 'center', maxWidth: '768px', margin: '0 auto', width: '100%', paddingLeft: '0', paddingRight: '0', marginTop: '-25px' }}>
              AI-curated news and insights on automotive financing, loans, and market trends
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg className="animate-spin h-12 w-12 text-blue-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="text-gray-400 text-lg">Ranking articles by relevance...</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {sorted.map((a,i)=>(
                <ArticleCard key={i} rank={i+1} {...a}/>
              ))}
            </div>
          )}
          
          <ChatBot />
        </main>

        <footer style={{ backgroundColor: 'rgba(10, 40, 24, 0.95)', borderTop: '1px solid rgba(20, 64, 40, 0.5)' }} className="mt-20">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center text-gray-400">
              <p className="text-sm">
                Powered by AI • Real-time Financial Insights
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
