import { describe, expect, it } from "vitest";
import { isAdminRoute, isProtectedCustomerRoute } from "@/lib/route-guards";

describe("route protection helpers", () => {
  it("matches customer routes", () => {
    expect(isProtectedCustomerRoute("/orders")).toBe(true);
    expect(isProtectedCustomerRoute("/shop")).toBe(false);
  });

  it("matches admin routes", () => {
    expect(isAdminRoute("/admin/products")).toBe(true);
    expect(isAdminRoute("/login")).toBe(false);
  });
});
