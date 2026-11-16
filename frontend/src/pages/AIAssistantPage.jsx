import React from 'react';
import { AIChatbotComponent } from '../features/ai-assistant/AIChatbotComponent';

export const AIAssistantPage = () => {
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col font-sans overflow-hidden">
      <AIChatbotComponent />
    </div>
  );
};
