import { createClient } from 'redis';

const redis = createClient({ url: 'redis://localhost:6379' });

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.connect().then().catch(err =>
    console.error('Failed to connect to Redis:', err)
);

export default redis;