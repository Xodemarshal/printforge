import { describe, expect, it } from "vitest";
import { filterProducts } from "@/lib/product-filters";

describe("product filtering", () => {
  const products = [
    { name: "Desk Lamp", description: "LED lamp", slug: "desk-lamp", category: "decor" },
    { name: "Mini Drone", description: "FPV drone", slug: "mini-drone", category: "electronics" },
    { name: "Phone Stand", description: "Adjustable phone stand", slug: "phone-stand", category: "decor" }
  ];

  it("filters by query", () => {
    const result = filterProducts(products, { query: "drone" });
    expect(result.total).toBe(1);
    expect(result.items[0]?.slug).toBe("mini-drone");
  });

  it("filters by category", () => {
    const result = filterProducts(products, { category: "decor" });
    expect(result.total).toBe(2);
  });
});
