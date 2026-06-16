import { describe, expect, it } from "vitest";
import crypto from "crypto";
import { verifyHmacSignature } from "@/lib/utils";

describe("payment signature verification", () => {
  it("accepts a matching HMAC", () => {
    const payload = "order_1|payment_1";
    const secret = "secret";
    const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    expect(verifyHmacSignature(payload, signature, secret)).toBe(true);
  });

  it("rejects a mismatching HMAC", () => {
    expect(verifyHmacSignature("payload", "bad", "secret")).toBe(false);
  });
});
