export type ComplaintCategory =
  | 'women_child_related_crime'
  | 'financial_fraud'
  | 'other_cybercrime';

export type FinancialSubCategory =
  | 'upi_banking_fraud'
  | 'investment_job_scam'
  | 'credit_debit_card_fraud'
  | 'loan_app_fraud'
  | 'crypto_currency_fraud'
  | 'other_financial_fraud';

export type WomenChildSubCategory =
  | 'cyber_stalking_harassment'
  | 'child_abuse_exploitation'
  | 'blackmail_morphing'
  | 'fake_profile_impersonation'
  | 'other_women_child_crime';

export type OtherCyberSubCategory =
  | 'account_hacking_takeover'
  | 'phishing_fake_websites'
  | 'ransomware_malware'
  | 'cyber_bullying_defamation'
  | 'e_commerce_fraud'
  | 'other_cybercrime_general';

export type ComplaintSubCategory =
  | FinancialSubCategory
  | WomenChildSubCategory
  | OtherCyberSubCategory;

export interface ComplainantDetails {
  name?: string;
  mobile?: string;
  state?: string;
  isGuest?: boolean;
  verifiedAt?: string;
}

export interface IncidentDetails {
  summary?: string;
  date?: string;
  time?: string;
  platform?: string;
  location?: string;
  description?: string;
}

export interface FinancialDetails {
  amountLost?: number;
  paymentMethod?: string;
  transactionId?: string;
  bankOrWallet?: string;
}

export interface SuspectDetails {
  phone?: string;
  email?: string;
  url?: string;
  socialHandle?: string;
  upiId?: string;
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: string;
  mockSize: string;
  uploadedAt?: string;
  previewUrl?: string;
}

export interface ComplaintDraft {
  acknowledgementId?: string;
  language: 'en' | 'hi';
  category?: ComplaintCategory;
  subCategory?: string;
  subCategoryKey?: ComplaintSubCategory;
  confidence?: number;
  isEmergency?: boolean;
  complainant: ComplainantDetails;
  incident: IncidentDetails;
  financial?: FinancialDetails;
  suspect?: SuspectDetails;
  evidence: EvidenceItem[];
  status?: 'draft' | 'preview_ready' | 'submitted';
  createdAt?: string;
  updatedAt?: string;
  submittedAt?: string;
}

export type SubmittedComplaint = ComplaintDraft & {
  acknowledgementId: string;
  status: 'submitted';
  submittedAt: string;
};
