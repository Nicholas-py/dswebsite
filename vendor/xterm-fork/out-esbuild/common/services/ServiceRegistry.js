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
var ServiceRegistry_exports = {};
__export(ServiceRegistry_exports, {
  createDecorator: () => createDecorator,
  getServiceDependencies: () => getServiceDependencies,
  serviceRegistry: () => serviceRegistry
});
module.exports = __toCommonJS(ServiceRegistry_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * This was heavily inspired from microsoft/vscode's dependency injection system (MIT).
 */
const DI_TARGET = "di$target";
const DI_DEPENDENCIES = "di$dependencies";
const serviceRegistry = /* @__PURE__ */ new Map();
function getServiceDependencies(ctor) {
  return ctor[DI_DEPENDENCIES] || [];
}
function createDecorator(id) {
  if (serviceRegistry.has(id)) {
    return serviceRegistry.get(id);
  }
  const decorator = function(target, key, index) {
    if (arguments.length !== 3) {
      throw new Error("@IServiceName-decorator can only be used to decorate a parameter");
    }
    storeServiceDependency(decorator, target, index);
  };
  decorator._id = id;
  serviceRegistry.set(id, decorator);
  return decorator;
}
function storeServiceDependency(id, target, index) {
  if (target[DI_TARGET] === target) {
    target[DI_DEPENDENCIES].push({ id, index });
  } else {
    target[DI_DEPENDENCIES] = [{ id, index }];
    target[DI_TARGET] = target;
  }
}
//# sourceMappingURL=ServiceRegistry.js.map
