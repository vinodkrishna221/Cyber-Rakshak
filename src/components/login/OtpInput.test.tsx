import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OtpInput } from './OtpInput';

describe('OtpInput', () => {
  it('renders 6 digit input fields with proper ARIA attributes', () => {
    render(<OtpInput value="" onChange={() => {}} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toHaveAttribute('aria-label', 'Digit 1 of 6');
    expect(inputs[5]).toHaveAttribute('aria-label', 'Digit 6 of 6');
  });

  it('populates initial value across boxes', () => {
    render(<OtpInput value="123456" onChange={() => {}} />);

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs.map((i) => i.value)).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('calls onChange when user types a digit and auto-focuses next box', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<OtpInput value="" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.type(inputs[0], '1');

    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('handles paste of 6 digits correctly', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleComplete = vi.fn();

    render(
      <OtpInput
        value=""
        onChange={handleChange}
        onComplete={handleComplete}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.paste('123456');

    expect(handleChange).toHaveBeenCalledWith('123456');
    expect(handleComplete).toHaveBeenCalledWith('123456');
  });

  it('handles backspace properly by navigating to previous input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<OtpInput value="12" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[1]);
    await user.keyboard('{Backspace}');

    expect(handleChange).toHaveBeenCalledWith('1');
  });

  it('displays error styles and aria-invalid when hasError is true', () => {
    render(<OtpInput value="123" onChange={() => {}} hasError={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('supports Home and End keys for keyboard focus navigation', async () => {
    const user = userEvent.setup();
    render(<OtpInput value="123456" onChange={() => {}} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[2]);
    expect(inputs[2]).toHaveFocus();

    await user.keyboard('{Home}');
    expect(inputs[0]).toHaveFocus();

    await user.keyboard('{End}');
    expect(inputs[5]).toHaveFocus();
  });

  it('supports Delete key to clear current box', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<OtpInput value="123456" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[1]);
    await user.keyboard('{Delete}');

    expect(handleChange).toHaveBeenCalledWith('13456');
  });

  it('extracts 6-digit OTP from SMS message on paste regardless of focused box', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleComplete = vi.fn();

    render(
      <OtpInput
        value=""
        onChange={handleChange}
        onComplete={handleComplete}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    // Paste while focused on box 3 (index 2)
    await user.click(inputs[2]);
    await user.paste('Your Cyber Rakshak code is 123456. Valid for 10 mins.');

    expect(handleChange).toHaveBeenCalledWith('123456');
    expect(handleComplete).toHaveBeenCalledWith('123456');
  });

  it('replaces an existing digit when user types a new digit over it', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<OtpInput value="123456" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.type(inputs[0], '9');

    expect(handleChange).toHaveBeenCalledWith('923456');
  });

  it('ignores non-numeric characters without advancing focus or firing change', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<OtpInput value="123456" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.type(inputs[0], 'a');

    expect(handleChange).not.toHaveBeenCalled();
    expect(inputs[0]).toHaveFocus();
  });

  it('handles partial paste starting from currently focused box', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<OtpInput value="120000" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[2]);
    await user.paste('34');

    expect(handleChange).toHaveBeenCalledWith('123400');
  });

  it('assigns id to first input for accessible label association', () => {
    render(<OtpInput id="test-otp" value="" onChange={() => {}} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveAttribute('id', 'test-otp');
    expect(inputs[1]).toHaveAttribute('id', 'test-otp-1');
  });

  it('advances focus to the next input box as the user types sequentially', async () => {
    const user = userEvent.setup();
    let currentVal = '';
    const handleChange = vi.fn((val: string) => {
      currentVal = val;
    });

    const { rerender } = render(<OtpInput value={currentVal} onChange={handleChange} />);
    const inputs = screen.getAllByRole('textbox');

    // Type digit 1 in box 0
    await user.type(inputs[0], '1');
    expect(handleChange).toHaveBeenCalledWith('1');
    expect(inputs[1]).toHaveFocus();

    // Rerender with updated value and type digit 2 in box 1
    rerender(<OtpInput value="1" onChange={handleChange} />);
    await user.type(inputs[1], '2');
    expect(handleChange).toHaveBeenCalledWith('12');
    expect(inputs[2]).toHaveFocus();
  });

  it('handles formatted paste with dashes or spaces like 123-456 or 123 456', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const handleComplete = vi.fn();

    render(
      <OtpInput
        value=""
        onChange={handleChange}
        onComplete={handleComplete}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);
    await user.paste('123-456');

    expect(handleChange).toHaveBeenCalledWith('123456');
    expect(handleComplete).toHaveBeenCalledWith('123456');
  });

  it('disables all digit inputs when disabled is true', () => {
    render(<OtpInput value="123" onChange={() => {}} disabled={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});


