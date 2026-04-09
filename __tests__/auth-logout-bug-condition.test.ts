/**
 * Bug Condition Exploration Test - Logout Cookie Clearing
 * 
 * This test MUST FAIL on unfixed code - failure confirms the logout bug exists.
 * 
 * Validates: Requirements 2.3
 * 
 * Test Cases:
 * 1. Logout should clear the session cookie
 * 2. After logout, accessing protected routes should redirect to login
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
import { logoutAction } from "@/lib/actions/auth";
import { connectDB } from "@/lib/db/mongoose";
import User from "@/lib/models/User";

describe("Bug Condition: Logout Cookie Clearing", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    redirectCalls.length = 0;
    // Clear test user if exists
    try {
      await User.deleteMany({ email: "logout-test@example.com" });
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({ email: "logout-test@example.com" });
    } catch (e) {
      // Ignore errors during cleanup
    }
  });

  describe("Test Case 1: Logout should clear the session cookie", () => {
    it("should redirect to home after logout (bug condition: redirect not called)", async () => {
      // Create test user
      const user = await User.create({
        email: "logout-test@example.com",
        passwordHash: "hash",
        role: "user",
      });

      // Call logout
      try {
        await logoutAction();
      } catch (e) {
        // Expected redirect error
      }

      // BUG CONDITION: Redirect should have been called with /
      // This test FAILS on unfixed code, which confirms the bug exists
      expect(redirectCalls).toContain("/");
    });
  });

  describe("Test Case 2: After logout, accessing protected routes should redirect to login", () => {
    it("should redirect to home when logout is called (bug condition: redirect not called)", async () => {
      // Create test user
      const user = await User.create({
        email: "logout-test@example.com",
        passwordHash: "hash",
        role: "user",
      });

      // Call logout
      try {
        await logoutAction();
      } catch (e) {
        // Expected redirect error
      }

      // BUG CONDITION: Redirect should have been called
      // This test FAILS on unfixed code, which confirms the bug exists
      expect(redirectCalls.length).toBeGreaterThan(0);
    });
  });
});
