import '@testing-library/jest-dom/vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import App from './App';
// import { useJokeFeed } from './useJokeFeed';

vi.mock('./useJokeFeed', () => ({
  useJokeFeed: vi.fn(() => ({
    lastError: null,
    setOnJoke: vi.fn(),
    startFeed: vi.fn(),
    stopFeed: vi.fn(),
  })),
}));

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

  // TASK 2: Tests for WebSocket joke feed
  // it('starts feed when button clicked', () => {
  //   const startFeed = vi.fn();

  //   (useJokeFeed as Mock).mockReturnValue({
  //     lastError: null,
  //     setOnJoke: vi.fn(),
  //     startFeed,
  //     stopFeed: vi.fn(),
  //   });

  //   render(<App />);
  //   screen.getByText('Joke feed').click();
  //   expect(startFeed).toHaveBeenCalled();
  // });

  // it('adds a joke from feed to DataGrid', async () => {
  //   const mockSetOnJoke = vi.fn();

  //   (useJokeFeed as Mock).mockReturnValue({
  //     lastError: null,
  //     setOnJoke: mockSetOnJoke,
  //     startFeed: vi.fn(),
  //     stopFeed: vi.fn(),
  //   });

  //   render(<App />);

  //   // Emulate feed handler being registered
  //   const feedCallback = mockSetOnJoke.mock.calls[0][0];

  //   feedCallback({
  //     id: 999,
  //     category: 'Test',
  //     joke: 'Hello from WS',
  //     flags: {},
  //     type: 'single',
  //     safe: true,
  //     lang: 'en',
  //   });

  //   expect(await screen.findByText('Hello from WS')).toBeInTheDocument();
  // });

  // it('shows Snackbar error if feed reports error', async () => {
  //   const mockSetOnJoke = vi.fn();

  //   (useJokeFeed as Mock).mockReturnValue({
  //     lastError: 'Feed error',
  //     setOnJoke: mockSetOnJoke,
  //     startFeed: vi.fn(),
  //     stopFeed: vi.fn(),
  //   });

  //   render(<App />);
  //   expect(await screen.findByText('Feed error')).toBeInTheDocument();
  // });

  // it('stops feed when button clicked again', async () => {
  //   const startFeed = vi.fn();
  //   const stopFeed = vi.fn();

  //   (useJokeFeed as Mock).mockReturnValue({
  //     lastError: null,
  //     setOnJoke: vi.fn(),
  //     startFeed,
  //     stopFeed,
  //   });

  //   render(<App />);
  //   screen.getByText('Joke feed').click();

  //   // Wait for UI to switch text
  //   const stopButton = await screen.findByText('Stop joke feed');
  //   stopButton.click();

  //   expect(stopFeed).toHaveBeenCalled();
  // });
});
