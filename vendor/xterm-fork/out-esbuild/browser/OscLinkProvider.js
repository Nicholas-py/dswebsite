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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var OscLinkProvider_exports = {};
__export(OscLinkProvider_exports, {
  OscLinkProvider: () => OscLinkProvider
});
module.exports = __toCommonJS(OscLinkProvider_exports);
var import_CellData = require("common/buffer/CellData");
var import_Services2 = require("common/services/Services");
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let OscLinkProvider = class {
  constructor(_bufferService, _optionsService, _oscLinkService) {
    this._bufferService = _bufferService;
    this._optionsService = _optionsService;
    this._oscLinkService = _oscLinkService;
  }
  provideLinks(y, callback) {
    const line = this._bufferService.buffer.lines.get(y - 1);
    if (!line) {
      callback(void 0);
      return;
    }
    const result = [];
    const linkHandler = this._optionsService.rawOptions.linkHandler;
    const cell = new import_CellData.CellData();
    const lineLength = line.getTrimmedLength();
    let currentLinkId = -1;
    let currentStart = -1;
    let finishLink = false;
    for (let x = 0; x < lineLength; x++) {
      if (currentStart === -1 && !line.hasContent(x)) {
        continue;
      }
      line.loadCell(x, cell);
      if (cell.hasExtendedAttrs() && cell.extended.urlId) {
        if (currentStart === -1) {
          currentStart = x;
          currentLinkId = cell.extended.urlId;
          continue;
        } else {
          finishLink = cell.extended.urlId !== currentLinkId;
        }
      } else {
        if (currentStart !== -1) {
          finishLink = true;
        }
      }
      if (finishLink || currentStart !== -1 && x === lineLength - 1) {
        const text = this._oscLinkService.getLinkData(currentLinkId)?.uri;
        if (text) {
          const range = {
            start: {
              x: currentStart + 1,
              y
            },
            end: {
              // Offset end x if it's a link that ends on the last cell in the line
              x: x + (!finishLink && x === lineLength - 1 ? 1 : 0),
              y
            }
          };
          let ignoreLink = false;
          if (!linkHandler?.allowNonHttpProtocols) {
            try {
              const parsed = new URL(text);
              if (!["http:", "https:"].includes(parsed.protocol)) {
                ignoreLink = true;
              }
            } catch (e) {
              ignoreLink = true;
            }
          }
          if (!ignoreLink) {
            result.push({
              text,
              range,
              activate: (e, text2) => linkHandler ? linkHandler.activate(e, text2, range) : defaultActivate(e, text2),
              hover: (e, text2) => linkHandler?.hover?.(e, text2, range),
              leave: (e, text2) => linkHandler?.leave?.(e, text2, range)
            });
          }
        }
        finishLink = false;
        if (cell.hasExtendedAttrs() && cell.extended.urlId) {
          currentStart = x;
          currentLinkId = cell.extended.urlId;
        } else {
          currentStart = -1;
          currentLinkId = -1;
        }
      }
    }
    callback(result);
  }
};
OscLinkProvider = __decorateClass([
  __decorateParam(0, import_Services2.IBufferService),
  __decorateParam(1, import_Services2.IOptionsService),
  __decorateParam(2, import_Services2.IOscLinkService)
], OscLinkProvider);
function defaultActivate(e, uri) {
  const answer = confirm(`Do you want to navigate to ${uri}?

WARNING: This link could potentially be dangerous`);
  if (answer) {
    const newWindow = window.open();
    if (newWindow) {
      try {
        newWindow.opener = null;
      } catch {
      }
      newWindow.location.href = uri;
    } else {
      console.warn("Opening link blocked as opener could not be cleared");
    }
  }
}
//# sourceMappingURL=OscLinkProvider.js.map
