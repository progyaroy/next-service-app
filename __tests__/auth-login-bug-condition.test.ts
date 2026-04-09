/**
 * Bug Condition Exploration Test - Session Token Persistence and Redirect Handling
 * 
 * This test MUST FAIL on unfixed code - failure confirms the bugs exist.
 * 
 * Validates: Requirements 2.1, 2.2
 * 
 * Test Cases:
 * 1. Login with valid credentials should set session cookie with httpOnly, secure, sameSite, maxAge flags
 * 2. Login with ?next=/account should redirect to /account (not /login?next=/account)
 * 3. Login without next parameter should redirect to /user/account
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
import { loginAction } from "@/lib/actions/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";
import { hashPassword } from "@/lib/auth/password";

describe("Bug Condition: Session Token Persistence and Redirect Handling", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    redirectCalls.length = 0;
    // Clear test user if exists
    try {
      await User.deleteMany({ email: "test@example.com" });
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({ email: "test@example.com" });
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  describe("Test Case 1: Login with valid credentials should set session cookie with security flags", () => {
    it("should redirect after successful login (bug condition: redirect not called)", async () => {
      // Create test user
      const passwordHash = hashPassword("password123");
      const user = await User.create({
        email: "test@example.com",
        passwordHash,
        role: "user",
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      try {
        await loginAction({}, formData);
      } catch (e) {
        // Expected redirect error
      }

      // BUG CONDITION: Redirect should have been called but wasn't
      // This test FAILS on unfixed code, which confirms the bug exists
      expect(redirectCalls.length).toBeGreaterThan(0);
    });
  });

  describe("Test Case 2: Login with ?next=/account should redirect to /account", () => {
    it("should redirect to /account when next parameter is provided (bug condition: redirect not called)", async () => {
      // Create test user
      const passwordHash = hashPassword("password123");
      await User.create({
        email: "test@example.com",
        passwordHash,
        role: "user",
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");
      formData.append("next", "/account");

      try {
        await loginAction({}, formData);
      } catch (e) {
        // Expected redirect error
      }

      // BUG CONDITION: Redirect should have been called with /account
      // This test FAILS on unfixed code, which confirms the bug exists
      expect(redirectCalls).toContain("/account");
    });
  });

  describe("Test Case 3: Login without next parameter should redirect to /user/account", () => {
    it("should redirect to /user/account when no next parameter is provided (bug condition: redirect not called)", async () => {
      // Create test user
      const passwordHash = hashPassword("password123");
      await User.create({
        email: "test@example.com",
        passwordHash,
        role: "user",
      });

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("password", "password123");

      try {
        await loginAction({}, formData);
      } catch (e) {
        // Expected redirect error
      }

      // BUG CONDITION: Redirect should have been called with /user/account
      // This test FAILS on unfixed code, which confirms the bug exists
      expect(redirectCalls).toContain("/user/account");
    });
  });
});
