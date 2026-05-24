const Redis = require('ioredis');

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // don't retry
  });
  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.log('Redis error:', err.message));
}

module.exports = redis;