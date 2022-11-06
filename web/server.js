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

// Initialize Express.
const app = express();
app.set('views', new URL('./views', import.meta.url).pathname);
app.set('view engine', 'ejs');
app.use(express.static('static'));

app.get('/incr', async (req, res) => {
  // Atomically add one to the counter in Redis.
  // If they key doesn't exist, Redis will create it with
  // an initial value of 1.
  const count = await client.incrBy(COUNTER_KEY_NAME, 1);
  return res.json({ count });
});

app.get('/reset', async (req, res) => {
  // Reset by just deleting the key from Redis.
  await client.del(COUNTER_KEY_NAME);
  return res.json({ count: 0 });
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
  switch(message) {
    case 'incrby':
      console.log('incrby message received...');
      const newCounterValue = parseInt(await client.get(COUNTER_KEY_NAME));
      console.log(`Counter should now be showing ${newCounterValue}.`);
      break;
    case 'del':
      console.log('del message received...');
      console.log('Counter should now be showing 0.');
      break;
    default:
      console.log(`Recevied unknown pub/sub message "${message}" - ignored!`);
  }
});
