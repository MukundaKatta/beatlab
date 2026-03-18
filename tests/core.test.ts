import { describe, it, expect } from "vitest";
import { Beatlab } from "../src/core.js";
describe("Beatlab", () => {
  it("init", () => { expect(new Beatlab().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Beatlab(); await c.track(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Beatlab(); await c.track(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
