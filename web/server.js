import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from 'redis';

// Port that Express will listen on.
const SERVER_PORT = process.env.SERVER_PORT ?? 5000;

// Specify Redis connection parameters and create a client instance.
const client = createClient({
  url: process.env.REDIS_URL ?? 'redis://default:@localhost:6379/'
});

// Duplicate the client instance to use for a subscriber.
const subscriberClient = client.duplicate();

// Redis key name that we will store our counter in.
const COUNTER_KEY_NAME = 'mycounter';

// Redis Pub/Sub channel to subscribe to.
const REDIS_PUB_SUB_CHANNEL_NAME = `__keyspace@0__:${COUNTER_KEY_NAME}`;

// Track subscribers to the server sent events.
const eventSubscribers = {};

// Initialize Express.
const app = express();
app.set('views', new URL('./views', import.meta.url).pathname);
app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/incr', async (req, res) => {
  // Atomically add one to the counter in Redis.
  // If they key doesn't exist, Redis will create it with
  // an initial value of 1.
  await client.incrBy(COUNTER_KEY_NAME, 1);

  return res.status(200).send('OK');
});

app.get('/reset', async (req, res) => {
  // Reset by just deleting the key from Redis.
  await client.del(COUNTER_KEY_NAME);
  return res.status(200).send('OK');
});

app.get('/count', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write('retry: 10000\n\n');

  // Add this connection to the map of ones that get updated
  // when there is a new Pub/Sub message.
  const sseSubscriberKey = Date.now();
  eventSubscribers[sseSubscriberKey] = res;

  res.on('close', function() {
    // Remove this connection from the map of ones that get 
    // updated when there is a new Pub/Sub message.
    res.end();
    delete(eventSubscribers[sseSubscriberKey]);
  });
});

// Serve the home page, initialize the counter if needed.
app.get('/', async (req, res) => {
  // Get the current counter value.
  let count = await client.get(COUNTER_KEY_NAME);
  if (count === null) {
    count = 0;
  }
  // Render the home page with the current counter value.
  return res.render('homepage', { count });
});

// Connect to Redis with both connections.
await client.connect();
await subscriberClient.connect();

// Start the Express server.
app.listen(SERVER_PORT, () => {
  console.log(`Server listening on port ${SERVER_PORT}.`);
});

// Subscribe to the Pub/Sub channel in Redis.
await subscriberClient.subscribe(REDIS_PUB_SUB_CHANNEL_NAME, async (message) => {
  // message will be 'incrby' or 'del'.
  console.log(`Received Pub/Sub message "${message}".`);

  let newCounterValue = 0;

  switch(message) {    
    case 'del':
      console.log('Counter should now be showing 0.');
      break;
    // This covers bad message type, plus expected 'incrby'.
    default:
      newCounterValue = parseInt(await client.get(COUNTER_KEY_NAME));
      console.log(`Counter should now be showing ${newCounterValue}.`);
  }

  // Push out a server sent event to each event subscriber...
  for (const sseSubscriber in eventSubscribers) {
    eventSubscribers[sseSubscriber].write(`event: count\ndata:${newCounterValue}\n\n\n`);
  }
});
