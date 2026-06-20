import { promises as dns } from "dns";
import disposableDomains from "disposable-email-domains";
import { redis } from "../redis";

const disposable = new Set<string>(disposableDomains);

export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? disposable.has(domain) : true;
}

// Comprueba que el dominio del correo tiene registros MX (puede recibir email).
export async function hasValidMx(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  try {
    const mx = await dns.resolveMx(domain);
    return Array.isArray(mx) && mx.length > 0;
  } catch {
    return false;
  }
}

// Tope de cuentas gratis por IP (anti-farmeo). Sin Redis no limita.
export async function ipAccountAllowed(ip: string, max: number): Promise<boolean> {
  if (!redis) return true;
  try {
    const k = `acct:ip:${ip}`;
    const n = await redis.incr(k);
    if (n === 1) await redis.expire(k, 24 * 3600);
    return n <= max;
  } catch {
    return true;
  }
}
