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
var sequence_exports = {};
__export(sequence_exports, {
  Sequence: () => Sequence
});
module.exports = __toCommonJS(sequence_exports);
var import_event = require("vs/base/common/event");
class Sequence {
  constructor() {
    this.elements = [];
    this._onDidSplice = new import_event.Emitter();
    this.onDidSplice = this._onDidSplice.event;
  }
  splice(start, deleteCount, toInsert = []) {
    this.elements.splice(start, deleteCount, ...toInsert);
    this._onDidSplice.fire({ start, deleteCount, toInsert });
  }
}
//# sourceMappingURL=sequence.js.map
