import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ChatMessage,
  ClassificationResult,
  ComplainantDetails,
  ComplaintCategory,
  ComplaintDraft,
  ComplaintSubCategory,
  EvidenceItem,
  SuggestedOption,
  WorkflowState,
  WorkflowStep,
} from '../types';
import { classifyIncident } from '../utils/classifier';
import {
  getQuestionByIndex,
  getTotalQuestions,
} from '../data/guidedQuestions';

export interface DraftStoreState {
  draft: ComplaintDraft;
  isAuthenticated: boolean;
  classification: ClassificationResult | null;
  chatMessages: ChatMessage[];
  workflow: WorkflowState;
  submittedComplaints: Record<string, ComplaintDraft>;
  latestSubmissionId: string | null;

  // Complainant & Auth actions
  setComplainant: (details: Partial<ComplainantDetails>) => void;
  setGuestComplainant: (state?: string) => void;

  // Draft details actions
  updateDraft: (
    updater:
      | Partial<ComplaintDraft>
      | ((prev: ComplaintDraft) => Partial<ComplaintDraft>),
  ) => void;
  setCategory: (
    category: ComplaintCategory,
    subCategoryKey?: ComplaintSubCategory,
    confidence?: number,
  ) => void;
  setIncidentSummary: (summary: string) => void;

  // AI Classification action
  classifySummary: (summary: string) => ClassificationResult;

  // Evidence actions
  addEvidenceItem: (item: EvidenceItem | Omit<EvidenceItem, 'id'>) => void;
  removeEvidenceItem: (id: string) => void;
  clearEvidence: () => void;

  // Chat & Guided Question Workflow actions
  addChatMessage: (message: ChatMessage) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setWorkflowStep: (step: WorkflowStep, questionIndex?: number) => void;
  setEmergency: (isEmergency: boolean) => void;
  confirmCategory: (confirmed: boolean) => void;
  startGuidedQuestions: (category?: ComplaintCategory) => void;
  answerGuidedQuestion: (
    answerText: string,
    selectedOption?: SuggestedOption,
  ) => void;

  // Submission & Tracking actions
  submitComplaint: (customAckId?: string) => string;
  getSubmittedComplaint: (ackId: string) => ComplaintDraft | undefined;
  clearSubmissions: () => void;

  // Reset actions
  resetDraft: () => void;
  resetChat: () => void;
}

const initialComplainant: ComplainantDetails = {
  name: '',
  mobile: '',
  state: '',
  isGuest: false,
};

const initialDraft: ComplaintDraft = {
  language: 'en',
  status: 'draft',
  complainant: initialComplainant,
  incident: {
    summary: '',
    date: '',
    time: '',
    platform: '',
    location: '',
    description: '',
  },
  financial: {
    amountLost: undefined,
    paymentMethod: '',
    transactionId: '',
    bankOrWallet: '',
  },
  suspect: {
    phone: '',
    email: '',
    url: '',
    socialHandle: '',
    upiId: '',
  },
  evidence: [],
};

export const SAMPLE_DEMO_COMPLAINT: ComplaintDraft = {
  acknowledgementId: 'CR-2026-08-0001930',
  language: 'en',
  category: 'financial_fraud',
  subCategory: 'UPI / Banking Fraud',
  subCategoryKey: 'upi_banking_fraud',
  confidence: 0.94,
  isEmergency: true,
  status: 'submitted',
  submittedAt: '2026-08-28T16:35:00.000Z',
  complainant: {
    name: 'Vikram Singh',
    mobile: '9876543210',
    state: 'Telangana',
    isGuest: false,
    verifiedAt: '2026-08-28T16:30:00.000Z',
  },
  incident: {
    summary:
      'Unauthorized debit of ₹25,000 via fraudulent payment link and fake banking caller.',
    date: '28 Aug 2026',
    time: '04:30 PM',
    platform: 'Phone call + UPI App',
    location: 'Hyderabad, Telangana',
    description:
      'Received a call claiming KYC expiry. Within minutes of sharing OTP, money was deducted.',
  },
  financial: {
    amountLost: 25000,
    paymentMethod: 'UPI (Google Pay)',
    transactionId: 'UTR987654321012',
    bankOrWallet: 'State Bank of India',
  },
  suspect: {
    phone: '+91 98765 00000',
    upiId: 'fraudster@okhdfcbank',
  },
  evidence: [
    {
      id: 'ev-sample-1',
      name: 'Bank_Debit_SMS.png',
      type: 'image/png',
      mockSize: '120 KB',
      uploadedAt: '2026-08-28T16:35:00Z',
    },
    {
      id: 'ev-sample-2',
      name: 'Payment_Receipt.pdf',
      type: 'application/pdf',
      mockSize: '340 KB',
      uploadedAt: '2026-08-28T16:36:00Z',
    },
  ],
};

const initialWorkflow: WorkflowState = {
  currentStep: 'ask_summary',
  currentQuestionIndex: 0,
  categoryConfirmed: false,
  isEmergency: false,
  isQuestionsCompleted: false,
  activeQuestionId: undefined,
  completedSteps: [],
};

export const useDraftStore = create<DraftStoreState>()(
  persist(
    (set, get) => ({
      draft: initialDraft,
      isAuthenticated: false,
      classification: null,
      chatMessages: [],
      workflow: initialWorkflow,
      submittedComplaints: {
        'CR-2026-08-0001930': SAMPLE_DEMO_COMPLAINT,
      },
      latestSubmissionId: null,

      setComplainant: (details: Partial<ComplainantDetails>) =>
        set((state) => {
          const updatedComplainant: ComplainantDetails = {
            ...state.draft.complainant,
            ...details,
            isGuest: details.isGuest ?? false,
            verifiedAt: details.verifiedAt || new Date().toISOString(),
          };

          return {
            isAuthenticated: true,
            draft: {
              ...state.draft,
              complainant: updatedComplainant,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setGuestComplainant: (selectedState?: string) =>
        set((state) => {
          const guestComplainant: ComplainantDetails = {
            name: 'Guest Citizen',
            mobile: '9800000000',
            state: selectedState || 'National / General',
            isGuest: true,
            verifiedAt: new Date().toISOString(),
          };

          return {
            isAuthenticated: true,
            draft: {
              ...state.draft,
              complainant: guestComplainant,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      updateDraft: (updater) =>
        set((state) => {
          const partial =
            typeof updater === 'function' ? updater(state.draft) : updater;
          return {
            draft: {
              ...state.draft,
              ...partial,
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      setCategory: (category, subCategoryKey, confidence) => {
        const isEmergency = category === 'financial_fraud';
        const state = get();

        // When category is selected/changed, start guided questions for the selected category
        const firstQuestion = getQuestionByIndex(category, 0);
        const totalQuestions = getTotalQuestions(category);

        let newMessages = [...state.chatMessages];
        if (firstQuestion) {
          const questionMsg: ChatMessage = {
            id: `msg-asst-q-${firstQuestion.id}-${Date.now()}`,
            sender: 'assistant',
            content: firstQuestion.prompt,
            contentHi: firstQuestion.promptHi,
            timestamp: new Date().toISOString(),
            type: 'question',
            questionKey: firstQuestion.questionKey,
            options: firstQuestion.options,
            meta: {
              category,
              explanation: firstQuestion.explanation,
              explanationHi: firstQuestion.explanationHi,
              questionIndex: 1,
              totalQuestions,
              questionTitle: firstQuestion.title,
              questionTitleHi: firstQuestion.titleHi,
            },
          };
          newMessages = [...state.chatMessages, questionMsg];
        }

        set({
          draft: {
            ...state.draft,
            category,
            subCategoryKey,
            confidence: confidence ?? state.draft.confidence ?? 0.9,
            isEmergency,
            updatedAt: new Date().toISOString(),
          },
          chatMessages: newMessages,
          workflow: {
            ...state.workflow,
            isEmergency,
            categoryConfirmed: true,
            currentStep: firstQuestion?.step || 'ask_incident_time',
            currentQuestionIndex: 0,
            activeQuestionId: firstQuestion?.id,
            isQuestionsCompleted: false,
          },
        });
      },

      setIncidentSummary: (summary: string) =>
        set((state) => ({
          draft: {
            ...state.draft,
            incident: {
              ...state.draft.incident,
              summary,
            },
            updatedAt: new Date().toISOString(),
          },
        })),

      classifySummary: (summary: string) => {
        const result = classifyIncident(summary);

        set((state) => ({
          classification: result,
          draft: {
            ...state.draft,
            category: result.category,
            subCategory: result.subCategory,
            subCategoryKey: result.subCategoryKey,
            confidence: result.confidence,
            isEmergency: result.isEmergency,
            incident: {
              ...state.draft.incident,
              summary,
            },
            updatedAt: new Date().toISOString(),
          },
          workflow: {
            ...state.workflow,
            isEmergency: result.isEmergency,
          },
        }));

        return result;
      },

      addEvidenceItem: (item) =>
        set((state) => {
          const newItem: EvidenceItem =
            'id' in item && item.id
              ? (item as EvidenceItem)
              : {
                  ...item,
                  id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  uploadedAt: item.uploadedAt || new Date().toISOString(),
                };

          return {
            draft: {
              ...state.draft,
              evidence: [...state.draft.evidence, newItem],
              updatedAt: new Date().toISOString(),
            },
          };
        }),

      removeEvidenceItem: (id: string) =>
        set((state) => ({
          draft: {
            ...state.draft,
            evidence: state.draft.evidence.filter((item) => item.id !== id),
            updatedAt: new Date().toISOString(),
          },
        })),

      clearEvidence: () =>
        set((state) => ({
          draft: {
            ...state.draft,
            evidence: [],
            updatedAt: new Date().toISOString(),
          },
        })),

      addChatMessage: (message: ChatMessage) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),

      setChatMessages: (messages: ChatMessage[]) =>
        set({
          chatMessages: messages,
        }),

      setWorkflowStep: (step: WorkflowStep, questionIndex?: number) =>
        set((state) => ({
          workflow: {
            ...state.workflow,
            currentStep: step,
            currentQuestionIndex:
              questionIndex !== undefined
                ? questionIndex
                : state.workflow.currentQuestionIndex,
            completedSteps: state.workflow.completedSteps.includes(
              state.workflow.currentStep,
            )
              ? state.workflow.completedSteps
              : [...state.workflow.completedSteps, state.workflow.currentStep],
          },
        })),

      setEmergency: (isEmergency: boolean) =>
        set((state) => ({
          workflow: {
            ...state.workflow,
            isEmergency,
          },
          draft: {
            ...state.draft,
            isEmergency,
          },
        })),

      confirmCategory: (confirmed: boolean) => {
        set((state) => ({
          workflow: {
            ...state.workflow,
            categoryConfirmed: confirmed,
          },
        }));

        if (confirmed) {
          get().startGuidedQuestions();
        }
      },

      startGuidedQuestions: (category?: ComplaintCategory) => {
        const state = get();
        const targetCategory =
          category ||
          state.draft.category ||
          state.classification?.category ||
          'other_cybercrime';

        const firstQuestion = getQuestionByIndex(targetCategory, 0);
        const totalQuestions = getTotalQuestions(targetCategory);

        if (!firstQuestion) return;

        const firstQuestionMessage: ChatMessage = {
          id: `msg-asst-q-${firstQuestion.id}-${Date.now()}`,
          sender: 'assistant',
          content: firstQuestion.prompt,
          contentHi: firstQuestion.promptHi,
          timestamp: new Date().toISOString(),
          type: 'question',
          questionKey: firstQuestion.questionKey,
          options: firstQuestion.options,
          meta: {
            category: targetCategory,
            explanation: firstQuestion.explanation,
            explanationHi: firstQuestion.explanationHi,
            questionIndex: 1,
            totalQuestions,
            questionTitle: firstQuestion.title,
            questionTitleHi: firstQuestion.titleHi,
          },
        };

        set({
          draft: {
            ...state.draft,
            category: targetCategory,
            isEmergency: targetCategory === 'financial_fraud',
          },
          chatMessages: [...state.chatMessages, firstQuestionMessage],
          workflow: {
            ...state.workflow,
            categoryConfirmed: true,
            currentStep: firstQuestion.step,
            currentQuestionIndex: 0,
            activeQuestionId: firstQuestion.id,
            isQuestionsCompleted: false,
            isEmergency: targetCategory === 'financial_fraud',
          },
        });
      },

      answerGuidedQuestion: (
        answerText: string,
        selectedOption?: SuggestedOption,
      ) => {
        const state = get();
        const currentCategory =
          state.draft.category ||
          state.classification?.category ||
          'other_cybercrime';
        const currentIndex = state.workflow.currentQuestionIndex;
        const currentQuestion = getQuestionByIndex(
          currentCategory,
          currentIndex,
        );

        // Record User's reply
        const displayLabel = selectedOption?.label || answerText;
        const displayLabelHi = selectedOption?.labelHi || answerText;
        const userMessage: ChatMessage = {
          id: `msg-user-ans-${Date.now()}`,
          sender: 'user',
          content: displayLabel,
          contentHi: displayLabelHi,
          timestamp: new Date().toISOString(),
          type: 'text',
        };

        // Extract values from user's response
        let draftUpdates: Partial<ComplaintDraft> = {};
        if (currentQuestion) {
          draftUpdates = currentQuestion.extractValue(
            answerText,
            selectedOption,
            state.draft,
          );
        }

        const nextIndex = currentIndex + 1;
        const nextQuestion = getQuestionByIndex(currentCategory, nextIndex);
        const totalQuestions = getTotalQuestions(currentCategory);

        const updatedIncident = {
          ...state.draft.incident,
          ...(draftUpdates.incident || {}),
        };
        const updatedFinancial = {
          ...state.draft.financial,
          ...(draftUpdates.financial || {}),
        };
        const updatedSuspect = {
          ...state.draft.suspect,
          ...(draftUpdates.suspect || {}),
        };

        const updatedDraft: ComplaintDraft = {
          ...state.draft,
          ...draftUpdates,
          incident: updatedIncident,
          financial: updatedFinancial,
          suspect: updatedSuspect,
          updatedAt: new Date().toISOString(),
        };

        const newMessages = [...state.chatMessages, userMessage];

        if (nextQuestion) {
          const nextQuestionMsg: ChatMessage = {
            id: `msg-asst-q-${nextQuestion.id}-${Date.now()}`,
            sender: 'assistant',
            content: nextQuestion.prompt,
            contentHi: nextQuestion.promptHi,
            timestamp: new Date().toISOString(),
            type: 'question',
            questionKey: nextQuestion.questionKey,
            options: nextQuestion.options,
            meta: {
              category: currentCategory,
              explanation: nextQuestion.explanation,
              explanationHi: nextQuestion.explanationHi,
              questionIndex: nextIndex + 1,
              totalQuestions,
              questionTitle: nextQuestion.title,
              questionTitleHi: nextQuestion.titleHi,
            },
          };
          newMessages.push(nextQuestionMsg);

          set({
            draft: updatedDraft,
            chatMessages: newMessages,
            workflow: {
              ...state.workflow,
              currentStep: nextQuestion.step,
              currentQuestionIndex: nextIndex,
              activeQuestionId: nextQuestion.id,
              isQuestionsCompleted: false,
              completedSteps: state.workflow.completedSteps.includes(
                state.workflow.currentStep,
              )
                ? state.workflow.completedSteps
                : [...state.workflow.completedSteps, state.workflow.currentStep],
            },
          });
        } else {
          // Guided Questions sequence complete
          const completionMsg: ChatMessage = {
            id: `msg-asst-completed-${Date.now()}`,
            sender: 'assistant',
            content:
              'All key incident questions for this category have been captured. Your draft complaint is structured and ready. You can attach supporting evidence files or proceed directly to preview your report.',
            contentHi:
              'इस श्रेणी के सभी मुख्य प्रश्न पूर्ण हो चुके हैं। आपकी शिकायत का मसौदा तैयार है। अब आप साक्ष्य फ़ाइलें जोड़ सकते हैं या शिकायत पूर्वावलोकन पर जा सकते हैं।',
            timestamp: new Date().toISOString(),
            type: 'summary_card',
            meta: {
              category: currentCategory,
            },
          };
          newMessages.push(completionMsg);

          set({
            draft: {
              ...updatedDraft,
              status: 'draft',
            },
            chatMessages: newMessages,
            workflow: {
              ...state.workflow,
              currentStep: 'ask_evidence',
              currentQuestionIndex: nextIndex,
              activeQuestionId: undefined,
              isQuestionsCompleted: true,
              completedSteps: [
                ...state.workflow.completedSteps,
                state.workflow.currentStep,
              ],
            },
          });
        }
      },

      submitComplaint: (customAckId?: string) => {
        const state = get();
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');

        // Formats to documented CR-YYYY-MM-000XXXX / 7-digit suffix
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const ackId = customAckId || `CR-${year}-${month}-000${randomSuffix}`;
        const submittedTimestamp = now.toISOString();

        const finalizedDraft: ComplaintDraft = {
          ...state.draft,
          acknowledgementId: ackId,
          status: 'submitted',
          submittedAt: submittedTimestamp,
          updatedAt: submittedTimestamp,
        };

        const normalizedAckId = ackId.toUpperCase().trim();

        set((prevState) => ({
          draft: finalizedDraft,
          latestSubmissionId: ackId,
          submittedComplaints: {
            ...prevState.submittedComplaints,
            [normalizedAckId]: finalizedDraft,
          },
        }));

        return ackId;
      },

      getSubmittedComplaint: (ackId: string) => {
        if (!ackId) return undefined;
        const normalized = ackId.toUpperCase().trim();
        const state = get();

        // 1. Look up in stored submitted complaints
        if (state.submittedComplaints[normalized]) {
          return state.submittedComplaints[normalized];
        }

        // 2. Look up in active draft if submitted and matches
        if (
          state.draft.acknowledgementId?.toUpperCase().trim() === normalized &&
          state.draft.status === 'submitted'
        ) {
          return state.draft;
        }

        // 3. Fallback to sample demo complaint
        if (normalized === 'CR-2026-08-0001930') {
          return SAMPLE_DEMO_COMPLAINT;
        }

        return undefined;
      },

      clearSubmissions: () =>
        set({
          submittedComplaints: {
            'CR-2026-08-0001930': SAMPLE_DEMO_COMPLAINT,
          },
          latestSubmissionId: null,
        }),

      resetDraft: () =>
        set((state) => ({
          draft: initialDraft,
          isAuthenticated: false,
          classification: null,
          chatMessages: [],
          workflow: initialWorkflow,
          // Retain submittedComplaints across draft resets so tracking continues working
          submittedComplaints: state.submittedComplaints,
        })),

      resetChat: () =>
        set((state) => ({
          classification: null,
          chatMessages: [],
          workflow: initialWorkflow,
          draft: {
            ...state.draft,
            category: undefined,
            subCategory: undefined,
            subCategoryKey: undefined,
            confidence: undefined,
            isEmergency: undefined,
            incident: {
              summary: '',
              date: '',
              time: '',
              platform: '',
              location: '',
              description: '',
            },
            financial: {
              amountLost: undefined,
              paymentMethod: '',
              transactionId: '',
              bankOrWallet: '',
            },
            suspect: {
              phone: '',
              email: '',
              url: '',
              socialHandle: '',
              upiId: '',
            },
            evidence: [],
          },
        })),
    }),
    {
      name: 'cyber-rakshak-draft',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

// Alias for flexibility across future tasks
export const useComplaintStore = useDraftStore;
