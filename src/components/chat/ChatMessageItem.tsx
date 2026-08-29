import React from 'react';
import { User, HelpCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { ChatMessage } from '../../types';
import { ChakraMark } from '../ui/ChakraMark';
import { useTranslation } from '../../i18n';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const { t, language } = useTranslation();
  const isAssistant = message.sender === 'assistant';
  const isSystem = message.sender === 'system';

  const isHindi = language === 'hi';

  // Display bilingual content if available for active language
  const displayContent =
    isHindi && message.contentHi ? message.contentHi : message.content;

  const explanation =
    isHindi && message.meta?.explanationHi
      ? message.meta.explanationHi
      : message.meta?.explanation;

  const questionTitle =
    isHindi && message.meta?.questionTitleHi
      ? message.meta.questionTitleHi
      : message.meta?.questionTitle;

  const questionIndex = message.meta?.questionIndex;
  const totalQuestions = message.meta?.totalQuestions;

  if (isSystem) {
    return (
      <div className="flex justify-center my-2" role="status">
        <div className="inline-flex items-center px-3 py-1 rounded-pill bg-mist text-muted-text text-xs font-medium border border-border-soft shadow-2xs">
          {displayContent}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2.5 sm:gap-3 my-3 sm:my-4 ${
        isAssistant ? 'justify-start' : 'justify-end flex-row-reverse'
      }`}
      role="article"
      aria-label={`${isAssistant ? 'Rakshak AI' : 'You'}: ${displayContent}`}
      data-testid={`chat-message-${message.id}`}
    >
      {/* Avatar */}
      {isAssistant ? (
        <div className="shrink-0 pt-0.5">
          <ChakraMark size="sm" aria-hidden="true" />
        </div>
      ) : (
        <div className="size-7 rounded-full bg-deep-navy text-white flex items-center justify-center shrink-0 shadow-2xs">
          <User className="size-4 text-white" aria-hidden="true" />
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`flex flex-col max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-2xs ${
          isAssistant
            ? 'bg-white border border-border-soft text-deep-navy rounded-tl-xs'
            : 'bg-deep-navy text-white rounded-tr-xs'
        }`}
      >
        {/* Header with Sender name, Question Step Counter & Timestamp */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                isAssistant ? 'text-chakra-blue' : 'text-blue-200'
              }`}
            >
              {isAssistant ? 'Rakshak AI' : 'You'}
            </span>

            {/* Question Progress Badge */}
            {isAssistant && questionIndex && totalQuestions && (
              <span className="text-[10px] font-bold text-chakra-blue bg-blue-50 px-2 py-0.5 rounded-pill border border-blue-100/80">
                {t.chat.questionProgress
                  .replace('{current}', questionIndex.toString())
                  .replace('{total}', totalQuestions.toString())}
              </span>
            )}
          </div>

          {message.timestamp && (
            <span
              className={`text-[10px] ${
                isAssistant ? 'text-muted-text' : 'text-blue-300/80'
              }`}
            >
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {/* Optional Question Title */}
        {isAssistant && questionTitle && (
          <h4 className="text-xs font-bold text-deep-navy/80 mb-1">
            {questionTitle}
          </h4>
        )}

        {/* Message Content */}
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
          {displayContent}
        </p>

        {/* Supportive Sensitive Information Explanation Callout */}
        {isAssistant && explanation && (
          <div className="mt-2.5 pt-2 border-t border-border-soft/80 flex items-start gap-2 text-xs bg-mist/70 p-2.5 rounded-xl text-muted-text">
            <ShieldCheck className="size-4 text-chakra-blue shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-0.5">
              <span className="font-bold text-deep-navy block text-[11px]">
                {t.chat.whyWeAsk}
              </span>
              <p className="text-[11px] leading-normal font-normal text-muted-text">
                {explanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
