
import "server-only";

import { randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { eq, and, gt } from "drizzle-orm";

import { db } from "@/db";
import { sessions, users, roles } from "@/db/schema";

const SESSION_COOKIE_NAME = "worksphere_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

// Convert the original session token into a SHA-256 hash.
function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// Create a new session after successful login.
export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

// Get the currently logged-in user.
export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const result = await db
    .select({
      sessionId: sessions.id,
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      approvalStatus: users.approvalStatus,
      isActive: users.isActive,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, new Date()),
        eq(users.isActive, true)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0];
}

// Delete the current session during logout.
export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, tokenHash));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}
