import React, { useEffect, useRef } from 'react';
import {
  ChatMessage,
  ClassificationResult,
  ComplaintCategory,
  ComplaintSubCategory,
} from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { CategoryConfidenceCard } from './CategoryConfidenceCard';
import { EmergencyActionCard } from './EmergencyActionCard';
import { EvidenceUploader } from './EvidenceUploader';
import { ChakraMark } from '../ui/ChakraMark';
import { useTranslation } from '../../i18n';

interface ChatThreadProps {
  messages: ChatMessage[];
  classification: ClassificationResult | null;
  categoryConfirmed: boolean;
  isTyping?: boolean;
  showEvidenceUploader?: boolean;
  category?: ComplaintCategory;
  onConfirmCategory: () => void;
  onChangeCategory: (
    newCategory: ComplaintCategory,
    newSubCategoryKey?: ComplaintSubCategory,
  ) => void;
  onCloseEvidence?: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  classification,
  categoryConfirmed,
  isTyping = false,
  showEvidenceUploader = false,
  category,
  onConfirmCategory,
  onChangeCategory,
  onCloseEvidence,
}) => {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom smoothly when messages or classification updates
  useEffect(() => {
    if (
      bottomRef.current &&
      typeof bottomRef.current.scrollIntoView === 'function'
    ) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, classification, isTyping, showEvidenceUploader]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-6 space-y-2"
      role="log"
      aria-live="polite"
      aria-label="Conversation with Rakshak AI"
      data-testid="chat-thread"
    >
      {/* Messages */}
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}

      {/* Suggested Category Confidence Card */}
      {classification && (
        <div className="pl-0 sm:pl-10">
          <CategoryConfidenceCard
            classification={classification}
            isConfirmed={categoryConfirmed}
            onConfirm={onConfirmCategory}
            onChangeCategory={onChangeCategory}
          />
        </div>
      )}

      {/* Emergency 1930 Action Card for Financial Fraud */}
      {classification?.isEmergency && (
        <div className="pl-0 sm:pl-10">
          <EmergencyActionCard />
        </div>
      )}

      {/* Inline Evidence Uploader when triggered or upon questions completion */}
      {showEvidenceUploader && (
        <div className="pl-0 sm:pl-10 my-3 animate-fade-in" data-testid="chat-evidence-section">
          <EvidenceUploader
            category={category || classification?.category}
            onClose={onCloseEvidence}
          />
        </div>
      )}

      {/* Simulated Typing Indicator */}
      {isTyping && (
        <div
          className="flex items-center gap-3 my-3 animate-fade-in pl-0 sm:pl-10"
          role="status"
          aria-label={t.chat.typingIndicator}
        >
          <div className="shrink-0">
            <ChakraMark size="sm" aria-hidden="true" />
          </div>
          <div className="bg-white border border-border-soft px-4 py-2.5 rounded-2xl shadow-2xs flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-chakra-blue animate-bounce [animation-delay:-0.3s]" />
            <span className="size-1.5 rounded-full bg-chakra-blue animate-bounce [animation-delay:-0.15s]" />
            <span className="size-1.5 rounded-full bg-chakra-blue animate-bounce" />
            <span className="text-xs text-muted-text font-medium ml-1">
              {t.chat.typingIndicator}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
};
