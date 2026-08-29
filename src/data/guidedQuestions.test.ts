import { describe, it, expect } from 'vitest';
import {
  FINANCIAL_FRAUD_QUESTIONS,
  WOMEN_CHILD_QUESTIONS,
  OTHER_CYBERCRIME_QUESTIONS,
  getQuestionsForCategory,
  getQuestionByIndex,
  getTotalQuestions,
} from './guidedQuestions';

describe('Guided Questions Data & Parsing', () => {
  it('defines valid question sequences for all 3 primary categories', () => {
    expect(FINANCIAL_FRAUD_QUESTIONS.length).toBeGreaterThanOrEqual(6);
    expect(WOMEN_CHILD_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    expect(OTHER_CYBERCRIME_QUESTIONS.length).toBeGreaterThanOrEqual(5);

    expect(getTotalQuestions('financial_fraud')).toBe(FINANCIAL_FRAUD_QUESTIONS.length);
    expect(getTotalQuestions('women_child_related_crime')).toBe(WOMEN_CHILD_QUESTIONS.length);
    expect(getTotalQuestions('other_cybercrime')).toBe(OTHER_CYBERCRIME_QUESTIONS.length);
  });

  it('provides bilingual prompts, title, and suggested options for every question', () => {
    const allCategories = ['financial_fraud', 'women_child_related_crime', 'other_cybercrime'] as const;

    for (const cat of allCategories) {
      const questions = getQuestionsForCategory(cat);
      for (const q of questions) {
        expect(q.id).toBeTruthy();
        expect(q.prompt).toBeTruthy();
        expect(q.promptHi).toBeTruthy();
        expect(q.title).toBeTruthy();
        expect(q.titleHi).toBeTruthy();
        expect(q.options.length).toBeGreaterThan(0);
        for (const opt of q.options) {
          expect(opt.label).toBeTruthy();
          expect(opt.labelHi).toBeTruthy();
          expect(opt.value).toBeDefined();
        }
      }
    }
  });

  it('includes supportive sensitive data explanations on key questions', () => {
    // Financial fraud txnid and suspect questions
    const txnQuestion = FINANCIAL_FRAUD_QUESTIONS.find((q) => q.questionKey === 'transaction_id');
    expect(txnQuestion?.explanation).toContain('Why we ask');
    expect(txnQuestion?.explanationHi).toContain('यह क्यों जरूरी है');

    const suspectQuestion = FINANCIAL_FRAUD_QUESTIONS.find((q) => q.questionKey === 'suspect_info');
    expect(suspectQuestion?.explanation).toContain('Why we ask');

    // Women/Child safety role and threat questions
    const roleQuestion = WOMEN_CHILD_QUESTIONS.find((q) => q.questionKey === 'affected_person');
    expect(roleQuestion?.explanation).toBeTruthy();

    const threatQuestion = WOMEN_CHILD_QUESTIONS.find((q) => q.questionKey === 'threat_nature');
    expect(threatQuestion?.explanation).toContain('Why we ask');
  });

  describe('Financial Fraud Extractors', () => {
    it('extracts date and time accurately', () => {
      const q = FINANCIAL_FRAUD_QUESTIONS[0];
      const res = q.extractValue('Today', { label: 'Today', value: 'Today' });
      expect(res.incident?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(res.incident?.time).toBeTruthy();
    });

    it('extracts amount lost from text and options', () => {
      const q = FINANCIAL_FRAUD_QUESTIONS[1];
      const res1 = q.extractValue('₹25,000', { label: '₹25,000', value: '25000' });
      expect(res1.financial?.amountLost).toBe(25000);

      const res2 = q.extractValue('I lost 50000 rupees in this scam');
      expect(res2.financial?.amountLost).toBe(50000);

      const res3 = q.extractValue('Lost 1.5 lakh in crypto fraud');
      expect(res3.financial?.amountLost).toBe(150000);

      const res4 = q.extractValue('Lost 75k in task scam');
      expect(res4.financial?.amountLost).toBe(75000);
    });

    it('extracts payment method and platform', () => {
      const q = FINANCIAL_FRAUD_QUESTIONS[2];
      const res = q.extractValue('UPI (GPay / PhonePe / Paytm)', {
        label: 'UPI (GPay / PhonePe / Paytm)',
        value: 'UPI (GPay / PhonePe / Paytm)',
      });
      expect(res.financial?.paymentMethod).toBe('UPI (GPay / PhonePe / Paytm)');
      expect(res.incident?.platform).toBe('UPI (GPay / PhonePe / Paytm)');
    });

    it('extracts transaction ID or UTR number from text', () => {
      const q = FINANCIAL_FRAUD_QUESTIONS[3];
      const res1 = q.extractValue('My UTR is 202612345678 from HDFC bank');
      expect(res1.financial?.transactionId).toBe('202612345678');

      const res2 = q.extractValue('UPI ref: AXIS9876543210');
      expect(res2.financial?.transactionId).toBe('AXIS9876543210');
    });

    it('extracts bank name', () => {
      const q = FINANCIAL_FRAUD_QUESTIONS[4];
      const res = q.extractValue('State Bank of India', {
        label: 'State Bank of India (SBI)',
        value: 'State Bank of India',
      });
      expect(res.financial?.bankOrWallet).toBe('State Bank of India');
    });

    it('extracts suspect phone, upi, and url', () => {
      const q = FINANCIAL_FRAUD_QUESTIONS[5];
      const res = q.extractValue(
        'Fraudster phone is 9876543210 and beneficiary UPI is scammer@okaxis',
      );
      expect(res.suspect?.phone).toBe('9876543210');
      expect(res.suspect?.upiId).toBe('scammer@okaxis');
    });
  });

  describe('Women / Child Safety Extractors', () => {
    it('extracts affected person context', () => {
      const q = WOMEN_CHILD_QUESTIONS[0];
      const res = q.extractValue('Victim is a Woman (Self reporting)', {
        label: 'Reporting for myself (Woman)',
        value: 'Victim is a Woman (Self reporting)',
      });
      expect(res.incident?.description).toContain('Woman');
    });

    it('extracts platform and threat nature', () => {
      const platformQ = WOMEN_CHILD_QUESTIONS[2];
      const res1 = platformQ.extractValue('Instagram / Facebook', {
        label: 'Instagram / Facebook',
        value: 'Instagram / Facebook',
      });
      expect(res1.incident?.platform).toBe('Instagram / Facebook');

      const threatQ = WOMEN_CHILD_QUESTIONS[3];
      const res2 = threatQ.extractValue('Blackmail & Morphed Photos', {
        label: 'Blackmail / Morphed Images',
        value: 'Blackmail & Morphed Photos',
      });
      expect(res2.incident?.description).toContain('Blackmail & Morphed Photos');
    });

    it('extracts suspect social handle and contact', () => {
      const q = WOMEN_CHILD_QUESTIONS[4];
      const res = q.extractValue('Suspect handle is @fake_stalker_99 and phone 9876501234');
      expect(res.suspect?.socialHandle).toBe('@fake_stalker_99');
      expect(res.suspect?.phone).toBe('9876501234');
    });
  });

  describe('Other Cybercrime Extractors', () => {
    it('extracts crime nature, service, and phishing URL', () => {
      const typeQ = OTHER_CYBERCRIME_QUESTIONS[1];
      const res1 = typeQ.extractValue('Phishing & Fake Website', {
        label: 'Phishing Link',
        value: 'Phishing & Fake Website',
      });
      expect(res1.incident?.description).toBe('Phishing & Fake Website');

      const platformQ = OTHER_CYBERCRIME_QUESTIONS[2];
      const res2 = platformQ.extractValue('Email (Gmail / Outlook)', {
        label: 'Email',
        value: 'Email (Gmail / Outlook)',
      });
      expect(res2.incident?.platform).toBe('Email (Gmail / Outlook)');

      const suspectQ = OTHER_CYBERCRIME_QUESTIONS[3];
      const res3 = suspectQ.extractValue(
        'Phishing link is https://secure-bank-login.xyz and email is scam@support.com',
      );
      expect(res3.suspect?.url).toBe('https://secure-bank-login.xyz');
      expect(res3.suspect?.email).toBe('scam@support.com');
    });
  });
});
