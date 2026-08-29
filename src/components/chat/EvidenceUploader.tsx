import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  FileImage,
  File,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Sparkles,
  Info,
  X,
} from 'lucide-react';
import { ComplaintCategory, EvidenceItem } from '../../types';
import { useDraftStore } from '../../store';
import { useTranslation } from '../../i18n';

interface EvidenceUploaderProps {
  category?: ComplaintCategory;
  className?: string;
  onClose?: () => void;
  compact?: boolean;
}

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.doc', '.docx', '.txt'];
const ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  category,
  className = '',
  onClose,
  compact = false,
}) => {
  const { t, language } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { draft, addEvidenceItem, removeEvidenceItem } = useDraftStore();
  const currentCategory = category || draft.category || 'other_cybercrime';
  const isHindi = language === 'hi';

  const getGuidanceText = () => {
    switch (currentCategory) {
      case 'financial_fraud':
        return t.evidence.evidenceGuidanceFinancial;
      case 'women_child_related_crime':
        return t.evidence.evidenceGuidanceWomenChild;
      case 'other_cybercrime':
      default:
        return t.evidence.evidenceGuidanceOther;
    }
  };

  const getFileIcon = (mimeOrName: string) => {
    const lower = mimeOrName.toLowerCase();
    if (lower.includes('image') || lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
      return <FileImage className="size-4.5 text-chakra-blue" aria-hidden="true" />;
    }
    if (lower.includes('pdf') || lower.includes('doc') || lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.doc')) {
      return <FileText className="size-4.5 text-alert-red" aria-hidden="true" />;
    }
    return <File className="size-4.5 text-deep-navy" aria-hidden="true" />;
  };

  const validateAndAddFile = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. File Size Check
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const err = t.evidence.fileTooLargeError
        .replace('{fileName}', file.name)
        .replace('{fileSize}', formatFileSize(file.size));
      setErrorMessage(err);
      return false;
    }

    // 2. Extension Check
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(file.type);

    if (!isAllowedExt && !isAllowedMime) {
      const err = t.evidence.unsupportedFileTypeError.replace('{fileType}', ext || file.type || 'unknown');
      setErrorMessage(err);
      return false;
    }

    // 3. Duplicate Name Check
    const alreadyExists = draft.evidence.some(
      (item) => item.name.toLowerCase() === file.name.toLowerCase(),
    );
    if (alreadyExists) {
      const err = t.evidence.duplicateFileError.replace('{fileName}', file.name);
      setErrorMessage(err);
      return false;
    }

    // Add metadata only (Browser-only, no server upload)
    const newItem: EvidenceItem = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      type: file.type || 'application/octet-stream',
      mockSize: formatFileSize(file.size),
      uploadedAt: new Date().toISOString(),
    };

    addEvidenceItem(newItem);
    setSuccessMessage(t.evidence.fileAddedSuccess.replace('{fileName}', file.name));
    return true;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    let addedCount = 0;
    Array.from(files).forEach((file) => {
      if (validateAndAddFile(file)) {
        addedCount++;
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Quick Add Sample Demo Evidence
  const handleAddSample = (name: string, type: string, mockSize: string) => {
    setErrorMessage(null);
    const alreadyExists = draft.evidence.some((item) => item.name === name);
    if (alreadyExists) {
      setErrorMessage(t.evidence.duplicateFileError.replace('{fileName}', name));
      return;
    }

    addEvidenceItem({
      id: `ev-sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      type,
      mockSize,
      uploadedAt: new Date().toISOString(),
    });

    setSuccessMessage(t.evidence.fileAddedSuccess.replace('{fileName}', name));
  };

  const handleRemove = (id: string, name: string) => {
    removeEvidenceItem(id);
    setSuccessMessage(t.evidence.fileRemovedSuccess.replace('{fileName}', name));
    setErrorMessage(null);
  };

  const sampleEvidenceOptions = [
    {
      id: 'upi',
      name: isHindi ? 'यूपीआई डेबिट रसीद.png' : 'UPI-Payment-Debit-Receipt.png',
      type: 'image/png',
      mockSize: '248 KB',
      label: t.evidence.sampleUpiReceipt,
      category: 'financial_fraud',
    },
    {
      id: 'sms',
      name: isHindi ? 'बैंक एसएमएस सूचना.txt' : 'Bank-Transaction-SMS-Alert.txt',
      type: 'text/plain',
      mockSize: '16 KB',
      label: t.evidence.sampleBankSms,
      category: 'financial_fraud',
    },
    {
      id: 'passbook',
      name: isHindi ? 'बैंक पासबुक विवरण.pdf' : 'Bank-Account-Statement-Entry.pdf',
      type: 'application/pdf',
      mockSize: '1.24 MB',
      label: t.evidence.samplePassbook,
      category: 'financial_fraud',
    },
    {
      id: 'chat',
      name: isHindi ? 'व्हाट्सएप चैट स्क्रीनशॉट.png' : 'WhatsApp-Threat-Chat-Record.png',
      type: 'image/png',
      mockSize: '412 KB',
      label: t.evidence.sampleChatScreenshot,
      category: 'women_child_related_crime',
    },
    {
      id: 'profile',
      name: isHindi ? 'संदिग्ध प्रोफ़ाइल स्क्रीनशॉट.png' : 'Suspect-Instagram-Profile.png',
      type: 'image/png',
      mockSize: '320 KB',
      label: t.evidence.sampleProfileScreenshot,
      category: 'women_child_related_crime',
    },
    {
      id: 'caller',
      name: isHindi ? 'कॉल लॉग रिकॉर्ड.txt' : 'Fake-Caller-Log-Record.txt',
      type: 'text/plain',
      mockSize: '28 KB',
      label: t.evidence.sampleCallLog,
      category: 'women_child_related_crime',
    },
    {
      id: 'phishing',
      name: isHindi ? 'फ़िशिंग ईमेल हेडर.txt' : 'Phishing-Email-Full-Headers.txt',
      type: 'text/plain',
      mockSize: '48 KB',
      label: t.evidence.samplePhishingEmail,
      category: 'other_cybercrime',
    },
  ];

  // Filter relevant samples based on active category
  const relevantSamples = sampleEvidenceOptions.filter(
    (s) => s.category === currentCategory || draft.evidence.length === 0,
  );

  return (
    <div
      className={`rounded-2xl border border-border-soft bg-white p-4 sm:p-5 shadow-xs space-y-4 ${className}`}
      data-testid="evidence-uploader"
      role="region"
      aria-label={t.evidence.sectionTitle}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-border-soft">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-blue-50 text-chakra-blue flex items-center justify-center">
            <UploadCloud className="size-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-deep-navy">
              {t.evidence.sectionTitle}
            </h3>
            {!compact && (
              <p className="text-xs text-muted-text">
                {t.evidence.sectionSubtitle}
              </p>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close evidence uploader"
            className="p-1 rounded-lg text-muted-text hover:text-deep-navy hover:bg-mist transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Category-Tailored Guidance Banner */}
      <div className="flex items-start gap-2 p-3 rounded-xl bg-mist border border-border-soft text-xs text-muted-text leading-relaxed">
        <Info className="size-4 text-chakra-blue shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold text-deep-navy block mb-0.5">
            {t.chat.categoryLabel}: {currentCategory.replace(/_/g, ' ')}
          </span>
          <p className="text-ink/80">{getGuidanceText()}</p>
        </div>
      </div>

      {/* Error / Alert Feedback */}
      {errorMessage && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-alert-red animate-fade-in"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-alert-red hover:opacity-80 p-0.5 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && !errorMessage && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-green-50 border border-green-200 text-xs text-india-green animate-fade-in"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
            <span>{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-india-green hover:opacity-80 p-0.5 cursor-pointer"
            aria-label="Dismiss message"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
          isDragging
            ? 'border-chakra-blue bg-blue-50/80 ring-2 ring-chakra-blue/30 scale-[1.01]'
            : 'border-border-soft bg-mist/50 hover:bg-mist hover:border-chakra-blue/40'
        }`}
        role="button"
        tabIndex={0}
        aria-label={t.evidence.dropzoneTitle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
          onChange={(e) => handleFiles(e.target.files)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        <div className="size-10 rounded-full bg-white text-chakra-blue shadow-2xs flex items-center justify-center border border-border-soft">
          <UploadCloud className="size-5" aria-hidden="true" />
        </div>

        <div>
          <p className="text-xs sm:text-sm font-bold text-deep-navy">
            {t.evidence.dropzoneTitle}
          </p>
          <p className="text-[11px] text-muted-text mt-0.5">
            {t.evidence.dropzoneSubtitle}
          </p>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-pill bg-white text-chakra-blue text-xs font-bold border border-chakra-blue/30 shadow-2xs">
          <Plus className="size-3.5" aria-hidden="true" />
          <span>{t.evidence.browseFilesBtn}</span>
        </span>
      </div>

      {/* Quick Add Demo Evidence Chips */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-text font-semibold">
          <Sparkles className="size-3.5 text-saffron" aria-hidden="true" />
          <span>{t.evidence.quickAddSampleTitle}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {relevantSamples.slice(0, 4).map((sample) => (
            <button
              key={sample.id}
              type="button"
              onClick={() => handleAddSample(sample.name, sample.type, sample.mockSize)}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-pill bg-blue-50/80 hover:bg-blue-100 text-chakra-blue border border-chakra-blue/20 hover:border-chakra-blue/40 transition-all cursor-pointer shadow-2xs text-left"
            >
              <Plus className="size-3" aria-hidden="true" />
              <span>{sample.label}</span>
              <span className="text-[10px] text-muted-text/80">({sample.mockSize})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Attached Evidence List */}
      <div className="space-y-2 pt-2 border-t border-border-soft">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-deep-navy uppercase tracking-wider">
            {t.evidence.attachedFilesTitle} ({draft.evidence.length})
          </span>
          <span className="text-[11px] text-muted-text">
            {t.evidence.maxSizeNotice}
          </span>
        </div>

        {draft.evidence.length === 0 ? (
          <p className="text-xs text-muted-text italic bg-mist p-3 rounded-lg border border-border-soft text-center">
            {t.evidence.noEvidenceAttached}
          </p>
        ) : (
          <ul className="space-y-2" aria-label={t.evidence.attachedFilesTitle}>
            {draft.evidence.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 bg-mist/60 hover:bg-mist p-2.5 sm:p-3 rounded-xl border border-border-soft transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-lg bg-white border border-border-soft flex items-center justify-center shrink-0 shadow-2xs">
                    {getFileIcon(item.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-deep-navy truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-text">
                      <span>{item.mockSize}</span>
                      <span>•</span>
                      <span className="text-india-green flex items-center gap-0.5">
                        <CheckCircle2 className="size-3" />
                        <span>Ready</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id, item.name)}
                  aria-label={t.evidence.removeFileAria.replace('{fileName}', item.name)}
                  title={t.evidence.removeFileAria.replace('{fileName}', item.name)}
                  className="p-1.5 rounded-lg text-muted-text hover:text-alert-red hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Demo In-Browser Notice */}
      <div className="flex items-center gap-1.5 text-[11px] text-muted-text/90 pt-1">
        <ShieldCheck className="size-3.5 text-chakra-blue shrink-0" aria-hidden="true" />
        <span>{t.home.trustCard3Desc}</span>
      </div>
    </div>
  );
};
