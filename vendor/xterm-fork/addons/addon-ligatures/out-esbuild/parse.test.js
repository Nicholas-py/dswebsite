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
var import_parse = __toESM(require("./parse"));
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("parse", () => {
  it("parses individual families", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("monospace"), ["monospace"]);
  });
  it("parses multiple families", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("Arial, Verdana, serif"), ["Arial", "Verdana", "serif"]);
  });
  it("parses quoted families", () => {
    import_chai.assert.deepEqual((0, import_parse.default)('"Times New Roman", serif'), ["Times New Roman", "serif"]);
  });
  it("parses single quoted families", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("'Times New Roman', serif"), ["Times New Roman", "serif"]);
  });
  it("parses families with spaces in their names", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("Times New Roman, serif"), ["Times New Roman", "serif"]);
  });
  it("collapses multiple spaces together in identifiers", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("Times   New Roman, serif"), ["Times New Roman", "serif"]);
  });
  it("does not collapse multiple spaces together in quoted strings", () => {
    import_chai.assert.deepEqual((0, import_parse.default)('"Times   New Roman", serif'), ["Times   New Roman", "serif"]);
  });
  it("handles escaped characters in strings", () => {
    import_chai.assert.deepEqual((0, import_parse.default)('"quote \\" slash \\\\ slashquote \\\\\\"", serif'), ['quote " slash \\ slashquote \\"', "serif"]);
  });
  it("fails if a family has an unterminated string", () => {
    import_chai.assert.throws(() => (0, import_parse.default)('"Unterminated, serif'));
  });
  it("handles unicode escape sequences", () => {
    import_chai.assert.deepEqual((0, import_parse.default)('"space\\20 between", serif'), ["space between", "serif"]);
  });
  it("swallows only the first space after a unicode escape", () => {
    import_chai.assert.deepEqual((0, import_parse.default)('"two-space\\20  between", serif'), ["two-space  between", "serif"]);
  });
  it("automatically ends the unicode escape after six digits", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("space\\000020between, serif"), ["space between", "serif"]);
  });
  it("handles unicode escapes at the end of the family", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("endswithbrace \\7b, serif"), ["endswithbrace {", "serif"]);
  });
  it("handles unicode escapes at the end of the input", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("endswithbrace \\7b"), ["endswithbrace {"]);
  });
  it("handles other escaped characters in identifiers", () => {
    import_chai.assert.deepEqual((0, import_parse.default)("has\\,comma"), ["has,comma"]);
  });
  it("swallows escaped newlines in strings", () => {
    import_chai.assert.deepEqual((0, import_parse.default)('"multi \\\nline", serif'), ["multi line", "serif"]);
  });
});
//# sourceMappingURL=parse.test.js.map
