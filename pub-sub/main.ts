import client from "../server";
import express from 'express';

const app = express();
app.use(express.json());

app.post('/pub', async (req, res) => {

  const { pubMessage } = req.body;

  await client.connect()
  .then(() => {console.log(`Redis connected for pub-sub`)})
  .catch((e) => {console.log(`Error connecting redis - ${e}`)});

  await client.publish('chat-room', pubMessage)
  .then(() => {res.send('message sent')})
  .catch((e) => {res.end(`Error while senting a message - ${e}`)});
});

app.get('/sub', async (req, res) => {
  const subscriber = client.duplicate();
  // seprate connection

  await subscriber.connect();

  await subscriber.subscribe('chat-room', (message) => {
    res.send(`Message from pub: ${message}`);
  });
})

app.listen(5000, () => {console.log(`Server at 5000`)});