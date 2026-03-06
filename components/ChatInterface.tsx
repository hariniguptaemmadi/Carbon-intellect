
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getCarbonReasoning } from '../services/geminiService';

interface ChatInterfaceProps {
  currentData: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I am Carbon Intellect AI. How can I help you analyze your carbon footprint today?', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await getCarbonReasoning(input, currentData);
    
    const assistantMsg: ChatMessage = { role: 'assistant', content: response || "I encountered an error.", timestamp: new Date() };
    setMessages(prev => [...prev, assistantMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-slate-700">Carbon Reasoning AI</h3>
        </div>
        <span className="text-xs text-slate-400">Powered by Gemini 3</span>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
            }`}>
              {m.content.split('\n').map((line, idx) => (
                <p key={idx} className={line.startsWith('-') ? 'ml-4' : 'mb-2'}>
                  {line}
                </p>
              ))}
              <span className={`text-[10px] mt-1 block opacity-60 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-3 text-sm animate-pulse">
              Analyzing organizational data and ESG documents...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about Scope 3 impacts, reduction targets..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
