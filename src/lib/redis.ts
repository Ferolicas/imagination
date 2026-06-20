import Redis from "ioredis";

// Redis se usa para contadores anti-abuso, caché de prompts, cola y kill switch.
// Si REDIS_URL no está definido, las features que dependen de él degradan con elegancia.
const globalForRedis = globalThis as unknown as { redis?: Redis | null };

function create(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  const client = new Redis(url, { maxRetriesPerRequest: 2 });
  client.on("error", (e) => console.error("[redis]", e.message));
  return client;
}

export const redis: Redis | null =
  globalForRedis.redis !== undefined ? globalForRedis.redis : create();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
