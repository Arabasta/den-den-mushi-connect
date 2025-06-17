const { createClient } = require('redis');

const redis = createClient({ url: 'redis://localhost:6379' });

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.connect().then(r =>
    console.log('Redis client connected successfully')
).catch(err =>
    console.error('Failed to connect to Redis:', err)
);

module.exports = redis;
