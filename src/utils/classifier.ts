import {
  CATEGORY_DEFINITIONS,
  getSubCategoryDefinition,
} from '../data/categories';
import {
  ClassificationResult,
  ComplaintCategory,
  ComplaintSubCategory,
} from '../types';

interface ScoredCategoryMatch {
  category: ComplaintCategory;
  subCategoryKey: ComplaintSubCategory;
  subCategoryTitle: string;
  matchedKeywords: string[];
  score: number;
  confidence: number;
}

// Financial keywords (Highest priority for Golden Hour 1930 protection)
const FINANCIAL_PATTERNS: Array<{
  keyword: string;
  weight: number;
  subCategory?: ComplaintSubCategory;
}> = [
  // High-signal UPI & Banking
  { keyword: 'upi', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'gpay', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'google pay', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'phonepe', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'paytm', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'qr code', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'net banking', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'netbanking', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'imps', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'neft', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'rtgs', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'otp', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'bank', weight: 3, subCategory: 'upi_banking_fraud' },
  { keyword: 'banking', weight: 3, subCategory: 'upi_banking_fraud' },
  { keyword: 'debited', weight: 3, subCategory: 'upi_banking_fraud' },
  { keyword: 'deducted', weight: 3, subCategory: 'upi_banking_fraud' },
  { keyword: 'debit', weight: 2, subCategory: 'upi_banking_fraud' },
  { keyword: 'utr', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'khata', weight: 3, subCategory: 'upi_banking_fraud' },
  { keyword: 'कट गए', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'कट गया', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'बैंक', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'खाता', weight: 3, subCategory: 'upi_banking_fraud' },
  { keyword: 'ओटीपी', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'पैसे कट', weight: 5, subCategory: 'upi_banking_fraud' },
  { keyword: 'kat gaye', weight: 4, subCategory: 'upi_banking_fraud' },
  { keyword: 'kat gaya', weight: 4, subCategory: 'upi_banking_fraud' },

  // Credit / Debit Card Fraud
  { keyword: 'credit card', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'debit card', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'card cloned', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'card cloning', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'atm skimming', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'card limit', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'atm card', weight: 5, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'cvv', weight: 6, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'atm', weight: 3, subCategory: 'credit_debit_card_fraud' },
  { keyword: 'कार्ड', weight: 4, subCategory: 'credit_debit_card_fraud' },

  // Loan App Fraud
  { keyword: 'loan app', weight: 7, subCategory: 'loan_app_fraud' },
  { keyword: 'instant loan', weight: 7, subCategory: 'loan_app_fraud' },
  { keyword: 'loan harassment', weight: 7, subCategory: 'loan_app_fraud' },
  { keyword: 'recovery agent', weight: 6, subCategory: 'loan_app_fraud' },
  { keyword: 'harassing contacts', weight: 6, subCategory: 'loan_app_fraud' },
  { keyword: 'extortion money', weight: 5, subCategory: 'loan_app_fraud' },
  { keyword: 'loan', weight: 4, subCategory: 'loan_app_fraud' },
  { keyword: 'लोन', weight: 5, subCategory: 'loan_app_fraud' },
  { keyword: 'कर्ज', weight: 4, subCategory: 'loan_app_fraud' },

  // Investment & Job Scams
  { keyword: 'telegram task', weight: 7, subCategory: 'investment_job_scam' },
  { keyword: 'investment scam', weight: 7, subCategory: 'investment_job_scam' },
  { keyword: 'part-time job', weight: 6, subCategory: 'investment_job_scam' },
  { keyword: 'part time job', weight: 6, subCategory: 'investment_job_scam' },
  { keyword: 'part-time', weight: 5, subCategory: 'investment_job_scam' },
  { keyword: 'part time', weight: 5, subCategory: 'investment_job_scam' },
  { keyword: 'daily income', weight: 6, subCategory: 'investment_job_scam' },
  { keyword: 'daily earnings', weight: 6, subCategory: 'investment_job_scam' },
  { keyword: 'double money', weight: 6, subCategory: 'investment_job_scam' },
  { keyword: 'investment', weight: 5, subCategory: 'investment_job_scam' },
  { keyword: 'trading', weight: 4, subCategory: 'investment_job_scam' },
  { keyword: 'forex', weight: 5, subCategory: 'investment_job_scam' },
  { keyword: 'share market', weight: 4, subCategory: 'investment_job_scam' },
  { keyword: 'योजना', weight: 4, subCategory: 'investment_job_scam' },
  { keyword: 'निवेश', weight: 5, subCategory: 'investment_job_scam' },

  // Cryptocurrency Fraud
  { keyword: 'cryptocurrency', weight: 6, subCategory: 'crypto_currency_fraud' },
  { keyword: 'crypto', weight: 5, subCategory: 'crypto_currency_fraud' },
  { keyword: 'bitcoin', weight: 5, subCategory: 'crypto_currency_fraud' },
  { keyword: 'usdt', weight: 6, subCategory: 'crypto_currency_fraud' },
  { keyword: 'binance', weight: 6, subCategory: 'crypto_currency_fraud' },
  { keyword: 'wallet key', weight: 6, subCategory: 'crypto_currency_fraud' },
  { keyword: 'क्रिप्टो', weight: 5, subCategory: 'crypto_currency_fraud' },

  // Other General Financial Fraud
  { keyword: 'money', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: 'rupees', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: 'rs', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: '₹', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: 'inr', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: 'transaction', weight: 2, subCategory: 'other_financial_fraud' },
  { keyword: 'transferred', weight: 2, subCategory: 'other_financial_fraud' },
  { keyword: 'lottery', weight: 5, subCategory: 'other_financial_fraud' },
  { keyword: 'electricity bill', weight: 6, subCategory: 'other_financial_fraud' },
  { keyword: 'customs fee', weight: 6, subCategory: 'other_financial_fraud' },
  { keyword: 'customs parcel', weight: 6, subCategory: 'other_financial_fraud' },
  { keyword: 'refund scam', weight: 6, subCategory: 'other_financial_fraud' },
  { keyword: 'stole money', weight: 5, subCategory: 'other_financial_fraud' },
  { keyword: 'lost money', weight: 5, subCategory: 'other_financial_fraud' },
  { keyword: 'पैसे', weight: 4, subCategory: 'other_financial_fraud' },
  { keyword: 'रुपये', weight: 4, subCategory: 'other_financial_fraud' },
  { keyword: 'धोखाधड़ी', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: 'paise', weight: 3, subCategory: 'other_financial_fraud' },
  { keyword: 'rupaye', weight: 3, subCategory: 'other_financial_fraud' },
];

// Women/Child safety keywords (Second priority)
const WOMEN_CHILD_PATTERNS: Array<{
  keyword: string;
  weight: number;
  subCategory?: ComplaintSubCategory;
}> = [
  // Blackmail, Morphed & Sextortion
  { keyword: 'morphing', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'morphed', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'nude', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'nudes', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'deepfake', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'private photos', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'private picture', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'sextortion', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'leaked photos', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'video call blackmail', weight: 6, subCategory: 'blackmail_morphing' },
  { keyword: 'blackmail', weight: 5, subCategory: 'blackmail_morphing' },
  { keyword: 'intimate', weight: 4, subCategory: 'blackmail_morphing' },
  { keyword: 'ब्लैकमेल', weight: 5, subCategory: 'blackmail_morphing' },
  { keyword: 'तस्वीरें', weight: 4, subCategory: 'blackmail_morphing' },
  { keyword: 'फोटो', weight: 3, subCategory: 'blackmail_morphing' },

  // Stalking & Harassment
  { keyword: 'cyberstalking', weight: 6, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'stalking', weight: 5, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'stalker', weight: 5, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'abusive messages', weight: 5, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'harassment', weight: 4, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'harassing', weight: 4, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'threats', weight: 3, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'woman', weight: 3, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'girl', weight: 3, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'female', weight: 3, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'महिला', weight: 4, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'लड़की', weight: 4, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'छेड़छाड़', weight: 5, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'mahila', weight: 3, subCategory: 'cyber_stalking_harassment' },
  { keyword: 'ladki', weight: 3, subCategory: 'cyber_stalking_harassment' },

  // CSAM & Child safety
  { keyword: 'child abuse', weight: 7, subCategory: 'child_abuse_exploitation' },
  { keyword: 'csam', weight: 7, subCategory: 'child_abuse_exploitation' },
  { keyword: 'grooming', weight: 6, subCategory: 'child_abuse_exploitation' },
  { keyword: 'pedophile', weight: 7, subCategory: 'child_abuse_exploitation' },
  { keyword: 'underage', weight: 6, subCategory: 'child_abuse_exploitation' },
  { keyword: 'school girl', weight: 6, subCategory: 'child_abuse_exploitation' },
  { keyword: 'school boy', weight: 6, subCategory: 'child_abuse_exploitation' },
  { keyword: 'minor', weight: 5, subCategory: 'child_abuse_exploitation' },
  { keyword: 'child', weight: 5, subCategory: 'child_abuse_exploitation' },
  { keyword: 'kid', weight: 4, subCategory: 'child_abuse_exploitation' },
  { keyword: 'बच्चे', weight: 5, subCategory: 'child_abuse_exploitation' },
  { keyword: 'नाबालिग', weight: 6, subCategory: 'child_abuse_exploitation' },
  { keyword: 'bacha', weight: 4, subCategory: 'child_abuse_exploitation' },

  // Fake Profile of Woman
  { keyword: 'fake profile of girl', weight: 6, subCategory: 'fake_profile_impersonation' },
  { keyword: 'impersonating girl', weight: 6, subCategory: 'fake_profile_impersonation' },
  { keyword: 'fake profile', weight: 4, subCategory: 'fake_profile_impersonation' },
];

// Other general cybercrime patterns (Third priority / fallback)
const OTHER_CYBER_PATTERNS: Array<{
  keyword: string;
  weight: number;
  subCategory?: ComplaintSubCategory;
}> = [
  // Account Hacking
  { keyword: 'account takeover', weight: 6, subCategory: 'account_hacking_takeover' },
  { keyword: 'instagram hacked', weight: 6, subCategory: 'account_hacking_takeover' },
  { keyword: 'facebook hacked', weight: 6, subCategory: 'account_hacking_takeover' },
  { keyword: 'whatsapp hacked', weight: 6, subCategory: 'account_hacking_takeover' },
  { keyword: 'email hacked', weight: 6, subCategory: 'account_hacking_takeover' },
  { keyword: 'password changed', weight: 5, subCategory: 'account_hacking_takeover' },
  { keyword: 'locked out', weight: 4, subCategory: 'account_hacking_takeover' },
  { keyword: 'hacked', weight: 5, subCategory: 'account_hacking_takeover' },
  { keyword: 'hack', weight: 4, subCategory: 'account_hacking_takeover' },
  { keyword: 'हैक', weight: 5, subCategory: 'account_hacking_takeover' },
  { keyword: 'हैकिंग', weight: 5, subCategory: 'account_hacking_takeover' },

  // Phishing & Fake Sites
  { keyword: 'phishing', weight: 6, subCategory: 'phishing_fake_websites' },
  { keyword: 'fake website', weight: 6, subCategory: 'phishing_fake_websites' },
  { keyword: 'fake link', weight: 5, subCategory: 'phishing_fake_websites' },
  { keyword: 'malicious link', weight: 6, subCategory: 'phishing_fake_websites' },
  { keyword: 'spoofed email', weight: 5, subCategory: 'phishing_fake_websites' },
  { keyword: 'fake portal', weight: 5, subCategory: 'phishing_fake_websites' },
  { keyword: 'apk', weight: 4, subCategory: 'phishing_fake_websites' },
  { keyword: 'फर्जी वेबसाइट', weight: 5, subCategory: 'phishing_fake_websites' },

  // Ransomware & Malware
  { keyword: 'ransomware', weight: 7, subCategory: 'ransomware_malware' },
  { keyword: 'files encrypted', weight: 6, subCategory: 'ransomware_malware' },
  { keyword: 'ransom note', weight: 6, subCategory: 'ransomware_malware' },
  { keyword: 'malware', weight: 5, subCategory: 'ransomware_malware' },
  { keyword: 'trojan', weight: 5, subCategory: 'ransomware_malware' },
  { keyword: 'spyware', weight: 5, subCategory: 'ransomware_malware' },
  { keyword: 'keylogger', weight: 5, subCategory: 'ransomware_malware' },
  { keyword: 'virus', weight: 4, subCategory: 'ransomware_malware' },
  { keyword: 'वायरस', weight: 5, subCategory: 'ransomware_malware' },

  // Cyber Bullying
  { keyword: 'cyber bullying', weight: 6, subCategory: 'cyber_bullying_defamation' },
  { keyword: 'hate speech', weight: 5, subCategory: 'cyber_bullying_defamation' },
  { keyword: 'online defamation', weight: 5, subCategory: 'cyber_bullying_defamation' },
  { keyword: 'trolling', weight: 4, subCategory: 'cyber_bullying_defamation' },
  { keyword: 'bullying', weight: 4, subCategory: 'cyber_bullying_defamation' },
  { keyword: 'defamation', weight: 4, subCategory: 'cyber_bullying_defamation' },

  // E-Commerce
  { keyword: 'fake shopping', weight: 6, subCategory: 'e_commerce_fraud' },
  { keyword: 'e-commerce', weight: 4, subCategory: 'e_commerce_fraud' },
  { keyword: 'fake product', weight: 5, subCategory: 'e_commerce_fraud' },
  { keyword: 'non-delivery', weight: 5, subCategory: 'e_commerce_fraud' },

  // General
  { keyword: 'data breach', weight: 5, subCategory: 'other_cybercrime_general' },
  { keyword: 'data leak', weight: 5, subCategory: 'other_cybercrime_general' },
  { keyword: 'sim swap', weight: 5, subCategory: 'other_cybercrime_general' },
  { keyword: 'डेटा लीक', weight: 5, subCategory: 'other_cybercrime_general' },
];

/**
 * Normalizes input text for keyword matching:
 * Converts to lowercase, collapses whitespace, replaces curly quotes.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Scores a pattern set against the normalized text.
 */
function scorePatterns(
  normalized: string,
  patterns: Array<{
    keyword: string;
    weight: number;
    subCategory?: ComplaintSubCategory;
  }>,
  category: ComplaintCategory,
): ScoredCategoryMatch | null {
  const matchedKeywords: string[] = [];
  let score = 0;
  const subCategoryCounts: Record<string, number> = {};

  for (const pattern of patterns) {
    const kw = pattern.keyword.toLowerCase();
    // Use word boundaries for short words, substring for multi-word or Devanagari
    const isMatched =
      kw.length <= 3 && /^[a-z0-9]+$/i.test(kw)
        ? new RegExp(`\\b${kw}\\b`, 'i').test(normalized)
        : normalized.includes(kw);

    if (isMatched) {
      matchedKeywords.push(pattern.keyword);
      score += pattern.weight;
      if (pattern.subCategory) {
        subCategoryCounts[pattern.subCategory] =
          (subCategoryCounts[pattern.subCategory] || 0) + pattern.weight;
      }
    }
  }

  if (matchedKeywords.length === 0 || score === 0) {
    return null;
  }

  // Determine top subcategory
  let topSubCategory: ComplaintSubCategory;
  const sortedSubCats = Object.entries(subCategoryCounts).sort((a, b) => b[1] - a[1]);

  if (sortedSubCats.length > 0) {
    topSubCategory = sortedSubCats[0][0] as ComplaintSubCategory;
  } else {
    // Default fallback subcategory per category
    if (category === 'financial_fraud') topSubCategory = 'other_financial_fraud';
    else if (category === 'women_child_related_crime') topSubCategory = 'other_women_child_crime';
    else topSubCategory = 'other_cybercrime_general';
  }

  // Calculate deterministic confidence between 0.76 and 0.96
  const confidence = Math.min(0.96, Math.max(0.76, 0.74 + score * 0.02));
  const subDef = getSubCategoryDefinition(topSubCategory);

  return {
    category,
    subCategoryKey: topSubCategory,
    subCategoryTitle: subDef?.label || 'General Cyber Incident',
    matchedKeywords,
    score,
    confidence: Number(confidence.toFixed(2)),
  };
}

/**
 * Deterministic AI mock classifier for citizen incident summaries.
 *
 * Rules:
 * 1. Financial fraud takes absolute priority over overlapping terms to ensure
 *    emergency Golden Hour 1930 access.
 * 2. Women/Child safety takes second priority.
 * 3. General other cybercrimes take third priority.
 * 4. Outputs always include `isSuggestion: true` and official disclaimers.
 * 5. Clean fallback when no keywords match.
 */
export function classifyIncident(summary: string): ClassificationResult {
  const normalized = normalizeText(summary);

  if (!normalized) {
    return createDefaultClassification(
      'Empty or minimal incident summary provided. Showing default category recommendation.',
      'कोई विवरण प्रदान नहीं किया गया। डिफ़ॉल्ट श्रेणी सुझाव प्रदर्शित किया जा रहा है।',
    );
  }

  // 1. Evaluate Financial Fraud (Priority 1)
  const financialMatch = scorePatterns(normalized, FINANCIAL_PATTERNS, 'financial_fraud');

  // 2. Evaluate Women & Child Crime (Priority 2)
  const womenChildMatch = scorePatterns(normalized, WOMEN_CHILD_PATTERNS, 'women_child_related_crime');

  // 3. Evaluate Other Cybercrime (Priority 3)
  const otherCyberMatch = scorePatterns(normalized, OTHER_CYBER_PATTERNS, 'other_cybercrime');

  // PRIORITY RULE: If financial terms matched, ALWAYS pick financial fraud
  if (financialMatch && financialMatch.score >= 3) {
    return buildResult(financialMatch, true);
  }

  // If women/child terms matched with significant signal
  if (womenChildMatch && womenChildMatch.score >= 3) {
    return buildResult(womenChildMatch, false);
  }

  // If other cybercrime terms matched
  if (otherCyberMatch && otherCyberMatch.score >= 3) {
    return buildResult(otherCyberMatch, false);
  }

  // If any lower-score matches exist, pick according to priority order
  if (financialMatch) {
    return buildResult(financialMatch, true);
  }

  if (womenChildMatch) {
    return buildResult(womenChildMatch, false);
  }

  if (otherCyberMatch) {
    return buildResult(otherCyberMatch, false);
  }

  // Fallback if no keywords matched
  return createDefaultClassification(
    'Incident summary did not match specific keywords. Classified under General Cybercrime as an initial suggestion.',
    'घटना का विवरण विशिष्ट कीवर्ड्स से मेल नहीं खाता। प्रारंभिक सुझाव के रूप में सामान्य साइबर अपराध के तहत वर्गीकृत किया गया।',
  );
}

function buildResult(match: ScoredCategoryMatch, isFinancial: boolean): ClassificationResult {
  const catDef = CATEGORY_DEFINITIONS[match.category];
  const subDef = getSubCategoryDefinition(match.subCategoryKey);

  const matchedListStr = match.matchedKeywords.slice(0, 3).join(', ');

  const reasoning = isFinancial
    ? `Financial keywords detected (${matchedListStr}) indicating monetary loss or unauthorized transaction. 1930 Golden Hour guidance recommended.`
    : `Detected ${catDef.label.toLowerCase()} indicators (${matchedListStr}). Suggested category: ${subDef?.label || catDef.label}.`;

  const reasoningHi = isFinancial
    ? `वित्तीय संकेत मिले हैं (${matchedListStr}) जिससे अनधिकृत लेनदेन या धन हानि का संकेत मिलता है। 1930 स्वर्णिम घंटा सहायता अनुशंसित है।`
    : `${catDef.labelHi} के संकेत मिले (${matchedListStr})। सुझाई गई श्रेणी: ${subDef?.labelHi || catDef.labelHi}।`;

  return {
    category: match.category,
    categoryLabel: catDef.label,
    categoryLabelHi: catDef.labelHi,
    subCategory: subDef?.label || match.subCategoryTitle,
    subCategoryKey: match.subCategoryKey,
    confidence: match.confidence,
    isEmergency: isFinancial,
    matchedKeywords: match.matchedKeywords,
    reasoning,
    reasoningHi,
    isSuggestion: true,
    disclaimer:
      'This is an AI-assisted suggestion based on your description, not a legal determination. You can confirm or change this category at any time.',
    disclaimerHi:
      'यह आपके विवरण पर आधारित एक AI-सहायक सुझाव है, कोई अंतिम कानूनी वर्गीकरण नहीं। आप इसे कभी भी बदल सकते हैं।',
  };
}

function createDefaultClassification(
  reasoning: string,
  reasoningHi: string,
): ClassificationResult {
  const catDef = CATEGORY_DEFINITIONS.other_cybercrime;
  const subDef = getSubCategoryDefinition('other_cybercrime_general');

  return {
    category: 'other_cybercrime',
    categoryLabel: catDef.label,
    categoryLabelHi: catDef.labelHi,
    subCategory: subDef?.label || 'General Cybercrime Incident',
    subCategoryKey: 'other_cybercrime_general',
    confidence: 0.72,
    isEmergency: false,
    matchedKeywords: [],
    reasoning,
    reasoningHi,
    isSuggestion: true,
    disclaimer:
      'This is an AI-assisted suggestion based on your description, not a legal determination. You can confirm or change this category at any time.',
    disclaimerHi:
      'यह आपके विवरण पर आधारित एक AI-सहायक सुझाव है, कोई अंतिम कानूनी वर्गीकरण नहीं। आप इसे कभी भी बदल सकते हैं।',
  };
}
