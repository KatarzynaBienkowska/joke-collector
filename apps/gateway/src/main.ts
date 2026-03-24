import http from 'http';
import express from 'express';
import { attachWebSocket } from './websocket';

export function createServer() {
  const app = express();

  app.get('/health', (_req, res) => res.json({ ok: true }));

  const server = http.createServer(app);
  attachWebSocket(server);
  return server;
}

const server = createServer();
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Gateway listening on http://localhost:${port}`);
  console.log(`WebSocket at ws://localhost:${port}/ws`);
});
