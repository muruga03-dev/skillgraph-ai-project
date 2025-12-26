
import React, { useState, useRef, useEffect } from 'react';
import { getCareerAssistantResponse } from '../services/geminiService';
import { ChatMessage, SkillAnalysis, User } from '../types';
import { saveChatMessage } from '../services/dbService';

interface CareerAssistantProps {
  analysis: SkillAnalysis | null;
  user: User | null;
}

const CareerAssistant: React.FC<CareerAssistantProps> = ({ analysis, user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am your SkillGraph AI Assistant. Based on your profile, I can help with study plans, career advice, or interview mockups. What would you like to discuss today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user) return;

    const userMsg: ChatMessage = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Save user message to DB
    saveChatMessage(user.id, userMsg).catch(console.error);

    try {
      const aiResponse = await getCareerAssistantResponse(messages, inputValue);
      const modelMsg: ChatMessage = { role: 'model', text: aiResponse || "I'm sorry, I couldn't process that." };
      setMessages(prev => [...prev, modelMsg]);
      
      // Save model message to DB
      saveChatMessage(user.id, modelMsg).catch(console.error);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI service." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100 overflow-hidden">
      <div className="bg-indigo-600 p-6 text-white flex items-center space-x-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
          <i className="fas fa-robot text-2xl"></i>
        </div>
        <div>
          <h2 className="text-xl font-bold">Career Assistant</h2>
          <div className="flex items-center text-indigo-200 text-xs font-bold uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
            AI Online (Synced to DB)
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-5 rounded-[2rem] shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
            }`}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 rounded-bl-none shadow-sm flex space-x-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-indigo-400 transition-all">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me anything about your career journey..."
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700 font-medium"
          />
          <button 
            onClick={handleSendMessage}
            className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CareerAssistant;
