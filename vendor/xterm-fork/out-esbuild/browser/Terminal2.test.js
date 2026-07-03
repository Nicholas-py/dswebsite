"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var glob = __toESM(require("glob"));
var path = __toESM(require("path"));
var os = __toESM(require("os"));
var fs = __toESM(require("fs"));
var pty = __toESM(require("node-pty"));
var import_CoreBrowserTerminal = require("browser/CoreBrowserTerminal");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const COLS = 80;
const ROWS = 25;
const TESTFILES = glob.sync("**/escape_sequence_files/*.in", { cwd: path.join(__dirname, "../..") });
const SKIP_FILES = [
  "t0055-EL.in",
  // EL/ED handle cursor at cols differently (see #3362)
  "t0084-CBT.in",
  "t0101-NLM.in",
  "t0103-reverse_wrap.in",
  // not comparable, we deviate from xterm reverse wrap on purpose
  "t0504-vim.in"
];
if (os.platform() === "darwin") {
  SKIP_FILES.push(
    "t0003-line_wrap.in",
    "t0005-CR.in",
    "t0009-NEL.in",
    "t0503-zsh_ls_color.in"
  );
}
const FILES = TESTFILES.filter((value) => !SKIP_FILES.includes(value.split("/").slice(-1)[0]));
describe("Escape Sequence Files", function() {
  this.timeout(1e3);
  let ptyTerm;
  let slaveEnd;
  let term;
  let customHandler;
  before(() => {
    if (process.platform === "win32") {
      return;
    }
    ptyTerm = pty.open({ cols: COLS, rows: ROWS });
    slaveEnd = ptyTerm._slave;
    term = new import_CoreBrowserTerminal.CoreBrowserTerminal({ cols: COLS, rows: ROWS });
    ptyTerm._master.on("data", (data) => term.write(data));
  });
  after(() => {
    if (process.platform === "win32") {
      return;
    }
    ptyTerm._master.end();
    ptyTerm._master.destroy();
  });
  for (const filename of FILES) {
    (process.platform === "win32" ? it.skip : it)(filename.split("/").slice(-1)[0], async () => {
      if (customHandler) {
        customHandler.dispose();
      }
      slaveEnd.write("\r\n");
      term.reset();
      slaveEnd.write("\x1Bc\x1B[H");
      let content = "";
      const OSC_CODE = 12345;
      await new Promise((resolve) => {
        customHandler = term.registerOscHandler(OSC_CODE, () => {
          content = terminalToString(term);
          resolve();
          return true;
        });
        slaveEnd.write(fs.readFileSync(filename, "utf8"));
        slaveEnd.write(`\x1B]${OSC_CODE};\x07`);
      });
      const expected = fs.readFileSync(filename.split(".")[0] + ".text", "utf8");
      const expectedRightTrimmed = expected.split("\n").map((l) => l.replace(/\s+$/, "")).join("\n");
      if (content !== expectedRightTrimmed) {
        throw new Error(formatError(fs.readFileSync(filename, "utf8"), content, expected));
      }
    });
  }
});
function formatError(input, output, expected) {
  function addLineNumber(start, color) {
    let counter = start || 0;
    return (s2) => {
      counter++;
      return "\x1B[33m" + (" " + counter).slice(-2) + color + s2;
    };
  }
  const line80 = "12345678901234567890123456789012345678901234567890123456789012345678901234567890";
  let s = "";
  s += `
\x1B[34m${JSON.stringify(input)}`;
  s += `
\x1B[33m  ${line80}
`;
  s += output.split("\n").map(addLineNumber(0, "\x1B[31m")).join("\n");
  s += `
\x1B[33m  ${line80}
`;
  s += expected.split("\n").map(addLineNumber(0, "\x1B[32m")).join("\n");
  return s;
}
function terminalToString(term) {
  let result = "";
  let lineText = "";
  for (let line = term.buffer.ybase; line < term.buffer.ybase + term.rows; line++) {
    lineText = term.buffer.lines.get(line).translateToString(true);
    lineText = lineText.replace(/\s+$/, "");
    result += lineText;
    result += "\n";
  }
  return result;
}
//# sourceMappingURL=Terminal2.test.js.map
