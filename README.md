# Redis

1. Install Redis w Docker
- docker run -d --name redis-stack -p 6379:6379 -p 8001:8001  redis/redis-stack:latest

2. Use Ports
- 6379: default port for redis
- 8001: GUI interface

3. Add Redis in packages
- bun install redis

4. Create client
- with CreateClient from redis

5. Connect client
- with await client.connect()

# String

1. SET
- await client.set('key', 'value')
- set key value pair in redis
- (entity):(id) value - in example user:1 admin

2. nx
- await client.set('msg:1', 'hello', { NX: true })
  // Only set this key if it doesn't already exist
- await client.set('msg:1', 'hello', { NX: false })
  // if key exist, then change the value of the key

3. mget (multiple get)
- await client.mGet(['name', 'msg:1']);
  pass multiple keys in one array to get the value
  if key doesn't include with value then, it shows null

4. mset (multiple set)
- await client.set({'user:3':'john doe', 'msg:3':'hello, john doe'})
  set multiple key value with objects

5. incr
- await client.incr('count')
  it increases key value by +1

6. expire
- await client.expire('key', 10)
  expire this key after 10s
  we can expire any key with the key name and second

# Lists
- we can use with stacks and queues both
- one type of array

1. lpush
- await client.lPush('messages', 'hey')
- it push hey into messages list from the left side
- await client.lPush('messages', 'hello')
- now the list look like this, ['hello', 'hey']

2. rpush
- await client.rPush('messages', 'right 2');
- await client.rPush('messages', 'right 1');
- it push both values in the messages list from right side
now the list look like this, ['hello', 'hey', 'right 2', 'right 1']

3. lpop
- await client.lPop('messages')
- it remove or return the values from left side

4. rpop
- await client.rPop('messages')
- it remove or return the values from right side

5. Blocking commands
  1. blpop
  - await client.blPop('messages', 10);
    - pop messages list from the left side
    - scenario 1: if message exist in 'messages' list then, return the message quickly
    - scenario 2: else wait for the 10 seconds. if message arrived then same as above, else return null

# Stack and Queues
- Insert from the left side and Remove from the right side ~ Queue
- Insert and Remove from the left side ~ Stack

# Other data types
- we have sets, hash maps, ordered sets, streams, geospatial data
- and also pub-sub

# Test
- without redis - 1.51s
- with redis (before cache) - 1.07s
- with redis caching - 40ms/9ms/8ms

# How this works

Client --> Server --> Database (1st time)
- client do the request for the data to the server and server getting the data from database.

If we don't use redis then, the server follow the pattern everytime

Client --> Server --> Database --> Redis(as a cache value)

Client --> Server --> Redis(if values found)-(if not found, then call out the database) --> Database

- Time efficiency increased by 70%/80%
- Note: we have to do expire key after some amount of time (30s/60s)

# Advance Topics
1. Caching strategies
2. TTL (Time To Live)
3. Pub/Sub (Publish/Subscribe)

## 1. Caching strategies
- Reduce database load
- Improve response time
- Handle high traffic

#### Read-through
``` js
import express from 'express';
import client from "../server";

const app = express();

await client.connect()
  .then(() => { console.log(`Redis connected`) })
  .catch((e) => { console.log(`Error in redis connection - ${e}`) });

app.get('/todos', async (req, res) => {

  const cachedData = await client.get('todos');

  if (cachedData) return res.json({
    from: 'redis',
    data: JSON.parse(cachedData)
  });
  const response = await fetch('https://jsonplaceholder.typicode.com/todos');
  const data = await response.json();

  await client.set('todos', JSON.stringify(data), { EX: 60 });

  return res.json({
    from: 'server',
    data: data
  })
});

app.listen(3000, () => { console.log(`Server at 3000`) });
```
- Server - 499ms
- Redis - 20ms

#### Write-through cache
- Write to cache and DB at a same time

```js
await redisClient.set('user:123', JSON.stringify(userData));
// set data to redis first

await db.updateUser(userData);
// callout the database and store immidiatly after redis
```

#### Write-back cache
- Write to cache first, sync with DB later (with a delay)
- Use when need to do background job

#### Cache aside (Lazy loading)
- Checks cache first. if miss, loads from database and caches it.

## 2. TTL(Time To Leave)
- TTL controls how long a key stays in redis. After TTL expires, the key is automatically deleted

#### Set a key with TTL
``` js
await client.set('users', serverData, { EX: 60 });
// expires in 60 seconds
```

#### Add TTL to existing key
``` js
await client.expire('users', 30);
// it modifies ttl value from 60 to 30
```

#### Check TTL of a key
``` js
await client.ttl('users');
// check ttl for existing key
// add in var and log this
```

#### Persistent key (remove TTL)
``` js
await client.persist('users');
// remove ttl from users key and make sure this key has no limit
```

- Use TTL for
1. Session management
2. Rate limiting
3. Temporary tokens (OTP, Password reset)

## 3. Redis Pub/Sub (Publisher/Subscribe)
- Real-time notifications
- Chat apps
- Live dashboards
- Background processing triggers

#### Concept
- 📦 Publisher sends a message to a channel
- 📬 Subscribers receive that message instantly

#### Publisher
``` js
await client.publish('chat-room', 'Hello, world!');
```

#### Subscriber
``` js
const subscriber = client.duplicate();
// separate connection

await subscriber.connect();

await subscriber.subscribe('chat-room', (message) => {
  // if chat-room received a message, then log this
  console.log(`Received: ${message}`);
});
```

- Note: Pub/Sub is fire-and-forget — no history, no message persistence. Use Redis Streams or Kafka for durability.