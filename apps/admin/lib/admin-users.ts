import { ObjectId } from "mongodb";

import { ensureCentralIndexes } from "@/lib/central-indexes";
import { getCentralDb } from "@/lib/mongo";
import { hashPassword, verifyPassword } from "@/lib/password";
import { ensureVentureRegistered } from "@/lib/venture-registry";

export type AdminUserDoc = {
  _id: ObjectId;
  ventureKey: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

const COL = "admin_users";

export async function seedAdminUser(input: {
  ventureKey: string;
  email: string;
  password: string;
}): Promise<"seeded" | "already_exists"> {
  const email = input.email.trim().toLowerCase();
  const ventureKey = input.ventureKey.trim().toLowerCase();
  await ensureVentureRegistered(ventureKey);
  await ensureCentralIndexes();

  const passwordHash = await hashPassword(input.password);
  const col = (await getCentralDb()).collection<Omit<AdminUserDoc, "_id">>(COL);
  const now = new Date();

  const existing = await col.findOne({ ventureKey, email });
  if (existing) {
    await col.updateOne({ _id: existing._id }, { $set: { passwordHash, updatedAt: now } });
    return "already_exists";
  }

  await col.insertOne({
    ventureKey,
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });
  return "seeded";
}

export async function authenticateAdmin(ventureKey: string, email: string, password: string) {
  const key = ventureKey.trim().toLowerCase();
  const normalized = email.trim().toLowerCase();
  const user = await (await getCentralDb())
    .collection<AdminUserDoc>(COL)
    .findOne({ ventureKey: key, email: normalized });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return user;
}

export async function findAdminUserById(ventureKey: string, userId: string) {
  if (!ObjectId.isValid(userId)) return null;
  return (await getCentralDb()).collection<AdminUserDoc>(COL).findOne({
    _id: new ObjectId(userId),
    ventureKey: ventureKey.trim().toLowerCase(),
  });
}
