import React,{useState} from 'react';
export default function ChatBot(){
  const [question,setQuestion]=useState('');
  const [response,setResponse]=useState('');
  const [loading,setLoading]=useState(false);
  const ask=async()=>{
    if(!question.trim()) return;
    setLoading(true);
    const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
    const data=await res.json();
    setResponse(data.response);
    setLoading(false);
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      ask();
    }
  };
  return (
    <div 
      className="mt-12 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
      style={{ 
        backgroundColor: 'rgba(15, 52, 32, 0.3)', 
        border: '1px solid rgba(20, 64, 40, 0.3)' 
      }}
    >
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <span className="text-blue-400 text-2xl">💬</span>
        Ask About the Articles
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input
          type="text"
          className="w-full rounded-xl px-5 focus:outline-none focus:ring-2 transition-all duration-200"
          style={{ 
            backgroundColor: 'rgba(10, 40, 24, 0.5)', 
            border: '1px solid rgba(20, 64, 40, 0.5)',
            height: '56px',
            fontSize: '18px',
            color: 'white'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgb(59, 130, 246)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(20, 64, 40, 0.5)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          placeholder="What would you like to know about auto finance?"
          value={question}
          onChange={e=>setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
          <button
            className="rounded-xl font-semibold transition-all duration-200 flex items-center gap-3"
            style={{
              padding: '12px 24px',
              height: '48px',
              backgroundColor: loading ? 'rgba(20, 64, 40, 0.7)' : '#2563eb',
              color: loading ? '#9ca3af' : 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(37, 99, 235, 0.2)',
              transform: loading ? 'none' : 'translateY(0)',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(37, 99, 235, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37, 99, 235, 0.2)';
              }
            }}
            onClick={ask}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Thinking...</span>
              </>
            ) : (
              <>
                <span>Ask Question</span>
                <span className="text-lg">→</span>
              </>
            )}
          </button>
        </div>
        {response && (
          <div 
            className="rounded-xl p-6"
            style={{ 
              backgroundColor: 'rgba(10, 40, 24, 0.3)', 
              border: '1px solid rgba(20, 64, 40, 0.3)',
              animation: 'fadeIn 0.5s ease-in-out',
              width: '100%',
              alignSelf: 'flex-start'
            }}
          >
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}