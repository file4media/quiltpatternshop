import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("patterns.list", () => {
  it("returns active patterns for public users", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const patterns = await caller.patterns.list();

    expect(Array.isArray(patterns)).toBe(true);
  });
});

describe("patterns.featured", () => {
  it("returns featured patterns", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const patterns = await caller.patterns.featured();

    expect(Array.isArray(patterns)).toBe(true);
    patterns.forEach((pattern) => {
      expect(pattern.featured).toBe(1);
      expect(pattern.active).toBe(1);
    });
  });
});
