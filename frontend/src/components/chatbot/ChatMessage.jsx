import React from 'react';
import { Bot, User } from 'lucide-react';
import { EmergencyAlert } from './EmergencyAlert';
import { DoctorRecommendation } from './DoctorRecommendation';

export const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-[#4C5BBD] text-white shadow-xs'
            : 'bg-[#F2F5FF] text-[#4C5BBD] border border-[#DCE5F7]'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
            isUser
              ? 'bg-[#4C5BBD] text-white font-medium rounded-tr-none'
              : 'bg-white text-[#1F1F1F] font-medium border border-slate-100 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-line">{message.text || message.content}</p>
        </div>

        {/* Emergency Alert Banner */}
        {message.emergency && (
          <EmergencyAlert
            message={message.emergency_message || message.text}
            emergencyContact={message.emergency_contact || '112'}
          />
        )}

        {/* Doctor & Specialty Recommendations */}
        {!message.emergency && message.show_doctors && (
          <DoctorRecommendation
            specialty={message.suggested_specialty}
            specialtyReason={message.specialty_reason}
            doctors={message.doctors}
          />
        )}
      </div>
    </div>
  );
};

