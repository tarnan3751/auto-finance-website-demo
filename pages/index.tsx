import fs from 'fs';
import path from 'path';
import {useEffect,useState} from 'react';
import ArticleCard from '@components/ArticleCard';
import ChatBot from '@components/ChatBot';
import LoadingSpinner from '@components/LoadingSpinner';

export async function getStaticProps(){
  const filePath=path.join(process.cwd(),'data','articles.json');
  const json=fs.readFileSync(filePath,'utf8');
  return {props:{articles:JSON.parse(json)}};
}

export default function Home({articles}:{articles:any[]}){
  const [sorted,setSorted]=useState(articles);
  const [loading,setLoading]=useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  
  useEffect(()=>{
    // First reorder articles, then generate AI summaries
    fetch('/api/reorder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({articles})})
      .then(r=>r.json())
      .then(async d=>{
        let reorderedArticles = articles;
        if (d.articles && Array.isArray(d.articles)) {
          reorderedArticles = d.articles;
        } else {
          console.warn('Reorder API returned invalid data, using original articles');
        }
        
        // Generate AI summaries for the reordered articles
        try {
          const summaryResponse = await fetch('/api/summarize', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ articles: reorderedArticles })
          });
          
          const summaryData = await summaryResponse.json();
          if (summaryData.articles && Array.isArray(summaryData.articles)) {
            setSorted(summaryData.articles);
          } else {
            setSorted(reorderedArticles);
          }
        } catch (summaryError) {
          console.error('Failed to generate AI summaries:', summaryError);
          setSorted(reorderedArticles);
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
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background mesh gradient */}
      <div className="absolute inset-0 bg-mesh-gradient opacity-30"></div>
      
      <div className="relative z-10">
        {/* Modern Header */}
        <header className="glass-dark sticky top-0 z-50 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-20">
              {/* Logo and Brand */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-space">
                    AutoFinance<span className="text-gradient">Hub</span>
                  </h1>
                  <p className="text-xs text-gray-400 -mt-1">AI-Powered Market Intelligence</p>
                </div>
              </div>

              {/* Navigation and Actions */}
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                  <a href="#trending" className="text-sm text-gray-300 hover:text-white transition-colors">Trending</a>
                  <a href="#analysis" className="text-sm text-gray-300 hover:text-white transition-colors">Analysis</a>
                  <a href="#insights" className="text-sm text-gray-300 hover:text-white transition-colors">Insights</a>
                </nav>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setChatOpen(true)}
                    className="btn btn-primary flex items-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Ask AI
                  </button>
                  
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400 font-medium">Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 py-20 md:py-32">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gray-700 mb-8 animate-fade-in">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Real-time market analysis powered by GPT-4</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold font-space mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <span className="text-white">The Future of</span>
                <br />
                <span className="text-gradient">Auto Finance</span>
                <span className="text-white"> Intelligence</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
                Stay ahead with AI-curated insights on automotive financing, market trends, and industry analysis. Updated in real-time.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-500 mt-1">Monitoring</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">500+</div>
                  <div className="text-sm text-gray-500 mt-1">Sources</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white">AI</div>
                  <div className="text-sm text-gray-500 mt-1">Powered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 pb-20">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white font-space">Top Stories</h2>
              <p className="text-gray-400 mt-1">Ranked by relevance to industry professionals</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort by date
              </button>
              <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" text="AI is analyzing articles and generating detailed summaries..." />
              <div className="mt-8 grid gap-6 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-48 h-32 bg-gray-800 rounded-xl skeleton"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-800 rounded w-3/4 mb-3 skeleton"></div>
                        <div className="h-4 bg-gray-800 rounded w-full mb-2 skeleton"></div>
                        <div className="h-4 bg-gray-800 rounded w-5/6 skeleton"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {sorted.map((a,i)=>(
                <ArticleCard key={i} rank={i+1} {...a}/>
              ))}
            </div>
          )}
        </main>

        {/* Modern Footer */}
        <footer className="glass-dark border-t border-gray-800 mt-32">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-white font-space">AutoFinanceHub</span>
                </div>
                <p className="text-gray-400 text-sm max-w-md">
                  Your trusted source for AI-powered automotive finance intelligence. Real-time market insights, trend analysis, and industry news.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Market Analysis</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Industry Reports</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI Insights</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Stay Updated</h3>
                <p className="text-gray-400 text-sm mb-4">Get the latest insights delivered to your inbox</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2025 AutoFinanceHub. Powered by AI • Real-time Financial Intelligence
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Chat Interface */}
      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} />}
    </div>
  );
}