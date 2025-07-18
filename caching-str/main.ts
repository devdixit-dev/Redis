import express from 'express';
import client from "../server";

const BasicCaching = async () => {
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
}

BasicCaching();