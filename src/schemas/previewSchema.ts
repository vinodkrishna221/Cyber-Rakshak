import { z } from 'zod';

const CATEGORY_KEYS = [
  'financial_fraud',
  'women_child_related_crime',
  'other_cybercrime',
] as const;

export const previewEditSchema = z.object({
  category: z.enum(CATEGORY_KEYS),
  subCategoryKey: z.string().optional(),
  complainant: z.object({
    name: z.string().optional(),
    mobile: z
      .string()
      .optional()
      .refine((val) => {
        if (!val || val.trim().length === 0) return true;
        const clean = val.replace(/[\s\-().+]/g, '');
        const normalized = clean.startsWith('91') && clean.length === 12 ? clean.slice(2) : clean;
        return /^[6-9]\d{9}$/.test(normalized);
      }, 'mobileInvalid'),
    state: z
      .string()
      .min(1, 'stateRequired')
      .refine((val) => val.trim().length > 0, 'stateRequired'),
  }),
  incident: z.object({
    summary: z
      .string()
      .min(1, 'summaryRequired')
      .refine((val) => val.trim().length >= 5, 'summaryMinLength'),
    date: z.string().optional(),
    time: z.string().optional(),
    platform: z.string().optional(),
    location: z.string().optional(),
    description: z.string().optional(),
  }),
  financial: z
    .object({
      amountLost: z
        .union([z.number(), z.string()])
        .optional()
        .refine((val) => {
          if (val === undefined || val === null || val === '') return true;
          const num = typeof val === 'number' ? val : Number(val.toString().replace(/,/g, ''));
          return !isNaN(num) && num >= 0;
        }, 'amountInvalid'),
      paymentMethod: z.string().optional(),
      transactionId: z.string().optional(),
      bankOrWallet: z.string().optional(),
    })
    .optional(),
  suspect: z
    .object({
      phone: z.string().optional(),
      upiId: z.string().optional(),
      socialHandle: z.string().optional(),
      url: z
        .string()
        .optional()
        .refine((val) => {
          if (!val || val.trim().length === 0) return true;
          try {
            const withProto =
              val.startsWith('http://') || val.startsWith('https://')
                ? val
                : `https://${val}`;
            new URL(withProto);
            return true;
          } catch {
            return false;
          }
        }, 'urlInvalid'),
      email: z
        .string()
        .optional()
        .refine((val) => {
          if (!val || val.trim().length === 0) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
        }, 'emailInvalid'),
    })
    .optional(),
  declarationConfirmed: z.boolean().optional(),
});

export type PreviewEditFormData = z.infer<typeof previewEditSchema>;
