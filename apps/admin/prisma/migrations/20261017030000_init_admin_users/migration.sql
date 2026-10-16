CREATE TABLE IF NOT EXISTS "VentureAdminUser" (
    "id" UUID NOT NULL,
    "ventureKey" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VentureAdminUser_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "VentureAdminUser_ventureKey_email_key" ON "VentureAdminUser"("ventureKey", "email");
CREATE INDEX IF NOT EXISTS "VentureAdminUser_email_idx" ON "VentureAdminUser"("email");
