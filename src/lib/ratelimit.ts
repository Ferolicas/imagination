import { redis } from "./redis";

// Kill switch global: env KILL_SWITCH=on o clave Redis "killswitch"=on pausa el free.
export async function killSwitchOn(): Promise<boolean> {
  if (process.env.KILL_SWITCH === "on") return true;
  if (!redis) return false;
  try {
    const v = await redis.get("killswitch");
    return v === "on" || v === "1";
  } catch {
    return false;
  }
}

// Límite de ventana fija. Sin Redis degrada (no limita); en producción siempre hay Redis.
export async function rateLimit(
  key: string,
  max: number,
  windowSec: number,
): Promise<{ ok: boolean; remaining: number }> {
  if (!redis) return { ok: true, remaining: max };
  try {
    const k = `rl:${key}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, windowSec);
    return { ok: n <= max, remaining: Math.max(0, max - n) };
  } catch {
    return { ok: true, remaining: max };
  }
}

// Contador diario (para kill switch de uso: nº de llamadas a Pollinations, etc.)
export async function bumpDailyCounter(name: string): Promise<number> {
  if (!redis) return 0;
  try {
    const day = new Date().toISOString().slice(0, 10);
    const k = `count:${name}:${day}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, 36 * 3600);
    return n;
  } catch {
    return 0;
  }
}
