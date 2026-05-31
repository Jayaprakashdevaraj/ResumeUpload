import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResumeUploadCard from '../ResumeUploadCard';
import { ToastProvider } from '../../../../lib/toast';

function renderWithProviders(ui: React.ReactElement) {
  return render(<ToastProvider>{ui}</ToastProvider>);
}

describe('ResumeUploadCard', () => {
  test('renders validation rules and dropzone', () => {
    renderWithProviders(<ResumeUploadCard />);
    expect(screen.getByText(/Validation rules/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop a PDF here/i)).toBeInTheDocument();
  });

  test('shows error for non-pdf file', async () => {
    renderWithProviders(<ResumeUploadCard />);
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    const user = userEvent.setup();
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });
    await user.upload(input, file);
    await waitFor(() => expect(screen.getByText(/Only PDF files are allowed/i)).toBeInTheDocument());
  });

  test('shows error for large file', async () => {
    renderWithProviders(<ResumeUploadCard />);
    const input = document.querySelector('input[type=file]') as HTMLInputElement;
    // create a fake large file (>5MB)
    const large = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, large);
    expect(await screen.findByText(/Maximum 5MB allowed/i)).toBeInTheDocument();
  });
});
