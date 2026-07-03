"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var font_exports = {};
__export(font_exports, {
  default: () => load
});
module.exports = __toCommonJS(font_exports);
var import_font_ligatures = require("font-ligatures");
var import_parse = __toESM(require("./parse"));
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let fontsPromise = void 0;
async function load(fontFamily, cacheSize) {
  if (!fontsPromise) {
    if (typeof navigator !== "undefined" && "fonts" in navigator) {
      try {
        const status = await navigator.permissions.request?.({
          name: "local-fonts"
        });
        if (status && status.state !== "granted") {
          throw new Error("Permission to access local fonts not granted.");
        }
      } catch (err) {
        if (err.name !== "TypeError") {
          throw err;
        }
      }
      const fonts2 = {};
      try {
        const fontsIterator = await navigator.fonts.query();
        for (const metadata of fontsIterator) {
          if (!fonts2.hasOwnProperty(metadata.family)) {
            fonts2[metadata.family] = [];
          }
          fonts2[metadata.family].push(metadata);
        }
        fontsPromise = Promise.resolve(fonts2);
      } catch (err) {
        console.error(err.name, err.message);
      }
    } else if (typeof window !== "undefined" && "queryLocalFonts" in window) {
      const fonts2 = {};
      try {
        const fontsIterator = await window.queryLocalFonts();
        for (const metadata of fontsIterator) {
          if (!fonts2.hasOwnProperty(metadata.family)) {
            fonts2[metadata.family] = [];
          }
          fonts2[metadata.family].push(metadata);
        }
        fontsPromise = Promise.resolve(fonts2);
      } catch (err) {
        console.error(err.name, err.message);
      }
    }
    if (!fontsPromise) {
      fontsPromise = Promise.resolve({});
    }
  }
  const fonts = await fontsPromise;
  for (const family of (0, import_parse.default)(fontFamily)) {
    if (genericFontFamilies.includes(family)) {
      return void 0;
    }
    if (fonts.hasOwnProperty(family) && fonts[family].length > 0) {
      const font = fonts[family][0];
      if ("blob" in font) {
        const bytes = await font.blob();
        const buffer = await bytes.arrayBuffer();
        return (0, import_font_ligatures.loadBuffer)(buffer, { cacheSize });
      }
      return void 0;
    }
  }
  return void 0;
}
const genericFontFamilies = [
  "serif",
  "sans-serif",
  "cursive",
  "fantasy",
  "monospace",
  "system-ui",
  "emoji",
  "math",
  "fangsong"
];
//# sourceMappingURL=font.js.map
