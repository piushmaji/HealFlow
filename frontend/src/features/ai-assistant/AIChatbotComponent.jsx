import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAIChatResponse } from '../../services/supabase/aiService';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Calendar,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  Activity,
  Zap,
  Clock,
  RotateCcw,
  Baby,
} from 'lucide-react';

export const AIChatbotComponent = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend = null) => {
    const query = textToSend || inputMessage;
    if (!query.trim()) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const response = await generateAIChatResponse(query);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedSpecialty: response.suggestedSpecialty,
        recommendedDoctor: response.recommendedDoctor,
        isEmergency: response.isEmergency,
        followUpQuestions: response.followUpQuestions || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: 'Unable to analyze symptoms right now. Please try again or consult a doctor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const quickPills = [
    { label: 'Chest tightness', prompt: 'Chest tightness and shortness of breath during physical exercise', icon: HeartPulse },
    { label: 'Severe headache', prompt: 'Severe throbbing headache with light sensitivity for 2 days', icon: Zap },
    { label: 'Skin rash', prompt: 'Red itchy skin rash on arm with small raised bumps', icon: Activity },
    { label: 'Joint stiffness', prompt: 'Swollen knee joint with stiffness after walking', icon: Clock },
  ];

  return (
    <div className="bg-white rounded-3xl border-0 shadow-xs flex flex-col h-[540px] overflow-hidden font-sans relative">
      
      {/* 1. Header Bar */}
      <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 font-heading">
              <h3 className="text-sm font-black text-[#1F1F1F]">HealFlow AI Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-[#6B6E84] font-medium font-secondary">
              Instant Symptom Triage & Doctor Suggestions
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={handleClearChat}
            style={{ outline: 'none' }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border-0 font-secondary"
            title="Reset Chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        )}
      </div>

      {/* 2. Messages & Empty State Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFE] no-scrollbar font-secondary">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-5 py-4 animate-fade-in">
            
            <div className="w-14 h-14 rounded-3xl bg-[#F2F5FF] text-[#4C5BBD] flex items-center justify-center shadow-xs">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-[#1F1F1F] font-heading">
                How can I help your health today?
              </h3>
              <p className="text-xs text-[#6B6E84] font-medium max-w-sm mx-auto">
                Describe your medical symptoms or select a quick concern pill below.
              </p>
            </div>

            {/* Quick Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto pt-2">
              {quickPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <button
                    key={pill.label}
                    type="button"
                    onClick={() => handleSendMessage(pill.prompt)}
                    style={{ outline: 'none' }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[#4C5BBD] text-xs font-bold shadow-xs hover:bg-[#4C5BBD] hover:text-white transition-all border-0"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{pill.label}</span>
                  </button>
                );
              })}
            </div>

          </div>
        ) : (
          /* ACTIVE CHAT THREAD */
          <div className="space-y-4">
            {messages.map((msg) => {
              const isAI = msg.sender === 'ai';

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  {isAI && (
                    <div className="w-8 h-8 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] space-y-2 ${isAI ? 'text-left' : 'text-right'}`}>
                    
                    {/* Text Bubble */}
                    <div
                      className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAI
                          ? 'bg-white text-[#1F1F1F] rounded-tl-sm border-0'
                          : 'bg-[#4C5BBD] text-white rounded-tr-sm font-medium'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>

                    {/* Inline Recommended Doctor Telemetry Card */}
                    {isAI && msg.recommendedDoctor && (
                      <div className="p-4 rounded-2xl bg-white border-0 shadow-xs space-y-3 mt-2 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase text-[#4C5BBD] bg-[#F2F5FF] px-2.5 py-0.5 rounded-full">
                            Suggested Specialist
                          </span>
                          <span className="text-xs font-black text-[#1F1F1F] font-sans">
                            ₹{msg.recommendedDoctor.consultation_fee}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-[#F2F5FF] text-[#4C5BBD] shrink-0">
                            <Stethoscope className="w-4.5 h-4.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-black text-[#1F1F1F] font-heading">{msg.recommendedDoctor.name}</h4>
                            <p className="text-[11px] text-[#4C5BBD] font-bold">{msg.recommendedDoctor.specialty}</p>
                            <p className="text-[10px] text-[#6B6E84] truncate">{msg.recommendedDoctor.hospital}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/doctors/${msg.recommendedDoctor.id}/book`)}
                          style={{ outline: 'none' }}
                          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white text-xs font-black shadow-xs transition-all border-0"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book Consultation Slot →</span>
                        </button>
                      </div>
                    )}

                    {/* Interactive Follow-Up Chips */}
                    {isAI && msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5 text-left">
                        {msg.followUpQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleSendMessage(q)}
                            style={{ outline: 'none' }}
                            className="px-3 py-1 rounded-full text-[11px] font-bold bg-white text-[#4C5BBD] hover:bg-[#4C5BBD] hover:text-white shadow-xs border-0 transition-all"
                          >
                            "{q}"
                          </button>
                        ))}
                      </div>
                    )}

                    <span className="text-[9px] text-[#6B6E84] block px-1">
                      {msg.timestamp}
                    </span>

                  </div>

                  {!isAI && (
                    <div className="w-8 h-8 rounded-2xl bg-[#161B33] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-[#4C5BBD] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-3.5 rounded-3xl bg-white text-[#6B6E84] text-xs font-bold shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#4C5BBD] animate-ping"></span>
                  <span>AI Assistant analyzing symptoms...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* 3. Floating Centered Composer Bar */}
      <div className="p-3.5 bg-white border-t border-slate-100 shrink-0 font-secondary">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-[#F8FAFE] p-1.5 pl-5 pr-2 rounded-full shadow-xs border-0 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4C5BBD]/20 transition-all"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type symptoms or ask a medical question..."
            style={{ outline: 'none', boxShadow: 'none' }}
            className="flex-1 bg-transparent border-0 text-xs text-[#1F1F1F] font-semibold placeholder-[#A8B1CE] outline-none"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            style={{ outline: 'none' }}
            className="w-9 h-9 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white flex items-center justify-center shadow-xs transition-all border-0 disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex items-center justify-center gap-1 text-[9px] text-[#6B6E84] pt-1.5 font-medium">
          <ShieldCheck className="w-3 h-3 text-[#4C5BBD]" />
          <span>AI suggestions are for guidance only. Call emergency for urgent care.</span>
        </div>
      </div>

    </div>
  );
};
