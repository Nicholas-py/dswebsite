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
var OscLinkService_exports = {};
__export(OscLinkService_exports, {
  OscLinkService: () => OscLinkService
});
module.exports = __toCommonJS(OscLinkService_exports);
var import_Services = require("common/services/Services");
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let OscLinkService = class {
  constructor(_bufferService) {
    this._bufferService = _bufferService;
    this._nextId = 1;
    /**
     * A map of the link key to link entry. This is used to add additional lines to links with ids.
     */
    this._entriesWithId = /* @__PURE__ */ new Map();
    /**
     * A map of the link id to the link entry. The "link id" (number) which is the numberic
     * representation of a unique link should not be confused with "id" (string) which comes in with
     * `id=` in the OSC link's properties.
     */
    this._dataByLinkId = /* @__PURE__ */ new Map();
  }
  registerLink(data) {
    const buffer = this._bufferService.buffer;
    if (data.id === void 0) {
      const marker2 = buffer.addMarker(buffer.ybase + buffer.y);
      const entry2 = {
        data,
        id: this._nextId++,
        lines: [marker2]
      };
      marker2.onDispose(() => this._removeMarkerFromLink(entry2, marker2));
      this._dataByLinkId.set(entry2.id, entry2);
      return entry2.id;
    }
    const castData = data;
    const key = this._getEntryIdKey(castData);
    const match = this._entriesWithId.get(key);
    if (match) {
      this.addLineToLink(match.id, buffer.ybase + buffer.y);
      return match.id;
    }
    const marker = buffer.addMarker(buffer.ybase + buffer.y);
    const entry = {
      id: this._nextId++,
      key: this._getEntryIdKey(castData),
      data: castData,
      lines: [marker]
    };
    marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
    this._entriesWithId.set(entry.key, entry);
    this._dataByLinkId.set(entry.id, entry);
    return entry.id;
  }
  addLineToLink(linkId, y) {
    const entry = this._dataByLinkId.get(linkId);
    if (!entry) {
      return;
    }
    if (entry.lines.every((e) => e.line !== y)) {
      const marker = this._bufferService.buffer.addMarker(y);
      entry.lines.push(marker);
      marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
    }
  }
  getLinkData(linkId) {
    return this._dataByLinkId.get(linkId)?.data;
  }
  _getEntryIdKey(linkData) {
    return `${linkData.id};;${linkData.uri}`;
  }
  _removeMarkerFromLink(entry, marker) {
    const index = entry.lines.indexOf(marker);
    if (index === -1) {
      return;
    }
    entry.lines.splice(index, 1);
    if (entry.lines.length === 0) {
      if (entry.data.id !== void 0) {
        this._entriesWithId.delete(entry.key);
      }
      this._dataByLinkId.delete(entry.id);
    }
  }
};
OscLinkService = __decorateClass([
  __decorateParam(0, import_Services.IBufferService)
], OscLinkService);
//# sourceMappingURL=OscLinkService.js.map
