"use strict";

const { fnv1a32Hex } = require("./fnv1a.cjs");

/* Frame layer: wraps an already-transposed body so the reader can prove the
 * content is complete and uncorrupted before parsing anything:
 *
 *   E2E1|<bodyLength>|<fnv1a32 hex of body>|<body>|END
 *
 * Maps onto the plan's envelope guards: bodyLength ~ payloadChunkCount,
 * the hash ~ payloadChecksum, the END marker ~ complete. A truncated write
 * loses END; a corrupted or partially-overwritten body fails length or hash.
 */
const PREFIX = "E2E1";
const SUFFIX = "END";

function encodeFrame(body) {
  return `${PREFIX}|${body.length}|${fnv1a32Hex(body)}|${body}|${SUFFIX}`;
}

// Returns { ok: true, body } or { ok: false, reason }.
function decodeFrame(text) {
  if (typeof text !== "string" || text.length === 0) return { ok: false, reason: "empty" };
  if (!text.startsWith(`${PREFIX}|`)) return { ok: false, reason: "bad-prefix" };
  const lenEnd = text.indexOf("|", PREFIX.length + 1);
  if (lenEnd < 0) return { ok: false, reason: "no-length" };
  const length = Number(text.slice(PREFIX.length + 1, lenEnd));
  if (!Number.isInteger(length) || length < 0) return { ok: false, reason: "bad-length" };
  const hashEnd = text.indexOf("|", lenEnd + 1);
  if (hashEnd < 0) return { ok: false, reason: "no-hash" };
  const declaredHash = text.slice(lenEnd + 1, hashEnd);
  const bodyStart = hashEnd + 1;
  const expectedTotal = bodyStart + length + 1 + SUFFIX.length;
  if (text.length < expectedTotal) return { ok: false, reason: "truncated" };
  if (text.length > expectedTotal) return { ok: false, reason: "trailing-garbage" };
  const body = text.slice(bodyStart, bodyStart + length);
  if (text.slice(bodyStart + length) !== `|${SUFFIX}`) return { ok: false, reason: "no-end-marker" };
  if (fnv1a32Hex(body) !== declaredHash) return { ok: false, reason: "checksum-mismatch" };
  return { ok: true, body };
}

module.exports = { encodeFrame, decodeFrame };
