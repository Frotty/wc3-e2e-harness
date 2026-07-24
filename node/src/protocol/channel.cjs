"use strict";

const { decodeSnapshotFile } = require("./snapshot.cjs");
const { LEGAL_TRANSITIONS, IDENTITY_FIELDS } = require("./constants.cjs");

/* Output-channel reader over the alternating A/B files.
 *
 * Plan invariants ("Snapshot envelope"): a snapshot is accepted only when the
 * wrapper is complete, identity matches, the sequence is newer than the last
 * accepted one, and the state transition is legal. Of the two files, the
 * highest fully-valid matching sequence wins — a truncated newer write cannot
 * hide an older valid snapshot.
 */

function identityMatches(envelope, identity) {
  return IDENTITY_FIELDS.every((field) => envelope[field] === identity[field]);
}

// texts: array of file contents (string or null), e.g. [readA, readB].
// context: { identity, lastSeq: number|-1, lastState: string|null }
// Returns { accepted: envelope|null, rejected: [{source, reason}] }
function selectSnapshot(abilityId, texts, context) {
  const rejected = [];
  let best = null;
  texts.forEach((text, index) => {
    const source = index === 0 ? "A" : "B";
    if (text === null || text === undefined) return;
    const decoded = decodeSnapshotFile(abilityId, text);
    if (!decoded.ok) {
      rejected.push({ source, reason: decoded.reason });
      return;
    }
    const envelope = decoded.envelope;
    if (!identityMatches(envelope, context.identity)) {
      rejected.push({ source, reason: "identity-mismatch" });
      return;
    }
    if (envelope.seq <= context.lastSeq) {
      rejected.push({ source, reason: `stale-seq-${envelope.seq}` });
      return;
    }
    const legalFrom = LEGAL_TRANSITIONS[context.lastState ?? "null"] ?? [];
    if (!legalFrom.includes(envelope.state)) {
      rejected.push({ source, reason: `illegal-transition-${context.lastState ?? "null"}->${envelope.state}` });
      return;
    }
    if (best === null || envelope.seq > best.seq) best = envelope;
  });
  return { accepted: best, rejected };
}

// Stateful convenience wrapper used by the runner loop.
function createChannelReader(abilityId, identity) {
  let lastSeq = -1;
  let lastState = null;
  return {
    poll(texts) {
      const result = selectSnapshot(abilityId, texts, { identity, lastSeq, lastState });
      if (result.accepted) {
        lastSeq = result.accepted.seq;
        lastState = result.accepted.state;
      }
      return result;
    },
    get lastSeq() {
      return lastSeq;
    },
    get lastState() {
      return lastState;
    },
  };
}

module.exports = { selectSnapshot, createChannelReader };
