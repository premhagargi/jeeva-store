import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createHash, randomBytes } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

function makePasswordHash(password: string): string {
  const salt = randomBytes(8).toString("hex");
  return `${salt}$${hashPassword(password, salt)}`;
}

interface Seed {
  username: string;
  password: string;
  displayName: string;
}

const SEEDS: Seed[] = [
  { username: "admin", password: "admin123", displayName: "Primary Admin" },
  { username: "jeeva", password: "jeeva@2026", displayName: "Jeeva" },
];

async function main() {
  for (const s of SEEDS) {
    const existing = await prisma.admin.findUnique({
      where: { username: s.username },
    });
    if (existing) {
      console.log(`✓ ${s.username} already exists, skipping`);
      continue;
    }
    await prisma.admin.create({
      data: {
        username: s.username,
        passwordHash: makePasswordHash(s.password),
        displayName: s.displayName,
        isActive: true,
      },
    });
    console.log(`✓ created admin "${s.username}" (password: ${s.password})`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
