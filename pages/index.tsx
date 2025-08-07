import {useEffect,useState} from 'react';
import Head from 'next/head';
import Image from 'next/image';
import ArticleCard from '@components/ArticleCard';
import ChatBot from '@components/ChatBot';
import ChatWidget from '@components/ChatWidget';
import LoadingSpinner from '@components/LoadingSpinner';
import FilterDropdown, { FilterOptions } from '@components/FilterDropdown';
import ErrorBoundary from '@components/ErrorBoundary';
import type { Article } from '@lib/newsapi';

export default function Home(){
  const [sorted,setSorted]=useState<Article[]>([]);
  const [loading,setLoading]=useState(true);
  const [newsLoading,setNewsLoading]=useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [error,setError]=useState<string|null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    country: 'all',
    sourceQuality: 'all'
  });
  
  useEffect(()=>{
    // Fetch real news articles from NewsAPI
    const fetchAndProcessArticles = async () => {
      try {
        setLoading(true);
        setNewsLoading(true);
        setError(null);
        
        // Build query string with filters
        const queryParams = new URLSearchParams({
          dateRange: filters.dateRange,
          country: filters.country,
          sourceQuality: filters.sourceQuality,
          // Add timestamp to ensure fresh fetch when filters change
          _t: Date.now().toString()
        });
        
        // Fetch news articles
        console.log('Fetching news with params:', queryParams.toString());
        const newsResponse = await fetch(`/api/news?${queryParams}`);
        
        const responseText = await newsResponse.text();
        
        if (!newsResponse.ok) {
          console.error('News API response error:', newsResponse.status, responseText);
          throw new Error(`Failed to fetch news: ${newsResponse.status} - ${responseText.substring(0, 200)}...`);
        }
        
        let newsData;
        try {
          newsData = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Failed to parse JSON response:', jsonError);
          console.error('Response text:', responseText.substring(0, 500));
          throw new Error(`Invalid JSON response from news API: ${responseText.substring(0, 100)}...`);
        }
        
        const articles = newsData.articles;
        
        if (!articles || articles.length === 0) {
          console.log('No articles found with current filters');
          setError('No articles found with the current filters. Try adjusting your filter settings or resetting filters.');
          setNewsLoading(false);
          setLoading(false);
          return;
        }
        
        setNewsLoading(false);
        
        // Reorder articles using AI
        const reorderResponse = await fetch('/api/reorder', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ articles })
        });
        
        const reorderText = await reorderResponse.text();
        let reorderData;
        
        try {
          reorderData = JSON.parse(reorderText);
        } catch (jsonError) {
          console.error('Failed to parse reorder response:', jsonError);
          console.error('Reorder response text:', reorderText.substring(0, 500));
          // Continue with original articles if reorder fails
          reorderData = { articles };
        }
        let reorderedArticles = articles;
        
        if (reorderData.articles && Array.isArray(reorderData.articles)) {
          reorderedArticles = reorderData.articles;
        }
        
        // Generate AI summaries
        try {
          const summaryResponse = await fetch('/api/summarize', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ articles: reorderedArticles })
          });
          
          const summaryText = await summaryResponse.text();
          let summaryData;
          
          try {
            summaryData = JSON.parse(summaryText);
          } catch (jsonError) {
            console.error('Failed to parse summary response:', jsonError);
            console.error('Summary response text:', summaryText.substring(0, 500));
            // Continue with original articles if summary fails
            summaryData = { articles: reorderedArticles };
          }
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
      } catch (err) {
        console.error('Failed to fetch articles:', err);
        setError(err instanceof Error ? err.message : 'Failed to load articles');
        setNewsLoading(false);
        setLoading(false);
      }
    };
    
    fetchAndProcessArticles();
  },[filters]); // Re-fetch when filters change
  
  return (
    <>
      <Head>
        <title>ExeterHub - AI-Powered Auto Finance Intelligence</title>
        <meta name="description" content="Real-time auto finance news and insights powered by AI. Stay ahead with market trends, industry analysis, and intelligent summaries." />
        <link rel="icon" href="/images/exeter_logo.png" />
      </Head>
      
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
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 rounded-xl blur-lg opacity-50"></div>
                  <div className="relative">
                    <Image src="/images/exeter_logo.png" alt="Exeter Logo" className="w-12 h-12 object-contain" width={48} height={48} />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white font-space">
                    Exeter<span className="text-gradient">Hub</span>
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
                
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">Live</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gray-700 mb-8 animate-fade-in">
                <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                <span className="text-sm text-gray-300">Real-time market analysis powered by GPT-4o</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold font-space mb-6 animate-fade-in" style={{animationDelay: '0.1s'}}>
                <span className="text-white">The Future of</span>
                <br />
                <span className="text-gradient">Auto Finance</span>
                <span className="text-white"> Intelligence</span>
              </h1>
              
              <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in" style={{animationDelay: '0.2s'}}>
                Stay ahead with AI-curated insights on automotive financing, market trends, and industry analysis. Updated in real-time.
              </p>

              {/* Stats */}
              <div className="flex justify-center items-start gap-16 md:gap-24 animate-fade-in" style={{animationDelay: '0.3s'}}>
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="text-3xl font-bold text-white">24/7</div>
                  <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">Monitoring</div>
                </div>
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="text-3xl font-bold text-white">150k+</div>
                  <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">Sources</div>
                </div>
                <div className="flex flex-col items-center min-w-[100px]">
                  <div className="text-3xl font-bold text-white">AI</div>
                  <div className="text-sm text-gray-500 mt-1 whitespace-nowrap">Powered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 pb-20 min-h-[600px]">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white font-space">Top Stories</h2>
              <p className="text-gray-400 mt-1">
                {newsLoading ? 'Fetching latest news...' : 'Live news ranked by relevance to industry professionals'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-gray-700 hover:border-lime-500 text-gray-300 hover:text-white transition-all"
              >
                <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">Refresh</span>
              </button>
              <FilterDropdown
                filters={filters}
                onFilterChange={setFilters}
                isLoading={newsLoading}
              />
            </div>
          </div>

          {error ? (
            <ErrorBoundary>
              <div className="glass rounded-2xl p-8 text-center">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Articles</h3>
                <p className="text-gray-400 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 text-white rounded-lg font-medium hover:shadow-glow transition-all"
                >
                  Try Again
                </button>
              </div>
            </ErrorBoundary>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner 
                size="lg" 
                text={newsLoading ? "Fetching live news from 150,000+ sources..." : "AI is analyzing articles and generating detailed summaries..."} 
              />
              <div className="mt-8 grid gap-6 w-full">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                    <div className="flex gap-6">
                      <div className="w-48 h-36 bg-gray-800 rounded-xl skeleton"></div>
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
            <ErrorBoundary>
              <div className="grid gap-6">
                {sorted.map((a,i)=>(
                  <ErrorBoundary key={i}>
                    <ArticleCard rank={i+1} {...a}/>
                  </ErrorBoundary>
                ))}
              </div>
            </ErrorBoundary>
          )}
        </main>

        {/* Modern Footer */}
        <footer className="glass-dark border-t border-gray-800 mt-32">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <Image src="/images/exeter_logo.png" alt="Exeter Logo" className="w-10 h-10 object-contain" width={40} height={40} />
                  </div>
                  <span className="text-xl font-bold text-white font-space">ExeterHub</span>
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
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <button className="px-4 py-2 bg-lime-600 text-white rounded-lg text-sm hover:bg-lime-700 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-400">
                © 2025 ExeterHub. Powered by AI • Real-time Financial Intelligence
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
      {chatOpen && <ChatBot onClose={() => setChatOpen(false)} currentArticles={sorted} />}
      
      {/* Floating Chat Widget */}
      <ChatWidget onOpenChat={() => setChatOpen(true)} />
    </div>
    </>
  );
}