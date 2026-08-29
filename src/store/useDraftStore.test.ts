import { beforeEach, describe, expect, it } from 'vitest';
import { useDraftStore } from './useDraftStore';

describe('useDraftStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useDraftStore.getState().resetDraft();
  });

  describe('Initialization and Auth', () => {
    it('initializes with default empty draft state and isAuthenticated false', () => {
      const state = useDraftStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.classification).toBeNull();
      expect(state.chatMessages).toEqual([]);
      expect(state.workflow.currentStep).toBe('ask_summary');
      expect(state.workflow.categoryConfirmed).toBe(false);
      expect(state.workflow.isEmergency).toBe(false);
      expect(state.draft.complainant.mobile).toBe('');
      expect(state.draft.complainant.state).toBe('');
      expect(state.draft.complainant.isGuest).toBe(false);
      expect(state.draft.evidence).toEqual([]);
    });

    it('sets complainant details and updates isAuthenticated to true', () => {
      useDraftStore.getState().setComplainant({
        mobile: '9876543210',
        state: 'Telangana',
      });

      const state = useDraftStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.draft.complainant.mobile).toBe('9876543210');
      expect(state.draft.complainant.state).toBe('Telangana');
      expect(state.draft.complainant.isGuest).toBe(false);
      expect(state.draft.complainant.verifiedAt).toBeDefined();
    });

    it('sets guest complainant details properly with default or custom state', () => {
      useDraftStore.getState().setGuestComplainant('Maharashtra');

      let state = useDraftStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.draft.complainant.name).toBe('Guest Citizen');
      expect(state.draft.complainant.mobile).toBe('9800000000');
      expect(state.draft.complainant.state).toBe('Maharashtra');
      expect(state.draft.complainant.isGuest).toBe(true);

      useDraftStore.getState().setGuestComplainant();
      state = useDraftStore.getState();
      expect(state.draft.complainant.state).toBe('National / General');
    });
  });

  describe('Draft Mutation and Category Settings', () => {
    it('updates draft with partial fields or updater functions', () => {
      useDraftStore.getState().updateDraft({
        category: 'financial_fraud',
        confidence: 0.94,
      });

      let state = useDraftStore.getState();
      expect(state.draft.category).toBe('financial_fraud');
      expect(state.draft.confidence).toBe(0.94);

      useDraftStore.getState().updateDraft((prev) => ({
        subCategory: 'UPI / Banking Fraud',
        confidence: (prev.confidence || 0) + 0.02,
      }));

      state = useDraftStore.getState();
      expect(state.draft.subCategory).toBe('UPI / Banking Fraud');
      expect(state.draft.confidence).toBeCloseTo(0.96);
    });

    it('sets category and automatically updates workflow and emergency flag', () => {
      useDraftStore.getState().setCategory('financial_fraud', 'upi_banking_fraud', 0.95);

      let state = useDraftStore.getState();
      expect(state.draft.category).toBe('financial_fraud');
      expect(state.draft.subCategoryKey).toBe('upi_banking_fraud');
      expect(state.draft.confidence).toBe(0.95);
      expect(state.draft.isEmergency).toBe(true);
      expect(state.workflow.isEmergency).toBe(true);
      expect(state.workflow.categoryConfirmed).toBe(true);

      useDraftStore.getState().setCategory('other_cybercrime', 'account_hacking_takeover', 0.88);
      state = useDraftStore.getState();
      expect(state.draft.category).toBe('other_cybercrime');
      expect(state.draft.isEmergency).toBe(false);
      expect(state.workflow.isEmergency).toBe(false);
    });

    it('sets incident summary in draft', () => {
      const summaryText = 'Someone hacked into my official email.';
      useDraftStore.getState().setIncidentSummary(summaryText);

      const state = useDraftStore.getState();
      expect(state.draft.incident.summary).toBe(summaryText);
    });
  });

  describe('Classification Execution via Store', () => {
    it('runs classifySummary, updates draft and stores classification result', () => {
      const summary =
        'Someone called pretending to be bank executive, asked for OTP, and ₹25,000 was debited via UPI.';
      const result = useDraftStore.getState().classifySummary(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.subCategoryKey).toBe('upi_banking_fraud');
      expect(result.isEmergency).toBe(true);
      expect(result.isSuggestion).toBe(true);

      const state = useDraftStore.getState();
      expect(state.classification).toEqual(result);
      expect(state.draft.category).toBe('financial_fraud');
      expect(state.draft.subCategory).toBe(result.subCategory);
      expect(state.draft.subCategoryKey).toBe('upi_banking_fraud');
      expect(state.draft.confidence).toBe(result.confidence);
      expect(state.draft.isEmergency).toBe(true);
      expect(state.draft.incident.summary).toBe(summary);
      expect(state.workflow.isEmergency).toBe(true);
    });
  });

  describe('Guided Questions State Machine', () => {
    it('starts guided questions on confirmCategory(true)', () => {
      useDraftStore.getState().classifySummary('I lost 25000 rs in online task fraud');
      useDraftStore.getState().confirmCategory(true);

      const state = useDraftStore.getState();
      expect(state.workflow.categoryConfirmed).toBe(true);
      expect(state.workflow.currentQuestionIndex).toBe(0);
      expect(state.workflow.activeQuestionId).toBe('fin_q1_datetime');

      const lastMsg = state.chatMessages[state.chatMessages.length - 1];
      expect(lastMsg.type).toBe('question');
      expect(lastMsg.questionKey).toBe('incident_time');
      expect(lastMsg.options?.length).toBeGreaterThan(0);
    });

    it('progresses through guided questions and updates draft fields sequentially', () => {
      useDraftStore.getState().classifySummary('Bank OTP scam');
      useDraftStore.getState().confirmCategory(true);

      // Q1: Date
      useDraftStore.getState().answerGuidedQuestion('Today', { label: 'Today', value: 'Today' });
      let state = useDraftStore.getState();
      expect(state.draft.incident.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(state.workflow.currentQuestionIndex).toBe(1);

      // Q2: Amount
      useDraftStore.getState().answerGuidedQuestion('₹25,000', { label: '₹25,000', value: '25000' });
      state = useDraftStore.getState();
      expect(state.draft.financial?.amountLost).toBe(25000);
      expect(state.workflow.currentQuestionIndex).toBe(2);

      // Q3: Payment Method
      useDraftStore.getState().answerGuidedQuestion('UPI', { label: 'UPI (GPay / PhonePe / Paytm)', value: 'UPI' });
      state = useDraftStore.getState();
      expect(state.draft.financial?.paymentMethod).toBe('UPI');
      expect(state.workflow.currentQuestionIndex).toBe(3);

      // Q4: Txn ID / UTR
      useDraftStore.getState().answerGuidedQuestion('UTR 202699887766');
      state = useDraftStore.getState();
      expect(state.draft.financial?.transactionId).toBe('202699887766');

      // Q5: Bank
      useDraftStore.getState().answerGuidedQuestion('HDFC Bank', { label: 'HDFC Bank', value: 'HDFC Bank' });
      state = useDraftStore.getState();
      expect(state.draft.financial?.bankOrWallet).toBe('HDFC Bank');

      // Q6: Suspect
      useDraftStore.getState().answerGuidedQuestion('Suspect phone is 9876543210');
      state = useDraftStore.getState();
      expect(state.draft.suspect?.phone).toBe('9876543210');

      // Q7: Location
      useDraftStore.getState().answerGuidedQuestion('Hyderabad, Telangana');
      state = useDraftStore.getState();
      expect(state.draft.incident.location).toBe('Hyderabad, Telangana');

      // All questions completed!
      expect(state.workflow.isQuestionsCompleted).toBe(true);
      expect(state.workflow.currentStep).toBe('ask_evidence');
    });

    it('handles category change smoothly by starting new category question sequence', () => {
      useDraftStore.getState().classifySummary('Harassment online');
      useDraftStore.getState().confirmCategory(true);

      expect(useDraftStore.getState().workflow.activeQuestionId).toBe('wc_q1_victim_role');

      // Change category to other_cybercrime
      useDraftStore.getState().setCategory('other_cybercrime', 'account_hacking_takeover');

      const state = useDraftStore.getState();
      expect(state.draft.category).toBe('other_cybercrime');
      expect(state.workflow.currentQuestionIndex).toBe(0);
      expect(state.workflow.activeQuestionId).toBe('oc_q1_datetime');
    });
  });

  describe('Evidence Management', () => {
    it('adds evidence item with auto-generated id when none provided', () => {
      useDraftStore.getState().addEvidenceItem({
        name: 'screenshot-payment.png',
        type: 'image/png',
        mockSize: '1.2 MB',
      });

      const state = useDraftStore.getState();
      expect(state.draft.evidence.length).toBe(1);
      expect(state.draft.evidence[0].id).toMatch(/^ev-/);
      expect(state.draft.evidence[0].name).toBe('screenshot-payment.png');
      expect(state.draft.evidence[0].uploadedAt).toBeDefined();
    });

    it('adds evidence item with preserved custom id', () => {
      useDraftStore.getState().addEvidenceItem({
        id: 'custom-ev-123',
        name: 'bank-statement.pdf',
        type: 'application/pdf',
        mockSize: '2.5 MB',
      });

      const state = useDraftStore.getState();
      expect(state.draft.evidence[0].id).toBe('custom-ev-123');
    });

    it('removes evidence item by id', () => {
      useDraftStore.getState().addEvidenceItem({
        id: 'ev-1',
        name: 'file1.png',
        type: 'image/png',
        mockSize: '1 MB',
      });
      useDraftStore.getState().addEvidenceItem({
        id: 'ev-2',
        name: 'file2.png',
        type: 'image/png',
        mockSize: '2 MB',
      });

      expect(useDraftStore.getState().draft.evidence.length).toBe(2);

      useDraftStore.getState().removeEvidenceItem('ev-1');

      const state = useDraftStore.getState();
      expect(state.draft.evidence.length).toBe(1);
      expect(state.draft.evidence[0].id).toBe('ev-2');
    });

    it('clears all evidence items', () => {
      useDraftStore.getState().addEvidenceItem({ id: '1', name: 'f1', type: 't', mockSize: '1M' });
      useDraftStore.getState().addEvidenceItem({ id: '2', name: 'f2', type: 't', mockSize: '2M' });

      useDraftStore.getState().clearEvidence();

      expect(useDraftStore.getState().draft.evidence).toEqual([]);
    });
  });

  describe('Store Reset Operations', () => {
    it('resets complete draft and auth back to initial state', () => {
      useDraftStore.getState().setComplainant({
        mobile: '9876543210',
        state: 'Delhi',
      });
      useDraftStore.getState().classifySummary('Lost money through fake UPI call');
      useDraftStore.getState().addEvidenceItem({ id: '1', name: 'f', type: 't', mockSize: '1' });
      useDraftStore.getState().addChatMessage({
        id: '1',
        sender: 'user',
        content: 'hi',
        timestamp: 'now',
      });

      expect(useDraftStore.getState().isAuthenticated).toBe(true);
      expect(useDraftStore.getState().draft.evidence.length).toBe(1);

      useDraftStore.getState().resetDraft();

      const state = useDraftStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.classification).toBeNull();
      expect(state.chatMessages).toEqual([]);
      expect(state.draft.complainant.mobile).toBe('');
      expect(state.draft.category).toBeUndefined();
      expect(state.draft.evidence).toEqual([]);
    });

    it('resets chat and incident details while keeping authenticated complainant', () => {
      useDraftStore.getState().setComplainant({
        name: 'Ravi Kumar',
        mobile: '9876543210',
        state: 'Karnataka',
      });
      useDraftStore.getState().classifySummary('Bank fraud');
      useDraftStore.getState().addChatMessage({
        id: '1',
        sender: 'assistant',
        content: 'Hello',
        timestamp: 'now',
      });

      useDraftStore.getState().resetChat();

      const state = useDraftStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.draft.complainant.name).toBe('Ravi Kumar');
      expect(state.draft.complainant.mobile).toBe('9876543210');
      expect(state.chatMessages).toEqual([]);
      expect(state.classification).toBeNull();
      expect(state.draft.category).toBeUndefined();
    });
  });

  describe('Submission and Tracking Operations', () => {
    it('submits complaint generating a deterministic acknowledgement ID and storing it locally', () => {
      useDraftStore.getState().setComplainant({
        name: 'Priya Verma',
        mobile: '9876500000',
        state: 'Delhi',
      });
      useDraftStore.getState().setIncidentSummary('Fake investment task fraud ₹50,000');
      useDraftStore.getState().updateDraft({
        category: 'financial_fraud',
        subCategory: 'Investment & Part-Time Job Scam',
        financial: { amountLost: 50000 },
      });

      const ackId = useDraftStore.getState().submitComplaint();

      expect(ackId).toMatch(/^CR-\d{4}-\d{2}-\d{7}$/);

      const state = useDraftStore.getState();
      expect(state.draft.status).toBe('submitted');
      expect(state.draft.acknowledgementId).toBe(ackId);
      expect(state.draft.submittedAt).toBeDefined();
      expect(state.latestSubmissionId).toBe(ackId);

      // Verify stored in submitted complaints map
      const stored = state.submittedComplaints[ackId.toUpperCase()];
      expect(stored).toBeDefined();
      expect(stored.acknowledgementId).toBe(ackId);
      expect(stored.financial?.amountLost).toBe(50000);
      expect(stored.complainant.name).toBe('Priya Verma');
    });

    it('retrieves submitted complaint by normalized acknowledgement ID', () => {
      useDraftStore.getState().submitComplaint('CR-2026-08-0009999');

      const retrieved = useDraftStore
        .getState()
        .getSubmittedComplaint('  cr-2026-08-0009999  ');
      expect(retrieved).toBeDefined();
      expect(retrieved?.acknowledgementId).toBe('CR-2026-08-0009999');
    });

    it('returns default sample demo complaint for CR-2026-08-0001930', () => {
      const sample = useDraftStore
        .getState()
        .getSubmittedComplaint('CR-2026-08-0001930');
      expect(sample).toBeDefined();
      expect(sample?.acknowledgementId).toBe('CR-2026-08-0001930');
      expect(sample?.category).toBe('financial_fraud');
    });

    it('returns undefined for non-existent acknowledgement IDs', () => {
      const nonExistent = useDraftStore
        .getState()
        .getSubmittedComplaint('CR-0000-00-UNKNOWN');
      expect(nonExistent).toBeUndefined();
    });
  });
});
