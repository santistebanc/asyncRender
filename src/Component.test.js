import { expect, test } from "vitest";
import Component from "./Component";

test("chain arbitrary properties", () => {
  const comp = Component();
  expect(comp.a.b.c).toBeDefined();
});
