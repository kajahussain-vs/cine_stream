import React, { useState, useRef, useEffect } from 'react';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function CineBot({ movies }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: "Welcome to **CineStream**! Ask me anything about our movies, or tell me your current mood.", timestamp: new Date() }
  ]);

  const messagesEndRef = useRef(null);

  const formatMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input;
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userText, timestamp: new Date() }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const historyPayload = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      historyPayload.push({ role: 'user', parts: [{ text: userText }] });

      const systemPrompt = {
        parts: [{
          text: `You are CineBot. These are the movies currently in our database:
${JSON.stringify(movies, null, 2)}
Instructions: Always check our movie context database before making suggestions. Highlight titles in bold (**Title**). Format text clearly in markdown.`
        }]
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: historyPayload,
            systemInstruction: systemPrompt
          })
        }
      );

      if (!response.ok) throw new Error("API Connection Interrupted.");
      const data = await response.json();
      const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble retrieving my thoughts. Let's try again.";

      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: botText, timestamp: new Date() }]);
    } catch (err) {
      console.error(err);
      setError("AI connection failure. Verify API Key settings.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90]">
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="p-4 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:scale-110 active:scale-95 transition-all duration-300">
          💬
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-0 sm:right-0 w-full h-full sm:w-96 sm:h-[500px] bg-[#0c0c0c]/95 border border-zinc-850 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-6 duration-200">
          <div className="p-4 bg-zinc-950 border-b border-zinc-850 flex items-center justify-between">
            <span className="font-bold text-sm">CineBot Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
          </div>

          <div className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-red-600 text-white rounded-tr-none' : 'bg-zinc-900 border border-zinc-800 rounded-tl-none text-zinc-200'}`}>
                  <p>{formatMarkdown(msg.text)}</p>
                </div>
              </div>
            ))}
            {isLoading && <p className="text-xs text-zinc-500">Thinking...</p>}
            {error && <p className="text-xs text-red-500 bg-red-900/10 p-2 rounded">{error}</p>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950 border-t border-zinc-850 flex gap-2">
            <input
              type="text" value={input}
              disabled={isLoading || !GEMINI_API_KEY}
              onChange={e => setInput(e.target.value)}
              placeholder={GEMINI_API_KEY ? "Ask CineBot..." : "Check API configuration..."}
              className="flex-grow bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white p-2.5 focus:outline-none"
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="bg-red-600 hover:bg-red-700 px-4 py-2 text-xs rounded-xl font-bold transition">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
