"use strict";

const { CHUNK_SIZE, CHUNKS_PER_FILE } = require("./constants.cjs");

/* stdlib FileIO on-disk transport (hardened from the Phase 0 spike).
 *
 * Writer: emits minimal clean JASS the game executes via Preloader() — a
 * PreloadFiles function of BlzSetAbilityTooltip calls (spike-verified; no
 * need to byte-mimic PreloadGenEnd output).
 *
 * Reader: parses what stdlib File.write produced (breakout wrapper included)
 * AND our own writer output — both carry the same BlzSetAbilityTooltip lines.
 */

function validateAbilityId(abilityId) {
  if (!/^[\x21-\x7e]{4}$/.test(abilityId) || abilityId.includes("'")) {
    throw new Error(`Invalid ability rawcode: ${JSON.stringify(abilityId)}`);
  }
}

function splitChunks(content) {
  if (/["\\]/.test(content)) {
    throw new Error("FileIO content must not contain quotes or backslashes (stdlib validateInput)");
  }
  const chunks = [];
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }
  if (chunks.length >= CHUNKS_PER_FILE) {
    throw new Error(`Content needs ${chunks.length} chunks; stdlib limit is ${CHUNKS_PER_FILE - 1}`);
  }
  return chunks;
}

// Returns the file text for a launch/output file carrying `content`.
function encodeFileText(abilityId, content) {
  validateAbilityId(abilityId);
  const lines = splitChunks(content).map(
    (chunk, level) => `\tcall BlzSetAbilityTooltip('${abilityId}', "${chunk}", ${level})`,
  );
  return `function PreloadFiles takes nothing returns nothing\n${lines.join("\n")}\nendfunction\n`;
}

// Returns { ok: true, content } or { ok: false, reason }.
// Chunk levels must be contiguous from 0; a gap means a missing chunk.
function decodeFileText(abilityId, text) {
  validateAbilityId(abilityId);
  if (typeof text !== "string" || text.length === 0) return { ok: false, reason: "empty" };
  const escaped = abilityId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`BlzSetAbilityTooltip\\('${escaped}',\\s*"([^"\\\\]*)",\\s*(\\d+)\\)`, "g");
  const byLevel = new Map();
  for (const match of text.matchAll(pattern)) {
    const level = Number(match[2]);
    if (byLevel.has(level)) return { ok: false, reason: `duplicate-chunk-level-${level}` };
    byLevel.set(level, match[1]);
  }
  if (byLevel.size === 0) return { ok: false, reason: "no-chunks" };
  const parts = [];
  for (let level = 0; level < byLevel.size; level++) {
    if (!byLevel.has(level)) return { ok: false, reason: `missing-chunk-level-${level}` };
    parts.push(byLevel.get(level));
  }
  return { ok: true, content: parts.join("") };
}

module.exports = { encodeFileText, decodeFileText, splitChunks };
