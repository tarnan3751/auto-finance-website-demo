import React, { useState } from 'react';

interface ChatWidgetProps {
  onOpenChat: () => void;
}

export default function ChatWidget({ onOpenChat }: ChatWidgetProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget Container */}
      <div 
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Widget Container */}
        <div
          className="glass rounded-2xl p-6 pr-16 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-700 hover:border-indigo-500 group relative"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(20px)',
            minWidth: '300px'
          }}
        >
          {/* Minimize Button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-2 left-2 z-10 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-full p-1.5 transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Minimize chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Animated gradient background */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

          {/* Clickable Content Area */}
          <div
            onClick={onOpenChat}
            className="relative cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onOpenChat();
              }
            }}
          >
            {/* Chat icon with pulse effect */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              
              {/* Text content */}
              <div className="text-left select-none">
                <p className="text-white font-semibold text-base">Ask me about Auto Finance!</p>
                <p className="text-gray-400 text-sm mt-1">Powered by AI • Click to chat</p>
              </div>
            </div>

            {/* Hover arrow */}
            <div className={`absolute -right-6 top-1/2 -translate-y-1/2 transform transition-all duration-300 ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-2 opacity-0'}`}>
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}