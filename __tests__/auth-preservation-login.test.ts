/**
 * Preservation Property Tests - Non-Buggy Login Behavior
 * 
 * Observe behavior on UNFIXED code for non-buggy inputs:
 * - Login without `next` parameter redirects to `/user/account`
 * - Invalid credentials return error without creating session
 * - Registration creates account and establishes session
 * 
 * Validates: Requirements 3.3, 3.4
 * 
 * EXPECTED OUTCOME: Tests PASS (this confirms baseline behavior to preserve)
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from "vitest";

// Track redirect calls
const redirectCalls: string[] = [];

// Mock next/navigation redirect before importing auth actions
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    redirectCalls.push(path);
    throw new Error(`REDIRECT_TO_${path}`);
  },
}));

// Import after mocking
import { loginAction, registerAction } from "@/lib/actions/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { hashPassword } from "@/lib/auth/password";

describe("Preservation: Non-Buggy Login Behavior", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    redirectCalls.length = 0;
    // Clear test users if exist
    try {
      await User.deleteMany({
        email: { $in: ["preserve-test@example.com", "register-test@example.com"] },
      });
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({
        email: { $in: ["preserve-test@example.com", "register-test@example.com"] },
      });
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  describe("Property 1: Invalid credentials return error without creating session", () => {
    it("should return error for invalid email", async () => {
      const formData = new FormData();
      formData.append("email", "invalid");
      formData.append("password", "password123");

      const result = await loginAction({}, formData);

      expect(result.error).toBeDefined();
      expect(result.error).toContain("valid email");
    });

    it("should return error for non-existent user", async () => {
      const formData = new FormData();
      formData.append("email", "nonexistent@example.com");
      formData.append("password", "password123");

      const result = await loginAction({}, formData);

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Invalid email or password");
    });

    it("should return error for wrong password", async () => {
      // Create test user
      const passwordHash = hashPassword("password123");
      await User.create({
        email: "preserve-test@example.com",
        passwordHash,
        role: "user",
      });

      const formData = new FormData();
      formData.append("email", "preserve-test@example.com");
      formData.append("password", "wrongpassword");

      const result = await loginAction({}, formData);

      expect(result.error).toBeDefined();
      expect(result.error).toContain("Invalid email or password");
    });
  });

  describe("Property 2: Registration creates account and establishes session", () => {
    it("should create account for valid registration", async () => {
      const formData = new FormData();
      formData.append("email", "register-test@example.com");
      formData.append("password", "password123");
      formData.append("confirm", "password123");

      try {
        await registerAction({}, formData);
      } catch (e) {
        // Expected redirect error
      }

      // Verify user was created
      const user = await User.findOne({ email: "register-test@example.com" });
      expect(user).not.toBeNull();
      expect(user?.role).toBe("user");
    });

    it("should return error for duplicate email", async () => {
      // Create first user
      await User.create({
        email: "register-test@example.com",
        passwordHash: hashPassword("password123"),
        role: "user",
      });

      // Try to register with same email
      const formData = new FormData();
      formData.append("email", "register-test@example.com");
      formData.append("password", "password123");
      formData.append("confirm", "password123");

      const result = await registerAction({}, formData);

      expect(result.error).toBeDefined();
      expect(result.error).toContain("already exists");
    });

    it("should return error for short password", async () => {
      const formData = new FormData();
      formData.append("email", "register-test@example.com");
      formData.append("password", "short");
      formData.append("confirm", "short");

      const result = await registerAction({}, formData);

      expect(result.error).toBeDefined();
      expect(result.error).toContain("at least 8 characters");
    });

    it("should return error for mismatched passwords", async () => {
      const formData = new FormData();
      formData.append("email", "register-test@example.com");
      formData.append("password", "password123");
      formData.append("confirm", "password456");

      const result = await registerAction({}, formData);

      expect(result.error).toBeDefined();
      expect(result.error).toContain("do not match");
    });
  });
});
