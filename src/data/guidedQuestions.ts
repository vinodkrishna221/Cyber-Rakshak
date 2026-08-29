import {
  ComplaintCategory,
  ComplaintDraft,
  SuggestedOption,
  WorkflowStep,
} from '../types';

export interface QuestionDefinition {
  id: string;
  questionKey: string;
  category: ComplaintCategory;
  step: WorkflowStep;
  title: string;
  titleHi: string;
  prompt: string;
  promptHi: string;
  explanation?: string;
  explanationHi?: string;
  options: SuggestedOption[];
  inputType?: 'text' | 'options_only' | 'amount' | 'date';
  extractValue: (
    answerText: string,
    option?: SuggestedOption,
    currentDraft?: ComplaintDraft,
  ) => Partial<ComplaintDraft>;
}

// ---------------------------------------------------------------------------
// Helper parsing utilities
// ---------------------------------------------------------------------------

function parseAmount(text: string): number | undefined {
  // Look for currency amounts like 25000, 25,000, ₹25000, Rs 25000, 50k, etc.
  const cleaned = text.replace(/,/g, '');
  const kMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:k|thousand)/i);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1000);
  }
  const lakhMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac)/i);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100000);
  }
  const match = cleaned.match(/(?:₹|rs\.?|inr)?\s*(\d+)/i);
  if (match) {
    const val = parseInt(match[1], 10);
    return isNaN(val) ? undefined : val;
  }
  return undefined;
}

function parsePhone(text: string): string | undefined {
  const match = text.match(/(?:\+91[\s-]?)?([6-9]\d{9})/);
  return match ? match[1] : undefined;
}

function parseUpiId(text: string): string | undefined {
  const match = text.match(/[\w.-]+@[\w.-]+/);
  return match ? match[0] : undefined;
}

function parseUrl(text: string): string | undefined {
  const match = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:com|in|org|net|xyz|top|app|apk)[^\s]*)/i);
  return match ? match[0] : undefined;
}

// ---------------------------------------------------------------------------
// FINANCIAL FRAUD QUESTIONS
// ---------------------------------------------------------------------------
export const FINANCIAL_FRAUD_QUESTIONS: QuestionDefinition[] = [
  {
    id: 'fin_q1_datetime',
    questionKey: 'incident_time',
    category: 'financial_fraud',
    step: 'ask_incident_time',
    title: 'Incident Date & Time',
    titleHi: 'घटना की तारीख एवं समय',
    prompt: 'When did this fraudulent transaction or incident occur?',
    promptHi: 'यह अनधिकृत लेन-देन या धोखाधड़ी की घटना कब हुई?',
    options: [
      {
        label: 'Today (within past few hours)',
        labelHi: 'आज (पिछले कुछ घंटों में)',
        value: 'Today',
      },
      {
        label: 'Yesterday',
        labelHi: 'कल',
        value: 'Yesterday',
      },
      {
        label: 'Within the last 3 days',
        labelHi: 'पिछले 3 दिनों के भीतर',
        value: 'Within last 3 days',
      },
      {
        label: 'More than a week ago',
        labelHi: 'एक सप्ताह से अधिक पहले',
        value: 'More than a week ago',
      },
    ],
    extractValue: (answer, option) => {
      const now = new Date();
      let dateVal = option?.value || answer;
      let timeVal = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (dateVal === 'Today') {
        dateVal = now.toISOString().split('T')[0];
      } else if (dateVal === 'Yesterday') {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        dateVal = y.toISOString().split('T')[0];
      }

      return {
        incident: {
          date: dateVal,
          time: timeVal,
        },
      };
    },
  },
  {
    id: 'fin_q2_amount',
    questionKey: 'financial_amount',
    category: 'financial_fraud',
    step: 'ask_category_specific',
    title: 'Amount Lost',
    titleHi: 'नुकसान / निकासी की राशि',
    prompt:
      'What was the approximate monetary loss or total amount debited? (You can type the exact amount or select an estimate)',
    promptHi:
      'कुल कितने रुपये की अनधिकृत निकासी या नुकसान हुआ? (आप सटीक राशि लिख सकते हैं या अनुमानित विकल्प चुन सकते हैं)',
    options: [
      { label: '₹10,000 – ₹25,000', labelHi: '₹10,000 – ₹25,000', value: '25000' },
      { label: '₹25,000 – ₹1,00,000', labelHi: '₹25,000 – ₹1,00,000', value: '50000' },
      { label: 'Above ₹1,00,000', labelHi: '₹1,00,000 से अधिक', value: '100000' },
      {
        label: 'Attempted fraud (No money lost)',
        labelHi: 'प्रयास किया गया (पैसे नहीं कटे)',
        value: '0',
      },
    ],
    inputType: 'amount',
    extractValue: (answer, option) => {
      const amountVal = option ? parseInt(option.value, 10) : parseAmount(answer);
      return {
        financial: {
          amountLost: amountVal ?? (parseAmount(answer) || 0),
        },
      };
    },
  },
  {
    id: 'fin_q3_payment_method',
    questionKey: 'payment_method',
    category: 'financial_fraud',
    step: 'ask_category_specific',
    title: 'Payment Channel & Method',
    titleHi: 'भुगतान का माध्यम',
    prompt: 'Which payment method, app, or channel was involved in the transaction?',
    promptHi: 'लेन-देन में किस भुगतान माध्यम, ऐप या चैनल का उपयोग किया गया था?',
    options: [
      {
        label: 'UPI (GPay / PhonePe / Paytm / BHIM)',
        labelHi: 'यूपीआई (Google Pay / PhonePe / Paytm)',
        value: 'UPI (GPay / PhonePe / Paytm)',
      },
      {
        label: 'Credit / Debit Card',
        labelHi: 'क्रेडिट / डेबिट कार्ड',
        value: 'Credit / Debit Card',
      },
      {
        label: 'Net Banking / IMPS / NEFT',
        labelHi: 'नेट बैंकिंग / आईएमपीएस / एनईएफटी',
        value: 'Net Banking (IMPS / NEFT)',
      },
      {
        label: 'Instant Loan App / Digital Wallet',
        labelHi: 'लोन ऐप / डिजिटल वॉलेट',
        value: 'Loan App / Digital Wallet',
      },
    ],
    extractValue: (answer, option) => ({
      financial: {
        paymentMethod: option?.value || answer,
      },
      incident: {
        platform: option?.value || answer,
      },
    }),
  },
  {
    id: 'fin_q4_txnid',
    questionKey: 'transaction_id',
    category: 'financial_fraud',
    step: 'ask_category_specific',
    title: 'Transaction / UTR Reference',
    titleHi: 'ट्रांजैक्शन / यूटीआर रेफरेंस',
    prompt:
      'Do you have a Transaction ID, UPI Reference ID, or 12-digit UTR Number from your bank SMS or statement?',
    promptHi:
      'क्या आपके पास बैंक एसएमएस या स्टेटमेंट से कोई ट्रांजैक्शन आईडी, यूपीआई रेफरेंस नंबर या 12-अंकीय यूटीआर नंबर है?',
    explanation:
      'Why we ask: Investigating officers and banks use the UTR/Reference ID to track the recipient beneficiary bank account and initiate immediate account freeze requests.',
    explanationHi:
      'यह क्यों जरूरी है: जांच अधिकारी और बैंक इस यूटीआर नंबर से लाभार्थी खाते का पता लगाकर तुरंत फंड फ्रीज करने की प्रक्रिया शुरू करते हैं।',
    options: [
      {
        label: 'Will provide in next step / Evidence',
        labelHi: 'अगले चरण में रसीद संलग्न करूंगा',
        value: 'Available in receipt / evidence',
      },
      {
        label: 'Transaction Failed / Blocked by Bank',
        labelHi: 'लेन-देन विफल / बैंक द्वारा ब्लॉक',
        value: 'Failed / Blocked',
      },
      {
        label: 'Not available right now',
        labelHi: 'अभी उपलब्ध नहीं है',
        value: 'Pending bank statement',
      },
    ],
    extractValue: (answer, option) => {
      const match = answer.match(/\b(?:\d{12}|[A-Za-z0-9]{10,24})\b/);
      return {
        financial: {
          transactionId: match ? match[0] : option?.value || answer,
        },
      };
    },
  },
  {
    id: 'fin_q5_bank',
    questionKey: 'bank_name',
    category: 'financial_fraud',
    step: 'ask_category_specific',
    title: 'Bank / Wallet Institution',
    titleHi: 'बैंक अथवा वॉलेट संस्थान',
    prompt: 'Which bank or financial institution is your victim account held with?',
    promptHi: 'आपका पीड़ित खाता किस बैंक या वित्तीय संस्थान में है?',
    options: [
      { label: 'State Bank of India (SBI)', labelHi: 'भारतीय स्टेट बैंक (SBI)', value: 'State Bank of India' },
      { label: 'HDFC Bank', labelHi: 'एचडीएफसी बैंक (HDFC)', value: 'HDFC Bank' },
      { label: 'ICICI Bank', labelHi: 'आईसीआईसीआई बैंक (ICICI)', value: 'ICICI Bank' },
      { label: 'Punjab National Bank (PNB)', labelHi: 'पंजाब नेशनल बैंक (PNB)', value: 'Punjab National Bank' },
      { label: 'Other Bank / Digital Wallet', labelHi: 'अन्य बैंक / वॉलेट', value: 'Other Bank / Wallet' },
    ],
    extractValue: (answer, option) => ({
      financial: {
        bankOrWallet: option?.value || answer,
      },
    }),
  },
  {
    id: 'fin_q6_suspect',
    questionKey: 'suspect_info',
    category: 'financial_fraud',
    step: 'ask_suspect_details',
    title: 'Suspect Identifiers',
    titleHi: 'संदिग्ध का विवरण',
    prompt:
      'Do you have any suspect details (e.g. caller phone number, beneficiary UPI ID, fraudulent link, or website)?',
    promptHi:
      'क्या आपके पास जालसाज का कोई विवरण है (जैसे कॉलर का फोन नंबर, लाभार्थी यूपीआई आईडी, फर्जी लिंक या वेबसाइट)?',
    explanation:
      'Why we ask: Suspect phone numbers and recipient UPI IDs are matched against the National Cybercrime Database to blacklist fraudulent accounts and protect other citizens.',
    explanationHi:
      'यह क्यों जरूरी है: संदिग्ध फोन नंबर और यूपीआई आईडी को राष्ट्रीय डेटाबेस में ब्लैकलिस्ट करने के लिए दर्ज किया जाता है ताकि अन्य नागरिकों को बचाया जा सके।',
    options: [
      {
        label: 'Fraudster Caller Number',
        labelHi: 'जालसाज का कॉलिंग नंबर',
        value: '+91 98765 00000',
      },
      {
        label: 'Beneficiary UPI ID',
        labelHi: 'प्राप्तकर्ता यूपीआई आईडी',
        value: 'fraudster@fakeupi',
      },
      {
        label: 'Fake APK / Website Link',
        labelHi: 'फर्जी ऐप / वेबसाइट लिंक',
        value: 'https://fraudulent-portal-link.demo',
      },
      {
        label: 'No suspect details known',
        labelHi: 'कोई विवरण उपलब्ध नहीं है',
        value: 'Unknown / Number not stored',
      },
    ],
    extractValue: (answer, option) => {
      const phone = parsePhone(answer);
      const upi = parseUpiId(answer);
      const url = parseUrl(answer);

      return {
        suspect: {
          phone: phone || (answer.includes('98765') ? '+91 98765 00000' : undefined),
          upiId: upi || (answer.includes('@') ? answer.trim() : undefined),
          url: url,
        },
      };
    },
  },
  {
    id: 'fin_q7_location',
    questionKey: 'location',
    category: 'financial_fraud',
    step: 'ask_location',
    title: 'Incident Location & Summary',
    titleHi: 'घटना का स्थान एवं विवरण',
    prompt:
      'In which city or state were you located during this incident, and are there any other critical notes to add?',
    promptHi:
      'घटना के समय आप किस शहर अथवा राज्य में थे, और क्या कोई अन्य महत्वपूर्ण बिंदु जोड़ना चाहते हैं?',
    options: [
      {
        label: 'Same as my registered state',
        labelHi: 'मेरे पंजीकृत राज्य में ही',
        value: 'Same as registered state',
      },
      {
        label: 'During travel / Other state',
        labelHi: 'यात्रा के दौरान / अन्य राज्य',
        value: 'Interstate / Travel',
      },
      {
        label: 'All details noted above',
        labelHi: 'सभी विवरण ऊपर दिए गए हैं',
        value: 'All details noted',
      },
    ],
    extractValue: (answer, option, currentDraft) => ({
      incident: {
        location: option?.value || answer || currentDraft?.complainant.state || 'Local Jurisdiction',
        description: answer.length > 15 ? answer : undefined,
      },
    }),
  },
];

// ---------------------------------------------------------------------------
// WOMEN / CHILD RELATED CRIME QUESTIONS
// ---------------------------------------------------------------------------
export const WOMEN_CHILD_QUESTIONS: QuestionDefinition[] = [
  {
    id: 'wc_q1_victim_role',
    questionKey: 'affected_person',
    category: 'women_child_related_crime',
    step: 'ask_category_specific',
    title: 'Affected Person & Role',
    titleHi: 'प्रभावित व्यक्ति एवं संबंध',
    prompt:
      'To help us prepare this report with appropriate sensitivity and legal priority, who is the affected person?',
    promptHi:
      'इस शिकायत को उचित संवेदनशीलता और कानूनी प्राथमिकता के साथ तैयार करने के लिए, प्रभावित व्यक्ति कौन है?',
    explanation:
      'Privacy notice: In-browser draft. Reports involving women and minors receive fast-track handling under Indian cyber laws.',
    explanationHi:
      'गोपनीयता सूचना: महिलाओं और नाबालिगों से जुड़े मामलों को भारतीय साइबर कानूनों के तहत विशेष प्राथमिकता और गोपनीयता प्रदान की जाती है।',
    options: [
      {
        label: 'Reporting for myself (Woman)',
        labelHi: 'स्वयं के लिए रिपोर्टिंग (महिला)',
        value: 'Victim is a Woman (Self reporting)',
      },
      {
        label: 'Reporting for a child / minor (< 18 years)',
        labelHi: 'नाबालिग बच्चे के लिए रिपोर्टिंग (< 18 वर्ष)',
        value: 'Victim is a Minor / Child (Guardian reporting)',
      },
      {
        label: 'Reporting on behalf of family member / friend',
        labelHi: 'परिवार के सदस्य या मित्र की ओर से',
        value: 'Reporting on behalf of family member / friend',
      },
    ],
    extractValue: (answer, option) => ({
      incident: {
        description: option?.value || answer,
      },
    }),
  },
  {
    id: 'wc_q2_datetime',
    questionKey: 'incident_time',
    category: 'women_child_related_crime',
    step: 'ask_incident_time',
    title: 'Incident Timing',
    titleHi: 'घटना का समय',
    prompt: 'When did this harassment, stalking, or incident begin or take place?',
    promptHi: 'यह उत्पीड़न, स्टॉकिंग या घटना कब शुरू हुई या कब घटी?',
    options: [
      {
        label: 'Active & Ongoing right now',
        labelHi: 'वर्तमान में लगातार जारी है',
        value: 'Ongoing',
      },
      {
        label: 'Within the past 24–48 hours',
        labelHi: 'पिछले 24-48 घंटों के भीतर',
        value: 'Past 48 hours',
      },
      {
        label: 'Within the last week',
        labelHi: 'पिछले एक सप्ताह के भीतर',
        value: 'Within last week',
      },
      {
        label: 'Started over a month ago',
        labelHi: 'एक महीने से अधिक पहले शुरू हुआ',
        value: 'Over a month ago',
      },
    ],
    extractValue: (answer, option) => {
      const now = new Date();
      return {
        incident: {
          date: option?.value === 'Ongoing' ? now.toISOString().split('T')[0] : option?.value || answer,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };
    },
  },
  {
    id: 'wc_q3_platform',
    questionKey: 'platform',
    category: 'women_child_related_crime',
    step: 'ask_platform',
    title: 'Platform / Channel',
    titleHi: 'प्लेटफॉर्म अथवा माध्यम',
    prompt: 'Which digital platform, social media app, or communication channel was used?',
    promptHi: 'उत्पीड़न या घटना में किस डिजिटल प्लेटफॉर्म, सोशल मीडिया ऐप या संचार माध्यम का उपयोग हुआ?',
    options: [
      {
        label: 'WhatsApp / Telegram',
        labelHi: 'व्हाट्सएप / टेलीग्राम',
        value: 'WhatsApp / Telegram',
      },
      {
        label: 'Instagram / Facebook',
        labelHi: 'इंस्टाग्राम / फेसबुक',
        value: 'Instagram / Facebook',
      },
      {
        label: 'Phone Calls / SMS / Video Call',
        labelHi: 'फोन कॉल / एसएमएस / वीडियो कॉल',
        value: 'Phone Calls / SMS / Video Call',
      },
      {
        label: 'Dating App / Gaming / Other Website',
        labelHi: 'डेटिंग ऐप / गेमिंग / अन्य वेबसाइट',
        value: 'Dating App / Other Platform',
      },
    ],
    extractValue: (answer, option) => ({
      incident: {
        platform: option?.value || answer,
      },
    }),
  },
  {
    id: 'wc_q4_threat_type',
    questionKey: 'threat_nature',
    category: 'women_child_related_crime',
    step: 'ask_category_specific',
    title: 'Nature of Incident & Danger',
    titleHi: 'घटना का स्वरूप एवं खतरा',
    prompt:
      'What is the nature of the threat? (e.g. blackmail with morphed photos, persistent stalking, obscene messages, or extortion)',
    promptHi:
      'धमकी या घटना का क्या स्वरूप है? (जैसे मॉर्फ्ड फोटो से ब्लैकमेल, लगातार स्टॉकिंग, अभद्र संदेश या जबरन वसूली)',
    explanation:
      'Why we ask: Clear threat details help cyber cells issue immediate content takedown notices to social platforms and preserve evidence under IT Act Sec 67/66E.',
    explanationHi:
      'यह क्यों जरूरी है: स्पष्ट विवरण से साइबर सेल सोशल मीडिया कंपनियों को तुरंत आपत्तिजनक सामग्री हटाने (Content Takedown) का नोटिस जारी कर सकती है।',
    options: [
      {
        label: 'Blackmail / Morphed Images / Video Call',
        labelHi: 'ब्लैकमेल / मॉर्फ्ड फोटो / वीडियो कॉल',
        value: 'Blackmail & Morphed Photos',
      },
      {
        label: 'Persistent Stalking & Threatening Messages',
        labelHi: 'लगातार स्टॉकिंग एवं धमकी भरे संदेश',
        value: 'Cyber Stalking & Harassment',
      },
      {
        label: 'Fake Profile Impersonation / Defamation',
        labelHi: 'फर्जी प्रोफाइल / मानहानि',
        value: 'Fake Profile & Defamation',
      },
      {
        label: 'Child Exploitation / Inappropriate Contact',
        labelHi: 'बाल शोषण / अनुचित संपर्क',
        value: 'Child Safety Violation',
      },
    ],
    extractValue: (answer, option, currentDraft) => {
      const prevDesc = currentDraft?.incident.description || '';
      const newPart = option?.value || answer;
      return {
        incident: {
          description: prevDesc ? `${prevDesc} | Threat: ${newPart}` : newPart,
        },
      };
    },
  },
  {
    id: 'wc_q5_suspect',
    questionKey: 'suspect_info',
    category: 'women_child_related_crime',
    step: 'ask_suspect_details',
    title: 'Perpetrator Details',
    titleHi: 'संदिग्ध / आरोपी का विवरण',
    prompt:
      'Do you have any suspect information (e.g. social media username/handle, profile URL, mobile number, or email)?',
    promptHi:
      'क्या आपके पास आरोपी का कोई विवरण है (जैसे सोशल मीडिया यूजरनेम/हैंडल, प्रोफाइल यूआरएल, मोबाइल नंबर या ईमेल)?',
    explanation:
      'Why we ask: Providing specific handles or profile URLs allows investigating officers to request IP logs and account records directly from platforms.',
    explanationHi:
      'यह क्यों जरूरी है: प्रोफाइल हैंडल या यूआरएल देने से जांच अधिकारी सीधे प्लेटफॉर्म्स से आईपी लॉग और खाता रिकॉर्ड सुरक्षित करवा सकते हैं।',
    options: [
      {
        label: 'Suspect Instagram / Social Handle',
        labelHi: 'संदिग्ध इंस्टाग्राम / सोशल हैंडल',
        value: '@suspect_user_handle',
      },
      {
        label: 'Suspect Mobile Number',
        labelHi: 'संदिग्ध मोबाइल नंबर',
        value: '+91 98765 43210',
      },
      {
        label: 'Profile Web Link / URL',
        labelHi: 'प्रोफाइल वेब लिंक / यूआरएल',
        value: 'https://instagram.com/fake_profile_id',
      },
      {
        label: 'Perpetrator is unknown / Anonymous',
        labelHi: 'आरोपी अज्ञात / गुमनाम है',
        value: 'Unknown / Anonymous perpetrator',
      },
    ],
    extractValue: (answer, option) => {
      const phone = parsePhone(answer);
      const url = parseUrl(answer);
      const handleMatch = answer.match(/@[\w.]+/);

      return {
        suspect: {
          phone: phone || (answer.includes('98765') ? '+91 98765 43210' : undefined),
          socialHandle: handleMatch ? handleMatch[0] : (answer.startsWith('@') ? answer : undefined),
          url: url,
        },
      };
    },
  },
  {
    id: 'wc_q6_location',
    questionKey: 'location',
    category: 'women_child_related_crime',
    step: 'ask_location',
    title: 'Jurisdiction & Location',
    titleHi: 'अधिकार क्षेत्र एवं स्थान',
    prompt: 'What is your current city or state where you are residing?',
    promptHi: 'आपका वर्तमान शहर अथवा राज्य कौन सा है जहां आप निवास कर रहे हैं?',
    options: [
      {
        label: 'My current registered state',
        labelHi: 'मेरा वर्तमान पंजीकृत राज्य',
        value: 'Registered State Jurisdiction',
      },
      {
        label: 'Prefer not to specify exact city',
        labelHi: 'सटीक शहर साझा नहीं करना चाहते',
        value: 'General State Level',
      },
    ],
    extractValue: (answer, option, currentDraft) => ({
      incident: {
        location: option?.value || answer || currentDraft?.complainant.state || 'Local Jurisdiction',
      },
    }),
  },
];

// ---------------------------------------------------------------------------
// OTHER CYBERCRIME QUESTIONS
// ---------------------------------------------------------------------------
export const OTHER_CYBERCRIME_QUESTIONS: QuestionDefinition[] = [
  {
    id: 'oc_q1_datetime',
    questionKey: 'incident_time',
    category: 'other_cybercrime',
    step: 'ask_incident_time',
    title: 'Incident Occurrence',
    titleHi: 'घटना की तारीख एवं समय',
    prompt: 'When did you first detect or experience this cyber incident?',
    promptHi: 'आपने इस साइबर घटना को पहली बार कब अनुभव किया या देखा?',
    options: [
      { label: 'Today', labelHi: 'आज', value: 'Today' },
      { label: 'Yesterday', labelHi: 'कल', value: 'Yesterday' },
      { label: 'Within the last week', labelHi: 'पिछले एक सप्ताह में', value: 'Within last week' },
      { label: 'More than 2 weeks ago', labelHi: '2 सप्ताह से अधिक पहले', value: 'Over 2 weeks ago' },
    ],
    extractValue: (answer, option) => {
      const now = new Date();
      let dateVal = option?.value || answer;
      if (dateVal === 'Today') dateVal = now.toISOString().split('T')[0];
      return {
        incident: {
          date: dateVal,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      };
    },
  },
  {
    id: 'oc_q2_type',
    questionKey: 'crime_nature',
    category: 'other_cybercrime',
    step: 'ask_category_specific',
    title: 'Type of Cyber Incident',
    titleHi: 'साइबर अपराध का स्वरूप',
    prompt: 'What was the specific nature of the cyber attack or issue?',
    promptHi: 'इस साइबर हमले या समस्या का मुख्य स्वरूप क्या था?',
    options: [
      {
        label: 'Account Hacked / Password Changed / 2FA Bypassed',
        labelHi: 'अकाउंट हैक / पासवर्ड बदला गया',
        value: 'Account Takeover / Hacking',
      },
      {
        label: 'Phishing Link / Malicious APK / Fake Website',
        labelHi: 'फ़िशिंग लिंक / फर्जी वेबसाइट / वायरस एपीके',
        value: 'Phishing & Fake Website',
      },
      {
        label: 'Ransomware / Computer Locked / Malware Infection',
        labelHi: 'रैंसमवेयर / कंप्यूटर लॉक / मैलवेयर',
        value: 'Ransomware / Malware Attack',
      },
      {
        label: 'Fake Shopping Website / Non-Delivery of Goods',
        labelHi: 'फर्जी शॉपिंग साइट / सामान न मिलना',
        value: 'E-Commerce Shopping Fraud',
      },
      {
        label: 'Online Defamation / Cyberbullying / Trolling',
        labelHi: 'ऑनलाइन मानहानि / साइबर बदमाशी',
        value: 'Cyberbullying & Defamation',
      },
    ],
    extractValue: (answer, option) => ({
      incident: {
        description: option?.value || answer,
      },
    }),
  },
  {
    id: 'oc_q3_platform',
    questionKey: 'platform',
    category: 'other_cybercrime',
    step: 'ask_platform',
    title: 'Impacted Service or Device',
    titleHi: 'प्रभावित सेवा अथवा उपकरण',
    prompt: 'Which account, service, email provider, or device was impacted?',
    promptHi: 'कौन सा खाता, सेवा, ईमेल प्रदाता या उपकरण प्रभावित हुआ?',
    options: [
      {
        label: 'Email (Gmail / Outlook / Corporate)',
        labelHi: 'ईमेल (Gmail / Outlook / कॉर्पोरेट)',
        value: 'Email (Gmail / Outlook)',
      },
      {
        label: 'Social Media (Instagram / Facebook / X / Telegram)',
        labelHi: 'सोशल मीडिया (Instagram / Facebook / X)',
        value: 'Social Media Account',
      },
      {
        label: 'E-Commerce Website / Web Portal',
        labelHi: 'ई-कॉमर्स वेबसाइट / वेब पोर्टल',
        value: 'E-Commerce Portal',
      },
      {
        label: 'Personal Computer / Laptop / Android Phone',
        labelHi: 'पर्सनल कंप्यूटर / लैपटॉप / स्मार्टफोन',
        value: 'Computer / Smartphone Device',
      },
    ],
    extractValue: (answer, option) => ({
      incident: {
        platform: option?.value || answer,
      },
    }),
  },
  {
    id: 'oc_q4_suspect',
    questionKey: 'suspect_info',
    category: 'other_cybercrime',
    step: 'ask_suspect_details',
    title: 'Malicious Source & Suspect Details',
    titleHi: 'दुर्भावनापूर्ण स्रोत एवं संदिग्ध विवरण',
    prompt:
      'Do you have the phishing link URL, sender email address, or suspect phone number involved?',
    promptHi:
      'क्या आपके पास फ़िशिंग वेबसाइट लिंक, प्रेषक का ईमेल पता या संदिग्ध का फोन नंबर है?',
    explanation:
      'Why we ask: Malicious URLs and domain names are submitted to CERT-In and national threat feeds to block access across Indian internet service providers.',
    explanationHi:
      'यह क्यों जरूरी है: दुर्भावनापूर्ण वेबसाइट्स और लिंक्स को CERT-In और राष्ट्रीय थ्रेट फीड्स में ब्लॉक करने के लिए यह विवरण आवश्यक होता है।',
    options: [
      {
        label: 'Phishing URL / Fake Domain Link',
        labelHi: 'फ़िशिंग यूआरएल / फर्जी डोमेन लिंक',
        value: 'https://fake-login-portal.scam',
      },
      {
        label: 'Malicious Sender Email Address',
        labelHi: 'फर्जी प्रेषक का ईमेल पता',
        value: 'support@fake-service-team.com',
      },
      {
        label: 'Caller / WhatsApp Sender Number',
        labelHi: 'कॉलर / व्हाट्सएप सेंडर नंबर',
        value: '+91 98765 11111',
      },
      {
        label: 'No suspect URL or contact available',
        labelHi: 'कोई संदिग्ध लिंक या संपर्क उपलब्ध नहीं',
        value: 'None available',
      },
    ],
    extractValue: (answer, option) => {
      const phone = parsePhone(answer);
      const url = parseUrl(answer);
      const emailMatch = answer.match(/[\w.-]+@[\w.-]+\.[a-z]{2,}/i);

      return {
        suspect: {
          phone: phone || (answer.includes('98765') ? '+91 98765 11111' : undefined),
          url: url || (answer.includes('http') ? answer.trim() : undefined),
          email: emailMatch ? emailMatch[0] : (answer.includes('@') && answer.includes('.') ? answer.trim() : undefined),
        },
      };
    },
  },
  {
    id: 'oc_q5_status_location',
    questionKey: 'location',
    category: 'other_cybercrime',
    step: 'ask_location',
    title: 'Current Status & State',
    titleHi: 'वर्तमान स्थिति एवं राज्य',
    prompt:
      'Is the issue currently active or has the account/system been secured, and what is your location state?',
    promptHi:
      'क्या समस्या अभी भी सक्रिय है या खाते को सुरक्षित कर लिया गया है, और आपका राज्य क्या है?',
    options: [
      {
        label: 'Still locked out / System compromised',
        labelHi: 'अभी भी लॉक आउट / सिस्टम प्रभावित',
        value: 'Active compromise',
      },
      {
        label: 'Account recovered / Password changed',
        labelHi: 'खाता पुनः प्राप्त / पासवर्ड बदल दिया',
        value: 'Secured & Recovered',
      },
      {
        label: 'Same as registered state jurisdiction',
        labelHi: 'पंजीकृत राज्य के क्षेत्राधिकार में',
        value: 'Registered State Jurisdiction',
      },
    ],
    extractValue: (answer, option, currentDraft) => ({
      incident: {
        location: option?.value || answer || currentDraft?.complainant.state || 'Local Jurisdiction',
      },
    }),
  },
];

// ---------------------------------------------------------------------------
// Main Query Functions
// ---------------------------------------------------------------------------

export const GUIDED_QUESTIONS_BY_CATEGORY: Record<ComplaintCategory, QuestionDefinition[]> = {
  financial_fraud: FINANCIAL_FRAUD_QUESTIONS,
  women_child_related_crime: WOMEN_CHILD_QUESTIONS,
  other_cybercrime: OTHER_CYBERCRIME_QUESTIONS,
};

export function getQuestionsForCategory(category: ComplaintCategory): QuestionDefinition[] {
  return GUIDED_QUESTIONS_BY_CATEGORY[category] || OTHER_CYBERCRIME_QUESTIONS;
}

export function getQuestionByIndex(
  category: ComplaintCategory,
  index: number,
): QuestionDefinition | undefined {
  const list = getQuestionsForCategory(category);
  return list[index];
}

export function getTotalQuestions(category: ComplaintCategory): number {
  return getQuestionsForCategory(category).length;
}
