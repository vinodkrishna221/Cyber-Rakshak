import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceUploader } from './EvidenceUploader';
import { useDraftStore } from '../../store';
import { useLanguageStore } from '../../i18n';

describe('EvidenceUploader Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useDraftStore.getState().resetDraft();
    useLanguageStore.setState({ language: 'en' });
  });

  it('renders title, category guidance, dropzone, sample chips, and empty state', () => {
    render(<EvidenceUploader category="financial_fraud" />);

    expect(screen.getByTestId('evidence-uploader')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Attach Supporting Evidence/i })).toBeInTheDocument();
    expect(screen.getByText(/Recommended: Transaction receipt, UPI \/ UTR screenshot/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Drag and drop files here/i })).toBeInTheDocument();
    expect(screen.getByText(/Sample UPI Debit Screenshot/i)).toBeInTheDocument();
    expect(screen.getByText(/No evidence files attached yet/i)).toBeInTheDocument();
  });

  it('adds sample demo evidence on clicking sample chip', async () => {
    const user = userEvent.setup();
    render(<EvidenceUploader category="financial_fraud" />);

    const sampleChip = screen.getByRole('button', { name: /Sample UPI Debit Screenshot/i });
    await user.click(sampleChip);

    // Store is updated immediately
    const evidenceList = useDraftStore.getState().draft.evidence;
    expect(evidenceList.length).toBe(1);
    expect(evidenceList[0].name).toContain('UPI-Payment-Debit-Receipt.png');
    expect(evidenceList[0].mockSize).toBe('248 KB');

    // UI reflects attached file
    expect(screen.getByText('UPI-Payment-Debit-Receipt.png')).toBeInTheDocument();
    expect(screen.getByText(/Added evidence:/i)).toBeInTheDocument();
  });

  it('removes evidence when clicking remove button', async () => {
    const user = userEvent.setup();
    useDraftStore.getState().addEvidenceItem({
      id: 'ev-test-1',
      name: 'bank-receipt.pdf',
      type: 'application/pdf',
      mockSize: '1.5 MB',
    });

    render(<EvidenceUploader />);

    expect(screen.getByText('bank-receipt.pdf')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove file bank-receipt.pdf/i });
    await user.click(removeBtn);

    expect(useDraftStore.getState().draft.evidence.length).toBe(0);
    expect(screen.queryByText('bank-receipt.pdf')).not.toBeInTheDocument();
    expect(screen.getByText(/Removed evidence:/i)).toBeInTheDocument();
  });

  it('validates and rejects unsupported file extensions', async () => {
    render(<EvidenceUploader />);

    const invalidFile = new File(['binary content'], 'virus.exe', { type: 'application/x-msdownload' });
    const fileInput = screen.getByLabelText(/Drag and drop files here/i).querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/File format "\.exe" is not supported/i)).toBeInTheDocument();
    expect(useDraftStore.getState().draft.evidence.length).toBe(0);
  });

  it('validates and rejects oversized files (>10MB)', async () => {
    render(<EvidenceUploader />);

    // Create mock 11MB file
    const oversizedBlob = new Blob([new ArrayBuffer(11 * 1024 * 1024)], { type: 'image/png' });
    const oversizedFile = new File([oversizedBlob], 'large-screenshot.png', { type: 'image/png' });

    const fileInput = screen.getByLabelText(/Drag and drop files here/i).querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/exceeds the 10MB limit/i)).toBeInTheDocument();
    expect(useDraftStore.getState().draft.evidence.length).toBe(0);
  });

  it('rejects duplicate files with clear feedback', async () => {
    const user = userEvent.setup();
    render(<EvidenceUploader category="financial_fraud" />);

    const sampleChip = screen.getByRole('button', { name: /Sample UPI Debit Screenshot/i });
    await user.click(sampleChip);

    expect(useDraftStore.getState().draft.evidence.length).toBe(1);

    // Click same chip again
    await user.click(sampleChip);

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/is already attached/i)).toBeInTheDocument();
    expect(useDraftStore.getState().draft.evidence.length).toBe(1);
  });

  it('accepts valid image and document files via drag and drop', () => {
    render(<EvidenceUploader />);

    const validFile1 = new File(['content'], 'screenshot.png', { type: 'image/png' });
    const validFile2 = new File(['pdf doc'], 'statement.pdf', { type: 'application/pdf' });

    const dropZone = screen.getByRole('button', { name: /Drag and drop files here/i });
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [validFile1, validFile2],
      },
    });

    expect(useDraftStore.getState().draft.evidence.length).toBe(2);
    expect(screen.getByText('screenshot.png')).toBeInTheDocument();
    expect(screen.getByText('statement.pdf')).toBeInTheDocument();
  });

  it('displays category guidance tailored for Women/Child Related Crime', () => {
    render(<EvidenceUploader category="women_child_related_crime" />);

    expect(
      screen.getByText(/Recommended: Chat history, profile URLs, abusive message screenshots/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sample WhatsApp \/ Insta Chat/i)).toBeInTheDocument();
  });

  it('renders completely in Hindi when language is hi', () => {
    useLanguageStore.setState({ language: 'hi' });
    render(<EvidenceUploader category="financial_fraud" />);

    expect(screen.getByRole('heading', { name: 'सहायक साक्ष्य संलग्न करें' })).toBeInTheDocument();
    expect(screen.getByText(/फ़ाइलें यहाँ खींचें और छोड़ें/i)).toBeInTheDocument();
    expect(screen.getByText(/नमूना यूपीआई डेबिट स्क्रीनशॉट/i)).toBeInTheDocument();
  });
});
