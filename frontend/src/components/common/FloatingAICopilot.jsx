import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { generateAIChatResponse } from '../../services/supabase/aiService';
import { Sparkles, Bot, Send, X, Calendar, Stethoscope, ArrowRight, RefreshCw, MessageSquare } from 'lucide-react';

export const FloatingAICopilot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      sender: 'ai',
      text: 'Hi! I am your HealFlow AI Health Copilot. How can I help you today?',
      followUps: ['Book Cardiology Consultation', 'Check rash on arm', 'Headache for 2 days'],
    },
  ]);
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (queryText = null) => {
    const query = queryText || input;
    if (!query.trim()) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const res = await generateAIChatResponse(query);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.text,
        recommendedDoctor: res.recommendedDoctor,
        followUps: res.followUpQuestions || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'ai', text: 'I am temporarily unavailable. Please try again.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[999999] font-sans">
      
      {/* Floating Toggle Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{ outline: 'none' }}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-bold shadow-lg transition-all hover:scale-105 border-0"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white animate-pulse" />
          </div>
          <span>AI Copilot</span>
        </button>
      ) : (
        /* Floating Chatbot Drawer Window */
        <div className="w-80 sm:w-96 bg-white text-[#1F1F1F] rounded-3xl shadow-2xl border-0 flex flex-col h-[520px] overflow-hidden animate-fade-in">
          
          {/* Header */}
          <div className="p-4 bg-[#4C5BBD] text-white flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white font-heading">AI Copilot</h4>
                <p className="text-[10px] text-[#CEDEFF]">Live Specialist Guidance</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ outline: 'none' }}
              className="p-1.5 rounded-full text-white/80 hover:bg-white/20 transition-colors border-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFE] text-xs font-secondary no-scrollbar">
            {messages.map((m) => {
              const isAI = m.sender === 'ai';
              return (
                <div key={m.id} className={`flex flex-col ${isAI ? 'items-start' : 'items-end'}`}>
                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed shadow-xs ${
                      isAI ? 'bg-white text-[#1F1F1F]' : 'bg-[#4C5BBD] text-white font-medium'
                    }`}
                  >
                    {m.text}
                  </div>

                  {/* Doctor recommendation card inside float widget */}
                  {isAI && m.recommendedDoctor && (
                    <div className="mt-2 p-3 rounded-2xl bg-white border-0 shadow-xs space-y-2 text-left w-[85%] font-secondary">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-3.5 h-3.5 text-[#4C5BBD]" />
                        <span className="text-[10px] font-black text-[#1F1F1F] truncate">
                          {m.recommendedDoctor.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          navigate(`/doctors/${m.recommendedDoctor.id}/book`);
                        }}
                        style={{ outline: 'none' }}
                        className="w-full py-1.5 px-3 rounded-full bg-[#4C5BBD] text-white text-[10px] font-bold border-0 shadow-xs flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" />
                        <span>Book Slot ₹{m.recommendedDoctor.consultation_fee}</span>
                      </button>
                    </div>
                  )}

                  {/* Follow up chips */}
                  {isAI && m.followUps && m.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {m.followUps.map((fu, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(fu)}
                          style={{ outline: 'none' }}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#4C5BBD] shadow-xs border-0 hover:bg-[#4C5BBD] hover:text-white transition-all"
                        >
                          "{fu}"
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="p-3 rounded-2xl bg-white text-[#6B6E84] text-[11px] font-bold shadow-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#4C5BBD] animate-spin" />
                <span>AI Copilot thinking...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Composer */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0 font-secondary">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI Copilot..."
                style={{ outline: 'none', boxShadow: 'none' }}
                className="flex-1 bg-[#F8FAFE] border-0 rounded-full px-3.5 py-2 text-xs text-[#1F1F1F] font-semibold"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                style={{ outline: 'none' }}
                className="w-8 h-8 rounded-full bg-[#4C5BBD] text-white flex items-center justify-center border-0 disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>,
    document.body
  );
};
