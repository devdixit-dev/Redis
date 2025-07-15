console.log("Hello via Bun!");

import client from "./client";

const init = async () => {
  client.on('error', (err) => console.log(`Redis client error - ${err}`));

  await client.connect();

  await client.set('key', 'value');
  const value = await client.get('key');

  console.log(value);

  await client.set('name', 'admin');
  const name = await client.get('name');
  console.log(name);

  await client.set('msg:1', 'hey');
  const message = await client.get('msg:1');
  console.log(message);

  await client.set('msg:1', 'hello', { NX: true });
  const newMsg = await client.get('msg:1');
  console.log(newMsg);

  const multipleValuesGet = await client.mGet(['name', 'msg:1']);
  console.log(multipleValuesGet); // ["admin", "hey"]

  const multipleValuesSet = await client.mSet(
    {
      'user:3': 'devdixit',
      'msg:3': 'hello admin'
    }
  );
  console.log(await client.mGet(['user:3', 'msg:3'])); 
  // ["dev dixit", "hello admin"]

  const incrCount = await client.incr('count') 
  // it increase count by +1
  console.log(incrCount) // 6

  await client.expire('count', 10);
  console.log(await client.get('count'))
}

init();