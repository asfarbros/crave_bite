const { Redis } = require('@upstash/redis');

// Caching is an optional performance layer, never a hard dependency — the app
// must behave identically whether Redis is configured, unreachable, or absent.
// Callers should always wrap redis calls in try/catch and fall back to the
// database on any failure.
//
// Uses Upstash's REST client rather than a raw TCP client: Upstash's serverless
// Redis is designed around stateless HTTPS requests per command, which avoids
// the persistent-connection instability (idle disconnects/resets) seen with
// TCP clients like ioredis against this kind of endpoint.

let client = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  console.log('✅ Redis (Upstash REST) client configured');
} else {
  console.log('ℹ️  UPSTASH_REDIS_REST_URL/TOKEN not set — running without cache (menu reads will always hit MongoDB)');
}

module.exports = client;
