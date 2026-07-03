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
var OscParser_exports = {};
__export(OscParser_exports, {
  OscHandler: () => OscHandler,
  OscParser: () => OscParser
});
module.exports = __toCommonJS(OscParser_exports);
var import_Constants = require("common/parser/Constants");
var import_TextDecoder = require("common/input/TextDecoder");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const EMPTY_HANDLERS = [];
class OscParser {
  constructor() {
    this._state = import_Constants.OscState.START;
    this._active = EMPTY_HANDLERS;
    this._id = -1;
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._handlerFb = () => {
    };
    this._stack = {
      paused: false,
      loopPosition: 0,
      fallThrough: false
    };
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
  dispose() {
    this._handlers = /* @__PURE__ */ Object.create(null);
    this._handlerFb = () => {
    };
    this._active = EMPTY_HANDLERS;
  }
  reset() {
    if (this._state === import_Constants.OscState.PAYLOAD) {
      for (let j = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; j >= 0; --j) {
        this._active[j].end(false);
      }
    }
    this._stack.paused = false;
    this._active = EMPTY_HANDLERS;
    this._id = -1;
    this._state = import_Constants.OscState.START;
  }
  _start() {
    this._active = this._handlers[this._id] || EMPTY_HANDLERS;
    if (!this._active.length) {
      this._handlerFb(this._id, "START");
    } else {
      for (let j = this._active.length - 1; j >= 0; j--) {
        this._active[j].start();
      }
    }
  }
  _put(data, start, end) {
    if (!this._active.length) {
      this._handlerFb(this._id, "PUT", (0, import_TextDecoder.utf32ToString)(data, start, end));
    } else {
      for (let j = this._active.length - 1; j >= 0; j--) {
        this._active[j].put(data, start, end);
      }
    }
  }
  start() {
    this.reset();
    this._state = import_Constants.OscState.ID;
  }
  /**
   * Put data to current OSC command.
   * Expects the identifier of the OSC command in the form
   * OSC id ; payload ST/BEL
   * Payload chunks are not further processed and get
   * directly passed to the handlers.
   */
  put(data, start, end) {
    if (this._state === import_Constants.OscState.ABORT) {
      return;
    }
    if (this._state === import_Constants.OscState.ID) {
      while (start < end) {
        const code = data[start++];
        if (code === 59) {
          this._state = import_Constants.OscState.PAYLOAD;
          this._start();
          break;
        }
        if (code < 48 || 57 < code) {
          this._state = import_Constants.OscState.ABORT;
          return;
        }
        if (this._id === -1) {
          this._id = 0;
        }
        this._id = this._id * 10 + code - 48;
      }
    }
    if (this._state === import_Constants.OscState.PAYLOAD && end - start > 0) {
      this._put(data, start, end);
    }
  }
  /**
   * Indicates end of an OSC command.
   * Whether the OSC got aborted or finished normally
   * is indicated by `success`.
   */
  end(success, promiseResult = true) {
    if (this._state === import_Constants.OscState.START) {
      return;
    }
    if (this._state !== import_Constants.OscState.ABORT) {
      if (this._state === import_Constants.OscState.ID) {
        this._start();
      }
      if (!this._active.length) {
        this._handlerFb(this._id, "END", success);
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
            handlerResult = this._active[j].end(success);
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
          handlerResult = this._active[j].end(false);
          if (handlerResult instanceof Promise) {
            this._stack.paused = true;
            this._stack.loopPosition = j;
            this._stack.fallThrough = true;
            return handlerResult;
          }
        }
      }
    }
    this._active = EMPTY_HANDLERS;
    this._id = -1;
    this._state = import_Constants.OscState.START;
  }
}
class OscHandler {
  constructor(_handler) {
    this._handler = _handler;
    this._data = "";
    this._hitLimit = false;
  }
  start() {
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
  end(success) {
    let ret = false;
    if (this._hitLimit) {
      ret = false;
    } else if (success) {
      ret = this._handler(this._data);
      if (ret instanceof Promise) {
        return ret.then((res) => {
          this._data = "";
          this._hitLimit = false;
          return res;
        });
      }
    }
    this._data = "";
    this._hitLimit = false;
    return ret;
  }
}
//# sourceMappingURL=OscParser.js.map
