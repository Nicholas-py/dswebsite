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
var parse_exports = {};
__export(parse_exports, {
  default: () => parse
});
module.exports = __toCommonJS(parse_exports);
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
function parse(family) {
  if (typeof family !== "string") {
    throw new Error("Font family must be a string");
  }
  const context = {
    input: family,
    offset: 0
  };
  const families = [];
  let currentFamily = "";
  while (context.offset < context.input.length) {
    const char = context.input[context.offset++];
    switch (char) {
      // String
      case "'":
      case '"':
        currentFamily += parseString(context, char);
        break;
      // End of family
      case ",":
        families.push(currentFamily);
        currentFamily = "";
        break;
      default:
        if (!/\s/.test(char)) {
          context.offset--;
          currentFamily += parseIdentifier(context);
          families.push(currentFamily);
          currentFamily = "";
        }
    }
  }
  return families;
}
function parseString(context, quoteChar) {
  let str = "";
  let escaped = false;
  while (context.offset < context.input.length) {
    const char = context.input[context.offset++];
    if (escaped) {
      if (/[\dA-Fa-f]/.test(char)) {
        context.offset--;
        str += parseUnicode(context);
      } else if (char !== "\n") {
        str += char;
      }
      escaped = false;
    } else {
      switch (char) {
        // Terminated quote
        case quoteChar:
          return str;
        // Begin escape
        case "\\":
          escaped = true;
          break;
        // Add character to string
        default:
          str += char;
      }
    }
  }
  throw new Error("Unterminated string");
}
function parseIdentifier(context) {
  let str = "";
  let escaped = false;
  while (context.offset < context.input.length) {
    const char = context.input[context.offset++];
    if (escaped) {
      if (/[\dA-Fa-f]/.test(char)) {
        context.offset--;
        str += parseUnicode(context);
      } else {
        str += char;
      }
      escaped = false;
    } else {
      switch (char) {
        // Begin escape
        case "\\":
          escaped = true;
          break;
        // Terminate identifier
        case ",":
          return str;
        default:
          if (/\s/.test(char)) {
            if (!str.endsWith(" ")) {
              str += " ";
            }
          } else {
            str += char;
          }
      }
    }
  }
  return str;
}
function parseUnicode(context) {
  let str = "";
  while (context.offset < context.input.length) {
    const char = context.input[context.offset++];
    if (/\s/.test(char)) {
      return unicodeToString(str);
    }
    if (str.length >= 6 || !/[\dA-Fa-f]/.test(char)) {
      context.offset--;
      return unicodeToString(str);
    }
    str += char;
  }
  return unicodeToString(str);
}
function unicodeToString(codePoint) {
  return String.fromCodePoint(parseInt(codePoint, 16));
}
//# sourceMappingURL=parse.js.map
