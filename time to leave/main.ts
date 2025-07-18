import client from "../server";

import express from 'express';

const redisTimeToLeave = async() => {

  const app = express();

  await client.connect()
  .then(() => {console.log(`Redis connected.`)})
  .catch((e) => {console.log(`Error connecting redis - ${e}`)});

  app.get('/users', async (req, res) => {
    const cachedData = await client.get('users');

    if(cachedData) return res.status(200).json({
      from: 'redis',
      data: JSON.parse(cachedData)
    });

    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const serverData = await response.json();

    await client.set('users', JSON.stringify(serverData), { EX: 60 });
    // add ttl when set the data

    await client.expire('users', 30);
    // it modifies above ttl to 60 to 30 seconds

    const ttlSec = await client.ttl('users');
    console.log(ttlSec); // 30
    // check ttl seconds for the key users

    return res.status(200).json({
      from: 'server',
      data: serverData
    });

  });

  app.post('/clear', async (req, res) => {
    await client.persist('users');
    // remove ttl for key users and make it avail anytime
    return res.json({
      message: 'key ttl removed'
    });
  });

  app.listen(4000, () => {console.log(`Server at 4000`)});
}
redisTimeToLeave();