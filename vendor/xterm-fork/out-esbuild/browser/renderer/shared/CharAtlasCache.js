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
var CharAtlasCache_exports = {};
__export(CharAtlasCache_exports, {
  acquireTextureAtlas: () => acquireTextureAtlas,
  removeTerminalFromCache: () => removeTerminalFromCache
});
module.exports = __toCommonJS(CharAtlasCache_exports);
var import_TextureAtlas = require("browser/renderer/shared/TextureAtlas");
var import_CharAtlasUtils = require("browser/renderer/shared/CharAtlasUtils");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const charAtlasCache = [];
function acquireTextureAtlas(terminal, options, colors, deviceCellWidth, deviceCellHeight, deviceCharWidth, deviceCharHeight, devicePixelRatio) {
  const newConfig = (0, import_CharAtlasUtils.generateConfig)(deviceCellWidth, deviceCellHeight, deviceCharWidth, deviceCharHeight, options, colors, devicePixelRatio);
  for (let i = 0; i < charAtlasCache.length; i++) {
    const entry = charAtlasCache[i];
    const ownedByIndex = entry.ownedBy.indexOf(terminal);
    if (ownedByIndex >= 0) {
      if ((0, import_CharAtlasUtils.configEquals)(entry.config, newConfig)) {
        return entry.atlas;
      }
      if (entry.ownedBy.length === 1) {
        entry.atlas.dispose();
        charAtlasCache.splice(i, 1);
      } else {
        entry.ownedBy.splice(ownedByIndex, 1);
      }
      break;
    }
  }
  for (let i = 0; i < charAtlasCache.length; i++) {
    const entry = charAtlasCache[i];
    if ((0, import_CharAtlasUtils.configEquals)(entry.config, newConfig)) {
      entry.ownedBy.push(terminal);
      return entry.atlas;
    }
  }
  const core = terminal._core;
  const newEntry = {
    atlas: new import_TextureAtlas.TextureAtlas(document, newConfig, core.unicodeService),
    config: newConfig,
    ownedBy: [terminal]
  };
  charAtlasCache.push(newEntry);
  return newEntry.atlas;
}
function removeTerminalFromCache(terminal) {
  for (let i = 0; i < charAtlasCache.length; i++) {
    const index = charAtlasCache[i].ownedBy.indexOf(terminal);
    if (index !== -1) {
      if (charAtlasCache[i].ownedBy.length === 1) {
        charAtlasCache[i].atlas.dispose();
        charAtlasCache.splice(i, 1);
      } else {
        charAtlasCache[i].ownedBy.splice(index, 1);
      }
      break;
    }
  }
}
//# sourceMappingURL=CharAtlasCache.js.map
