"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Charsets_exports = {};
__export(Charsets_exports, {
  CHARSETS: () => CHARSETS,
  DEFAULT_CHARSET: () => DEFAULT_CHARSET
});
module.exports = __toCommonJS(Charsets_exports);
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const CHARSETS = {};
const DEFAULT_CHARSET = CHARSETS["B"];
CHARSETS["0"] = {
  "`": "\u25C6",
  // '◆'
  "a": "\u2592",
  // '▒'
  "b": "\u2409",
  // '␉' (HT)
  "c": "\u240C",
  // '␌' (FF)
  "d": "\u240D",
  // '␍' (CR)
  "e": "\u240A",
  // '␊' (LF)
  "f": "\xB0",
  // '°'
  "g": "\xB1",
  // '±'
  "h": "\u2424",
  // '␤' (NL)
  "i": "\u240B",
  // '␋' (VT)
  "j": "\u2518",
  // '┘'
  "k": "\u2510",
  // '┐'
  "l": "\u250C",
  // '┌'
  "m": "\u2514",
  // '└'
  "n": "\u253C",
  // '┼'
  "o": "\u23BA",
  // '⎺'
  "p": "\u23BB",
  // '⎻'
  "q": "\u2500",
  // '─'
  "r": "\u23BC",
  // '⎼'
  "s": "\u23BD",
  // '⎽'
  "t": "\u251C",
  // '├'
  "u": "\u2524",
  // '┤'
  "v": "\u2534",
  // '┴'
  "w": "\u252C",
  // '┬'
  "x": "\u2502",
  // '│'
  "y": "\u2264",
  // '≤'
  "z": "\u2265",
  // '≥'
  "{": "\u03C0",
  // 'π'
  "|": "\u2260",
  // '≠'
  "}": "\xA3",
  // '£'
  "~": "\xB7"
  // '·'
};
CHARSETS["A"] = {
  "#": "\xA3"
};
CHARSETS["B"] = void 0;
CHARSETS["4"] = {
  "#": "\xA3",
  "@": "\xBE",
  "[": "ij",
  "\\": "\xBD",
  "]": "|",
  "{": "\xA8",
  "|": "f",
  "}": "\xBC",
  "~": "\xB4"
};
CHARSETS["C"] = CHARSETS["5"] = {
  "[": "\xC4",
  "\\": "\xD6",
  "]": "\xC5",
  "^": "\xDC",
  "`": "\xE9",
  "{": "\xE4",
  "|": "\xF6",
  "}": "\xE5",
  "~": "\xFC"
};
CHARSETS["R"] = {
  "#": "\xA3",
  "@": "\xE0",
  "[": "\xB0",
  "\\": "\xE7",
  "]": "\xA7",
  "{": "\xE9",
  "|": "\xF9",
  "}": "\xE8",
  "~": "\xA8"
};
CHARSETS["Q"] = {
  "@": "\xE0",
  "[": "\xE2",
  "\\": "\xE7",
  "]": "\xEA",
  "^": "\xEE",
  "`": "\xF4",
  "{": "\xE9",
  "|": "\xF9",
  "}": "\xE8",
  "~": "\xFB"
};
CHARSETS["K"] = {
  "@": "\xA7",
  "[": "\xC4",
  "\\": "\xD6",
  "]": "\xDC",
  "{": "\xE4",
  "|": "\xF6",
  "}": "\xFC",
  "~": "\xDF"
};
CHARSETS["Y"] = {
  "#": "\xA3",
  "@": "\xA7",
  "[": "\xB0",
  "\\": "\xE7",
  "]": "\xE9",
  "`": "\xF9",
  "{": "\xE0",
  "|": "\xF2",
  "}": "\xE8",
  "~": "\xEC"
};
CHARSETS["E"] = CHARSETS["6"] = {
  "@": "\xC4",
  "[": "\xC6",
  "\\": "\xD8",
  "]": "\xC5",
  "^": "\xDC",
  "`": "\xE4",
  "{": "\xE6",
  "|": "\xF8",
  "}": "\xE5",
  "~": "\xFC"
};
CHARSETS["Z"] = {
  "#": "\xA3",
  "@": "\xA7",
  "[": "\xA1",
  "\\": "\xD1",
  "]": "\xBF",
  "{": "\xB0",
  "|": "\xF1",
  "}": "\xE7"
};
CHARSETS["H"] = CHARSETS["7"] = {
  "@": "\xC9",
  "[": "\xC4",
  "\\": "\xD6",
  "]": "\xC5",
  "^": "\xDC",
  "`": "\xE9",
  "{": "\xE4",
  "|": "\xF6",
  "}": "\xE5",
  "~": "\xFC"
};
CHARSETS["="] = {
  "#": "\xF9",
  "@": "\xE0",
  "[": "\xE9",
  "\\": "\xE7",
  "]": "\xEA",
  "^": "\xEE",
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "_": "\xE8",
  "`": "\xF4",
  "{": "\xE4",
  "|": "\xF6",
  "}": "\xFC",
  "~": "\xFB"
};
//# sourceMappingURL=Charsets.js.map
