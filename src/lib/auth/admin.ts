import type { User } from "@prisma/client";

// Admin si role=ADMIN o si su correo está en ADMIN_EMAILS (lista separada por comas).
export function isAdmin(user: Pick<User, "role" | "email"> | null): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(user.email.toLowerCase());
}
