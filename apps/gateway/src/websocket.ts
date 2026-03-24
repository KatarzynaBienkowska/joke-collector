import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { listenForJokes } from './rabbit';

export function attachWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const clients = new Set<WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    clients.add(ws);

    ws.send(JSON.stringify({ type: 'hello', message: 'connected' }));

    ws.on('close', () => clients.delete(ws));
  });

  listenForJokes((joke) => {
    for (const ws of clients) {
      ws.send(JSON.stringify({ type: 'joke', payload: joke }));
    }
  });
}
