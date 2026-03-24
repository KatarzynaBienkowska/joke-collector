import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fetchJoke } from './jokeApi';

type ClientMsg = { type: 'start-feed' } | { type: 'stop-feed' };
const FEED_INTERVAL_MS = 5000;

async function sendJoke(ws: WebSocket) {
  try {
    const joke = await fetchJoke();

    if (!joke || typeof joke !== 'object') {
      ws.send(
        JSON.stringify({ type: 'error', message: 'Invalid API response' }),
      );
      return false;
    }

    // Send WS error if JokeAPI returned error
    if (joke.error === true) {
      ws.send(JSON.stringify({ type: 'error', message: joke.message }));
      return false;
    }

    ws.send(JSON.stringify({ type: 'joke', payload: joke }));
    return true;
  } catch {
    ws.send(JSON.stringify({ type: 'error', message: 'Joke fetch failed' }));
    return false;
  }
}

export function attachWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    let timer: NodeJS.Timeout | null = null;

    const stop = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    ws.on('message', async (raw) => {
      try {
        const msg = JSON.parse(String(raw)) as ClientMsg;

        if (msg.type === 'start-feed') {
          if (timer) return;

          // Send the first joke
          await sendJoke(ws);

          // Start interval
          timer = setInterval(() => sendJoke(ws), FEED_INTERVAL_MS);
        }

        if (msg.type === 'stop-feed') {
          stop();
          ws.send(JSON.stringify({ type: 'stopped' }));
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Bad message' }));
      }
    });

    ws.on('close', () => stop());

    ws.send(JSON.stringify({ type: 'hello', message: 'connected' }));
  });
}
