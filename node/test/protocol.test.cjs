"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { fnv1a32, fnv1a32Hex } = require("../src/protocol/fnv1a.cjs");
const { transpose, untranspose } = require("../src/protocol/encoding.cjs");
const { encodeFrame, decodeFrame } = require("../src/protocol/frame.cjs");
const { encodeFileText, decodeFileText } = require("../src/protocol/fileio.cjs");

// Shared test vectors: the Wurst FNV-1a implementation must reproduce these
// exact values (well-known FNV-1a 32 results).
test("fnv1a32 shared vectors", () => {
  assert.equal(fnv1a32(""), 0x811c9dc5);
  assert.equal(fnv1a32("a"), 0xe40c292c);
  assert.equal(fnv1a32("foobar"), 0xbf9cf968);
  assert.equal(fnv1a32Hex("foobar"), "bf9cf968");
});

test("fnv1a32 rejects non-ascii", () => {
  assert.throws(() => fnv1a32("ü"));
});

test("transpose round-trips reserved and non-ascii characters", () => {
  const original = JSON.stringify({ msg: 'say "hi"\\path', tilde: "a~b", unicode: "zürich" });
  const encoded = transpose(original);
  assert.doesNotMatch(encoded, /["\\]/);
  // Non-ASCII comes back as \uXXXX escapes in the JSON text — identical at the
  // JSON value level (transpose only ever carries JSON), byte-identical for ASCII.
  assert.deepEqual(JSON.parse(untranspose(encoded)), JSON.parse(original));
  const asciiOnly = JSON.stringify({ msg: 'say "hi"\\path', tilde: "a~b" });
  assert.equal(untranspose(transpose(asciiOnly)), asciiOnly);
});

test("untranspose rejects invalid escapes", () => {
  assert.throws(() => untranspose("abc~x"));
  assert.throws(() => untranspose("abc~"));
});

test("frame round-trip and tamper detection", () => {
  const framed = encodeFrame("hello world");
  assert.deepEqual(decodeFrame(framed), { ok: true, body: "hello world" });
  // truncation (partial preload write) loses the END marker
  assert.equal(decodeFrame(framed.slice(0, framed.length - 4)).ok, false);
  // corruption flips the checksum
  const corrupted = framed.replace("hello", "hellz");
  assert.equal(decodeFrame(corrupted).ok, false);
  assert.equal(decodeFrame(corrupted).reason, "checksum-mismatch");
  assert.equal(decodeFrame("").ok, false);
  assert.equal(decodeFrame("garbage").reason, "bad-prefix");
});

test("fileio writer/reader round-trip across chunk boundaries", () => {
  const content = "x".repeat(505); // 3 chunks of 200 + partial
  const text = encodeFileText("E2EF", content);
  assert.deepEqual(decodeFileText("E2EF", text), { ok: true, content });
});

test("fileio parses stdlib PreloadGenEnd output (breakout wrapper)", () => {
  const stdlibShaped = [
    "function PreloadFiles takes nothing returns nothing",
    "",
    "\tcall PreloadStart()",
    '\tcall Preload( "\\" )',
    "call BlzSetAbilityTooltip('AM04', \"part-one-\", 0)",
    '//" )',
    '\tcall Preload( "\\" )',
    "call BlzSetAbilityTooltip('AM04', \"part-two\", 1)",
    '//" )',
    '\tcall Preload( "\\" )',
    "endfunction",
    "function a takes nothing returns nothing",
    ' //" )',
    "\tcall PreloadEnd( 0.0 )",
    "",
    "endfunction",
  ].join("\n");
  assert.deepEqual(decodeFileText("AM04", stdlibShaped), { ok: true, content: "part-one-part-two" });
});

test("fileio rejects missing, duplicate, and reordered-with-gap chunks", () => {
  const gap = [
    "call BlzSetAbilityTooltip('E2EF', \"zero\", 0)",
    "call BlzSetAbilityTooltip('E2EF', \"two\", 2)",
  ].join("\n");
  assert.equal(decodeFileText("E2EF", gap).ok, false);
  assert.match(decodeFileText("E2EF", gap).reason, /missing-chunk-level-1/);

  const dup = [
    "call BlzSetAbilityTooltip('E2EF', \"a\", 0)",
    "call BlzSetAbilityTooltip('E2EF', \"b\", 0)",
  ].join("\n");
  assert.match(decodeFileText("E2EF", dup).reason, /duplicate-chunk-level-0/);

  // reordered but contiguous levels are fine — the reader sorts by level
  const reordered = [
    "call BlzSetAbilityTooltip('E2EF', \"second\", 1)",
    "call BlzSetAbilityTooltip('E2EF', \"first-\", 0)",
  ].join("\n");
  assert.deepEqual(decodeFileText("E2EF", reordered), { ok: true, content: "first-second" });
});

test("fileio enforces stdlib content and size limits", () => {
  assert.throws(() => encodeFileText("E2EF", 'has "quotes"'));
  assert.throws(() => encodeFileText("E2EF", "has \\ backslash"));
  assert.throws(() => encodeFileText("E2EF", "x".repeat(200 * 64))); // >= CHUNKS_PER_FILE
  assert.throws(() => encodeFileText("bad", "content")); // invalid rawcode
});
