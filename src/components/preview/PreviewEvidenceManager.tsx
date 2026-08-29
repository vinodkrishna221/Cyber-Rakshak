import React, { useRef } from 'react';
import {
  Paperclip,
  Trash2,
  Plus,
  FileImage,
  FileText,
  File,
  Sparkles,
} from 'lucide-react';
import { EvidenceItem, ComplaintCategory } from '../../types';
import { useTranslation } from '../../i18n';
import { useDraftStore } from '../../store';

interface PreviewEvidenceManagerProps {
  evidence: EvidenceItem[];
  category?: ComplaintCategory;
  isEditable?: boolean;
}

export const PreviewEvidenceManager: React.FC<PreviewEvidenceManagerProps> = ({
  evidence,
  category = 'financial_fraud',
  isEditable = true,
}) => {
  const { t, language } = useTranslation();
  const { addEvidenceItem, removeEvidenceItem } = useDraftStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (
      lower.endsWith('.png') ||
      lower.endsWith('.jpg') ||
      lower.endsWith('.jpeg') ||
      lower.endsWith('.webp')
    ) {
      return <FileImage className="size-4 text-chakra-blue shrink-0" aria-hidden="true" />;
    }
    if (lower.endsWith('.pdf') || lower.endsWith('.docx') || lower.endsWith('.doc')) {
      return <FileText className="size-4 text-alert-red shrink-0" aria-hidden="true" />;
    }
    return <File className="size-4 text-deep-navy shrink-0" aria-hidden="true" />;
  };

  const handleNativeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const formattedSize =
        file.size < 1024 * 1024
          ? `${(file.size / 1024).toFixed(1)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

      addEvidenceItem({
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        mockSize: formattedSize,
        uploadedAt: new Date().toISOString(),
      });
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSample = (sampleName: string, mockSize = '184 KB', type = 'image/png') => {
    addEvidenceItem({
      id: `ev-sample-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: sampleName,
      type,
      mockSize,
      uploadedAt: new Date().toISOString(),
    });
  };

  const isHindi = language === 'hi';

  const samples =
    category === 'financial_fraud'
      ? [
          {
            name: isHindi ? 'यूपीआई_लेनदेन_रसीद.png' : 'UPI_Transaction_Receipt.png',
            size: '240 KB',
            type: 'image/png',
          },
          {
            name: isHindi ? 'बैंक_डेबिट_एसएमएस.png' : 'Bank_Debit_SMS_Alert.png',
            size: '115 KB',
            type: 'image/png',
          },
        ]
      : category === 'women_child_related_crime'
        ? [
            {
              name: isHindi ? 'धमकी_चैट_स्क्रीनशॉट.png' : 'Threat_Chat_Screenshot.png',
              size: '310 KB',
              type: 'image/png',
            },
            {
              name: isHindi ? 'संदिग्ध_प्रोफाइल_रिकॉर्ड.pdf' : 'Suspect_Profile_Record.pdf',
              size: '420 KB',
              type: 'application/pdf',
            },
          ]
        : [
            {
              name: isHindi ? 'फ़िशिंग_ईमेल_हेडर.png' : 'Phishing_Email_Headers.png',
              size: '180 KB',
              type: 'image/png',
            },
            {
              name: isHindi ? 'फर्जी_वेबसाइट_लिंक.pdf' : 'Fake_Portal_Screenshot.png',
              size: '290 KB',
              type: 'image/png',
            },
          ];

  return (
    <div className="space-y-3" data-testid="preview-evidence-manager">
      {/* Evidence Items List */}
      {evidence.length === 0 ? (
        <div className="rounded-lg bg-mist/60 border border-border-soft p-3.5 text-xs text-muted-text text-center">
          <span>{t.preview.noEvidenceAttached}</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {evidence.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-border-soft text-xs shadow-2xs hover:border-chakra-blue/30 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {getFileIcon(item.name)}
                <div className="min-w-0">
                  <p className="font-semibold text-deep-navy truncate max-w-[170px] sm:max-w-[200px]" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-text">{item.mockSize}</p>
                </div>
              </div>

              {isEditable && (
                <button
                  type="button"
                  onClick={() => removeEvidenceItem(item.id)}
                  aria-label={t.preview.removeEvidenceAria.replace('{fileName}', item.name)}
                  title={t.preview.removeEvidenceAria.replace('{fileName}', item.name)}
                  className="text-muted-text hover:text-alert-red p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Controls */}
      {isEditable && (
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp,.pdf,.doc,.docx,.txt"
            onChange={handleNativeFileUpload}
            className="hidden"
            id="preview-evidence-upload-input"
            aria-label="Upload evidence files"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-chakra-blue text-chakra-blue bg-white hover:bg-blue-50/50 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            <span>{t.preview.addEvidenceBtn}</span>
          </button>

          {/* Quick sample chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-muted-text font-medium hidden sm:inline flex items-center gap-1">
              <Sparkles className="size-3 text-saffron" />
              <span>Sample:</span>
            </span>
            {samples.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handleAddSample(sample.name, sample.size, sample.type)}
                className="px-2.5 py-1 rounded-pill bg-mist hover:bg-blue-50 border border-border-soft hover:border-chakra-blue/30 text-[11px] font-medium text-deep-navy transition-colors cursor-pointer truncate max-w-[200px]"
                title={`Add ${sample.name}`}
              >
                + {sample.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
