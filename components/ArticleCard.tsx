import React from 'react';

type Props = { rank:number; title:string; summary:string; image:string; url:string; };
export default function ArticleCard({ rank,title,summary,image,url }:Props) {
  // Add error handling for missing props
  if (!title || !summary || !image || !url) {
    console.warn('ArticleCard missing props:', { rank, title, summary, image, url });
    return null;
  }
  
  return (
    <div 
      className="group relative flex p-8 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300" 
      style={{ 
        backgroundColor: 'rgba(15, 52, 32, 0.5)', 
        border: '1px solid rgba(20, 64, 40, 0.3)' 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(20, 64, 40, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(15, 52, 32, 0.5)';
        e.currentTarget.style.borderColor = 'rgba(20, 64, 40, 0.3)';
      }}
    >
      <div 
        className="absolute top-4 left-4 backdrop-blur-sm px-4 py-2 rounded-full"
        style={{ backgroundColor: 'rgba(30, 64, 175, 0.2)' }}
      >
        <span className="text-blue-400 font-bold text-base">#{rank}</span>
      </div>
      <div className="relative overflow-hidden rounded-xl shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300" style={{ width: '192px', height: '128px' }}>
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover" 
          style={{ objectPosition: 'center center' }}
          onError={(e) => {
            console.warn('Image failed to load:', image);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully:', image);
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-blue-900/10 pointer-events-none"
        />
      </div>
      <div className="flex-1 min-w-0" style={{ marginLeft: '24px' }}>
        <h2 className="text-2xl font-semibold mb-3">
          <a 
            href={url} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-400 transition-colors duration-200 decoration-blue-400 decoration-2 underline-offset-4 hover:underline"
          >
            {title}
          </a>
        </h2>
        <p className="text-gray-300 leading-relaxed text-base" style={{ 
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {summary}
        </p>
        <div className="mt-4 flex items-center gap-2 text-blue-400 text-base font-medium group-hover:text-blue-300 transition-colors">
          <span>Read more</span>
          <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
        </div>
      </div>
    </div>
  );
}