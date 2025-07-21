import React,{useState} from 'react';
export default function ChatBot(){
  const [question,setQuestion]=useState('');
  const [response,setResponse]=useState('');
  const [loading,setLoading]=useState(false);
  const ask=async()=>{
    setLoading(true);
    const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question})});
    const data=await res.json();
    setResponse(data.response);
    setLoading(false);
  };
  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold">Ask About the Articles</h3>
      <input
        type="text"
        className="w-full border rounded p-2 mt-2"
        placeholder="Ask something..."
        value={question}
        onChange={e=>setQuestion(e.target.value)}
      />
      <button
        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={ask}
        disabled={loading}
      >{loading?'Thinking...':'Ask'}</button>
      {response&&<p className="mt-4 text-gray-700 whitespace-pre-line">{response}</p>}
    </div>
  );
}