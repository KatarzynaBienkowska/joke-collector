import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 1,
        category: 'Programming',
        joke: 'Test joke',
        error: false,
        flags: {
          explicit: false,
          nsfw: false,
          political: false,
          racist: false,
          religious: false,
          sexist: false,
        },
        lang: 'en',
        safe: true,
        type: 'single',
      }),
    });
  });

  it('shows noRowsLabel when table is empty', () => {
    render(<App />);
    expect(screen.getByText(/No jokes fetched yet/i)).toBeInTheDocument();
  });

  it('adds a joke after clicking fetch', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /fetch joke/i }));
    await waitFor(() =>
      expect(screen.getByText('Test joke')).toBeInTheDocument(),
    );
  });

  it('shows error Snackbar when fetch fails', async () => {
    (global.fetch as Mock).mockRejectedValueOnce(new Error('Fail'));
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /fetch joke/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });
});
