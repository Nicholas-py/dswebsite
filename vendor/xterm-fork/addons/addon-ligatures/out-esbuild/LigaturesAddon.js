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
var LigaturesAddon_exports = {};
__export(LigaturesAddon_exports, {
  LigaturesAddon: () => LigaturesAddon
});
module.exports = __toCommonJS(LigaturesAddon_exports);
var import__ = require(".");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class LigaturesAddon {
  constructor(options) {
    this._fallbackLigatures = (options?.fallbackLigatures || [
      "<--",
      "<---",
      "<<-",
      "<-",
      "->",
      "->>",
      "-->",
      "--->",
      "<==",
      "<===",
      "<<=",
      "<=",
      "=>",
      "=>>",
      "==>",
      "===>",
      ">=",
      ">>=",
      "<->",
      "<-->",
      "<--->",
      "<---->",
      "<=>",
      "<==>",
      "<===>",
      "<====>",
      "-------->",
      "<~~",
      "<~",
      "~>",
      "~~>",
      "::",
      ":::",
      "==",
      "!=",
      "===",
      "!==",
      ":=",
      ":-",
      ":+",
      "<*",
      "<*>",
      "*>",
      "<|",
      "<|>",
      "|>",
      "+:",
      "-:",
      "=:",
      ":>",
      "++",
      "+++",
      "<!--",
      "<!---",
      "<***>"
    ]).sort((a, b) => b.length - a.length);
  }
  activate(terminal) {
    if (!terminal.element) {
      throw new Error("Cannot activate LigaturesAddon before open is called");
    }
    this._terminal = terminal;
    this._characterJoinerId = (0, import__.enableLigatures)(terminal, this._fallbackLigatures);
    terminal.element.style.fontFeatureSettings = '"liga" on, "calt" on';
  }
  dispose() {
    if (this._characterJoinerId !== void 0) {
      this._terminal?.deregisterCharacterJoiner(this._characterJoinerId);
      this._characterJoinerId = void 0;
    }
    if (this._terminal?.element) {
      this._terminal.element.style.fontFeatureSettings = "";
    }
  }
}
//# sourceMappingURL=LigaturesAddon.js.map
