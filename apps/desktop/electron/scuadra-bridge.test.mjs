import assert from "node:assert/strict";
import { test } from "node:test";

import { isPathAllowed } from "./scuadra-bridge.mjs";

test("allows an approved root and anything inside it", () => {
  const roots = new Set(["C:\\datos\\scuadra"]);
  assert.equal(isPathAllowed("C:\\datos\\scuadra", roots, "win32"), true);
  assert.equal(isPathAllowed("C:\\datos\\scuadra\\sub\\archivo.txt", roots, "win32"), true);
});

test("is case-insensitive on Windows", () => {
  const roots = new Set(["C:\\Datos\\Scuadra"]);
  assert.equal(isPathAllowed("c:\\datos\\scuadra\\a.txt", roots, "win32"), true);
});

test("rejects paths outside every approved root", () => {
  const roots = new Set(["C:\\datos\\scuadra"]);
  assert.equal(isPathAllowed("C:\\Windows\\System32", roots, "win32"), false);
  assert.equal(isPathAllowed("C:\\datos", roots, "win32"), false);
});

test("rejects sibling folders that share the root as a name prefix", () => {
  const roots = new Set(["C:\\datos\\scuadra"]);
  assert.equal(isPathAllowed("C:\\datos\\scuadra-privado\\x.txt", roots, "win32"), false);
});

test("rejects traversal that escapes the root", () => {
  const roots = new Set(["C:\\datos\\scuadra"]);
  assert.equal(isPathAllowed("C:\\datos\\scuadra\\..\\otros\\x.txt", roots, "win32"), false);
});

test("rejects everything when no folder was approved", () => {
  assert.equal(isPathAllowed("C:\\cualquiera", new Set(), "win32"), false);
});
