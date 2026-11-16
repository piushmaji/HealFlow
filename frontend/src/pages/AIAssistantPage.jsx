import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { AIChatbotComponent } from '../features/ai-assistant/AIChatbotComponent';
import { Badge } from '../components/ui/Badge';
import { Sparkles } from 'lucide-react';

export const AIAssistantPage = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-4 font-sans pb-4">
      <PageHeader
        title="AI Specialist Guide"
        subtitle="Conversational symptom triage, voice input, doctor matching, and clinical prescription guidance."
        badge={
          <Badge variant="brand" size="md" icon={Sparkles}>
            Live RAG Engine
          </Badge>
        }
      />

      <AIChatbotComponent />
    </div>
  );
};
