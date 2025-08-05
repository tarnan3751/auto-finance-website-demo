import React from 'react';

type Props = { rank:number; title:string; summary:string; aiSummary?:string; image:string; url:string; publishedAt?:string; };

export default function ArticleCard({ rank,title,summary,aiSummary,image,url,publishedAt }:Props) {
  if (!title || !summary || !image || !url) {
    console.warn('ArticleCard missing props:', { rank, title, summary, image, url });
    return null;
  }
  
  // Format the published date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return new Date().toLocaleDateString();
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  return (
    <a 
      href={url} 
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 card-hover"
      style={{ minHeight: '200px' }}
    >
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 rounded-full blur opacity-75"></div>
          <div className="relative bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 w-12 h-12 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">{rank}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Image */}
        <div className="relative flex-shrink-0 w-48 h-36 rounded-xl overflow-hidden bg-gray-800">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = `
                <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
                  <svg class="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                    <g>
                      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path d="M3 3l18 18" stroke-linecap="round" />
                    </g>
                  </svg>
                </div>
              `;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Category tag */}
          <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
            <span className="text-xs text-white font-medium">Finance News</span>
          </div>
          
          {/* AI Summary indicator */}
          {aiSummary && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/50 backdrop-blur-sm">
              <span className="text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-lime-400">AI Enhanced</span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2 group-hover:text-gradient transition-all duration-300">
            {title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 flex-grow leading-relaxed">
            {aiSummary || summary}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDate(publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {Math.floor(Math.random() * 900 + 100)} views
              </span>
            </div>

            <div className="flex items-center gap-2 font-medium text-sm text-lime-400 group-hover:text-lime-300 transition-colors">
              <span>Read article</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Hover effect gradient */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-teal-600/0 via-teal-600/0 to-lime-500/0 group-hover:from-teal-600/10 group-hover:via-teal-600/10 group-hover:to-lime-500/10 transition-all duration-500 pointer-events-none"></div>
    </a>
  );
}