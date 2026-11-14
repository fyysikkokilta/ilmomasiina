import { describe, expect, test } from "vitest";

import { base32Prefix, generateToken } from "../../../src/routes/signups/editTokens";

describe("base32Prefix", () => {
  // Test vectors from RFC 4648, lowercased and without padding.
  test.each([
    ["", ""],
    ["f", "my"],
    ["fo", "mzxq"],
    ["foo", "mzxw6"],
    ["foob", "mzxw6yq"],
    ["fooba", "mzxw6ytb"],
    ["foobar", "mzxw6ytboi"],
  ])("encodes %j as %j", (input, expected) => {
    expect(base32Prefix(Buffer.from(input), 100)).toBe(expected);
  });

  test("truncates to the given length", () => {
    expect(base32Prefix(Buffer.from("foobar"), 4)).toBe("mzxw");
  });
});

describe("generateToken", () => {
  test("returns 13 lowercase base32 characters, stable per signup", () => {
    const token = generateToken("abcdefghijkl");
    expect(token).toMatch(/^[a-z2-7]{13}$/);
    expect(generateToken("abcdefghijkl")).toBe(token);
    expect(generateToken("abcdefghijkm")).not.toBe(token);
  });
});
