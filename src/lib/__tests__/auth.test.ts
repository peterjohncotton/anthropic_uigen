// @vitest-environment node
import { test, expect, vi, beforeEach } from "vitest";
import { jwtVerify, SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockSet = vi.fn();
const mockGet = vi.fn();
const mockCookieStore = { set: mockSet, get: mockGet };
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

const { createSession, getSession } = await import("@/lib/auth");

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function mintToken(payload: object, expiresIn = "7d") {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

test("sets auth-token cookie", async () => {
  await createSession("user-123", "test@example.com");

  expect(mockSet).toHaveBeenCalledOnce();
  expect(mockSet.mock.calls[0][0]).toBe("auth-token");
});

test("JWT contains correct userId and email", async () => {
  await createSession("user-123", "test@example.com");

  const token = mockSet.mock.calls[0][1];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-123");
  expect(payload.email).toBe("test@example.com");
});

test("cookie is httpOnly with sameSite lax and path /", async () => {
  await createSession("user-123", "test@example.com");

  const options = mockSet.mock.calls[0][2];
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("cookie expires approximately 7 days from now", async () => {
  const before = Date.now();
  await createSession("user-123", "test@example.com");
  const after = Date.now();

  const options = mockSet.mock.calls[0][2];
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  expect(options.expires.getTime()).toBeGreaterThanOrEqual(before + sevenDaysMs - 1000);
  expect(options.expires.getTime()).toBeLessThanOrEqual(after + sevenDaysMs + 1000);
});

test("cookie is not secure outside production", async () => {
  vi.stubEnv("NODE_ENV", "development");
  await createSession("user-123", "test@example.com");

  const options = mockSet.mock.calls[0][2];
  expect(options.secure).toBe(false);
});

test("cookie is secure in production", async () => {
  vi.stubEnv("NODE_ENV", "production");
  await createSession("user-123", "test@example.com");

  const options = mockSet.mock.calls[0][2];
  expect(options.secure).toBe(true);
});

// getSession tests

test("getSession returns null when no cookie", async () => {
  mockGet.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns session payload for a valid token", async () => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await mintToken({ userId: "user-123", email: "test@example.com", expiresAt });
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session?.userId).toBe("user-123");
  expect(session?.email).toBe("test@example.com");
});

test("getSession returns null for an expired token", async () => {
  const token = await new SignJWT({ userId: "user-123", email: "test@example.com" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
    .setIssuedAt()
    .sign(JWT_SECRET);
  mockGet.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for a tampered token", async () => {
  mockGet.mockReturnValue({ value: "not.a.valid.jwt" });

  const session = await getSession();

  expect(session).toBeNull();
});
