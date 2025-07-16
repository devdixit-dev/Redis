import express from 'express';
import axios from 'axios';

import client from './client';

const app = express();

app.get('/', async(req, res) => {
  // wait for the client to connect - MISTAKE 1
  await client.connect()
  .then(() => { console.log(`Redis client connected`) })
  .catch((e) => { console.log(`Error connecting redis client - ${e}`) });

  // error handling for redis client
  client.on('error', (err) => console.log(`Redis Client Error - ${err}`));

  // check this cache values with .get
  const cacheValue = await client.get('todos');
  // if this value found then return the data
  // parse the data from string to json
  if(cacheValue) return res.json(JSON.parse(cacheValue))

  const {data} = await axios.get('https://jsonplaceholder.typicode.com/todos');
  // if data not found in redis, then store first in redis using .set
  // do JSON stringify data for the string operations
  await client.set('todos', JSON.stringify(data));
  // expire this todos key after 60sec/1min
  await client.expire('todos', 60);
  return res.json(data);
});

app.listen(9000, () => {
  console.log(`Server: 9000`)
});

// without redis - 1.51s
// with redis (before cache) - 1.07s
// with redis caching - 40ms/9ms/8ms