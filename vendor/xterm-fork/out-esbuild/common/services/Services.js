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
var Services_exports = {};
__export(Services_exports, {
  IBufferService: () => IBufferService,
  ICharsetService: () => ICharsetService,
  ICoreMouseService: () => ICoreMouseService,
  ICoreService: () => ICoreService,
  IDecorationService: () => IDecorationService,
  IInstantiationService: () => IInstantiationService,
  ILogService: () => ILogService,
  IOptionsService: () => IOptionsService,
  IOscLinkService: () => IOscLinkService,
  IUnicodeService: () => IUnicodeService,
  LogLevelEnum: () => LogLevelEnum
});
module.exports = __toCommonJS(Services_exports);
var import_ServiceRegistry = require("common/services/ServiceRegistry");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const IBufferService = (0, import_ServiceRegistry.createDecorator)("BufferService");
const ICoreMouseService = (0, import_ServiceRegistry.createDecorator)("CoreMouseService");
const ICoreService = (0, import_ServiceRegistry.createDecorator)("CoreService");
const ICharsetService = (0, import_ServiceRegistry.createDecorator)("CharsetService");
const IInstantiationService = (0, import_ServiceRegistry.createDecorator)("InstantiationService");
var LogLevelEnum = /* @__PURE__ */ ((LogLevelEnum2) => {
  LogLevelEnum2[LogLevelEnum2["TRACE"] = 0] = "TRACE";
  LogLevelEnum2[LogLevelEnum2["DEBUG"] = 1] = "DEBUG";
  LogLevelEnum2[LogLevelEnum2["INFO"] = 2] = "INFO";
  LogLevelEnum2[LogLevelEnum2["WARN"] = 3] = "WARN";
  LogLevelEnum2[LogLevelEnum2["ERROR"] = 4] = "ERROR";
  LogLevelEnum2[LogLevelEnum2["OFF"] = 5] = "OFF";
  return LogLevelEnum2;
})(LogLevelEnum || {});
const ILogService = (0, import_ServiceRegistry.createDecorator)("LogService");
const IOptionsService = (0, import_ServiceRegistry.createDecorator)("OptionsService");
const IOscLinkService = (0, import_ServiceRegistry.createDecorator)("OscLinkService");
const IUnicodeService = (0, import_ServiceRegistry.createDecorator)("UnicodeService");
const IDecorationService = (0, import_ServiceRegistry.createDecorator)("DecorationService");
//# sourceMappingURL=Services.js.map
