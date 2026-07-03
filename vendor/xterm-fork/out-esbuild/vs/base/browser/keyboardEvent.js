"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var keyboardEvent_exports = {};
__export(keyboardEvent_exports, {
  StandardKeyboardEvent: () => StandardKeyboardEvent,
  printKeyboardEvent: () => printKeyboardEvent,
  printStandardKeyboardEvent: () => printStandardKeyboardEvent
});
module.exports = __toCommonJS(keyboardEvent_exports);
var browser = __toESM(require("vs/base/browser/browser"));
var import_keyCodes = require("vs/base/common/keyCodes");
var import_keybindings = require("vs/base/common/keybindings");
var platform = __toESM(require("vs/base/common/platform"));
function extractKeyCode(e) {
  if (e.charCode) {
    const char = String.fromCharCode(e.charCode).toUpperCase();
    return import_keyCodes.KeyCodeUtils.fromString(char);
  }
  const keyCode = e.keyCode;
  if (keyCode === 3) {
    return import_keyCodes.KeyCode.PauseBreak;
  } else if (browser.isFirefox) {
    switch (keyCode) {
      case 59:
        return import_keyCodes.KeyCode.Semicolon;
      case 60:
        if (platform.isLinux) {
          return import_keyCodes.KeyCode.IntlBackslash;
        }
        break;
      case 61:
        return import_keyCodes.KeyCode.Equal;
      // based on: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode#numpad_keys
      case 107:
        return import_keyCodes.KeyCode.NumpadAdd;
      case 109:
        return import_keyCodes.KeyCode.NumpadSubtract;
      case 173:
        return import_keyCodes.KeyCode.Minus;
      case 224:
        if (platform.isMacintosh) {
          return import_keyCodes.KeyCode.Meta;
        }
        break;
    }
  } else if (browser.isWebKit) {
    if (platform.isMacintosh && keyCode === 93) {
      return import_keyCodes.KeyCode.Meta;
    } else if (!platform.isMacintosh && keyCode === 92) {
      return import_keyCodes.KeyCode.Meta;
    }
  }
  return import_keyCodes.EVENT_KEY_CODE_MAP[keyCode] || import_keyCodes.KeyCode.Unknown;
}
const ctrlKeyMod = platform.isMacintosh ? import_keyCodes.KeyMod.WinCtrl : import_keyCodes.KeyMod.CtrlCmd;
const altKeyMod = import_keyCodes.KeyMod.Alt;
const shiftKeyMod = import_keyCodes.KeyMod.Shift;
const metaKeyMod = platform.isMacintosh ? import_keyCodes.KeyMod.CtrlCmd : import_keyCodes.KeyMod.WinCtrl;
function printKeyboardEvent(e) {
  const modifiers = [];
  if (e.ctrlKey) {
    modifiers.push(`ctrl`);
  }
  if (e.shiftKey) {
    modifiers.push(`shift`);
  }
  if (e.altKey) {
    modifiers.push(`alt`);
  }
  if (e.metaKey) {
    modifiers.push(`meta`);
  }
  return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
}
function printStandardKeyboardEvent(e) {
  const modifiers = [];
  if (e.ctrlKey) {
    modifiers.push(`ctrl`);
  }
  if (e.shiftKey) {
    modifiers.push(`shift`);
  }
  if (e.altKey) {
    modifiers.push(`alt`);
  }
  if (e.metaKey) {
    modifiers.push(`meta`);
  }
  return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode} ('${import_keyCodes.KeyCodeUtils.toString(e.keyCode)}')`;
}
class StandardKeyboardEvent {
  constructor(source) {
    this._standardKeyboardEventBrand = true;
    const e = source;
    this.browserEvent = e;
    this.target = e.target;
    this.ctrlKey = e.ctrlKey;
    this.shiftKey = e.shiftKey;
    this.altKey = e.altKey;
    this.metaKey = e.metaKey;
    this.altGraphKey = e.getModifierState?.("AltGraph");
    this.keyCode = extractKeyCode(e);
    this.code = e.code;
    this.ctrlKey = this.ctrlKey || this.keyCode === import_keyCodes.KeyCode.Ctrl;
    this.altKey = this.altKey || this.keyCode === import_keyCodes.KeyCode.Alt;
    this.shiftKey = this.shiftKey || this.keyCode === import_keyCodes.KeyCode.Shift;
    this.metaKey = this.metaKey || this.keyCode === import_keyCodes.KeyCode.Meta;
    this._asKeybinding = this._computeKeybinding();
    this._asKeyCodeChord = this._computeKeyCodeChord();
  }
  preventDefault() {
    if (this.browserEvent && this.browserEvent.preventDefault) {
      this.browserEvent.preventDefault();
    }
  }
  stopPropagation() {
    if (this.browserEvent && this.browserEvent.stopPropagation) {
      this.browserEvent.stopPropagation();
    }
  }
  toKeyCodeChord() {
    return this._asKeyCodeChord;
  }
  equals(other) {
    return this._asKeybinding === other;
  }
  _computeKeybinding() {
    let key = import_keyCodes.KeyCode.Unknown;
    if (this.keyCode !== import_keyCodes.KeyCode.Ctrl && this.keyCode !== import_keyCodes.KeyCode.Shift && this.keyCode !== import_keyCodes.KeyCode.Alt && this.keyCode !== import_keyCodes.KeyCode.Meta) {
      key = this.keyCode;
    }
    let result = 0;
    if (this.ctrlKey) {
      result |= ctrlKeyMod;
    }
    if (this.altKey) {
      result |= altKeyMod;
    }
    if (this.shiftKey) {
      result |= shiftKeyMod;
    }
    if (this.metaKey) {
      result |= metaKeyMod;
    }
    result |= key;
    return result;
  }
  _computeKeyCodeChord() {
    let key = import_keyCodes.KeyCode.Unknown;
    if (this.keyCode !== import_keyCodes.KeyCode.Ctrl && this.keyCode !== import_keyCodes.KeyCode.Shift && this.keyCode !== import_keyCodes.KeyCode.Alt && this.keyCode !== import_keyCodes.KeyCode.Meta) {
      key = this.keyCode;
    }
    return new import_keybindings.KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key);
  }
}
//# sourceMappingURL=keyboardEvent.js.map
