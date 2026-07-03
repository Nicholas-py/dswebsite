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
var keybindings_exports = {};
__export(keybindings_exports, {
  KeyCodeChord: () => KeyCodeChord,
  Keybinding: () => Keybinding,
  ResolvedChord: () => ResolvedChord,
  ResolvedKeybinding: () => ResolvedKeybinding,
  ScanCodeChord: () => ScanCodeChord,
  createSimpleKeybinding: () => createSimpleKeybinding,
  decodeKeybinding: () => decodeKeybinding
});
module.exports = __toCommonJS(keybindings_exports);
var import_errors = require("vs/base/common/errors");
var import_keyCodes = require("vs/base/common/keyCodes");
var import_platform = require("vs/base/common/platform");
var BinaryKeybindingsMask = /* @__PURE__ */ ((BinaryKeybindingsMask2) => {
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["CtrlCmd"] = 2048] = "CtrlCmd";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["Shift"] = 1024] = "Shift";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["Alt"] = 512] = "Alt";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["WinCtrl"] = 256] = "WinCtrl";
  BinaryKeybindingsMask2[BinaryKeybindingsMask2["KeyCode"] = 255] = "KeyCode";
  return BinaryKeybindingsMask2;
})(BinaryKeybindingsMask || {});
function decodeKeybinding(keybinding, OS) {
  if (typeof keybinding === "number") {
    if (keybinding === 0) {
      return null;
    }
    const firstChord = (keybinding & 65535) >>> 0;
    const secondChord = (keybinding & 4294901760) >>> 16;
    if (secondChord !== 0) {
      return new Keybinding([
        createSimpleKeybinding(firstChord, OS),
        createSimpleKeybinding(secondChord, OS)
      ]);
    }
    return new Keybinding([createSimpleKeybinding(firstChord, OS)]);
  } else {
    const chords = [];
    for (let i = 0; i < keybinding.length; i++) {
      chords.push(createSimpleKeybinding(keybinding[i], OS));
    }
    return new Keybinding(chords);
  }
}
function createSimpleKeybinding(keybinding, OS) {
  const ctrlCmd = keybinding & 2048 /* CtrlCmd */ ? true : false;
  const winCtrl = keybinding & 256 /* WinCtrl */ ? true : false;
  const ctrlKey = OS === import_platform.OperatingSystem.Macintosh ? winCtrl : ctrlCmd;
  const shiftKey = keybinding & 1024 /* Shift */ ? true : false;
  const altKey = keybinding & 512 /* Alt */ ? true : false;
  const metaKey = OS === import_platform.OperatingSystem.Macintosh ? ctrlCmd : winCtrl;
  const keyCode = keybinding & 255 /* KeyCode */;
  return new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode);
}
class KeyCodeChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyCode = keyCode;
  }
  equals(other) {
    return other instanceof KeyCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.keyCode === other.keyCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
  }
  isModifierKey() {
    return this.keyCode === import_keyCodes.KeyCode.Unknown || this.keyCode === import_keyCodes.KeyCode.Ctrl || this.keyCode === import_keyCodes.KeyCode.Meta || this.keyCode === import_keyCodes.KeyCode.Alt || this.keyCode === import_keyCodes.KeyCode.Shift;
  }
  toKeybinding() {
    return new Keybinding([this]);
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && this.keyCode === import_keyCodes.KeyCode.Ctrl || this.shiftKey && this.keyCode === import_keyCodes.KeyCode.Shift || this.altKey && this.keyCode === import_keyCodes.KeyCode.Alt || this.metaKey && this.keyCode === import_keyCodes.KeyCode.Meta;
  }
}
class ScanCodeChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.scanCode = scanCode;
  }
  equals(other) {
    return other instanceof ScanCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.scanCode === other.scanCode;
  }
  getHashCode() {
    const ctrl = this.ctrlKey ? "1" : "0";
    const shift = this.shiftKey ? "1" : "0";
    const alt = this.altKey ? "1" : "0";
    const meta = this.metaKey ? "1" : "0";
    return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
  }
  /**
   * Does this keybinding refer to the key code of a modifier and it also has the modifier flag?
   */
  isDuplicateModifierCase() {
    return this.ctrlKey && (this.scanCode === import_keyCodes.ScanCode.ControlLeft || this.scanCode === import_keyCodes.ScanCode.ControlRight) || this.shiftKey && (this.scanCode === import_keyCodes.ScanCode.ShiftLeft || this.scanCode === import_keyCodes.ScanCode.ShiftRight) || this.altKey && (this.scanCode === import_keyCodes.ScanCode.AltLeft || this.scanCode === import_keyCodes.ScanCode.AltRight) || this.metaKey && (this.scanCode === import_keyCodes.ScanCode.MetaLeft || this.scanCode === import_keyCodes.ScanCode.MetaRight);
  }
}
class Keybinding {
  constructor(chords) {
    if (chords.length === 0) {
      throw (0, import_errors.illegalArgument)(`chords`);
    }
    this.chords = chords;
  }
  getHashCode() {
    let result = "";
    for (let i = 0, len = this.chords.length; i < len; i++) {
      if (i !== 0) {
        result += ";";
      }
      result += this.chords[i].getHashCode();
    }
    return result;
  }
  equals(other) {
    if (other === null) {
      return false;
    }
    if (this.chords.length !== other.chords.length) {
      return false;
    }
    for (let i = 0; i < this.chords.length; i++) {
      if (!this.chords[i].equals(other.chords[i])) {
        return false;
      }
    }
    return true;
  }
}
class ResolvedChord {
  constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
    this.ctrlKey = ctrlKey;
    this.shiftKey = shiftKey;
    this.altKey = altKey;
    this.metaKey = metaKey;
    this.keyLabel = keyLabel;
    this.keyAriaLabel = keyAriaLabel;
  }
}
class ResolvedKeybinding {
}
//# sourceMappingURL=keybindings.js.map
