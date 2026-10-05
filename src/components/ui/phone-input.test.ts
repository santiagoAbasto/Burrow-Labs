import { expect, test } from "vitest";
import { toInternational } from "./phone-input";

test("lo escrito en el campo simple pasa al selector en formato internacional", () => {
  expect(toInternational("")).toBeUndefined();
  expect(toInternational("  ")).toBeUndefined();
  expect(toInternational("70000000")).toBe("+59170000000");
  expect(toInternational("+591 700-00000")).toBe("+59170000000");
  expect(toInternational(" +54 9 11 5555 5555")).toBe("+5491155555555");
});
