import { useCallback, useEffect, useRef, useState } from 'react';
import { Joke } from './types';

type WSMessage =
  | { type: 'hello'; message: string }
  | { type: 'joke'; payload: Joke }
  | { type: 'error'; message: string }
  | { type: 'stopped' };

export function useJokeFeed(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const onJokeRef = useRef<(j: Joke) => void>(() => {});
  const setOnJoke = (fn: (j: Joke) => void) => (onJokeRef.current = fn);
  const [connected, setConnected] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const connect = useCallback(() => {
    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    )
      return;

    setLastError(null);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      setLastError(null);
    };
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setLastError('WebSocket error');

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data) as WSMessage;
        if (msg.type === 'joke') onJokeRef.current(msg.payload);
        if (msg.type === 'error') setLastError(msg.message);
        if (msg.type === 'stopped') setConnected(false);
      } catch {
        setLastError('Bad message');
      }
    };
  }, [url]);

  const startFeed = useCallback(() => {
    connect();
    const sendStart = () =>
      wsRef.current?.send(JSON.stringify({ type: 'start-feed' }));

    if (wsRef.current?.readyState === WebSocket.OPEN) sendStart();
    else wsRef.current?.addEventListener('open', sendStart, { once: true });
  }, [connect]);

  const stopFeed = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'stop-feed' }));
    }
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return { connected, lastError, setOnJoke, startFeed, stopFeed };
}
