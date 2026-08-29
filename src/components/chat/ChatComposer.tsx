import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare, Paperclip } from 'lucide-react';
import { Emergency1930Pill } from '../ui/Emergency1930Pill';
import { useTranslation } from '../../i18n';
import { SuggestedOption } from '../../types';

interface ChatComposerProps {
  onSendMessage: (message: string) => void;
  onSelectOption?: (option: SuggestedOption) => void;
  onToggleEvidence?: () => void;
  onSelectFiles?: (files: FileList) => void;
  disabled?: boolean;
  showStarterChips?: boolean;
  activeOptions?: SuggestedOption[];
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  onSelectOption,
  onToggleEvidence,
  onSelectFiles,
  disabled = false,
  showStarterChips = false,
  activeOptions = [],
}) => {
  const { t, language } = useTranslation();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isHindi = language === 'hi';

  // Auto-resize textarea height as user types
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStarterChipClick = (promptText: string) => {
    onSendMessage(promptText);
  };

  const handleOptionClick = (option: SuggestedOption) => {
    if (onSelectOption) {
      onSelectOption(option);
    } else {
      const val = isHindi && option.labelHi ? option.labelHi : option.label;
      onSendMessage(val);
    }
  };

  const starterChips = [
    { id: 'upi', text: t.chat.starterPrompt1 },
    { id: 'card', text: t.chat.starterPrompt2 },
    { id: 'hack', text: t.chat.starterPrompt3 },
    { id: 'blackmail', text: t.chat.starterPrompt4 },
  ];

  return (
    <div
      className="border-t border-border-soft bg-white px-3.5 py-3 sm:px-6 sm:py-4 space-y-2.5 shadow-2xs"
      data-testid="chat-composer"
    >
      {/* Dynamic Question Suggested Reply Chips */}
      {activeOptions.length > 0 && !showStarterChips && (
        <div className="space-y-1.5 pb-1 animate-fade-in" data-testid="guided-options-chips">
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-semibold">
            <MessageSquare className="size-3.5 text-chakra-blue" aria-hidden="true" />
            <span>{t.chat.suggestedOptionsTitle}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {activeOptions.map((opt, idx) => {
              const chipLabel = isHindi && opt.labelHi ? opt.labelHi : opt.label;
              return (
                <button
                  key={`${opt.value}-${idx}`}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  disabled={disabled}
                  className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-full bg-saffron/10 hover:bg-saffron text-saffron hover:text-white border border-saffron/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-left"
                >
                  {chipLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Starter Suggested Reply Chips */}
      {showStarterChips && (
        <div className="space-y-1.5 pb-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-text font-semibold">
            <Sparkles className="size-3.5 text-saffron" aria-hidden="true" />
            <span>{t.chat.starterPromptTitle}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {starterChips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleStarterChipClick(chip.text)}
                disabled={disabled}
                className="inline-flex items-center text-xs font-bold px-4 py-2 rounded-full bg-saffron/10 hover:bg-saffron text-saffron hover:text-white border border-saffron/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-left"
              >
                {chip.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Composer Box */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-white rounded-2xl border border-black/5 p-2 sm:p-2.5 focus-within:border-saffron/40 focus-within:ring-2 focus-within:ring-saffron/40 transition-all shadow-lg"
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              if (onSelectFiles) {
                onSelectFiles(e.target.files);
              }
            }
          }}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* Attachment Button */}
        <button
          type="button"
          onClick={() => {
            if (onToggleEvidence) {
              onToggleEvidence();
            } else if (fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
          disabled={disabled}
          title={t.chat.attachEvidenceAria}
          aria-label={t.chat.attachEvidenceAria}
          className="inline-flex items-center justify-center size-9 sm:size-10 rounded-full text-muted-text hover:text-saffron hover:bg-saffron/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 focus-visible:ring-2 focus-visible:ring-saffron"
        >
          <Paperclip className="size-4.5 sm:size-5" aria-hidden="true" />
        </button>

        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={t.chat.composerPlaceholder}
          aria-label={t.chat.composerPlaceholder}
          className="flex-1 max-h-36 min-h-[38px] bg-transparent resize-none px-2 py-1.5 text-sm sm:text-base text-deep-navy placeholder:text-muted-text/80 focus:outline-none disabled:opacity-60 leading-relaxed font-medium"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label={t.chat.sendButtonAria}
          className="inline-flex items-center justify-center size-9 sm:size-10 rounded-full bg-saffron hover:bg-[#E67E17] text-white font-bold shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-saffron"
        >
          <Send className="size-4.5 sm:size-5" aria-hidden="true" />
        </button>
      </form>

      {/* Emergency Helpline Strip below Composer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] sm:text-xs text-muted-text">
        <div className="flex items-center gap-2">
          <Emergency1930Pill size="sm" />
          <span className="hidden sm:inline font-medium">
            {t.emergency.financialFraudWarning}
          </span>
        </div>
        <span className="text-[10px] text-muted-text/80">
          Press Enter ↵ to send • Shift+Enter for newline
        </span>
      </div>
    </div>
  );
};
