import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Article {
  title: string;
  summary?: string;
  aiSummary?: string;
  source?: string;
  publishedAt?: string;
  url: string;
}

interface ChatBotProps {
  onClose?: () => void;
  currentArticles?: Article[];
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export default function ChatBot({ onClose, currentArticles }: ChatBotProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI assistant. Ask me anything about the auto finance articles or industry trends.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(Date.now().toString());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const savedHistory = localStorage.getItem('autoFinanceChatHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setChatHistory(parsed.map((session: ChatSession) => ({
            ...session,
            timestamp: new Date(session.timestamp),
            messages: Array.isArray(session.messages) ? session.messages.map((msg: Message) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            })) : []
          })));
        }
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      // Clear corrupted localStorage data
      localStorage.removeItem('autoFinanceChatHistory');
    }
  }, []);

  // Save current session to history when closing or switching
  const saveCurrentSession = useCallback(() => {
    if (messages.length > 1) { // Only save if there's more than the welcome message
      const userMessages = messages.filter(m => m.isUser);
      if (userMessages.length > 0) {
        const sessionTitle = userMessages[0].text.substring(0, 50) + (userMessages[0].text.length > 50 ? '...' : '');
        const newSession: ChatSession = {
          id: currentSessionId,
          title: sessionTitle,
          messages: messages,
          timestamp: new Date()
        };

        const updatedHistory = [newSession, ...chatHistory.filter(s => s.id !== currentSessionId)].slice(0, 20); // Keep last 20 sessions
        setChatHistory(updatedHistory);
        localStorage.setItem('autoFinanceChatHistory', JSON.stringify(updatedHistory));
      }
    }
  }, [messages, chatHistory, currentSessionId]);

  const ask = async () => {
    if (!question.trim() || loading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage.text,
          articles: currentArticles 
        })
      });
      
      const responseText = await res.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('Failed to parse chat response:', jsonError);
        console.error('Chat response text:', responseText.substring(0, 500));
        throw new Error('Invalid response from chat API');
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I couldn't process that request.",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      ask();
    }
  };

  const loadChatSession = (session: ChatSession) => {
    saveCurrentSession(); // Save current before switching
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setShowHistory(false);
  };

  const startNewChat = () => {
    saveCurrentSession();
    setMessages([
      {
        id: '1',
        text: "Hi! I'm your AI assistant. Ask me anything about the auto finance articles or industry trends.",
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setCurrentSessionId(Date.now().toString());
    setShowHistory(false);
  };

  const clearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history?')) {
      setChatHistory([]);
      localStorage.removeItem('autoFinanceChatHistory');
      setShowHistory(false);
    }
  };

  const handleClose = () => {
    saveCurrentSession();
    if (onClose) onClose();
  };

  const suggestedQuestions = [
    "What are the latest EV financing trends?",
    "How are auto loan delinquencies affecting the market?",
    "What's the current APR situation for auto loans?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl h-[600px] glass-dark rounded-2xl shadow-glow flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 rounded-lg blur opacity-50"></div>
              <div className="relative bg-gradient-to-r from-teal-700 via-teal-600 to-lime-500 p-2 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
              <p className="text-xs text-gray-400">Powered by GPT-4o</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* History Toggle Button */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-lime-600 text-white' : 'hover:bg-gray-800 text-gray-400'}`}
              title="Chat History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* New Chat Button */}
            <button
              onClick={startNewChat}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400"
              title="New Chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            
            {onClose && (
              <button
                onClick={handleClose}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        {showHistory ? (
          /* Chat History Panel */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-white">Chat History</h4>
              {chatHistory.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-400">No chat history yet</p>
                <p className="text-sm text-gray-500 mt-2">Your conversations will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chatHistory.map((session) => (
                  <button
                    key={session.id}
                    onClick={() => loadChatSession(session)}
                    className="w-full text-left p-4 glass rounded-xl border border-gray-700 hover:border-lime-500 transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 pr-4">
                        <h5 className="text-sm font-medium text-white group-hover:text-lime-400 transition-colors line-clamp-1">
                          {session.title}
                        </h5>
                        <p className="text-xs text-gray-400 mt-1">
                          {session.messages.length - 1} messages
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {session.timestamp.toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-in`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-lime-600 text-white'
                      : 'glass border border-gray-700 text-gray-200'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-lime-200' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start animate-slide-in">
                <div className="glass border border-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Suggested Questions - Only show in chat view */}
        {!showHistory && messages.length === 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setQuestion(q)}
                  className="text-xs px-3 py-1.5 rounded-full glass border border-gray-700 text-gray-300 hover:border-lime-500 hover:text-white transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input - Only show in chat view */}
        {!showHistory && (
          <div className="p-6 border-t border-gray-800">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent transition-all"
                placeholder="Ask me anything about auto finance..."
                value={question}
                onChange={e => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                onClick={ask}
                disabled={loading || !question.trim()}
                className="btn btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}