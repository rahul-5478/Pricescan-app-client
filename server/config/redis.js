const Redis = require("ioredis");

let redis = null;
let errorLogged = false;

const connectRedis = async () => {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    // Stop retrying after 3 attempts so the app stays usable without Redis
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times >= 3) {
        if (!errorLogged) {
          console.warn("⚠️  Redis unavailable — caching disabled, app will still work");
          errorLogged = true;
        }
        // Returning null tells ioredis to stop retrying
        return null;
      }
      return Math.min(times * 200, 1000);
    },
    reconnectOnError() {
      return false;
    },
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redis.on("connect", () => {
    errorLogged = false;
    console.log("✅ Redis connected");
  });

  // Single error listener — ioredis always emits 'error'; suppress after first log
  redis.on("error", (err) => {
    if (!errorLogged) {
      console.error("❌ Redis error:", err.message);
      errorLogged = true;
    }
  });

  try {
    await redis.connect();
  } catch {
    // Swallow — retryStrategy already logged the warning
  }
};

const getRedis = () => {
  // Return null if Redis never connected so callers skip cache gracefully
  if (!redis || redis.status === "end" || redis.status === "close") return null;
  return redis;
};

module.exports = { connectRedis, getRedis };
