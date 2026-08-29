import React, { useEffect, useState, useRef } from 'react';
import { Bot, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n';
import { useDraftStore } from '../store';
import {
  ChatThread,
  ChatComposer,
  ComplaintSummaryPanel,
} from '../components/chat';
import {
  ComplaintCategory,
  ComplaintSubCategory,
  SuggestedOption,
  EvidenceItem,
} from '../types';
import { getCategoryDefinition } from '../data/categories';

export const ChatPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [isTyping, setIsTyping] = useState(false);
  const [showEvidenceSection, setShowEvidenceSection] = useState(false);

  const {
    draft,
    classification,
    chatMessages,
    workflow,
    classifySummary,
    addChatMessage,
    addEvidenceItem,
    setCategory,
    confirmCategory,
    answerGuidedQuestion,
    resetChat,
  } = useDraftStore();

  const hasInitialized = useRef(false);

  // Initialize initial greeting if thread is empty
  useEffect(() => {
    if (chatMessages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      addChatMessage({
        id: `msg-initial-${Date.now()}`,
        sender: 'assistant',
        content: t.chat.assistantGreeting,
        contentHi:
          'नमस्ते! मैं रक्षक एआई हूं। एक-दो लाइनों में बताइए कि आपके साथ क्या हुआ, मैं आपकी शिकायत तैयार करने में मदद करूंगा।',
        timestamp: new Date().toISOString(),
        type: 'text',
      });
    }
  }, [chatMessages.length, addChatMessage, t.chat.assistantGreeting]);

  // Find active question options from the latest question message if questions are in progress
  const latestQuestionMessage = [...chatMessages]
    .reverse()
    .find((m) => m.type === 'question');

  const isAnsweringQuestions =
    workflow.categoryConfirmed &&
    !workflow.isQuestionsCompleted &&
    latestQuestionMessage !== undefined;

  const activeOptions = isAnsweringQuestions ? latestQuestionMessage.options : [];

  // Handle citizen message submission
  const handleSendMessage = (messageText: string) => {
    // If not classified yet, classify incident summary
    if (!classification) {
      const userMsgId = `msg-user-${Date.now()}`;
      addChatMessage({
        id: userMsgId,
        sender: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
        type: 'text',
      });

      // Deterministic instant classification
      const result = classifySummary(messageText);
      const isHindi = language === 'hi';
      const catLabel = isHindi ? result.categoryLabelHi : result.categoryLabel;

      let assistantReply = isHindi
        ? `यह मामला ${catLabel} से संबंधित प्रतीत होता है।`
        : `This looks like a ${catLabel} case.`;

      if (result.isEmergency) {
        assistantReply += isHindi
          ? ' चूंकि धन की अनधिकृत निकासी हुई है, कृपया लेन-देन रोकने के लिए तुरंत 1930 पर कॉल करें। मैं साथ ही आपकी औपचारिक शिकायत भी तैयार कर रहा हूं।'
          : ' Since money was deducted or transferred, please call 1930 immediately to freeze funds in banking channels. I will also help prepare your complaint.';
      } else {
        assistantReply += isHindi
          ? ' मैंने नीचे आपकी शिकायत का मसौदा तैयार करना शुरू कर दिया है। कृपया सुझाई गई श्रेणी की पुष्टि करें या बदलें।'
          : ' I will help prepare the complaint under this category unless you would like to change it.';
      }

      addChatMessage({
        id: `msg-asst-${Date.now()}`,
        sender: 'assistant',
        content: assistantReply,
        contentHi: assistantReply,
        timestamp: new Date().toISOString(),
        type: 'category_suggestion',
        meta: {
          category: result.category,
          subCategory: result.subCategory,
          subCategoryKey: result.subCategoryKey,
          confidence: result.confidence,
          isEmergency: result.isEmergency,
        },
      });
      return;
    }

    // If in guided questions mode
    if (workflow.categoryConfirmed && !workflow.isQuestionsCompleted) {
      answerGuidedQuestion(messageText);
      return;
    }

    // If category was suggested but user typed answer directly before clicking "Looks right"
    if (!workflow.categoryConfirmed) {
      confirmCategory(true);
      answerGuidedQuestion(messageText);
      return;
    }

    // Follow-up after questions completed
    addChatMessage({
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
      type: 'text',
    });
  };

  // Handle selecting an option chip
  const handleSelectOption = (option: SuggestedOption) => {
    if (workflow.categoryConfirmed && !workflow.isQuestionsCompleted) {
      answerGuidedQuestion(option.value, option);
    } else {
      handleSendMessage(option.value);
    }
  };

  // Handle category confirmation
  const handleConfirmCategory = () => {
    confirmCategory(true);
    const catName = classification?.categoryLabel || draft.category || 'Incident';

    addChatMessage({
      id: `msg-confirm-${Date.now()}`,
      sender: 'system',
      content: t.chat.categoryConfirmedNotice.replace('{category}', catName),
      timestamp: new Date().toISOString(),
      type: 'text',
    });
  };

  // Handle category changing
  const handleChangeCategory = (
    newCategory: ComplaintCategory,
    newSubCategoryKey?: ComplaintSubCategory,
  ) => {
    setCategory(newCategory, newSubCategoryKey);
    const catDef = getCategoryDefinition(newCategory);
    const catName = language === 'hi' ? catDef.labelHi : catDef.label;

    addChatMessage({
      id: `msg-change-${Date.now()}`,
      sender: 'system',
      content: t.chat.categoryChangedNotice.replace('{category}', catName),
      timestamp: new Date().toISOString(),
      type: 'text',
    });
  };

  // Handle file selection from composer directly
  const handleSelectFilesFromComposer = (files: FileList) => {
    Array.from(files).forEach((file) => {
      const formattedSize =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      const newItem: EvidenceItem = {
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        mockSize: formattedSize,
        uploadedAt: new Date().toISOString(),
      };
      addEvidenceItem(newItem);
    });
    setShowEvidenceSection(true);
  };

  // Handle resetting the chat report
  const handleReset = () => {
    if (window.confirm(t.chat.resetConfirmPrompt)) {
      resetChat();
      setShowEvidenceSection(false);
    }
  };

  const hasCitizenReplied = chatMessages.some((m) => m.sender === 'user');
  const shouldDisplayEvidence =
    showEvidenceSection ||
    workflow.isQuestionsCompleted ||
    workflow.currentStep === 'ask_evidence';

  return (
    <div
      className="max-w-7xl mx-auto w-full flex flex-col min-h-[calc(100vh-140px)]"
      data-testid="chat-page"
    >
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-border-soft px-2">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-full bg-chakra-blue text-white flex items-center justify-center shadow-2xs">
            <Bot className="size-4.5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-deep-navy leading-tight">
              {t.chat.pageTitle}
            </h1>
            <p className="text-xs text-muted-text hidden sm:block">
              {t.chat.pageSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasCitizenReplied && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-soft hover:bg-mist text-xs font-semibold text-deep-navy transition-colors cursor-pointer"
              title={t.chat.resetConversation}
            >
              <RotateCcw className="size-3.5 text-muted-text" />
              <span>{t.chat.resetConversation}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Chat Thread and Composer */}
        <div className="lg:col-span-8 flex flex-col bg-white rounded-2xl border border-border-soft shadow-xs overflow-hidden h-[620px] sm:h-[680px]">
          {/* Message Thread */}
          <ChatThread
            messages={chatMessages}
            classification={classification}
            categoryConfirmed={workflow.categoryConfirmed}
            isTyping={isTyping}
            showEvidenceUploader={shouldDisplayEvidence}
            category={draft.category}
            onConfirmCategory={handleConfirmCategory}
            onChangeCategory={handleChangeCategory}
            onCloseEvidence={() => setShowEvidenceSection(false)}
          />

          {/* Composer Box */}
          <ChatComposer
            onSendMessage={handleSendMessage}
            onSelectOption={handleSelectOption}
            onToggleEvidence={() => setShowEvidenceSection((prev) => !prev)}
            onSelectFiles={handleSelectFilesFromComposer}
            disabled={isTyping}
            showStarterChips={!hasCitizenReplied}
            activeOptions={activeOptions}
          />
        </div>

        {/* Right Column: Live Complaint Summary (Desktop Sidebar) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24">
          <ComplaintSummaryPanel
            draft={draft}
            classification={classification}
            onOpenEvidence={() => setShowEvidenceSection(true)}
          />
        </div>
      </div>

      {/* Mobile Collapsible Bottom Drawer */}
      <div className="lg:hidden mt-4">
        <ComplaintSummaryPanel
          draft={draft}
          classification={classification}
          isMobileDrawer={true}
          onOpenEvidence={() => setShowEvidenceSection(true)}
        />
      </div>
    </div>
  );
};
