import React, { useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Shield,
  IndianRupee,
  ShieldAlert,
  Laptop,
} from 'lucide-react';
import {
  ClassificationResult,
  ComplaintCategory,
  ComplaintSubCategory,
} from '../../types';
import { ALL_CATEGORIES, getCategoryDefinition } from '../../data/categories';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/Button';

interface CategoryConfidenceCardProps {
  classification: ClassificationResult;
  isConfirmed?: boolean;
  onConfirm: () => void;
  onChangeCategory: (
    newCategory: ComplaintCategory,
    newSubCategoryKey?: ComplaintSubCategory,
  ) => void;
}

export const CategoryConfidenceCard: React.FC<CategoryConfidenceCardProps> = ({
  classification,
  isConfirmed = false,
  onConfirm,
  onChangeCategory,
}) => {
  const { t, language } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const isHindi = language === 'hi';
  const categoryLabel = isHindi
    ? classification.categoryLabelHi
    : classification.categoryLabel;
  const reasoning = isHindi
    ? classification.reasoningHi
    : classification.reasoning;

  const matchPercent = Math.round((classification.confidence || 0.9) * 100);

  const getCategoryIcon = (category: ComplaintCategory) => {
    switch (category) {
      case 'financial_fraud':
        return <IndianRupee className="size-4.5 text-chakra-blue" aria-hidden="true" />;
      case 'women_child_related_crime':
        return <ShieldAlert className="size-4.5 text-alert-red" aria-hidden="true" />;
      case 'other_cybercrime':
      default:
        return <Laptop className="size-4.5 text-india-green" aria-hidden="true" />;
    }
  };

  const handleSelectNewCategory = (catKey: ComplaintCategory) => {
    const catDef = getCategoryDefinition(catKey);
    const firstSubKey = catDef.subCategories[0]?.key;
    onChangeCategory(catKey, firstSubKey);
    setIsChanging(false);
  };

  return (
    <div
      className="my-3 sm:my-4 rounded-xl border border-chakra-blue/30 bg-white p-4 sm:p-5 shadow-xs transition-all"
      role="region"
      aria-label={t.chat.suggestedCategoryTitle}
      data-testid="category-confidence-card"
    >
      {/* Header with AI Badge & Confidence Score */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-full bg-blue-50 text-chakra-blue flex items-center justify-center">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-chakra-blue">
            {t.chat.suggestedCategoryTitle}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-blue-50 border border-chakra-blue/20 text-chakra-blue text-xs font-bold shadow-2xs">
          <span>{t.chat.matchScore.replace('{score}', matchPercent.toString())}</span>
        </div>
      </div>

      {/* Main Category Result */}
      <div className="mt-3.5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-mist border border-border-soft">
            {getCategoryIcon(classification.category)}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-deep-navy">
              {categoryLabel}
            </h3>
            {classification.subCategory && (
              <span className="inline-block text-xs font-semibold text-chakra-blue bg-blue-50/80 px-2 py-0.5 rounded border border-blue-100 mt-0.5">
                {classification.subCategory}
              </span>
            )}
          </div>
        </div>

        {/* Plain-language AI Reasoning */}
        <p className="text-xs sm:text-sm text-muted-text leading-relaxed font-normal bg-mist/60 p-2.5 rounded-lg border border-border-soft">
          {reasoning}
        </p>

        {/* Disclaimer that this is an AI suggestion */}
        <p className="text-[11px] text-muted-text/90 italic">
          {t.chat.confidenceDisclaimer}
        </p>
      </div>

      {/* Confirmation & Switch Actions */}
      {!isChanging ? (
        <div className="mt-4 pt-3 border-t border-border-soft flex flex-wrap items-center justify-between gap-2.5">
          {isConfirmed ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-india-green">
              <CheckCircle2 className="size-4 text-india-green" />
              <span>
                {t.chat.categoryConfirmedNotice.replace(
                  '{category}',
                  categoryLabel,
                )}
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={onConfirm}
              leftIcon={<CheckCircle2 className="size-4" aria-hidden="true" />}
              className="text-xs font-bold"
            >
              {t.chat.looksRightBtn}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsChanging(true)}
            leftIcon={<RefreshCw className="size-3.5 text-chakra-blue" aria-hidden="true" />}
            className="text-xs font-semibold"
          >
            {t.chat.changeCategoryBtn}
          </Button>
        </div>
      ) : (
        <div className="mt-4 pt-3 border-t border-border-soft space-y-2">
          <span className="text-xs font-semibold text-deep-navy block">
            {t.chat.changeCategoryPrompt}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ALL_CATEGORIES.map((cat) => {
              const isCurrent = cat.key === classification.category;
              const catTitle = isHindi ? cat.labelHi : cat.label;
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => handleSelectNewCategory(cat.key)}
                  className={`p-2.5 text-left rounded-lg text-xs font-medium border transition-all cursor-pointer flex flex-col justify-between ${
                    isCurrent
                      ? 'border-chakra-blue bg-blue-50 text-chakra-blue font-bold shadow-2xs'
                      : 'border-border-soft bg-white text-deep-navy hover:bg-mist hover:border-chakra-blue/40'
                  }`}
                >
                  <span className="font-bold">{catTitle}</span>
                  <span className="text-[10px] text-muted-text mt-1 line-clamp-1">
                    {isHindi ? cat.taglineHi : cat.tagline}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setIsChanging(false)}
            className="text-xs text-muted-text hover:text-deep-navy hover:underline mt-1 cursor-pointer"
          >
            {t.buttons.cancel}
          </button>
        </div>
      )}
    </div>
  );
};
