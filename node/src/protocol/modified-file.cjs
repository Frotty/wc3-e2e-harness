"use strict";

const fs = require("node:fs");

/* Read a file only after its observable filesystem identity changes. The
 * runner still polls the directory, but avoids reparsing the same preload
 * text on every tick. Size and all timestamp fields are included so a
 * same-sized alternating write is not hidden on filesystems with coarse
 * timestamp resolution.
 */
function createModifiedFileReader(fsApi = fs) {
  let previous = null;

  return {
    read(filePath) {
      let stat;
      try {
        stat = fsApi.statSync(filePath);
      } catch {
        previous = null;
        return null;
      }

      const signature = [stat.size, stat.mtimeMs, stat.ctimeMs, stat.birthtimeMs].join(":");
      if (signature === previous) return null;

      try {
        const content = fsApi.readFileSync(filePath, "utf8");
        previous = signature;
        return content;
      } catch {
        // A writer can replace/truncate a file between stat and read. The
        // next poll must retry even if the metadata remains unchanged.
        return null;
      }
    },
  };
}

module.exports = { createModifiedFileReader };
