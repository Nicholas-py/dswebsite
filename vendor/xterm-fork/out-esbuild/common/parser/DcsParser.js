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
var DcsParser_exports = {};
__export(DcsParser_exports, {
  DcsHandler: () => DcsHandler,
  DcsParser: () => DcsParser
});
module.exports = __toCommonJS(DcsParser_exports);
var import_TextDecoder = require("common/input/TextDecoder");
var import_Params = require("common/parser/Params");
var import_Constants = require("common/parser/Constants");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const EMPTY_HANDLERS = [];
class DcsParser {
  constructor() {
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._active = EMPTY_HANDLERS;
    this._ident = 0;
    this._handlerFb = () => {
    };
    this._stack = {
      paused: false,
      loopPosition: 0,
      fallThrough: false
    };
  }
  dispose() {
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._handlerFb = () => {
    };
    this._active = EMPTY_HANDLERS;
  }
  registerHandler(ident, handler) {
    if (this._handlers[ident] === void 0) {
      this._handlers[ident] = [];
    }
    const handlerList = this._handlers[ident];
    handlerList.push(handler);
    return {
      dispose: () => {
        const handlerIndex = handlerList.indexOf(handler);
        if (handlerIndex !== -1) {
          handlerList.splice(handlerIndex, 1);
        }
      }
    };
  }
  clearHandler(ident) {
    if (this._handlers[ident]) delete this._handlers[ident];
  }
  setHandlerFallback(handler) {
    this._handlerFb = handler;
  }
  reset() {
    if (this._active.length) {
      for (let j = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; j >= 0; --j) {
        this._active[j].unhook(false);
      }
    }
    this._stack.paused = false;
    this._active = EMPTY_HANDLERS;
    this._ident = 0;
  }
  hook(ident, params) {
    this.reset();
    this._ident = ident;
    this._active = this._handlers[ident] || EMPTY_HANDLERS;
    if (!this._active.length) {
      this._handlerFb(this._ident, "HOOK", params);
    } else {
      for (let j = this._active.length - 1; j >= 0; j--) {
        this._active[j].hook(params);
      }
    }
  }
  put(data, start, end) {
    if (!this._active.length) {
      this._handlerFb(this._ident, "PUT", (0, import_TextDecoder.utf32ToString)(data, start, end));
    } else {
      for (let j = this._active.length - 1; j >= 0; j--) {
        this._active[j].put(data, start, end);
      }
    }
  }
  unhook(success, promiseResult = true) {
    if (!this._active.length) {
      this._handlerFb(this._ident, "UNHOOK", success);
    } else {
      let handlerResult = false;
      let j = this._active.length - 1;
      let fallThrough = false;
      if (this._stack.paused) {
        j = this._stack.loopPosition - 1;
        handlerResult = promiseResult;
        fallThrough = this._stack.fallThrough;
        this._stack.paused = false;
      }
      if (!fallThrough && handlerResult === false) {
        for (; j >= 0; j--) {
          handlerResult = this._active[j].unhook(success);
          if (handlerResult === true) {
            break;
          } else if (handlerResult instanceof Promise) {
            this._stack.paused = true;
            this._stack.loopPosition = j;
            this._stack.fallThrough = false;
            return handlerResult;
          }
        }
        j--;
      }
      for (; j >= 0; j--) {
        handlerResult = this._active[j].unhook(false);
        if (handlerResult instanceof Promise) {
          this._stack.paused = true;
          this._stack.loopPosition = j;
          this._stack.fallThrough = true;
          return handlerResult;
        }
      }
    }
    this._active = EMPTY_HANDLERS;
    this._ident = 0;
  }
}
const EMPTY_PARAMS = new import_Params.Params();
EMPTY_PARAMS.addParam(0);
class DcsHandler {
  constructor(_handler) {
    this._handler = _handler;
    this._data = "";
    this._params = EMPTY_PARAMS;
    this._hitLimit = false;
  }
  hook(params) {
    this._params = params.length > 1 || params.params[0] ? params.clone() : EMPTY_PARAMS;
    this._data = "";
    this._hitLimit = false;
  }
  put(data, start, end) {
    if (this._hitLimit) {
      return;
    }
    this._data += (0, import_TextDecoder.utf32ToString)(data, start, end);
    if (this._data.length > import_Constants.PAYLOAD_LIMIT) {
      this._data = "";
      this._hitLimit = true;
    }
  }
  unhook(success) {
    let ret = false;
    if (this._hitLimit) {
      ret = false;
    } else if (success) {
      ret = this._handler(this._data, this._params);
      if (ret instanceof Promise) {
        return ret.then((res) => {
          this._params = EMPTY_PARAMS;
          this._data = "";
          this._hitLimit = false;
          return res;
        });
      }
    }
    this._params = EMPTY_PARAMS;
    this._data = "";
    this._hitLimit = false;
    return ret;
  }
}
//# sourceMappingURL=DcsParser.js.map
