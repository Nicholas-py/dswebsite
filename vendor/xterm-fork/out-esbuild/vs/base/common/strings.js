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
var strings_exports = {};
__export(strings_exports, {
  CodePointIterator: () => CodePointIterator,
  commonPrefixLength: () => commonPrefixLength,
  commonSuffixLength: () => commonSuffixLength,
  compare: () => compare,
  compareIgnoreCase: () => compareIgnoreCase,
  compareSubstring: () => compareSubstring,
  compareSubstringIgnoreCase: () => compareSubstringIgnoreCase,
  computeCodePoint: () => computeCodePoint,
  convertSimple2RegExpPattern: () => convertSimple2RegExpPattern,
  count: () => count,
  createRegExp: () => createRegExp,
  equalsIgnoreCase: () => equalsIgnoreCase,
  escape: () => escape,
  escapeRegExpCharacters: () => escapeRegExpCharacters,
  firstNonWhitespaceIndex: () => firstNonWhitespaceIndex,
  format: () => format,
  format2: () => format2,
  getLeadingWhitespace: () => getLeadingWhitespace,
  getNextCodePoint: () => getNextCodePoint,
  htmlAttributeEncodeValue: () => htmlAttributeEncodeValue,
  isAsciiDigit: () => isAsciiDigit,
  isFalsyOrWhitespace: () => isFalsyOrWhitespace,
  isHighSurrogate: () => isHighSurrogate,
  isLowSurrogate: () => isLowSurrogate,
  isLowerAsciiLetter: () => isLowerAsciiLetter,
  isUpperAsciiLetter: () => isUpperAsciiLetter,
  lastNonWhitespaceIndex: () => lastNonWhitespaceIndex,
  ltrim: () => ltrim,
  noBreakWhitespace: () => noBreakWhitespace,
  regExpLeadsToEndlessLoop: () => regExpLeadsToEndlessLoop,
  replaceAsync: () => replaceAsync,
  rtrim: () => rtrim,
  splitLines: () => splitLines,
  splitLinesIncludeSeparators: () => splitLinesIncludeSeparators,
  startsWithIgnoreCase: () => startsWithIgnoreCase,
  stripWildcards: () => stripWildcards,
  trim: () => trim,
  truncate: () => truncate,
  truncateMiddle: () => truncateMiddle
});
module.exports = __toCommonJS(strings_exports);
var import_charCode = require("vs/base/common/charCode");
var import_uint = require("vs/base/common/uint");
function isFalsyOrWhitespace(str) {
  if (!str || typeof str !== "string") {
    return true;
  }
  return str.trim().length === 0;
}
const _formatRegexp = /{(\d+)}/g;
function format(value, ...args) {
  if (args.length === 0) {
    return value;
  }
  return value.replace(_formatRegexp, function(match, group) {
    const idx = parseInt(group, 10);
    return isNaN(idx) || idx < 0 || idx >= args.length ? match : args[idx];
  });
}
const _format2Regexp = /{([^}]+)}/g;
function format2(template, values) {
  if (Object.keys(values).length === 0) {
    return template;
  }
  return template.replace(_format2Regexp, (match, group) => values[group] ?? match);
}
function htmlAttributeEncodeValue(value) {
  return value.replace(/[<>"'&]/g, (ch) => {
    switch (ch) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&apos;";
      case "&":
        return "&amp;";
    }
    return ch;
  });
}
function escape(html) {
  return html.replace(/[<>&]/g, function(match) {
    switch (match) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      default:
        return match;
    }
  });
}
function escapeRegExpCharacters(value) {
  return value.replace(/[\\\{\}\*\+\?\|\^\$\.\[\]\(\)]/g, "\\$&");
}
function count(value, substr) {
  let result = 0;
  let index = value.indexOf(substr);
  while (index !== -1) {
    result++;
    index = value.indexOf(substr, index + substr.length);
  }
  return result;
}
function truncate(value, maxLength, suffix = "\u2026") {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.substr(0, maxLength)}${suffix}`;
}
function truncateMiddle(value, maxLength, suffix = "\u2026") {
  if (value.length <= maxLength) {
    return value;
  }
  const prefixLength = Math.ceil(maxLength / 2) - suffix.length / 2;
  const suffixLength = Math.floor(maxLength / 2) - suffix.length / 2;
  return `${value.substr(0, prefixLength)}${suffix}${value.substr(value.length - suffixLength)}`;
}
function trim(haystack, needle = " ") {
  const trimmed = ltrim(haystack, needle);
  return rtrim(trimmed, needle);
}
function ltrim(haystack, needle) {
  if (!haystack || !needle) {
    return haystack;
  }
  const needleLen = needle.length;
  if (needleLen === 0 || haystack.length === 0) {
    return haystack;
  }
  let offset = 0;
  while (haystack.indexOf(needle, offset) === offset) {
    offset = offset + needleLen;
  }
  return haystack.substring(offset);
}
function rtrim(haystack, needle) {
  if (!haystack || !needle) {
    return haystack;
  }
  const needleLen = needle.length, haystackLen = haystack.length;
  if (needleLen === 0 || haystackLen === 0) {
    return haystack;
  }
  let offset = haystackLen, idx = -1;
  while (true) {
    idx = haystack.lastIndexOf(needle, offset - 1);
    if (idx === -1 || idx + needleLen !== offset) {
      break;
    }
    if (idx === 0) {
      return "";
    }
    offset = idx;
  }
  return haystack.substring(0, offset);
}
function convertSimple2RegExpPattern(pattern) {
  return pattern.replace(/[\-\\\{\}\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&").replace(/[\*]/g, ".*");
}
function stripWildcards(pattern) {
  return pattern.replace(/\*/g, "");
}
function createRegExp(searchString, isRegex, options = {}) {
  if (!searchString) {
    throw new Error("Cannot create regex from empty string");
  }
  if (!isRegex) {
    searchString = escapeRegExpCharacters(searchString);
  }
  if (options.wholeWord) {
    if (!/\B/.test(searchString.charAt(0))) {
      searchString = "\\b" + searchString;
    }
    if (!/\B/.test(searchString.charAt(searchString.length - 1))) {
      searchString = searchString + "\\b";
    }
  }
  let modifiers = "";
  if (options.global) {
    modifiers += "g";
  }
  if (!options.matchCase) {
    modifiers += "i";
  }
  if (options.multiline) {
    modifiers += "m";
  }
  if (options.unicode) {
    modifiers += "u";
  }
  return new RegExp(searchString, modifiers);
}
function regExpLeadsToEndlessLoop(regexp) {
  if (regexp.source === "^" || regexp.source === "^$" || regexp.source === "$" || regexp.source === "^\\s*$") {
    return false;
  }
  const match = regexp.exec("");
  return !!(match && regexp.lastIndex === 0);
}
function splitLines(str) {
  return str.split(/\r\n|\r|\n/);
}
function splitLinesIncludeSeparators(str) {
  const linesWithSeparators = [];
  const splitLinesAndSeparators = str.split(/(\r\n|\r|\n)/);
  for (let i = 0; i < Math.ceil(splitLinesAndSeparators.length / 2); i++) {
    linesWithSeparators.push(splitLinesAndSeparators[2 * i] + (splitLinesAndSeparators[2 * i + 1] ?? ""));
  }
  return linesWithSeparators;
}
function firstNonWhitespaceIndex(str) {
  for (let i = 0, len = str.length; i < len; i++) {
    const chCode = str.charCodeAt(i);
    if (chCode !== import_charCode.CharCode.Space && chCode !== import_charCode.CharCode.Tab) {
      return i;
    }
  }
  return -1;
}
function getLeadingWhitespace(str, start = 0, end = str.length) {
  for (let i = start; i < end; i++) {
    const chCode = str.charCodeAt(i);
    if (chCode !== import_charCode.CharCode.Space && chCode !== import_charCode.CharCode.Tab) {
      return str.substring(start, i);
    }
  }
  return str.substring(start, end);
}
function lastNonWhitespaceIndex(str, startIndex = str.length - 1) {
  for (let i = startIndex; i >= 0; i--) {
    const chCode = str.charCodeAt(i);
    if (chCode !== import_charCode.CharCode.Space && chCode !== import_charCode.CharCode.Tab) {
      return i;
    }
  }
  return -1;
}
function replaceAsync(str, search, replacer) {
  const parts = [];
  let last = 0;
  for (const match of str.matchAll(search)) {
    parts.push(str.slice(last, match.index));
    if (match.index === void 0) {
      throw new Error("match.index should be defined");
    }
    last = match.index + match[0].length;
    parts.push(replacer(match[0], ...match.slice(1), match.index, str, match.groups));
  }
  parts.push(str.slice(last));
  return Promise.all(parts).then((p) => p.join(""));
}
function compare(a, b) {
  if (a < b) {
    return -1;
  } else if (a > b) {
    return 1;
  } else {
    return 0;
  }
}
function compareSubstring(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    const codeA = a.charCodeAt(aStart);
    const codeB = b.charCodeAt(bStart);
    if (codeA < codeB) {
      return -1;
    } else if (codeA > codeB) {
      return 1;
    }
  }
  const aLen = aEnd - aStart;
  const bLen = bEnd - bStart;
  if (aLen < bLen) {
    return -1;
  } else if (aLen > bLen) {
    return 1;
  }
  return 0;
}
function compareIgnoreCase(a, b) {
  return compareSubstringIgnoreCase(a, b, 0, a.length, 0, b.length);
}
function compareSubstringIgnoreCase(a, b, aStart = 0, aEnd = a.length, bStart = 0, bEnd = b.length) {
  for (; aStart < aEnd && bStart < bEnd; aStart++, bStart++) {
    let codeA = a.charCodeAt(aStart);
    let codeB = b.charCodeAt(bStart);
    if (codeA === codeB) {
      continue;
    }
    if (codeA >= 128 || codeB >= 128) {
      return compareSubstring(a.toLowerCase(), b.toLowerCase(), aStart, aEnd, bStart, bEnd);
    }
    if (isLowerAsciiLetter(codeA)) {
      codeA -= 32;
    }
    if (isLowerAsciiLetter(codeB)) {
      codeB -= 32;
    }
    const diff = codeA - codeB;
    if (diff === 0) {
      continue;
    }
    return diff;
  }
  const aLen = aEnd - aStart;
  const bLen = bEnd - bStart;
  if (aLen < bLen) {
    return -1;
  } else if (aLen > bLen) {
    return 1;
  }
  return 0;
}
function isAsciiDigit(code) {
  return code >= import_charCode.CharCode.Digit0 && code <= import_charCode.CharCode.Digit9;
}
function isLowerAsciiLetter(code) {
  return code >= import_charCode.CharCode.a && code <= import_charCode.CharCode.z;
}
function isUpperAsciiLetter(code) {
  return code >= import_charCode.CharCode.A && code <= import_charCode.CharCode.Z;
}
function equalsIgnoreCase(a, b) {
  return a.length === b.length && compareSubstringIgnoreCase(a, b) === 0;
}
function startsWithIgnoreCase(str, candidate) {
  const candidateLength = candidate.length;
  if (candidate.length > str.length) {
    return false;
  }
  return compareSubstringIgnoreCase(str, candidate, 0, candidateLength) === 0;
}
function commonPrefixLength(a, b) {
  const len = Math.min(a.length, b.length);
  let i;
  for (i = 0; i < len; i++) {
    if (a.charCodeAt(i) !== b.charCodeAt(i)) {
      return i;
    }
  }
  return len;
}
function commonSuffixLength(a, b) {
  const len = Math.min(a.length, b.length);
  let i;
  const aLastIndex = a.length - 1;
  const bLastIndex = b.length - 1;
  for (i = 0; i < len; i++) {
    if (a.charCodeAt(aLastIndex - i) !== b.charCodeAt(bLastIndex - i)) {
      return i;
    }
  }
  return len;
}
function isHighSurrogate(charCode) {
  return 55296 <= charCode && charCode <= 56319;
}
function isLowSurrogate(charCode) {
  return 56320 <= charCode && charCode <= 57343;
}
function computeCodePoint(highSurrogate, lowSurrogate) {
  return (highSurrogate - 55296 << 10) + (lowSurrogate - 56320) + 65536;
}
function getNextCodePoint(str, len, offset) {
  const charCode = str.charCodeAt(offset);
  if (isHighSurrogate(charCode) && offset + 1 < len) {
    const nextCharCode = str.charCodeAt(offset + 1);
    if (isLowSurrogate(nextCharCode)) {
      return computeCodePoint(charCode, nextCharCode);
    }
  }
  return charCode;
}
function getPrevCodePoint(str, offset) {
  const charCode = str.charCodeAt(offset - 1);
  if (isLowSurrogate(charCode) && offset > 1) {
    const prevCharCode = str.charCodeAt(offset - 2);
    if (isHighSurrogate(prevCharCode)) {
      return computeCodePoint(prevCharCode, charCode);
    }
  }
  return charCode;
}
class CodePointIterator {
  get offset() {
    return this._offset;
  }
  constructor(str, offset = 0) {
    this._str = str;
    this._len = str.length;
    this._offset = offset;
  }
  setOffset(offset) {
    this._offset = offset;
  }
  prevCodePoint() {
    const codePoint = getPrevCodePoint(this._str, this._offset);
    this._offset -= codePoint >= import_uint.Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1;
    return codePoint;
  }
  nextCodePoint() {
    const codePoint = getNextCodePoint(this._str, this._len, this._offset);
    this._offset += codePoint >= import_uint.Constants.UNICODE_SUPPLEMENTARY_PLANE_BEGIN ? 2 : 1;
    return codePoint;
  }
  eol() {
    return this._offset >= this._len;
  }
}
const noBreakWhitespace = "\xA0";
//# sourceMappingURL=strings.js.map
