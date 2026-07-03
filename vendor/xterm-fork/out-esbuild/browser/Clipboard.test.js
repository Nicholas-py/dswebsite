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
var import_chai = require("chai");
var Clipboard = __toESM(require("browser/Clipboard"));
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("evaluatePastedTextProcessing", () => {
  it("should replace carriage return and/or line feed with carriage return", () => {
    const pastedText = {
      unix: "foo\nbar\n",
      windows: "foo\r\nbar\r\n"
    };
    const processedText = {
      unix: Clipboard.prepareTextForTerminal(pastedText.unix),
      windows: Clipboard.prepareTextForTerminal(pastedText.windows)
    };
    import_chai.assert.equal(processedText.unix, "foo\rbar\r");
    import_chai.assert.equal(processedText.windows, "foo\rbar\r");
  });
  it("should bracket pasted text in bracketedPasteMode", () => {
    const pastedText = "foo bar";
    const unbracketedText = Clipboard.bracketTextForPaste(pastedText, false);
    const bracketedText = Clipboard.bracketTextForPaste(pastedText, true);
    import_chai.assert.equal(unbracketedText, "foo bar");
    import_chai.assert.equal(bracketedText, "\x1B[200~foo bar\x1B[201~");
  });
});
//# sourceMappingURL=Clipboard.test.js.map
