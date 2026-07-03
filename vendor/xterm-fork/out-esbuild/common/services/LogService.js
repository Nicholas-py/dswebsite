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
var LogService_exports = {};
__export(LogService_exports, {
  LogService: () => LogService,
  setTraceLogger: () => setTraceLogger,
  traceCall: () => traceCall
});
module.exports = __toCommonJS(LogService_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services = require("common/services/Services");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const optionsKeyToLogLevel = {
  trace: import_Services.LogLevelEnum.TRACE,
  debug: import_Services.LogLevelEnum.DEBUG,
  info: import_Services.LogLevelEnum.INFO,
  warn: import_Services.LogLevelEnum.WARN,
  error: import_Services.LogLevelEnum.ERROR,
  off: import_Services.LogLevelEnum.OFF
};
const LOG_PREFIX = "xterm.js: ";
let LogService = class extends import_lifecycle.Disposable {
  constructor(_optionsService) {
    super();
    this._optionsService = _optionsService;
    this._logLevel = import_Services.LogLevelEnum.OFF;
    this._updateLogLevel();
    this._register(this._optionsService.onSpecificOptionChange("logLevel", () => this._updateLogLevel()));
    traceLogger = this;
  }
  get logLevel() {
    return this._logLevel;
  }
  _updateLogLevel() {
    this._logLevel = optionsKeyToLogLevel[this._optionsService.rawOptions.logLevel];
  }
  _evalLazyOptionalParams(optionalParams) {
    for (let i = 0; i < optionalParams.length; i++) {
      if (typeof optionalParams[i] === "function") {
        optionalParams[i] = optionalParams[i]();
      }
    }
  }
  _log(type, message, optionalParams) {
    this._evalLazyOptionalParams(optionalParams);
    type.call(console, (this._optionsService.options.logger ? "" : LOG_PREFIX) + message, ...optionalParams);
  }
  trace(message, ...optionalParams) {
    if (this._logLevel <= import_Services.LogLevelEnum.TRACE) {
      this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, message, optionalParams);
    }
  }
  debug(message, ...optionalParams) {
    if (this._logLevel <= import_Services.LogLevelEnum.DEBUG) {
      this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, message, optionalParams);
    }
  }
  info(message, ...optionalParams) {
    if (this._logLevel <= import_Services.LogLevelEnum.INFO) {
      this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, message, optionalParams);
    }
  }
  warn(message, ...optionalParams) {
    if (this._logLevel <= import_Services.LogLevelEnum.WARN) {
      this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, message, optionalParams);
    }
  }
  error(message, ...optionalParams) {
    if (this._logLevel <= import_Services.LogLevelEnum.ERROR) {
      this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, message, optionalParams);
    }
  }
};
LogService = __decorateClass([
  __decorateParam(0, import_Services.IOptionsService)
], LogService);
let traceLogger;
function setTraceLogger(logger) {
  traceLogger = logger;
}
function traceCall(_target, key, descriptor) {
  if (typeof descriptor.value !== "function") {
    throw new Error("not supported");
  }
  const fnKey = "value";
  const fn = descriptor.value;
  descriptor[fnKey] = function(...args) {
    if (traceLogger.logLevel !== import_Services.LogLevelEnum.TRACE) {
      return fn.apply(this, args);
    }
    traceLogger.trace(`GlyphRenderer#${fn.name}(${args.map((e) => JSON.stringify(e)).join(", ")})`);
    const result = fn.apply(this, args);
    traceLogger.trace(`GlyphRenderer#${fn.name} return`, result);
    return result;
  };
}
//# sourceMappingURL=LogService.js.map
