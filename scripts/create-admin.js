
import "dotenv/config";

import argon2 from "argon2";
import { eq } from "drizzle-orm";

import { db, pool } from "../src/db/index.js";
import { users, roles } from "../src/db/schema.js";

async function createAdmin() {
  const name = process.env.BOOTSTRAP_ADMIN_NAME;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;

  // Check required environment variables.
  if (!process.env.DATABASE_URL || !name || !email || !password) {
    throw new Error(
      "Missing DATABASE_URL or Admin environment variables in root .env file."
    );
  }

  if (password.length < 12 || password.length > 128) {
    throw new Error(
      "Admin password must contain between 12 and 128 characters."
    );
  }

  await db.transaction(async (tx) => {
    // Check whether an Admin already exists.
    const existingAdmin = await tx
      .select({ id: users.id })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(eq(roles.name, "Admin"))
      .limit(1);

    if (existingAdmin.length > 0) {
      throw new Error(
        "An Admin account already exists. No new Admin was created."
      );
    }

    // Check whether this email is already registered.
    const existingUser = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error(
        "This email is already registered. Choose another Admin email."
      );
    }

    // Find the Admin role.
    const adminRole = await tx
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, "Admin"))
      .limit(1);

    if (adminRole.length === 0) {
      throw new Error(
        "Admin role not found. Check your roles table in PostgreSQL."
      );
    }

    // Hash the Admin password.
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });

    // Create the approved Admin account.
    await tx.insert(users).values({
      fullName: name,
      email,
      passwordHash,
      roleId: adminRole[0].id,
      requestedRoleId: null,
      approvalStatus: "approved",
      isActive: true,
    });
  });

  console.log("Admin account created successfully!");
  console.log(`Admin email: ${email}`);
}

createAdmin()
  .catch((error) => {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
