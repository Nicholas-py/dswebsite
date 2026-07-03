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
var AddonManager_exports = {};
__export(AddonManager_exports, {
  AddonManager: () => AddonManager
});
module.exports = __toCommonJS(AddonManager_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class AddonManager {
  constructor() {
    this._addons = [];
  }
  dispose() {
    for (let i = this._addons.length - 1; i >= 0; i--) {
      this._addons[i].instance.dispose();
    }
  }
  loadAddon(terminal, instance) {
    const loadedAddon = {
      instance,
      dispose: instance.dispose,
      isDisposed: false
    };
    this._addons.push(loadedAddon);
    instance.dispose = () => this._wrappedAddonDispose(loadedAddon);
    instance.activate(terminal);
  }
  _wrappedAddonDispose(loadedAddon) {
    if (loadedAddon.isDisposed) {
      return;
    }
    let index = -1;
    for (let i = 0; i < this._addons.length; i++) {
      if (this._addons[i] === loadedAddon) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      throw new Error("Could not dispose an addon that has not been loaded");
    }
    loadedAddon.isDisposed = true;
    loadedAddon.dispose.apply(loadedAddon.instance);
    this._addons.splice(index, 1);
  }
}
//# sourceMappingURL=AddonManager.js.map
