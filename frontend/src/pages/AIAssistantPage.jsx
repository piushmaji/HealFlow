import React from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { AIChatbotComponent } from '../features/ai-assistant/AIChatbotComponent';
import { Badge } from '../components/ui/Badge';
import { Sparkles } from 'lucide-react';

export const AIAssistantPage = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-4 font-sans pb-2">
      <PageHeader
        title="AI Specialist Suggestion Engine"
        subtitle="Describe your symptoms in plain language for instant specialist triage & doctor recommendations."
        badge={
          <Badge variant="brand" size="md" icon={Sparkles}>
            AI Clinical Assistant
          </Badge>
        }
      />

      <AIChatbotComponent />
    </div>
  );
};
