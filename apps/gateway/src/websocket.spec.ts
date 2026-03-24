import { WebSocket } from 'ws';
import { createServer } from './main';
import * as jokeApi from './jokeApi';
import { Joke } from './types';

type WSMessage =
  | { type: 'hello'; message: string }
  | { type: 'joke'; payload: Joke }
  | { type: 'error'; message: string }
  | { type: 'stopped' };

async function waitForMessage<T extends WSMessage>(ws: WebSocket): Promise<T> {
  return new Promise<T>((resolve) =>
    ws.once('message', (raw) => resolve(JSON.parse(String(raw)))),
  );
}

function assertMessageType<T extends WSMessage['type']>(
  msg: WSMessage,
  type: T,
): asserts msg is Extract<WSMessage, { type: T }> {
  expect(msg.type).toBe(type);
}

describe('WebSocket joke feed', () => {
  let server: any;
  let port: number;

  beforeEach(async () => {
    server = createServer();

    await new Promise<void>((resolve) => {
      const s = server.listen(0, () => {
        port = (s.address() as any).port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise((resolve) => server.close(resolve));
    vi.restoreAllMocks();
  });

  const connectClient = () => new WebSocket(`ws://localhost:${port}/ws`);

  it('sends hello message on connect', async () => {
    const ws = connectClient();
    const msg = await waitForMessage(ws);

    assertMessageType(msg, 'hello');
    expect(msg.message).toBe('connected');

    ws.close();
  });

  it('start-feed sends first joke', async () => {
    vi.spyOn(jokeApi, 'fetchJoke').mockResolvedValue({
      id: 1,
      category: 'Test',
      joke: 'Funny',
      flags: {},
      type: 'single',
      safe: true,
      lang: 'en',
    });

    const ws = connectClient();
    await waitForMessage(ws); // hello

    ws.send(JSON.stringify({ type: 'start-feed' }));

    const msg = await waitForMessage(ws);

    assertMessageType(msg, 'joke');
    expect(msg.payload.joke).toBe('Funny');

    ws.close();
  });

  it('sends WS error if API error occurs', async () => {
    vi.spyOn(jokeApi, 'fetchJoke').mockResolvedValue({
      error: true,
      message: 'API Error',
    });

    const ws = connectClient();
    await waitForMessage(ws); // hello

    ws.send(JSON.stringify({ type: 'start-feed' }));

    const msg = await waitForMessage(ws);

    assertMessageType(msg, 'error');
    expect(msg.message).toBe('API Error');

    ws.close();
  });
});
