// Setup for vitest to handle server-only modules
import { vi } from "vitest";

// Mock server-only to allow imports in test environment
vi.mock("server-only", () => ({}));

// Mock next/headers cookies function
const mockCookies = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(() => []),
  has: vi.fn(),
  toString: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookies),
}));
