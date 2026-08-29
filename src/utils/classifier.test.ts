import { describe, expect, it } from 'vitest';
import { classifyIncident, normalizeText } from './classifier';

describe('Classifier Utility', () => {
  describe('normalizeText', () => {
    it('handles empty or whitespace strings', () => {
      expect(normalizeText('')).toBe('');
      expect(normalizeText('   ')).toBe('');
    });

    it('converts to lowercase and collapses extra whitespace', () => {
      expect(normalizeText('  Someone   STOLE MY   OTP!  ')).toBe('someone stole my otp!');
    });

    it('normalizes smart quotes and apostrophes', () => {
      expect(normalizeText('“Hacked” user’s account')).toBe('"hacked" user\'s account');
    });
  });

  describe('Financial Fraud Classification & Priority', () => {
    it('classifies UPI & Banking OTP fraud with high confidence and emergency flag', () => {
      const summary =
        'Someone called pretending to be from my bank and made me share an OTP. Rs 25,000 was deducted.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.subCategoryKey).toBe('upi_banking_fraud');
      expect(result.isEmergency).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.matchedKeywords).toContain('bank');
      expect(result.matchedKeywords).toContain('otp');
      expect(result.matchedKeywords).toContain('deducted');
      expect(result.isSuggestion).toBe(true);
    });

    it('prioritizes financial fraud over overlapping other cybercrime terms', () => {
      // Contains 'hacked' (other_cybercrime) AND 'money'/'upi'/'rs' (financial_fraud)
      const summary =
        'My account was hacked and the hacker transferred Rs 10000 through UPI without permission.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.isEmergency).toBe(true);
    });

    it('prioritizes financial fraud over overlapping harassment/blackmail when money was stolen', () => {
      // Contains 'blackmail' AND 'demanded rupees via Paytm'
      const summary =
        'Someone tried to blackmail me online and stole 50000 rupees via Paytm transfer.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.isEmergency).toBe(true);
    });

    it('classifies Investment and Telegram job scams', () => {
      const summary =
        'Joined a Telegram task group offering daily investment returns and lost money in crypto trading.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.subCategoryKey).toBe('investment_job_scam');
      expect(result.isEmergency).toBe(true);
    });

    it('classifies Credit and Debit card fraud', () => {
      const summary =
        'Unauthorized credit card debit transactions made internationally without OTP or CVV verification.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.subCategoryKey).toBe('credit_debit_card_fraud');
      expect(result.isEmergency).toBe(true);
    });

    it('classifies illegal Loan App extortion', () => {
      const summary =
        'Downloaded an instant loan app and recovery agents are harassing all my contacts demanding extortion money.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.subCategoryKey).toBe('loan_app_fraud');
      expect(result.isEmergency).toBe(true);
    });

    it('correctly handles Devanagari Hindi financial terms', () => {
      const summary = 'फर्जी बैंक अधिकारी का कॉल आया और खाते से 20000 रुपये कट गए।';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.isEmergency).toBe(true);
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['बैंक', 'रुपये', 'कट गए']));
    });

    it('correctly handles Hinglish financial terms', () => {
      const summary = 'Mere bank khata se paise kat gaye fake caller ke bolne par.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('financial_fraud');
      expect(result.isEmergency).toBe(true);
    });
  });

  describe('Women & Child Related Crime Classification', () => {
    it('classifies Morphed images and Sextortion blackmail', () => {
      const summary =
        'Someone morphed my private photos into obscene deepfake pictures and is threatening to leak them.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('women_child_related_crime');
      expect(result.subCategoryKey).toBe('blackmail_morphing');
      expect(result.isEmergency).toBe(false);
      expect(result.isSuggestion).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
    });

    it('classifies Cyberstalking and harassment of women', () => {
      const summary =
        'An unknown stalker is sending abusive messages and continuous threats to a woman on Instagram.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('women_child_related_crime');
      expect(result.subCategoryKey).toBe('cyber_stalking_harassment');
      expect(result.isEmergency).toBe(false);
    });

    it('classifies Child Sexual Abuse Material (CSAM) and minor exploitation', () => {
      const summary =
        'Found an online group circulating abusive CSAM material involving school minor kids.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('women_child_related_crime');
      expect(result.subCategoryKey).toBe('child_abuse_exploitation');
      expect(result.isEmergency).toBe(false);
    });

    it('classifies fake profile impersonation of a woman', () => {
      const summary =
        'Someone created a fake profile of a girl on social media and is impersonating girl with vulgar posts.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('women_child_related_crime');
      expect(result.subCategoryKey).toBe('fake_profile_impersonation');
    });

    it('handles Devanagari Hindi women and child safety terms', () => {
      const summary = 'किसी ने महिला की तस्वीरें मॉर्फ करके ब्लैकमेल करना शुरू कर दिया।';
      const result = classifyIncident(summary);

      expect(result.category).toBe('women_child_related_crime');
      expect(result.subCategoryKey).toBe('blackmail_morphing');
    });
  });

  describe('Other Cybercrime Classification', () => {
    it('classifies account hacking and takeover', () => {
      const summary =
        'My Instagram account was hacked, password changed, and I am locked out of my account.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('account_hacking_takeover');
      expect(result.isEmergency).toBe(false);
    });

    it('classifies Phishing and fake websites', () => {
      const summary =
        'Received a phishing email with a fake link and malicious APK download portal.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('phishing_fake_websites');
    });

    it('classifies Ransomware and malware attacks', () => {
      const summary =
        'Our computer server files were encrypted by ransomware with a virus ransom note.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('ransomware_malware');
    });

    it('classifies online cyberbullying and defamation', () => {
      const summary =
        'A group of users is conducting online cyber bullying, trolling, and posting hate speech against us.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('cyber_bullying_defamation');
    });

    it('classifies e-commerce and shopping fraud', () => {
      const summary =
        'Ordered goods from a fake shopping e-commerce website and received fake product with non-delivery resolution.';
      const result = classifyIncident(summary);

      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('e_commerce_fraud');
    });

    it('handles Devanagari Hindi cybercrime terms', () => {
      const summary = 'कंप्यूटर में खतरनाक वायरस आ गया और डेटा लीक हो गया।';
      const result = classifyIncident(summary);

      expect(result.category).toBe('other_cybercrime');
      expect(result.matchedKeywords).toEqual(expect.arrayContaining(['वायरस', 'डेटा लीक']));
    });
  });

  describe('Confidence, Suggestion Framing & Disclaimers', () => {
    it('guarantees isSuggestion is strictly true', () => {
      const result = classifyIncident('Bank OTP theft');
      expect(result.isSuggestion).toBe(true);
    });

    it('provides both English and Hindi disclaimers highlighting non-legal advice', () => {
      const result = classifyIncident('Instagram hacked');
      expect(result.disclaimer).toContain('AI-assisted suggestion');
      expect(result.disclaimer).toContain('not a legal determination');
      expect(result.disclaimerHi).toContain('AI-सहायक सुझाव');
    });

    it('provides bilingual reasoning explanations', () => {
      const result = classifyIncident('Someone took my OTP and debited 15000 rs');
      expect(result.reasoning).toBeTruthy();
      expect(result.reasoningHi).toBeTruthy();
      expect(result.categoryLabel).toBe('Financial Fraud');
      expect(result.categoryLabelHi).toBe('वित्तीय धोखाधड़ी');
    });

    it('bounds confidence between 0.70 and 0.96 deterministically', () => {
      const lowResult = classifyIncident('Unusual activity noticed on system');
      expect(lowResult.confidence).toBeGreaterThanOrEqual(0.7);
      expect(lowResult.confidence).toBeLessThanOrEqual(0.96);

      const highResult = classifyIncident(
        'Someone called pretending to be bank manager, stole OTP, and debited ₹50,000 via UPI transaction UTR',
      );
      expect(highResult.confidence).toBeGreaterThanOrEqual(0.9);
      expect(highResult.confidence).toBeLessThanOrEqual(0.96);
    });
  });

  describe('Edge Cases and Fallbacks', () => {
    it('gracefully handles empty string', () => {
      const result = classifyIncident('');
      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('other_cybercrime_general');
      expect(result.confidence).toBe(0.72);
      expect(result.isEmergency).toBe(false);
      expect(result.isSuggestion).toBe(true);
    });

    it('gracefully handles whitespace only', () => {
      const result = classifyIncident('    \n\t  ');
      expect(result.category).toBe('other_cybercrime');
      expect(result.confidence).toBe(0.72);
    });

    it('gracefully handles unknown general sentence with no matching keywords', () => {
      const result = classifyIncident('Something happened yesterday afternoon on my desk.');
      expect(result.category).toBe('other_cybercrime');
      expect(result.subCategoryKey).toBe('other_cybercrime_general');
      expect(result.isSuggestion).toBe(true);
    });
  });
});
