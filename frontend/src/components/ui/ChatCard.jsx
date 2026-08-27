import React from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Card } from './Card';

export const ChatCard = ({
  name = 'Dr. Elise Brown',
  subtitle = 'Smart Medical Center',
  rating = '5.0',
  avatarUrl = 'https://images.unsplash.com/photo-1594824813566-88855ce78c91?w=150&auto=format&fit=crop&q=80',
  lastMessage = 'Hello, how can I assist you with your consultation today?',
  unreadCount = 2,
  onChatClick,
  className = '',
}) => {
  return (
    <Card
      onClick={onChatClick}
      hoverEffect
      className={`p-3.5 bg-white border-[#CEDEFF] shadow-card font-poppins cursor-pointer ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <img
            src={avatarUrl}
            alt={name}
            className="w-11 h-11 rounded-full object-cover border-2 border-[#CEDEFF]"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-[#1F1F1F] truncate font-heading">{name}</h5>
            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{rating}</span>
            </div>
          </div>
          <p className="text-[10px] text-[#5B81FA] font-semibold">{subtitle}</p>
          <p className="text-[11px] text-[#6B6E84] truncate mt-0.5">{lastMessage}</p>
        </div>

        {unreadCount > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#5B81FA] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
            {unreadCount}
          </span>
        )}
      </div>
    </Card>
  );
};
