import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../../store';

export default function ChatWindow() {
  const { policyText } = useStore();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am your GigGuard AI Assistant. How can I help you understand your insurance policy today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!policyText) {
       setMessages(prev => [...prev, { role: 'user', content: input }, { role: 'assistant', content: 'Please upload an insurance policy in the Insurance Hub so I can answer questions about it.'}]);
       setInput('');
       return;
    }

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Exclude system message, only keep conversation history
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await axios.post(`${apiUrl}/api/ai/chat`, {
        messages: apiMessages,
        policyText
      }, {
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token') || 'test-token'}`,
          'Content-Type': 'application/json'
        }
      });

      setMessages([...newMessages, { role: 'assistant', content: res.data.message }]);
    } catch (err) {
       console.error(err);
       setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request. Please check your connection and try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 z-50">
      <div className="bg-brand p-4 flex justify-between items-center text-white">
        <div>
          <h3 className="font-display font-medium text-lg border-none focus:outline-none">GigGuard Assistant</h3>
          <p className="text-xs opacity-80">Online & ready to help</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-app-bg">
        {!policyText && (
          <div className="text-xs p-3 bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 rounded-lg whitespace-normal leading-relaxed text-center">
            No policy loaded. Please upload your policy PDF in the Insurance Hub.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 text-sm rounded-2xl ${msg.role === 'user' ? 'bg-brand text-white rounded-br-none' : 'bg-surface border border-border text-app-text rounded-bl-none shadow-sm'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-surface border border-border p-3 rounded-2xl rounded-bl-none shadow-sm text-app-muted">
                <Loader2 className="animate-spin" size={16} />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-border bg-surface flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 bg-app-bg border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand text-app-text transition-colors"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading}
          className="bg-brand text-white p-2 rounded-xl hover:bg-brand-light disabled:opacity-50 transition-colors flex items-center justify-center shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
