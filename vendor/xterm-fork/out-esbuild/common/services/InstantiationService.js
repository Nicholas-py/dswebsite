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
var InstantiationService_exports = {};
__export(InstantiationService_exports, {
  InstantiationService: () => InstantiationService,
  ServiceCollection: () => ServiceCollection
});
module.exports = __toCommonJS(InstantiationService_exports);
var import_Services = require("common/services/Services");
var import_ServiceRegistry = require("common/services/ServiceRegistry");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * This was heavily inspired from microsoft/vscode's dependency injection system (MIT).
 */
class ServiceCollection {
  constructor(...entries) {
    this._entries = /* @__PURE__ */ new Map();
    for (const [id, service] of entries) {
      this.set(id, service);
    }
  }
  set(id, instance) {
    const result = this._entries.get(id);
    this._entries.set(id, instance);
    return result;
  }
  forEach(callback) {
    for (const [key, value] of this._entries.entries()) {
      callback(key, value);
    }
  }
  has(id) {
    return this._entries.has(id);
  }
  get(id) {
    return this._entries.get(id);
  }
}
class InstantiationService {
  constructor() {
    this._services = new ServiceCollection();
    this._services.set(import_Services.IInstantiationService, this);
  }
  setService(id, instance) {
    this._services.set(id, instance);
  }
  getService(id) {
    return this._services.get(id);
  }
  createInstance(ctor, ...args) {
    const serviceDependencies = (0, import_ServiceRegistry.getServiceDependencies)(ctor).sort((a, b) => a.index - b.index);
    const serviceArgs = [];
    for (const dependency of serviceDependencies) {
      const service = this._services.get(dependency.id);
      if (!service) {
        throw new Error(`[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id._id}.`);
      }
      serviceArgs.push(service);
    }
    const firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
    if (args.length !== firstServiceArgPos) {
      throw new Error(`[createInstance] First service dependency of ${ctor.name} at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments`);
    }
    return new ctor(...[...args, ...serviceArgs]);
  }
}
//# sourceMappingURL=InstantiationService.js.map
