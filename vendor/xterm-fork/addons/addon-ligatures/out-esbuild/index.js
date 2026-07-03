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
var src_exports = {};
__export(src_exports, {
  enableLigatures: () => enableLigatures
});
module.exports = __toCommonJS(src_exports);
var import_font = __toESM(require("./font"));
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var LoadingState = /* @__PURE__ */ ((LoadingState2) => {
  LoadingState2[LoadingState2["UNLOADED"] = 0] = "UNLOADED";
  LoadingState2[LoadingState2["LOADING"] = 1] = "LOADING";
  LoadingState2[LoadingState2["LOADED"] = 2] = "LOADED";
  LoadingState2[LoadingState2["FAILED"] = 3] = "FAILED";
  return LoadingState2;
})(LoadingState || {});
const CACHE_SIZE = 1e5;
function enableLigatures(term, fallbackLigatures = []) {
  let currentFontName = void 0;
  let font = void 0;
  let loadingState = 0 /* UNLOADED */;
  let loadError = void 0;
  return term.registerCharacterJoiner((text) => {
    const termFont = term.options.fontFamily;
    if (termFont && (loadingState === 0 /* UNLOADED */ || currentFontName !== termFont)) {
      font = void 0;
      loadingState = 1 /* LOADING */;
      currentFontName = termFont;
      const currentCallFontName = currentFontName;
      (0, import_font.default)(currentCallFontName, CACHE_SIZE).then((f) => {
        if (currentCallFontName === term.options.fontFamily) {
          loadingState = 2 /* LOADED */;
          font = f;
          if (f) {
            term.refresh(0, term.rows - 1);
          }
        }
      }).catch((e) => {
        if (currentCallFontName === term.options.fontFamily) {
          loadingState = 3 /* FAILED */;
          if (term.options.logLevel === "debug") {
            console.debug(loadError, new Error("Failure while loading font"));
          }
          font = void 0;
          loadError = e;
        }
      });
    }
    if (font && loadingState === 2 /* LOADED */) {
      return font.findLigatureRanges(text).map(
        (range) => [range[0], range[1]]
      );
    }
    return getFallbackRanges(text, fallbackLigatures);
  });
}
function getFallbackRanges(text, fallbackLigatures) {
  const ranges = [];
  for (let i = 0; i < text.length; i++) {
    for (let j = 0; j < fallbackLigatures.length; j++) {
      if (text.startsWith(fallbackLigatures[j], i)) {
        ranges.push([i, i + fallbackLigatures[j].length]);
        i += fallbackLigatures[j].length - 1;
        break;
      }
    }
  }
  return ranges;
}
//# sourceMappingURL=index.js.map
