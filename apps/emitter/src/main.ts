import amqplib from 'amqplib';
import { fetchJoke } from './jokeApi';

async function startEmitter() {
  const conn = await amqplib.connect('amqp://localhost');
  const ch = await conn.createChannel();

  const queue = 'joke-feed';
  await ch.assertQueue(queue, { durable: true });

  console.log('Emitter running. Publishing jokes every 5s...');

  // Send the first joke immediately
  const firstJoke = await fetchJoke();
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(firstJoke)));

  // Start interval
  setInterval(async () => {
    try {
      const joke = await fetchJoke();
      ch.sendToQueue(queue, Buffer.from(JSON.stringify(joke)));
    } catch (err) {
      console.error('Failed to publish joke:', err);
    }
  }, 5000);
}

startEmitter();
