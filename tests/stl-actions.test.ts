import { describe, expect, it } from "vitest";
import { estimatePrintPrice, validateSTLFile } from "@/lib/stl-utils";

describe("stl helpers", () => {
  it("validates supported file types", () => {
    expect(validateSTLFile({ name: "model.stl", size: 10 })).toBe(true);
    expect(validateSTLFile({ name: "model.exe", size: 10 })).toBe(false);
  });

  it("estimates price deterministically", () => {
    const price = estimatePrintPrice({
      material: "PLA",
      layerHeight: 0.2,
      infill: 20,
      quantity: 2,
      estimatedVolumeCm3: 20
    });
    expect(price).toBeGreaterThan(0);
  });
});
