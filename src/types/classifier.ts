import { ComplaintCategory, ComplaintSubCategory } from './complaint';

export interface ClassificationResult {
  category: ComplaintCategory;
  categoryLabel: string;
  categoryLabelHi: string;
  subCategory: string;
  subCategoryKey: ComplaintSubCategory;
  confidence: number;
  isEmergency: boolean;
  matchedKeywords: string[];
  reasoning: string;
  reasoningHi: string;
  isSuggestion: true;
  disclaimer: string;
  disclaimerHi: string;
}

export interface SubCategoryDefinition {
  key: ComplaintSubCategory;
  category: ComplaintCategory;
  label: string;
  labelHi: string;
  description: string;
  descriptionHi: string;
  keywords: string[];
  examplePhrases: string[];
}

export interface CategoryDefinition {
  key: ComplaintCategory;
  label: string;
  labelHi: string;
  tagline: string;
  taglineHi: string;
  description: string;
  descriptionHi: string;
  iconName: string;
  isEmergencyHelplineApplicable: boolean;
  helplineNumber?: string;
  subCategories: SubCategoryDefinition[];
}
