import { ComplaintCategory, ComplaintSubCategory } from './complaint';

export type MessageSender = 'assistant' | 'user' | 'system';

export type ChatMessageType =
  | 'text'
  | 'category_suggestion'
  | 'emergency_1930'
  | 'evidence_request'
  | 'question'
  | 'summary_card';

export type WorkflowStep =
  | 'ask_summary'
  | 'classify_category'
  | 'confirm_category'
  | 'ask_incident_time'
  | 'ask_platform'
  | 'ask_location'
  | 'ask_category_specific'
  | 'ask_suspect_details'
  | 'ask_evidence'
  | 'generate_preview'
  | 'submit_demo'
  | 'completed';

export interface SuggestedOption {
  label: string;
  labelHi?: string;
  value: string;
}

export interface SuggestedReply {
  id: string;
  label: string;
  labelHi?: string;
  value: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string;
  contentHi?: string;
  timestamp: string;
  type?: ChatMessageType;
  questionKey?: string;
  options?: SuggestedOption[];
  meta?: {
    category?: ComplaintCategory;
    subCategory?: string;
    subCategoryKey?: ComplaintSubCategory;
    confidence?: number;
    isEmergency?: boolean;
    reasoning?: string;
    reasoningHi?: string;
    explanation?: string;
    explanationHi?: string;
    questionIndex?: number;
    totalQuestions?: number;
    questionTitle?: string;
    questionTitleHi?: string;
    [key: string]: unknown;
  };
}

export interface WorkflowState {
  currentStep: WorkflowStep;
  currentQuestionIndex: number;
  categoryConfirmed: boolean;
  isEmergency: boolean;
  isQuestionsCompleted?: boolean;
  activeQuestionId?: string;
  completedSteps: WorkflowStep[];
}
