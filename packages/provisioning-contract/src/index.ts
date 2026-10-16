import { z } from "zod";

export const provisioningAdminRequestSchema = z.object({
  ventureKey: z.string().min(2).max(64),
  targetKey: z.string().min(2).max(32),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8).max(200),
  idempotencyKey: z.string().uuid(),
  correlationId: z.string().uuid(),
});

export const provisioningAdminResponseSchema = z.object({
  success: z.boolean(),
  status: z.enum(["seeded", "already_exists", "failed"]),
  venture: z.string().optional(),
  target: z.string().optional(),
  adminEmail: z.string().email().optional(),
  message: z.string(),
});

export function verifyProvisioningBearer(
  header: string | null,
  expected: string | undefined
): boolean {
  if (!expected?.trim()) return false;
  const m = header?.match(/^Bearer\s+(.+)$/i);
  if (!m) return false;
  return m[1] === expected;
}
