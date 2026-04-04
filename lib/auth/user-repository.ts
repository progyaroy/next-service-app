import "server-only";

import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db/sqlite";
import type { User, UserRole } from "@/lib/auth/types";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: number;
};

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

export function findUserByEmail(email: string): (User & { passwordHash: string }) | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, email, password_hash, role, created_at FROM users WHERE email = ? COLLATE NOCASE`
    )
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  if (!row) return null;
  return { ...rowToUser(row), passwordHash: row.password_hash };
}

export function findUserById(id: string): User | null {
  const db = getDb();
  const row = db
    .prepare(`SELECT id, email, password_hash, role, created_at FROM users WHERE id = ?`)
    .get(id) as UserRow | undefined;
  if (!row) return null;
  return rowToUser(row);
}

export function createUserRecord(
  email: string,
  passwordHash: string,
  role: UserRole = "user"
): User {
  const db = getDb();
  const id = randomUUID();
  const createdAt = Date.now();
  const normalized = email.trim().toLowerCase();
  db.prepare(
    `INSERT INTO users (id, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, normalized, passwordHash, role, createdAt);
  return { id, email: normalized, role, createdAt };
}
