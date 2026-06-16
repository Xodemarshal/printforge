import { describe, expect, it } from "vitest";
import { parseLoginInput, parseRegisterInput } from "@/lib/auth-actions";

function formData(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) {
    data.set(key, value);
  }
  return data;
}

describe("auth action validation", () => {
  it("rejects invalid login input", () => {
    const result = parseLoginInput(formData({ email: "bad", password: "short" }));
    expect(result.success).toBe(false);
  });

  it("accepts valid register input", () => {
    const result = parseRegisterInput(
      formData({ name: "Ada", email: "ada@example.com", password: "strongpass" })
    );
    expect(result.success).toBe(true);
  });
});
