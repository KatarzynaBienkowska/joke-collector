import amqplib from 'amqplib';
import { Joke } from './types';

export async function listenForJokes(onJoke: (msg: Joke) => void) {
  try {
    const conn = await amqplib.connect('amqp://localhost');
    const ch = await conn.createChannel();

    const queue = 'joke-feed';
    await ch.assertQueue(queue, { durable: true });
    await ch.prefetch(1);

    console.log('Gateway subscribed to RabbitMQ queue:', queue);

    ch.consume(queue, (msg) => {
      if (!msg) return;

      try {
        const joke = JSON.parse(msg.content.toString()) as Joke;
        onJoke(joke);
        ch.ack(msg);
      } catch (err) {
        console.error('Invalid message format:', err);
        ch.nack(msg, false, false); // Reject message without requeueing
      }
    });
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
  }
}
