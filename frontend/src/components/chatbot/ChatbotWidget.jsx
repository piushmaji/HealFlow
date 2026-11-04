import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { sendChatbotMessage } from '../../services/chatbotService';

export const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! I am your Healflow AI Specialist Guide. Describe your symptoms (in English, Hindi, or Hinglish) and I will help you identify the right specialist and available doctors on Healflow.',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (text) => {
    const userMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const response = await sendChatbotMessage(text);
      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.message,
        suggested_specialty: response.suggested_specialty,
        specialty_reason: response.specialty_reason,
        emergency: response.emergency,
        emergency_message: response.emergency_message,
        emergency_contact: response.emergency_contact,
        show_doctors: response.show_doctors,
        doctors: response.doctors || [],
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: 'I encountered an error connecting to the guidance system. Please describe your symptoms again or explore the doctors directory directly.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Conversation cleared. How can I help you today? You can describe any symptoms or ask about medical specialties.',
      },
    ]);
  };

  const samplePrompts = [
    'Chest pain & shortness of breath',
    'Red itchy skin rash for 3 days',
    'Child has high fever and cough',
    'Persistent knee joint pain',
  ];

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#4C5BBD] hover:bg-[#3B489E] text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-0 cursor-pointer font-sans"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide">AI Guide</span>
        </button>
      )}

      {/* Expandable Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[99999] w-[92vw] sm:w-[400px] h-[560px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-fade-in font-sans">
          <ChatHeader onClose={() => setIsOpen(false)} onClear={handleClear} />

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAFBFD]">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}

            {isTyping && <TypingIndicator />}

            {/* Quick Sample Chips if only welcome message is present */}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] font-bold text-[#6B6E84] uppercase tracking-wider">Suggested Inquiries:</p>
                <div className="flex flex-wrap gap-1.5">
                  {samplePrompts.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleSend(p)}
                      className="text-[11px] font-medium bg-white hover:bg-[#F2F5FF] text-[#4C5BBD] border border-slate-200/80 px-2.5 py-1 rounded-full transition-all text-left cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <ChatInput onSend={handleSend} disabled={isTyping} />
        </div>
      )}
    </>
  );
};

