"use strict";

// FNV-1a 32-bit over the code points of an ASCII-safe string. The Wurst
// implementation must produce identical values; both sides are asserted
// against the shared test vectors in test/fnv1a.test.cjs.
function fnv1a32(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code > 0x7f) {
      throw new Error(`fnv1a32 input must be ASCII; found code ${code} at index ${i}`);
    }
    hash ^= code;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function fnv1a32Hex(text) {
  return fnv1a32(text).toString(16).padStart(8, "0");
}

module.exports = { fnv1a32, fnv1a32Hex };
