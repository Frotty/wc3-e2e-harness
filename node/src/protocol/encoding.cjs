"use strict";

// stdlib FileIO rejects `"` and `\` outright (validateInput), and tooltip
// content should stay ASCII. JSON is therefore transposed before it goes on
// disk: non-ASCII becomes \uXXXX escapes first (so only ASCII remains), then
// the reserved characters are substituted:  ~ -> ~~   " -> ~q   \ -> ~b
const NON_ASCII = new RegExp("[\\u007f-\\uffff]", "g");

function transpose(text) {
  const asciiOnly = text.replace(NON_ASCII, (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`);
  return asciiOnly.replace(/~/g, "~~").replace(/"/g, "~q").replace(/\\/g, "~b");
}

function untranspose(text) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "~") {
      out += ch;
      continue;
    }
    const next = text[i + 1];
    if (next === "~") out += "~";
    else if (next === "q") out += '"';
    else if (next === "b") out += "\\";
    else throw new Error(`Invalid transpose escape "~${next ?? "<end>"}" at index ${i}`);
    i++;
  }
  return out;
}

module.exports = { transpose, untranspose };
