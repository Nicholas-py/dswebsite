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
var EscapeSequenceParser_exports = {};
__export(EscapeSequenceParser_exports, {
  EscapeSequenceParser: () => EscapeSequenceParser,
  TransitionTable: () => TransitionTable,
  VT500_TRANSITION_TABLE: () => VT500_TRANSITION_TABLE
});
module.exports = __toCommonJS(EscapeSequenceParser_exports);
var import_Types = require("common/parser/Types");
var import_Constants = require("common/parser/Constants");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Params = require("common/parser/Params");
var import_OscParser = require("common/parser/OscParser");
var import_DcsParser = require("common/parser/DcsParser");
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var TableAccess = /* @__PURE__ */ ((TableAccess2) => {
  TableAccess2[TableAccess2["TRANSITION_ACTION_SHIFT"] = 4] = "TRANSITION_ACTION_SHIFT";
  TableAccess2[TableAccess2["TRANSITION_STATE_MASK"] = 15] = "TRANSITION_STATE_MASK";
  TableAccess2[TableAccess2["INDEX_STATE_SHIFT"] = 8] = "INDEX_STATE_SHIFT";
  return TableAccess2;
})(TableAccess || {});
class TransitionTable {
  constructor(length) {
    this.table = new Uint8Array(length);
  }
  /**
   * Set default transition.
   * @param action default action
   * @param next default next state
   */
  setDefault(action, next) {
    this.table.fill(action << 4 /* TRANSITION_ACTION_SHIFT */ | next);
  }
  /**
   * Add a transition to the transition table.
   * @param code input character code
   * @param state current parser state
   * @param action parser action to be done
   * @param next next parser state
   */
  add(code, state, action, next) {
    this.table[state << 8 /* INDEX_STATE_SHIFT */ | code] = action << 4 /* TRANSITION_ACTION_SHIFT */ | next;
  }
  /**
   * Add transitions for multiple input character codes.
   * @param codes input character code array
   * @param state current parser state
   * @param action parser action to be done
   * @param next next parser state
   */
  addMany(codes, state, action, next) {
    for (let i = 0; i < codes.length; i++) {
      this.table[state << 8 /* INDEX_STATE_SHIFT */ | codes[i]] = action << 4 /* TRANSITION_ACTION_SHIFT */ | next;
    }
  }
}
const NON_ASCII_PRINTABLE = 160;
const VT500_TRANSITION_TABLE = function() {
  const table = new TransitionTable(4095);
  const BYTE_VALUES = 256;
  const blueprint = Array.apply(null, Array(BYTE_VALUES)).map((unused, i) => i);
  const r = (start, end) => blueprint.slice(start, end);
  const PRINTABLES = r(32, 127);
  const EXECUTABLES = r(0, 24);
  EXECUTABLES.push(25);
  EXECUTABLES.push.apply(EXECUTABLES, r(28, 32));
  const states = r(import_Constants.ParserState.GROUND, import_Constants.ParserState.DCS_PASSTHROUGH + 1);
  let state;
  table.setDefault(import_Constants.ParserAction.ERROR, import_Constants.ParserState.GROUND);
  table.addMany(PRINTABLES, import_Constants.ParserState.GROUND, import_Constants.ParserAction.PRINT, import_Constants.ParserState.GROUND);
  for (state in states) {
    table.addMany([24, 26, 153, 154], state, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.GROUND);
    table.addMany(r(128, 144), state, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.GROUND);
    table.addMany(r(144, 152), state, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.GROUND);
    table.add(156, state, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.GROUND);
    table.add(27, state, import_Constants.ParserAction.CLEAR, import_Constants.ParserState.ESCAPE);
    table.add(157, state, import_Constants.ParserAction.OSC_START, import_Constants.ParserState.OSC_STRING);
    table.addMany([152, 158, 159], state, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.SOS_PM_APC_STRING);
    table.add(155, state, import_Constants.ParserAction.CLEAR, import_Constants.ParserState.CSI_ENTRY);
    table.add(144, state, import_Constants.ParserAction.CLEAR, import_Constants.ParserState.DCS_ENTRY);
  }
  table.addMany(EXECUTABLES, import_Constants.ParserState.GROUND, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.GROUND);
  table.addMany(EXECUTABLES, import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.ESCAPE);
  table.add(127, import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.ESCAPE);
  table.addMany(EXECUTABLES, import_Constants.ParserState.OSC_STRING, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.OSC_STRING);
  table.addMany(EXECUTABLES, import_Constants.ParserState.CSI_ENTRY, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.CSI_ENTRY);
  table.add(127, import_Constants.ParserState.CSI_ENTRY, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_ENTRY);
  table.addMany(EXECUTABLES, import_Constants.ParserState.CSI_PARAM, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.CSI_PARAM);
  table.add(127, import_Constants.ParserState.CSI_PARAM, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_PARAM);
  table.addMany(EXECUTABLES, import_Constants.ParserState.CSI_IGNORE, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.CSI_IGNORE);
  table.addMany(EXECUTABLES, import_Constants.ParserState.CSI_INTERMEDIATE, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.CSI_INTERMEDIATE);
  table.add(127, import_Constants.ParserState.CSI_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_INTERMEDIATE);
  table.addMany(EXECUTABLES, import_Constants.ParserState.ESCAPE_INTERMEDIATE, import_Constants.ParserAction.EXECUTE, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
  table.add(127, import_Constants.ParserState.ESCAPE_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
  table.add(93, import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.OSC_START, import_Constants.ParserState.OSC_STRING);
  table.addMany(PRINTABLES, import_Constants.ParserState.OSC_STRING, import_Constants.ParserAction.OSC_PUT, import_Constants.ParserState.OSC_STRING);
  table.add(127, import_Constants.ParserState.OSC_STRING, import_Constants.ParserAction.OSC_PUT, import_Constants.ParserState.OSC_STRING);
  table.addMany([156, 27, 24, 26, 7], import_Constants.ParserState.OSC_STRING, import_Constants.ParserAction.OSC_END, import_Constants.ParserState.GROUND);
  table.addMany(r(28, 32), import_Constants.ParserState.OSC_STRING, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.OSC_STRING);
  table.addMany([88, 94, 95], import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.SOS_PM_APC_STRING);
  table.addMany(PRINTABLES, import_Constants.ParserState.SOS_PM_APC_STRING, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.SOS_PM_APC_STRING);
  table.addMany(EXECUTABLES, import_Constants.ParserState.SOS_PM_APC_STRING, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.SOS_PM_APC_STRING);
  table.add(156, import_Constants.ParserState.SOS_PM_APC_STRING, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.GROUND);
  table.add(127, import_Constants.ParserState.SOS_PM_APC_STRING, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.SOS_PM_APC_STRING);
  table.add(91, import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.CLEAR, import_Constants.ParserState.CSI_ENTRY);
  table.addMany(r(64, 127), import_Constants.ParserState.CSI_ENTRY, import_Constants.ParserAction.CSI_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany(r(48, 60), import_Constants.ParserState.CSI_ENTRY, import_Constants.ParserAction.PARAM, import_Constants.ParserState.CSI_PARAM);
  table.addMany([60, 61, 62, 63], import_Constants.ParserState.CSI_ENTRY, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.CSI_PARAM);
  table.addMany(r(48, 60), import_Constants.ParserState.CSI_PARAM, import_Constants.ParserAction.PARAM, import_Constants.ParserState.CSI_PARAM);
  table.addMany(r(64, 127), import_Constants.ParserState.CSI_PARAM, import_Constants.ParserAction.CSI_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany([60, 61, 62, 63], import_Constants.ParserState.CSI_PARAM, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_IGNORE);
  table.addMany(r(32, 64), import_Constants.ParserState.CSI_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_IGNORE);
  table.add(127, import_Constants.ParserState.CSI_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_IGNORE);
  table.addMany(r(64, 127), import_Constants.ParserState.CSI_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.GROUND);
  table.addMany(r(32, 48), import_Constants.ParserState.CSI_ENTRY, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.CSI_INTERMEDIATE);
  table.addMany(r(32, 48), import_Constants.ParserState.CSI_INTERMEDIATE, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.CSI_INTERMEDIATE);
  table.addMany(r(48, 64), import_Constants.ParserState.CSI_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_IGNORE);
  table.addMany(r(64, 127), import_Constants.ParserState.CSI_INTERMEDIATE, import_Constants.ParserAction.CSI_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany(r(32, 48), import_Constants.ParserState.CSI_PARAM, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.CSI_INTERMEDIATE);
  table.addMany(r(32, 48), import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
  table.addMany(r(32, 48), import_Constants.ParserState.ESCAPE_INTERMEDIATE, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.ESCAPE_INTERMEDIATE);
  table.addMany(r(48, 127), import_Constants.ParserState.ESCAPE_INTERMEDIATE, import_Constants.ParserAction.ESC_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany(r(48, 80), import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.ESC_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany(r(81, 88), import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.ESC_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany([89, 90, 92], import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.ESC_DISPATCH, import_Constants.ParserState.GROUND);
  table.addMany(r(96, 127), import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.ESC_DISPATCH, import_Constants.ParserState.GROUND);
  table.add(80, import_Constants.ParserState.ESCAPE, import_Constants.ParserAction.CLEAR, import_Constants.ParserState.DCS_ENTRY);
  table.addMany(EXECUTABLES, import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_ENTRY);
  table.add(127, import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_ENTRY);
  table.addMany(r(28, 32), import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_ENTRY);
  table.addMany(r(32, 48), import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.DCS_INTERMEDIATE);
  table.addMany(r(48, 60), import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.PARAM, import_Constants.ParserState.DCS_PARAM);
  table.addMany([60, 61, 62, 63], import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.DCS_PARAM);
  table.addMany(EXECUTABLES, import_Constants.ParserState.DCS_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_IGNORE);
  table.addMany(r(32, 128), import_Constants.ParserState.DCS_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_IGNORE);
  table.addMany(r(28, 32), import_Constants.ParserState.DCS_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_IGNORE);
  table.addMany(EXECUTABLES, import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_PARAM);
  table.add(127, import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_PARAM);
  table.addMany(r(28, 32), import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_PARAM);
  table.addMany(r(48, 60), import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.PARAM, import_Constants.ParserState.DCS_PARAM);
  table.addMany([60, 61, 62, 63], import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_IGNORE);
  table.addMany(r(32, 48), import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.DCS_INTERMEDIATE);
  table.addMany(EXECUTABLES, import_Constants.ParserState.DCS_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_INTERMEDIATE);
  table.add(127, import_Constants.ParserState.DCS_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_INTERMEDIATE);
  table.addMany(r(28, 32), import_Constants.ParserState.DCS_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_INTERMEDIATE);
  table.addMany(r(32, 48), import_Constants.ParserState.DCS_INTERMEDIATE, import_Constants.ParserAction.COLLECT, import_Constants.ParserState.DCS_INTERMEDIATE);
  table.addMany(r(48, 64), import_Constants.ParserState.DCS_INTERMEDIATE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_IGNORE);
  table.addMany(r(64, 127), import_Constants.ParserState.DCS_INTERMEDIATE, import_Constants.ParserAction.DCS_HOOK, import_Constants.ParserState.DCS_PASSTHROUGH);
  table.addMany(r(64, 127), import_Constants.ParserState.DCS_PARAM, import_Constants.ParserAction.DCS_HOOK, import_Constants.ParserState.DCS_PASSTHROUGH);
  table.addMany(r(64, 127), import_Constants.ParserState.DCS_ENTRY, import_Constants.ParserAction.DCS_HOOK, import_Constants.ParserState.DCS_PASSTHROUGH);
  table.addMany(EXECUTABLES, import_Constants.ParserState.DCS_PASSTHROUGH, import_Constants.ParserAction.DCS_PUT, import_Constants.ParserState.DCS_PASSTHROUGH);
  table.addMany(PRINTABLES, import_Constants.ParserState.DCS_PASSTHROUGH, import_Constants.ParserAction.DCS_PUT, import_Constants.ParserState.DCS_PASSTHROUGH);
  table.add(127, import_Constants.ParserState.DCS_PASSTHROUGH, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_PASSTHROUGH);
  table.addMany([27, 156, 24, 26], import_Constants.ParserState.DCS_PASSTHROUGH, import_Constants.ParserAction.DCS_UNHOOK, import_Constants.ParserState.GROUND);
  table.add(NON_ASCII_PRINTABLE, import_Constants.ParserState.GROUND, import_Constants.ParserAction.PRINT, import_Constants.ParserState.GROUND);
  table.add(NON_ASCII_PRINTABLE, import_Constants.ParserState.OSC_STRING, import_Constants.ParserAction.OSC_PUT, import_Constants.ParserState.OSC_STRING);
  table.add(NON_ASCII_PRINTABLE, import_Constants.ParserState.CSI_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.CSI_IGNORE);
  table.add(NON_ASCII_PRINTABLE, import_Constants.ParserState.DCS_IGNORE, import_Constants.ParserAction.IGNORE, import_Constants.ParserState.DCS_IGNORE);
  table.add(NON_ASCII_PRINTABLE, import_Constants.ParserState.DCS_PASSTHROUGH, import_Constants.ParserAction.DCS_PUT, import_Constants.ParserState.DCS_PASSTHROUGH);
  return table;
}();
class EscapeSequenceParser extends import_lifecycle.Disposable {
  constructor(_transitions = VT500_TRANSITION_TABLE) {
    super();
    this._transitions = _transitions;
    // parser stack save for async handler support
    this._parseStack = {
      state: import_Types.ParserStackType.NONE,
      handlers: [],
      handlerPos: 0,
      transition: 0,
      chunkPos: 0
    };
    this.initialState = import_Constants.ParserState.GROUND;
    this.currentState = this.initialState;
    this._params = new import_Params.Params();
    this._params.addParam(0);
    this._collect = 0;
    this.precedingJoinState = 0;
    this._printHandlerFb = (data, start, end) => {
    };
    this._executeHandlerFb = (code) => {
    };
    this._csiHandlerFb = (ident, params) => {
    };
    this._escHandlerFb = (ident) => {
    };
    this._errorHandlerFb = (state) => state;
    this._printHandler = this._printHandlerFb;
    this._executeHandlers = /* @__PURE__ */ Object.create(null);
    this._csiHandlers = /* @__PURE__ */ Object.create(null);
    this._escHandlers = /* @__PURE__ */ Object.create(null);
    this._register((0, import_lifecycle.toDisposable)(() => {
      this._csiHandlers = /* @__PURE__ */ Object.create(null);
      this._executeHandlers = /* @__PURE__ */ Object.create(null);
      this._escHandlers = /* @__PURE__ */ Object.create(null);
    }));
    this._oscParser = this._register(new import_OscParser.OscParser());
    this._dcsParser = this._register(new import_DcsParser.DcsParser());
    this._errorHandler = this._errorHandlerFb;
    this.registerEscHandler({ final: "\\" }, () => true);
  }
  _identifier(id, finalRange = [64, 126]) {
    let res = 0;
    if (id.prefix) {
      if (id.prefix.length > 1) {
        throw new Error("only one byte as prefix supported");
      }
      res = id.prefix.charCodeAt(0);
      if (res && 60 > res || res > 63) {
        throw new Error("prefix must be in range 0x3c .. 0x3f");
      }
    }
    if (id.intermediates) {
      if (id.intermediates.length > 2) {
        throw new Error("only two bytes as intermediates are supported");
      }
      for (let i = 0; i < id.intermediates.length; ++i) {
        const intermediate = id.intermediates.charCodeAt(i);
        if (32 > intermediate || intermediate > 47) {
          throw new Error("intermediate must be in range 0x20 .. 0x2f");
        }
        res <<= 8;
        res |= intermediate;
      }
    }
    if (id.final.length !== 1) {
      throw new Error("final must be a single byte");
    }
    const finalCode = id.final.charCodeAt(0);
    if (finalRange[0] > finalCode || finalCode > finalRange[1]) {
      throw new Error(`final must be in range ${finalRange[0]} .. ${finalRange[1]}`);
    }
    res <<= 8;
    res |= finalCode;
    return res;
  }
  identToString(ident) {
    const res = [];
    while (ident) {
      res.push(String.fromCharCode(ident & 255));
      ident >>= 8;
    }
    return res.reverse().join("");
  }
  setPrintHandler(handler) {
    this._printHandler = handler;
  }
  clearPrintHandler() {
    this._printHandler = this._printHandlerFb;
  }
  registerEscHandler(id, handler) {
    const ident = this._identifier(id, [48, 126]);
    if (this._escHandlers[ident] === void 0) {
      this._escHandlers[ident] = [];
    }
    const handlerList = this._escHandlers[ident];
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
  clearEscHandler(id) {
    if (this._escHandlers[this._identifier(id, [48, 126])]) delete this._escHandlers[this._identifier(id, [48, 126])];
  }
  setEscHandlerFallback(handler) {
    this._escHandlerFb = handler;
  }
  setExecuteHandler(flag, handler) {
    this._executeHandlers[flag.charCodeAt(0)] = handler;
  }
  clearExecuteHandler(flag) {
    if (this._executeHandlers[flag.charCodeAt(0)]) delete this._executeHandlers[flag.charCodeAt(0)];
  }
  setExecuteHandlerFallback(handler) {
    this._executeHandlerFb = handler;
  }
  registerCsiHandler(id, handler) {
    const ident = this._identifier(id);
    if (this._csiHandlers[ident] === void 0) {
      this._csiHandlers[ident] = [];
    }
    const handlerList = this._csiHandlers[ident];
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
  clearCsiHandler(id) {
    if (this._csiHandlers[this._identifier(id)]) delete this._csiHandlers[this._identifier(id)];
  }
  setCsiHandlerFallback(callback) {
    this._csiHandlerFb = callback;
  }
  registerDcsHandler(id, handler) {
    return this._dcsParser.registerHandler(this._identifier(id), handler);
  }
  clearDcsHandler(id) {
    this._dcsParser.clearHandler(this._identifier(id));
  }
  setDcsHandlerFallback(handler) {
    this._dcsParser.setHandlerFallback(handler);
  }
  registerOscHandler(ident, handler) {
    return this._oscParser.registerHandler(ident, handler);
  }
  clearOscHandler(ident) {
    this._oscParser.clearHandler(ident);
  }
  setOscHandlerFallback(handler) {
    this._oscParser.setHandlerFallback(handler);
  }
  setErrorHandler(callback) {
    this._errorHandler = callback;
  }
  clearErrorHandler() {
    this._errorHandler = this._errorHandlerFb;
  }
  /**
   * Reset parser to initial values.
   *
   * This can also be used to lift the improper continuation error condition
   * when dealing with async handlers. Use this only as a last resort to silence
   * that error when the terminal has no pending data to be processed. Note that
   * the interrupted async handler might continue its work in the future messing
   * up the terminal state even further.
   */
  reset() {
    this.currentState = this.initialState;
    this._oscParser.reset();
    this._dcsParser.reset();
    this._params.reset();
    this._params.addParam(0);
    this._collect = 0;
    this.precedingJoinState = 0;
    if (this._parseStack.state !== import_Types.ParserStackType.NONE) {
      this._parseStack.state = import_Types.ParserStackType.RESET;
      this._parseStack.handlers = [];
    }
  }
  /**
   * Async parse support.
   */
  _preserveStack(state, handlers, handlerPos, transition, chunkPos) {
    this._parseStack.state = state;
    this._parseStack.handlers = handlers;
    this._parseStack.handlerPos = handlerPos;
    this._parseStack.transition = transition;
    this._parseStack.chunkPos = chunkPos;
  }
  /**
   * Parse UTF32 codepoints in `data` up to `length`.
   *
   * Note: For several actions with high data load the parsing is optimized
   * by using local read ahead loops with hardcoded conditions to
   * avoid costly table lookups. Make sure that any change of table values
   * will be reflected in the loop conditions as well and vice versa.
   * Affected states/actions:
   * - GROUND:PRINT
   * - CSI_PARAM:PARAM
   * - DCS_PARAM:PARAM
   * - OSC_STRING:OSC_PUT
   * - DCS_PASSTHROUGH:DCS_PUT
   *
   * Note on asynchronous handler support:
   * Any handler returning a promise will be treated as asynchronous.
   * To keep the in-band blocking working for async handlers, `parse` pauses execution,
   * creates a stack save and returns the promise to the caller.
   * For proper continuation of the paused state it is important
   * to await the promise resolving. On resolve the parse must be repeated
   * with the same chunk of data and the resolved value in `promiseResult`
   * until no promise is returned.
   *
   * Important: With only sync handlers defined, parsing is completely synchronous as well.
   * As soon as an async handler is involved, synchronous parsing is not possible anymore.
   *
   * Boilerplate for proper parsing of multiple chunks with async handlers:
   *
   * ```typescript
   * async function parseMultipleChunks(chunks: Uint32Array[]): Promise<void> {
   *   for (const chunk of chunks) {
   *     let result: void | Promise<boolean>;
   *     let prev: boolean | undefined;
   *     while (result = parser.parse(chunk, chunk.length, prev)) {
   *       prev = await result;
   *     }
   *   }
   *   // finished parsing all chunks...
   * }
   * ```
   */
  parse(data, length, promiseResult) {
    let code = 0;
    let transition = 0;
    let start = 0;
    let handlerResult;
    if (this._parseStack.state) {
      if (this._parseStack.state === import_Types.ParserStackType.RESET) {
        this._parseStack.state = import_Types.ParserStackType.NONE;
        start = this._parseStack.chunkPos + 1;
      } else {
        if (promiseResult === void 0 || this._parseStack.state === import_Types.ParserStackType.FAIL) {
          this._parseStack.state = import_Types.ParserStackType.FAIL;
          throw new Error("improper continuation due to previous async handler, giving up parsing");
        }
        const handlers = this._parseStack.handlers;
        let handlerPos = this._parseStack.handlerPos - 1;
        switch (this._parseStack.state) {
          case import_Types.ParserStackType.CSI:
            if (promiseResult === false && handlerPos > -1) {
              for (; handlerPos >= 0; handlerPos--) {
                handlerResult = handlers[handlerPos](this._params);
                if (handlerResult === true) {
                  break;
                } else if (handlerResult instanceof Promise) {
                  this._parseStack.handlerPos = handlerPos;
                  return handlerResult;
                }
              }
            }
            this._parseStack.handlers = [];
            break;
          case import_Types.ParserStackType.ESC:
            if (promiseResult === false && handlerPos > -1) {
              for (; handlerPos >= 0; handlerPos--) {
                handlerResult = handlers[handlerPos]();
                if (handlerResult === true) {
                  break;
                } else if (handlerResult instanceof Promise) {
                  this._parseStack.handlerPos = handlerPos;
                  return handlerResult;
                }
              }
            }
            this._parseStack.handlers = [];
            break;
          case import_Types.ParserStackType.DCS:
            code = data[this._parseStack.chunkPos];
            handlerResult = this._dcsParser.unhook(code !== 24 && code !== 26, promiseResult);
            if (handlerResult) {
              return handlerResult;
            }
            if (code === 27) this._parseStack.transition |= import_Constants.ParserState.ESCAPE;
            this._params.reset();
            this._params.addParam(0);
            this._collect = 0;
            break;
          case import_Types.ParserStackType.OSC:
            code = data[this._parseStack.chunkPos];
            handlerResult = this._oscParser.end(code !== 24 && code !== 26, promiseResult);
            if (handlerResult) {
              return handlerResult;
            }
            if (code === 27) this._parseStack.transition |= import_Constants.ParserState.ESCAPE;
            this._params.reset();
            this._params.addParam(0);
            this._collect = 0;
            break;
        }
        this._parseStack.state = import_Types.ParserStackType.NONE;
        start = this._parseStack.chunkPos + 1;
        this.precedingJoinState = 0;
        this.currentState = this._parseStack.transition & 15 /* TRANSITION_STATE_MASK */;
      }
    }
    for (let i = start; i < length; ++i) {
      code = data[i];
      transition = this._transitions.table[this.currentState << 8 /* INDEX_STATE_SHIFT */ | (code < 160 ? code : NON_ASCII_PRINTABLE)];
      switch (transition >> 4 /* TRANSITION_ACTION_SHIFT */) {
        case import_Constants.ParserAction.PRINT:
          for (let j2 = i + 1; ; ++j2) {
            if (j2 >= length || (code = data[j2]) < 32 || code > 126 && code < NON_ASCII_PRINTABLE) {
              this._printHandler(data, i, j2);
              i = j2 - 1;
              break;
            }
            if (++j2 >= length || (code = data[j2]) < 32 || code > 126 && code < NON_ASCII_PRINTABLE) {
              this._printHandler(data, i, j2);
              i = j2 - 1;
              break;
            }
            if (++j2 >= length || (code = data[j2]) < 32 || code > 126 && code < NON_ASCII_PRINTABLE) {
              this._printHandler(data, i, j2);
              i = j2 - 1;
              break;
            }
            if (++j2 >= length || (code = data[j2]) < 32 || code > 126 && code < NON_ASCII_PRINTABLE) {
              this._printHandler(data, i, j2);
              i = j2 - 1;
              break;
            }
          }
          break;
        case import_Constants.ParserAction.EXECUTE:
          if (this._executeHandlers[code]) this._executeHandlers[code]();
          else this._executeHandlerFb(code);
          this.precedingJoinState = 0;
          break;
        case import_Constants.ParserAction.IGNORE:
          break;
        case import_Constants.ParserAction.ERROR:
          const inject = this._errorHandler(
            {
              position: i,
              code,
              currentState: this.currentState,
              collect: this._collect,
              params: this._params,
              abort: false
            }
          );
          if (inject.abort) return;
          break;
        case import_Constants.ParserAction.CSI_DISPATCH:
          const handlers = this._csiHandlers[this._collect << 8 | code];
          let j = handlers ? handlers.length - 1 : -1;
          for (; j >= 0; j--) {
            handlerResult = handlers[j](this._params);
            if (handlerResult === true) {
              break;
            } else if (handlerResult instanceof Promise) {
              this._preserveStack(import_Types.ParserStackType.CSI, handlers, j, transition, i);
              return handlerResult;
            }
          }
          if (j < 0) {
            this._csiHandlerFb(this._collect << 8 | code, this._params);
          }
          this.precedingJoinState = 0;
          break;
        case import_Constants.ParserAction.PARAM:
          do {
            switch (code) {
              case 59:
                this._params.addParam(0);
                break;
              case 58:
                this._params.addSubParam(-1);
                break;
              default:
                this._params.addDigit(code - 48);
            }
          } while (++i < length && (code = data[i]) > 47 && code < 60);
          i--;
          break;
        case import_Constants.ParserAction.COLLECT:
          this._collect <<= 8;
          this._collect |= code;
          break;
        case import_Constants.ParserAction.ESC_DISPATCH:
          const handlersEsc = this._escHandlers[this._collect << 8 | code];
          let jj = handlersEsc ? handlersEsc.length - 1 : -1;
          for (; jj >= 0; jj--) {
            handlerResult = handlersEsc[jj]();
            if (handlerResult === true) {
              break;
            } else if (handlerResult instanceof Promise) {
              this._preserveStack(import_Types.ParserStackType.ESC, handlersEsc, jj, transition, i);
              return handlerResult;
            }
          }
          if (jj < 0) {
            this._escHandlerFb(this._collect << 8 | code);
          }
          this.precedingJoinState = 0;
          break;
        case import_Constants.ParserAction.CLEAR:
          this._params.reset();
          this._params.addParam(0);
          this._collect = 0;
          break;
        case import_Constants.ParserAction.DCS_HOOK:
          this._dcsParser.hook(this._collect << 8 | code, this._params);
          break;
        case import_Constants.ParserAction.DCS_PUT:
          for (let j2 = i + 1; ; ++j2) {
            if (j2 >= length || (code = data[j2]) === 24 || code === 26 || code === 27 || code > 127 && code < NON_ASCII_PRINTABLE) {
              this._dcsParser.put(data, i, j2);
              i = j2 - 1;
              break;
            }
          }
          break;
        case import_Constants.ParserAction.DCS_UNHOOK:
          handlerResult = this._dcsParser.unhook(code !== 24 && code !== 26);
          if (handlerResult) {
            this._preserveStack(import_Types.ParserStackType.DCS, [], 0, transition, i);
            return handlerResult;
          }
          if (code === 27) transition |= import_Constants.ParserState.ESCAPE;
          this._params.reset();
          this._params.addParam(0);
          this._collect = 0;
          this.precedingJoinState = 0;
          break;
        case import_Constants.ParserAction.OSC_START:
          this._oscParser.start();
          break;
        case import_Constants.ParserAction.OSC_PUT:
          for (let j2 = i + 1; ; j2++) {
            if (j2 >= length || (code = data[j2]) < 32 || code > 127 && code < NON_ASCII_PRINTABLE) {
              this._oscParser.put(data, i, j2);
              i = j2 - 1;
              break;
            }
          }
          break;
        case import_Constants.ParserAction.OSC_END:
          handlerResult = this._oscParser.end(code !== 24 && code !== 26);
          if (handlerResult) {
            this._preserveStack(import_Types.ParserStackType.OSC, [], 0, transition, i);
            return handlerResult;
          }
          if (code === 27) transition |= import_Constants.ParserState.ESCAPE;
          this._params.reset();
          this._params.addParam(0);
          this._collect = 0;
          this.precedingJoinState = 0;
          break;
      }
      this.currentState = transition & 15 /* TRANSITION_STATE_MASK */;
    }
  }
}
//# sourceMappingURL=EscapeSequenceParser.js.map
