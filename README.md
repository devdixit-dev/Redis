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