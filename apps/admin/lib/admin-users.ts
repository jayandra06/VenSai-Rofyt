import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function seedAdminUser(input: {
  ventureKey: string;
  email: string;
  password: string;
}): Promise<"seeded" | "already_exists"> {
  const email = input.email.trim().toLowerCase();
  const ventureKey = input.ventureKey.trim().toLowerCase();
  const passwordHash = await hashPassword(input.password);

  const existing = await prisma.ventureAdminUser.findUnique({
    where: { ventureKey_email: { ventureKey, email } },
  });

  if (existing) {
    await prisma.ventureAdminUser.update({
      where: { id: existing.id },
      data: { passwordHash },
    });
    return "already_exists";
  }

  await prisma.ventureAdminUser.create({
    data: { ventureKey, email, passwordHash },
  });
  return "seeded";
}

export async function authenticateAdmin(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  const user = await prisma.ventureAdminUser.findFirst({
    where: { email: normalized },
    orderBy: { updatedAt: "desc" },
  });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}
