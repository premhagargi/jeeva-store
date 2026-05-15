import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import { prisma } from "./prisma";

const COOKIE_NAME = "jeeva_admin";

export interface AdminSession {
  id: string;
  username: string;
  displayName: string | null;
}

function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function makePasswordHash(password: string): string {
  const salt = randomBytes(8).toString("hex");
  return `${salt}$${hashPassword(password, salt)}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const idx = stored.indexOf("$");
  if (idx <= 0) return false;
  const salt = stored.slice(0, idx);
  const expected = stored.slice(idx + 1);
  return hashPassword(password, salt) === expected;
}

function signToken(adminId: string): string {
  const secret = process.env.ADMIN_PASSWORD ?? "dev-secret";
  return createHash("sha256").update(`${adminId}:${secret}`).digest("hex");
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const [adminId, token] = raw.split(".");
  if (!adminId || !token) return null;
  if (token !== signToken(adminId)) return null;
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, username: true, displayName: true, isActive: true },
  });
  if (!admin || !admin.isActive) return null;
  return { id: admin.id, username: admin.username, displayName: admin.displayName };
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminSession()) !== null;
}

export async function requireAdmin(): Promise<AdminSession> {
  const s = await getAdminSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function loginAdmin(
  username: string,
  password: string,
): Promise<boolean> {
  const admin = await prisma.admin.findUnique({
    where: { username: username.trim().toLowerCase() },
  });
  if (!admin || !admin.isActive) return false;
  if (!verifyPassword(password, admin.passwordHash)) return false;

  const jar = await cookies();
  jar.set(COOKIE_NAME, `${admin.id}.${signToken(admin.id)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
