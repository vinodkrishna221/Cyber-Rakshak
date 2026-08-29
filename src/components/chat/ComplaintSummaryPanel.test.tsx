import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComplaintSummaryPanel } from './ComplaintSummaryPanel';
import { useDraftStore } from '../../store';
import { useLanguageStore } from '../../i18n';
import { ComplaintDraft, ClassificationResult } from '../../types';

describe('ComplaintSummaryPanel Component', () => {
  beforeEach(() => {
    localStorage.clear();
    useDraftStore.getState().resetDraft();
    useLanguageStore.setState({ language: 'en' });
  });

  const emptyDraft: ComplaintDraft = {
    language: 'en',
    complainant: { name: '', mobile: '' },
    incident: {},
    evidence: [],
  };

  const sampleClassification: ClassificationResult = {
    category: 'financial_fraud',
    categoryLabel: 'Financial Fraud',
    categoryLabelHi: 'वित्तीय धोखाधड़ी',
    subCategory: 'UPI / Banking Fraud',
    subCategoryKey: 'upi_banking_fraud',
    confidence: 0.94,
    isEmergency: true,
    reasoning: 'Mentioned unauthorized UPI debit.',
    reasoningHi: 'अनधिकृत यूपीआई निकासी का उल्लेख किया गया।',
    matchedKeywords: ['upi', 'debit', 'fraud'],
    isSuggestion: true,
    disclaimer: 'AI suggestion based on your description',
    disclaimerHi: 'आपके विवरण पर आधारित एआई सुझाव',
  };

  it('renders initial unclassified draft with disabled preview button and helpful tooltip', () => {
    render(
      <MemoryRouter>
        <ComplaintSummaryPanel draft={emptyDraft} classification={null} />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('complaint-summary-panel')).toBeInTheDocument();
    expect(screen.getByText('Live Complaint Draft')).toBeInTheDocument();
    expect(screen.getByText('Pending classification')).toBeInTheDocument();
    expect(screen.getByText('Draft in progress')).toBeInTheDocument();

    const previewBtn = screen.getByRole('button', { name: /Preview Complaint/i });
    expect(previewBtn).toBeDisabled();
    expect(
      screen.getByText(/Please provide incident summary and confirm category to preview report/i),
    ).toBeInTheDocument();
  });

  it('updates draft completeness and enables preview button when required details are present', () => {
    const completedDraft: ComplaintDraft = {
      language: 'en',
      category: 'financial_fraud',
      subCategory: 'UPI / Banking Fraud',
      complainant: { name: 'John Doe', mobile: '9876543210' },
      incident: {
        summary: 'Debited 25000 rs via UPI fraud',
        date: '28 Aug 2026',
        platform: 'Google Pay',
      },
      financial: {
        amountLost: 25000,
        paymentMethod: 'UPI',
      },
      evidence: [],
    };

    render(
      <MemoryRouter>
        <ComplaintSummaryPanel draft={completedDraft} classification={sampleClassification} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Ready to Preview')).toBeInTheDocument();
    expect(screen.getByText('₹25,000')).toBeInTheDocument();
    expect(screen.getByText('28 Aug 2026')).toBeInTheDocument();

    const previewBtn = screen.getByRole('button', { name: /Preview Complaint/i });
    expect(previewBtn).not.toBeDisabled();
  });

  it('renders attached evidence items and removes an item when remove button is clicked', async () => {
    const user = userEvent.setup();
    useDraftStore.getState().addEvidenceItem({
      id: 'ev-test-1',
      name: 'upi-debit-screenshot.png',
      type: 'image/png',
      mockSize: '240 KB',
    });

    const draftWithEvidence: ComplaintDraft = {
      ...emptyDraft,
      evidence: useDraftStore.getState().draft.evidence,
    };

    render(
      <MemoryRouter>
        <ComplaintSummaryPanel draft={draftWithEvidence} classification={null} />
      </MemoryRouter>,
    );

    expect(screen.getByText('upi-debit-screenshot.png')).toBeInTheDocument();
    expect(screen.getByText('(240 KB)')).toBeInTheDocument();

    const removeBtn = screen.getByRole('button', { name: /Remove file upi-debit-screenshot\.png/i });
    await user.click(removeBtn);

    expect(useDraftStore.getState().draft.evidence.length).toBe(0);
  });

  it('calls onOpenEvidence when clicking + Add Evidence button', async () => {
    const user = userEvent.setup();
    const handleOpenEvidence = vi.fn();

    render(
      <MemoryRouter>
        <ComplaintSummaryPanel
          draft={emptyDraft}
          classification={null}
          onOpenEvidence={handleOpenEvidence}
        />
      </MemoryRouter>,
    );

    const addBtn = screen.getByRole('button', { name: /Add Evidence/i });
    await user.click(addBtn);

    expect(handleOpenEvidence).toHaveBeenCalledTimes(1);
  });

  it('handles mobile drawer expansion toggle', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <ComplaintSummaryPanel
          draft={emptyDraft}
          classification={null}
          isMobileDrawer={true}
        />
      </MemoryRouter>,
    );

    const toggleBtn = screen.getByRole('button', { name: /View Complaint Summary/i });
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggleBtn);
    expect(toggleBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Hide Summary/i)).toBeInTheDocument();
  });

  it('renders completely in Hindi when language is switched to hi', () => {
    useLanguageStore.setState({ language: 'hi' });

    render(
      <MemoryRouter>
        <ComplaintSummaryPanel draft={emptyDraft} classification={sampleClassification} />
      </MemoryRouter>,
    );

    expect(screen.getByText('शिकायत मसौदा स्थिति')).toBeInTheDocument();
    expect(screen.getByText('वित्तीय धोखाधड़ी')).toBeInTheDocument();
    expect(screen.getByText('मसौदा प्रगति पर')).toBeInTheDocument();
  });
});
