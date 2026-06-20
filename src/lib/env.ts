import { z } from "zod";

// Config no crítica + claves opcionales por fase. DATABASE_URL lo lee Prisma directamente.
// Todo es opcional/por defecto para que el build no falle si faltan claves (degradación elegante).
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  APP_URL: z.string().url().default("https://imagination.olcas.app"),

  // Motores de imagen
  POLLINATIONS_BASE: z.string().url().default("https://image.pollinations.ai"),
  OPENAI_API_KEY: z.string().optional(),

  // Prompt enhancer
  GROQ_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default("Imagination <no-reply@olcas.app>"),
  AUTH_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().optional(), // correos admin separados por comas

  // Anti-abuso / kill switch
  KILL_SWITCH: z.enum(["on", "off"]).default("off"),
  FREE_WELCOME_CREDITS: z.coerce.number().int().default(30),
  FREE_DAILY_CAP: z.coerce.number().int().default(10),
  FREE_ANON_DAILY_CAP: z.coerce.number().int().default(3),
  MAX_FREE_ACCOUNTS_PER_IP: z.coerce.number().int().default(2),
  DAILY_POLLINATIONS_CAP: z.coerce.number().int().default(2000),
  DAILY_OPENAI_BUDGET_EUR: z.coerce.number().default(20),
});

export const env = schema.parse(process.env);
export type Env = z.infer<typeof schema>;
