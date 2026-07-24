"use strict";

const { transpose, untranspose } = require("./encoding.cjs");
const { encodeFrame, decodeFrame } = require("./frame.cjs");
const { encodeFileText, decodeFileText } = require("./fileio.cjs");
const { PROTOCOL_VERSION, SNAPSHOT_STATES, IDENTITY_FIELDS } = require("./constants.cjs");

/* Snapshot layer: envelope object <-> on-disk file text.
 *
 *   file text = fileio( frame( transpose( JSON(envelope) ) ) )
 *
 * Envelope fields (plan: "Snapshot envelope"):
 *   v, projectId, buildId, runId, nonce, suiteId,   // identity
 *   seq, state, gameTime, heartbeat, payload
 */

function validateEnvelope(envelope) {
  const errors = [];
  for (const field of IDENTITY_FIELDS) {
    if (envelope[field] === undefined || envelope[field] === null || envelope[field] === "") {
      errors.push(`missing identity field: ${field}`);
    }
  }
  if (!Number.isInteger(envelope.seq) || envelope.seq < 0) errors.push("seq must be a non-negative integer");
  if (!SNAPSHOT_STATES.includes(envelope.state)) errors.push(`unknown state: ${String(envelope.state)}`);
  if (typeof envelope.gameTime !== "number" || envelope.gameTime < 0) errors.push("gameTime must be a non-negative number");
  if (!Number.isInteger(envelope.heartbeat) || envelope.heartbeat < 0) errors.push("heartbeat must be a non-negative integer");
  return errors;
}

// Envelope -> file text. Used by tests and simulators; the real map-side
// writer is the Wurst runtime producing the same body.
function encodeSnapshotFile(abilityId, envelope) {
  const errors = validateEnvelope(envelope);
  if (errors.length > 0) throw new Error(`Invalid envelope: ${errors.join("; ")}`);
  return encodeFileText(abilityId, encodeFrame(transpose(JSON.stringify(envelope))));
}

// File text -> { ok: true, envelope } or { ok: false, reason }.
function decodeSnapshotFile(abilityId, text) {
  const file = decodeFileText(abilityId, text);
  if (!file.ok) return { ok: false, reason: `fileio: ${file.reason}` };
  const frame = decodeFrame(file.content);
  if (!frame.ok) return { ok: false, reason: `frame: ${frame.reason}` };
  let envelope;
  try {
    envelope = JSON.parse(untranspose(frame.body));
  } catch (error) {
    return { ok: false, reason: `json: ${error.message}` };
  }
  const errors = validateEnvelope(envelope);
  if (errors.length > 0) return { ok: false, reason: `envelope: ${errors.join("; ")}` };
  return { ok: true, envelope };
}

function makeIdentity({ projectId, buildId, runId, nonce, suiteId }) {
  return { v: PROTOCOL_VERSION, projectId, buildId, runId, nonce, suiteId };
}

module.exports = { encodeSnapshotFile, decodeSnapshotFile, validateEnvelope, makeIdentity };
