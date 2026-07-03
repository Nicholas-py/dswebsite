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
var Keyboard_exports = {};
__export(Keyboard_exports, {
  evaluateKeyboardEvent: () => evaluateKeyboardEvent
});
module.exports = __toCommonJS(Keyboard_exports);
var import_Types = require("common/Types");
var import_EscapeSequences = require("common/data/EscapeSequences");
/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 */
const KEYCODE_KEY_MAPPINGS = {
  // digits 0-9
  48: ["0", ")"],
  49: ["1", "!"],
  50: ["2", "@"],
  51: ["3", "#"],
  52: ["4", "$"],
  53: ["5", "%"],
  54: ["6", "^"],
  55: ["7", "&"],
  56: ["8", "*"],
  57: ["9", "("],
  // special chars
  186: [";", ":"],
  187: ["=", "+"],
  188: [",", "<"],
  189: ["-", "_"],
  190: [".", ">"],
  191: ["/", "?"],
  192: ["`", "~"],
  219: ["[", "{"],
  220: ["\\", "|"],
  221: ["]", "}"],
  222: ["'", '"']
};
function evaluateKeyboardEvent(ev, applicationCursorMode, isMac, macOptionIsMeta) {
  const result = {
    type: import_Types.KeyboardResultType.SEND_KEY,
    // Whether to cancel event propagation (NOTE: this may not be needed since the event is
    // canceled at the end of keyDown
    cancel: false,
    // The new key even to emit
    key: void 0
  };
  const modifiers = (ev.shiftKey ? 1 : 0) | (ev.altKey ? 2 : 0) | (ev.ctrlKey ? 4 : 0) | (ev.metaKey ? 8 : 0);
  switch (ev.keyCode) {
    case 0:
      if (ev.key === "UIKeyInputUpArrow") {
        if (applicationCursorMode) {
          result.key = import_EscapeSequences.C0.ESC + "OA";
        } else {
          result.key = import_EscapeSequences.C0.ESC + "[A";
        }
      } else if (ev.key === "UIKeyInputLeftArrow") {
        if (applicationCursorMode) {
          result.key = import_EscapeSequences.C0.ESC + "OD";
        } else {
          result.key = import_EscapeSequences.C0.ESC + "[D";
        }
      } else if (ev.key === "UIKeyInputRightArrow") {
        if (applicationCursorMode) {
          result.key = import_EscapeSequences.C0.ESC + "OC";
        } else {
          result.key = import_EscapeSequences.C0.ESC + "[C";
        }
      } else if (ev.key === "UIKeyInputDownArrow") {
        if (applicationCursorMode) {
          result.key = import_EscapeSequences.C0.ESC + "OB";
        } else {
          result.key = import_EscapeSequences.C0.ESC + "[B";
        }
      }
      break;
    case 8:
      result.key = ev.ctrlKey ? "\b" : import_EscapeSequences.C0.DEL;
      if (ev.altKey) {
        result.key = import_EscapeSequences.C0.ESC + result.key;
      }
      break;
    case 9:
      if (ev.shiftKey) {
        result.key = import_EscapeSequences.C0.ESC + "[Z";
        break;
      }
      result.key = import_EscapeSequences.C0.HT;
      result.cancel = true;
      break;
    case 13:
      result.key = ev.altKey ? import_EscapeSequences.C0.ESC + import_EscapeSequences.C0.CR : import_EscapeSequences.C0.CR;
      result.cancel = true;
      break;
    case 27:
      result.key = import_EscapeSequences.C0.ESC;
      if (ev.altKey) {
        result.key = import_EscapeSequences.C0.ESC + import_EscapeSequences.C0.ESC;
      }
      result.cancel = true;
      break;
    case 37:
      if (ev.metaKey) {
        break;
      }
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "D";
        if (result.key === import_EscapeSequences.C0.ESC + "[1;3D") {
          result.key = import_EscapeSequences.C0.ESC + (isMac ? "b" : "[1;5D");
        }
      } else if (applicationCursorMode) {
        result.key = import_EscapeSequences.C0.ESC + "OD";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[D";
      }
      break;
    case 39:
      if (ev.metaKey) {
        break;
      }
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "C";
        if (result.key === import_EscapeSequences.C0.ESC + "[1;3C") {
          result.key = import_EscapeSequences.C0.ESC + (isMac ? "f" : "[1;5C");
        }
      } else if (applicationCursorMode) {
        result.key = import_EscapeSequences.C0.ESC + "OC";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[C";
      }
      break;
    case 38:
      if (ev.metaKey) {
        break;
      }
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "A";
        if (!isMac && result.key === import_EscapeSequences.C0.ESC + "[1;3A") {
          result.key = import_EscapeSequences.C0.ESC + "[1;5A";
        }
      } else if (applicationCursorMode) {
        result.key = import_EscapeSequences.C0.ESC + "OA";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[A";
      }
      break;
    case 40:
      if (ev.metaKey) {
        break;
      }
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "B";
        if (!isMac && result.key === import_EscapeSequences.C0.ESC + "[1;3B") {
          result.key = import_EscapeSequences.C0.ESC + "[1;5B";
        }
      } else if (applicationCursorMode) {
        result.key = import_EscapeSequences.C0.ESC + "OB";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[B";
      }
      break;
    case 45:
      if (!ev.shiftKey && !ev.ctrlKey) {
        result.key = import_EscapeSequences.C0.ESC + "[2~";
      }
      break;
    case 46:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[3;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[3~";
      }
      break;
    case 36:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "H";
      } else if (applicationCursorMode) {
        result.key = import_EscapeSequences.C0.ESC + "OH";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[H";
      }
      break;
    case 35:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "F";
      } else if (applicationCursorMode) {
        result.key = import_EscapeSequences.C0.ESC + "OF";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[F";
      }
      break;
    case 33:
      if (ev.shiftKey) {
        result.type = import_Types.KeyboardResultType.PAGE_UP;
      } else if (ev.ctrlKey) {
        result.key = import_EscapeSequences.C0.ESC + "[5;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[5~";
      }
      break;
    case 34:
      if (ev.shiftKey) {
        result.type = import_Types.KeyboardResultType.PAGE_DOWN;
      } else if (ev.ctrlKey) {
        result.key = import_EscapeSequences.C0.ESC + "[6;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[6~";
      }
      break;
    case 112:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "P";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "OP";
      }
      break;
    case 113:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "Q";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "OQ";
      }
      break;
    case 114:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "R";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "OR";
      }
      break;
    case 115:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[1;" + (modifiers + 1) + "S";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "OS";
      }
      break;
    case 116:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[15;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[15~";
      }
      break;
    case 117:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[17;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[17~";
      }
      break;
    case 118:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[18;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[18~";
      }
      break;
    case 119:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[19;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[19~";
      }
      break;
    case 120:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[20;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[20~";
      }
      break;
    case 121:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[21;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[21~";
      }
      break;
    case 122:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[23;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[23~";
      }
      break;
    case 123:
      if (modifiers) {
        result.key = import_EscapeSequences.C0.ESC + "[24;" + (modifiers + 1) + "~";
      } else {
        result.key = import_EscapeSequences.C0.ESC + "[24~";
      }
      break;
    default:
      if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
        if (ev.keyCode >= 65 && ev.keyCode <= 90) {
          result.key = String.fromCharCode(ev.keyCode - 64);
        } else if (ev.keyCode === 32) {
          result.key = import_EscapeSequences.C0.NUL;
        } else if (ev.keyCode >= 51 && ev.keyCode <= 55) {
          result.key = String.fromCharCode(ev.keyCode - 51 + 27);
        } else if (ev.keyCode === 56) {
          result.key = import_EscapeSequences.C0.DEL;
        } else if (ev.keyCode === 219) {
          result.key = import_EscapeSequences.C0.ESC;
        } else if (ev.keyCode === 220) {
          result.key = import_EscapeSequences.C0.FS;
        } else if (ev.keyCode === 221) {
          result.key = import_EscapeSequences.C0.GS;
        }
      } else if ((!isMac || macOptionIsMeta) && ev.altKey && !ev.metaKey) {
        const keyMapping = KEYCODE_KEY_MAPPINGS[ev.keyCode];
        const key = keyMapping?.[!ev.shiftKey ? 0 : 1];
        if (key) {
          result.key = import_EscapeSequences.C0.ESC + key;
        } else if (ev.keyCode >= 65 && ev.keyCode <= 90) {
          const keyCode = ev.ctrlKey ? ev.keyCode - 64 : ev.keyCode + 32;
          let keyString = String.fromCharCode(keyCode);
          if (ev.shiftKey) {
            keyString = keyString.toUpperCase();
          }
          result.key = import_EscapeSequences.C0.ESC + keyString;
        } else if (ev.keyCode === 32) {
          result.key = import_EscapeSequences.C0.ESC + (ev.ctrlKey ? import_EscapeSequences.C0.NUL : " ");
        } else if (ev.key === "Dead" && ev.code.startsWith("Key")) {
          let keyString = ev.code.slice(3, 4);
          if (!ev.shiftKey) {
            keyString = keyString.toLowerCase();
          }
          result.key = import_EscapeSequences.C0.ESC + keyString;
          result.cancel = true;
        }
      } else if (isMac && !ev.altKey && !ev.ctrlKey && !ev.shiftKey && ev.metaKey) {
        if (ev.keyCode === 65) {
          result.type = import_Types.KeyboardResultType.SELECT_ALL;
        }
      } else if (ev.key && !ev.ctrlKey && !ev.altKey && !ev.metaKey && ev.keyCode >= 48 && ev.key.length === 1) {
        result.key = ev.key;
      } else if (ev.key && ev.ctrlKey) {
        if (ev.key === "_") {
          result.key = import_EscapeSequences.C0.US;
        }
        if (ev.key === "@") {
          result.key = import_EscapeSequences.C0.NUL;
        }
      }
      break;
  }
  return result;
}
//# sourceMappingURL=Keyboard.js.map
