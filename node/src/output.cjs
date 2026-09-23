"use strict";

/**
 * Run output sized for a reader with a context window.
 *
 * A run is usually read by an agent tailing stdout. Two things made that expensive: the loading phase
 * logs every Space it sends - thirty-odd identical lines on a normal load, far more on a slow one - and
 * consumers tended to print the whole result payload, which on a metric-heavy suite is well over a
 * hundred numbers on one line. `collapsingLogger` fixes the first at the source, and `digestLines`
 * gives consumers the few facts a reader acts on, leaving the payload in `result.json`.
 */

/** Wraps a line writer so a repeated line is printed once and then counted. Call `flush()` at the end. */
function collapsingLogger(write = console.log) {
  let last = null;
  let repeats = 0;
  const flush = () => {
    if (repeats > 0) write(`  (previous line x${repeats + 1})`);
    repeats = 0;
  };
  const log = (line) => {
    const text = String(line);
    if (text === last) {
      repeats++;
      return;
    }
    flush();
    last = text;
    write(text);
  };
  log.flush = flush;
  return log;
}

/**
 * A run result in about ten lines: verdict and assert tally, the failed assert ids, the headline metrics
 * the consumer names, the metric count (and any dropped at the cap), and the event counters.
 *
 * `headlineMetrics` is the consumer's choice - the harness cannot know which of a suite's metrics decide
 * what happens next. Everything not named stays in `result.json`.
 */
function digestLines(result, { suiteId, artifactDir, headlineMetrics = [], maxEventKinds = 20 } = {}) {
  const payload = result?.payload ?? {};
  const asserts = payload.asserts ?? 0;
  const failed = payload.failed ?? 0;
  const lines = [
    `${suiteId ?? "suite"}: ${result?.verdict ?? "none"}  asserts ${asserts - failed}/${asserts}` +
    `  heartbeats ${result?.heartbeats ?? "?"}` +
    `${result?.failure ? `  failure=${result.failure}` : ""}`,
  ];
  if (payload.failedIds) lines.push(`failed: ${payload.failedIds}`);

  const metrics = payload.metrics ?? {};
  const headline = headlineMetrics.filter((id) => metrics[id] !== undefined).map((id) => `${id}=${metrics[id]}`);
  if (headline.length > 0) lines.push(`metrics: ${headline.join("  ")}`);
  const metricCount = Object.keys(metrics).length;
  const dropped = payload.metricsDropped ?? 0;
  if (metricCount > 0 || dropped > 0) {
    lines.push(`(${metricCount} metrics in result.json${dropped > 0 ? `, ${dropped} DROPPED at the cap` : ""})`);
  }

  const events = Object.entries(payload.events ?? {});
  if (events.length > 0) {
    lines.push("events:", ...events.slice(0, maxEventKinds).map(([id, count]) => `  ${id} x${count}`));
    if (events.length > maxEventKinds) lines.push(`  ... ${events.length - maxEventKinds} more kinds`);
  }
  if ((payload.eventKindsDropped ?? 0) > 0) lines.push(`(${payload.eventKindsDropped} event kinds DROPPED at the cap)`);
  if (artifactDir) lines.push(`artifacts: ${artifactDir}`);
  return lines;
}

module.exports = { collapsingLogger, digestLines };
