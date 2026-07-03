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
var keyCodes_exports = {};
__export(keyCodes_exports, {
  EVENT_KEY_CODE_MAP: () => EVENT_KEY_CODE_MAP,
  KeyChord: () => KeyChord,
  KeyCode: () => KeyCode,
  KeyCodeUtils: () => KeyCodeUtils,
  KeyMod: () => KeyMod,
  NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE: () => NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE,
  ScanCode: () => ScanCode,
  ScanCodeUtils: () => ScanCodeUtils
});
module.exports = __toCommonJS(keyCodes_exports);
var KeyCode = /* @__PURE__ */ ((KeyCode2) => {
  KeyCode2[KeyCode2["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
  KeyCode2[KeyCode2["Unknown"] = 0] = "Unknown";
  KeyCode2[KeyCode2["Backspace"] = 1] = "Backspace";
  KeyCode2[KeyCode2["Tab"] = 2] = "Tab";
  KeyCode2[KeyCode2["Enter"] = 3] = "Enter";
  KeyCode2[KeyCode2["Shift"] = 4] = "Shift";
  KeyCode2[KeyCode2["Ctrl"] = 5] = "Ctrl";
  KeyCode2[KeyCode2["Alt"] = 6] = "Alt";
  KeyCode2[KeyCode2["PauseBreak"] = 7] = "PauseBreak";
  KeyCode2[KeyCode2["CapsLock"] = 8] = "CapsLock";
  KeyCode2[KeyCode2["Escape"] = 9] = "Escape";
  KeyCode2[KeyCode2["Space"] = 10] = "Space";
  KeyCode2[KeyCode2["PageUp"] = 11] = "PageUp";
  KeyCode2[KeyCode2["PageDown"] = 12] = "PageDown";
  KeyCode2[KeyCode2["End"] = 13] = "End";
  KeyCode2[KeyCode2["Home"] = 14] = "Home";
  KeyCode2[KeyCode2["LeftArrow"] = 15] = "LeftArrow";
  KeyCode2[KeyCode2["UpArrow"] = 16] = "UpArrow";
  KeyCode2[KeyCode2["RightArrow"] = 17] = "RightArrow";
  KeyCode2[KeyCode2["DownArrow"] = 18] = "DownArrow";
  KeyCode2[KeyCode2["Insert"] = 19] = "Insert";
  KeyCode2[KeyCode2["Delete"] = 20] = "Delete";
  KeyCode2[KeyCode2["Digit0"] = 21] = "Digit0";
  KeyCode2[KeyCode2["Digit1"] = 22] = "Digit1";
  KeyCode2[KeyCode2["Digit2"] = 23] = "Digit2";
  KeyCode2[KeyCode2["Digit3"] = 24] = "Digit3";
  KeyCode2[KeyCode2["Digit4"] = 25] = "Digit4";
  KeyCode2[KeyCode2["Digit5"] = 26] = "Digit5";
  KeyCode2[KeyCode2["Digit6"] = 27] = "Digit6";
  KeyCode2[KeyCode2["Digit7"] = 28] = "Digit7";
  KeyCode2[KeyCode2["Digit8"] = 29] = "Digit8";
  KeyCode2[KeyCode2["Digit9"] = 30] = "Digit9";
  KeyCode2[KeyCode2["KeyA"] = 31] = "KeyA";
  KeyCode2[KeyCode2["KeyB"] = 32] = "KeyB";
  KeyCode2[KeyCode2["KeyC"] = 33] = "KeyC";
  KeyCode2[KeyCode2["KeyD"] = 34] = "KeyD";
  KeyCode2[KeyCode2["KeyE"] = 35] = "KeyE";
  KeyCode2[KeyCode2["KeyF"] = 36] = "KeyF";
  KeyCode2[KeyCode2["KeyG"] = 37] = "KeyG";
  KeyCode2[KeyCode2["KeyH"] = 38] = "KeyH";
  KeyCode2[KeyCode2["KeyI"] = 39] = "KeyI";
  KeyCode2[KeyCode2["KeyJ"] = 40] = "KeyJ";
  KeyCode2[KeyCode2["KeyK"] = 41] = "KeyK";
  KeyCode2[KeyCode2["KeyL"] = 42] = "KeyL";
  KeyCode2[KeyCode2["KeyM"] = 43] = "KeyM";
  KeyCode2[KeyCode2["KeyN"] = 44] = "KeyN";
  KeyCode2[KeyCode2["KeyO"] = 45] = "KeyO";
  KeyCode2[KeyCode2["KeyP"] = 46] = "KeyP";
  KeyCode2[KeyCode2["KeyQ"] = 47] = "KeyQ";
  KeyCode2[KeyCode2["KeyR"] = 48] = "KeyR";
  KeyCode2[KeyCode2["KeyS"] = 49] = "KeyS";
  KeyCode2[KeyCode2["KeyT"] = 50] = "KeyT";
  KeyCode2[KeyCode2["KeyU"] = 51] = "KeyU";
  KeyCode2[KeyCode2["KeyV"] = 52] = "KeyV";
  KeyCode2[KeyCode2["KeyW"] = 53] = "KeyW";
  KeyCode2[KeyCode2["KeyX"] = 54] = "KeyX";
  KeyCode2[KeyCode2["KeyY"] = 55] = "KeyY";
  KeyCode2[KeyCode2["KeyZ"] = 56] = "KeyZ";
  KeyCode2[KeyCode2["Meta"] = 57] = "Meta";
  KeyCode2[KeyCode2["ContextMenu"] = 58] = "ContextMenu";
  KeyCode2[KeyCode2["F1"] = 59] = "F1";
  KeyCode2[KeyCode2["F2"] = 60] = "F2";
  KeyCode2[KeyCode2["F3"] = 61] = "F3";
  KeyCode2[KeyCode2["F4"] = 62] = "F4";
  KeyCode2[KeyCode2["F5"] = 63] = "F5";
  KeyCode2[KeyCode2["F6"] = 64] = "F6";
  KeyCode2[KeyCode2["F7"] = 65] = "F7";
  KeyCode2[KeyCode2["F8"] = 66] = "F8";
  KeyCode2[KeyCode2["F9"] = 67] = "F9";
  KeyCode2[KeyCode2["F10"] = 68] = "F10";
  KeyCode2[KeyCode2["F11"] = 69] = "F11";
  KeyCode2[KeyCode2["F12"] = 70] = "F12";
  KeyCode2[KeyCode2["F13"] = 71] = "F13";
  KeyCode2[KeyCode2["F14"] = 72] = "F14";
  KeyCode2[KeyCode2["F15"] = 73] = "F15";
  KeyCode2[KeyCode2["F16"] = 74] = "F16";
  KeyCode2[KeyCode2["F17"] = 75] = "F17";
  KeyCode2[KeyCode2["F18"] = 76] = "F18";
  KeyCode2[KeyCode2["F19"] = 77] = "F19";
  KeyCode2[KeyCode2["F20"] = 78] = "F20";
  KeyCode2[KeyCode2["F21"] = 79] = "F21";
  KeyCode2[KeyCode2["F22"] = 80] = "F22";
  KeyCode2[KeyCode2["F23"] = 81] = "F23";
  KeyCode2[KeyCode2["F24"] = 82] = "F24";
  KeyCode2[KeyCode2["NumLock"] = 83] = "NumLock";
  KeyCode2[KeyCode2["ScrollLock"] = 84] = "ScrollLock";
  KeyCode2[KeyCode2["Semicolon"] = 85] = "Semicolon";
  KeyCode2[KeyCode2["Equal"] = 86] = "Equal";
  KeyCode2[KeyCode2["Comma"] = 87] = "Comma";
  KeyCode2[KeyCode2["Minus"] = 88] = "Minus";
  KeyCode2[KeyCode2["Period"] = 89] = "Period";
  KeyCode2[KeyCode2["Slash"] = 90] = "Slash";
  KeyCode2[KeyCode2["Backquote"] = 91] = "Backquote";
  KeyCode2[KeyCode2["BracketLeft"] = 92] = "BracketLeft";
  KeyCode2[KeyCode2["Backslash"] = 93] = "Backslash";
  KeyCode2[KeyCode2["BracketRight"] = 94] = "BracketRight";
  KeyCode2[KeyCode2["Quote"] = 95] = "Quote";
  KeyCode2[KeyCode2["OEM_8"] = 96] = "OEM_8";
  KeyCode2[KeyCode2["IntlBackslash"] = 97] = "IntlBackslash";
  KeyCode2[KeyCode2["Numpad0"] = 98] = "Numpad0";
  KeyCode2[KeyCode2["Numpad1"] = 99] = "Numpad1";
  KeyCode2[KeyCode2["Numpad2"] = 100] = "Numpad2";
  KeyCode2[KeyCode2["Numpad3"] = 101] = "Numpad3";
  KeyCode2[KeyCode2["Numpad4"] = 102] = "Numpad4";
  KeyCode2[KeyCode2["Numpad5"] = 103] = "Numpad5";
  KeyCode2[KeyCode2["Numpad6"] = 104] = "Numpad6";
  KeyCode2[KeyCode2["Numpad7"] = 105] = "Numpad7";
  KeyCode2[KeyCode2["Numpad8"] = 106] = "Numpad8";
  KeyCode2[KeyCode2["Numpad9"] = 107] = "Numpad9";
  KeyCode2[KeyCode2["NumpadMultiply"] = 108] = "NumpadMultiply";
  KeyCode2[KeyCode2["NumpadAdd"] = 109] = "NumpadAdd";
  KeyCode2[KeyCode2["NUMPAD_SEPARATOR"] = 110] = "NUMPAD_SEPARATOR";
  KeyCode2[KeyCode2["NumpadSubtract"] = 111] = "NumpadSubtract";
  KeyCode2[KeyCode2["NumpadDecimal"] = 112] = "NumpadDecimal";
  KeyCode2[KeyCode2["NumpadDivide"] = 113] = "NumpadDivide";
  KeyCode2[KeyCode2["KEY_IN_COMPOSITION"] = 114] = "KEY_IN_COMPOSITION";
  KeyCode2[KeyCode2["ABNT_C1"] = 115] = "ABNT_C1";
  KeyCode2[KeyCode2["ABNT_C2"] = 116] = "ABNT_C2";
  KeyCode2[KeyCode2["AudioVolumeMute"] = 117] = "AudioVolumeMute";
  KeyCode2[KeyCode2["AudioVolumeUp"] = 118] = "AudioVolumeUp";
  KeyCode2[KeyCode2["AudioVolumeDown"] = 119] = "AudioVolumeDown";
  KeyCode2[KeyCode2["BrowserSearch"] = 120] = "BrowserSearch";
  KeyCode2[KeyCode2["BrowserHome"] = 121] = "BrowserHome";
  KeyCode2[KeyCode2["BrowserBack"] = 122] = "BrowserBack";
  KeyCode2[KeyCode2["BrowserForward"] = 123] = "BrowserForward";
  KeyCode2[KeyCode2["MediaTrackNext"] = 124] = "MediaTrackNext";
  KeyCode2[KeyCode2["MediaTrackPrevious"] = 125] = "MediaTrackPrevious";
  KeyCode2[KeyCode2["MediaStop"] = 126] = "MediaStop";
  KeyCode2[KeyCode2["MediaPlayPause"] = 127] = "MediaPlayPause";
  KeyCode2[KeyCode2["LaunchMediaPlayer"] = 128] = "LaunchMediaPlayer";
  KeyCode2[KeyCode2["LaunchMail"] = 129] = "LaunchMail";
  KeyCode2[KeyCode2["LaunchApp2"] = 130] = "LaunchApp2";
  KeyCode2[KeyCode2["Clear"] = 131] = "Clear";
  KeyCode2[KeyCode2["MAX_VALUE"] = 132] = "MAX_VALUE";
  return KeyCode2;
})(KeyCode || {});
var ScanCode = /* @__PURE__ */ ((ScanCode2) => {
  ScanCode2[ScanCode2["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
  ScanCode2[ScanCode2["None"] = 0] = "None";
  ScanCode2[ScanCode2["Hyper"] = 1] = "Hyper";
  ScanCode2[ScanCode2["Super"] = 2] = "Super";
  ScanCode2[ScanCode2["Fn"] = 3] = "Fn";
  ScanCode2[ScanCode2["FnLock"] = 4] = "FnLock";
  ScanCode2[ScanCode2["Suspend"] = 5] = "Suspend";
  ScanCode2[ScanCode2["Resume"] = 6] = "Resume";
  ScanCode2[ScanCode2["Turbo"] = 7] = "Turbo";
  ScanCode2[ScanCode2["Sleep"] = 8] = "Sleep";
  ScanCode2[ScanCode2["WakeUp"] = 9] = "WakeUp";
  ScanCode2[ScanCode2["KeyA"] = 10] = "KeyA";
  ScanCode2[ScanCode2["KeyB"] = 11] = "KeyB";
  ScanCode2[ScanCode2["KeyC"] = 12] = "KeyC";
  ScanCode2[ScanCode2["KeyD"] = 13] = "KeyD";
  ScanCode2[ScanCode2["KeyE"] = 14] = "KeyE";
  ScanCode2[ScanCode2["KeyF"] = 15] = "KeyF";
  ScanCode2[ScanCode2["KeyG"] = 16] = "KeyG";
  ScanCode2[ScanCode2["KeyH"] = 17] = "KeyH";
  ScanCode2[ScanCode2["KeyI"] = 18] = "KeyI";
  ScanCode2[ScanCode2["KeyJ"] = 19] = "KeyJ";
  ScanCode2[ScanCode2["KeyK"] = 20] = "KeyK";
  ScanCode2[ScanCode2["KeyL"] = 21] = "KeyL";
  ScanCode2[ScanCode2["KeyM"] = 22] = "KeyM";
  ScanCode2[ScanCode2["KeyN"] = 23] = "KeyN";
  ScanCode2[ScanCode2["KeyO"] = 24] = "KeyO";
  ScanCode2[ScanCode2["KeyP"] = 25] = "KeyP";
  ScanCode2[ScanCode2["KeyQ"] = 26] = "KeyQ";
  ScanCode2[ScanCode2["KeyR"] = 27] = "KeyR";
  ScanCode2[ScanCode2["KeyS"] = 28] = "KeyS";
  ScanCode2[ScanCode2["KeyT"] = 29] = "KeyT";
  ScanCode2[ScanCode2["KeyU"] = 30] = "KeyU";
  ScanCode2[ScanCode2["KeyV"] = 31] = "KeyV";
  ScanCode2[ScanCode2["KeyW"] = 32] = "KeyW";
  ScanCode2[ScanCode2["KeyX"] = 33] = "KeyX";
  ScanCode2[ScanCode2["KeyY"] = 34] = "KeyY";
  ScanCode2[ScanCode2["KeyZ"] = 35] = "KeyZ";
  ScanCode2[ScanCode2["Digit1"] = 36] = "Digit1";
  ScanCode2[ScanCode2["Digit2"] = 37] = "Digit2";
  ScanCode2[ScanCode2["Digit3"] = 38] = "Digit3";
  ScanCode2[ScanCode2["Digit4"] = 39] = "Digit4";
  ScanCode2[ScanCode2["Digit5"] = 40] = "Digit5";
  ScanCode2[ScanCode2["Digit6"] = 41] = "Digit6";
  ScanCode2[ScanCode2["Digit7"] = 42] = "Digit7";
  ScanCode2[ScanCode2["Digit8"] = 43] = "Digit8";
  ScanCode2[ScanCode2["Digit9"] = 44] = "Digit9";
  ScanCode2[ScanCode2["Digit0"] = 45] = "Digit0";
  ScanCode2[ScanCode2["Enter"] = 46] = "Enter";
  ScanCode2[ScanCode2["Escape"] = 47] = "Escape";
  ScanCode2[ScanCode2["Backspace"] = 48] = "Backspace";
  ScanCode2[ScanCode2["Tab"] = 49] = "Tab";
  ScanCode2[ScanCode2["Space"] = 50] = "Space";
  ScanCode2[ScanCode2["Minus"] = 51] = "Minus";
  ScanCode2[ScanCode2["Equal"] = 52] = "Equal";
  ScanCode2[ScanCode2["BracketLeft"] = 53] = "BracketLeft";
  ScanCode2[ScanCode2["BracketRight"] = 54] = "BracketRight";
  ScanCode2[ScanCode2["Backslash"] = 55] = "Backslash";
  ScanCode2[ScanCode2["IntlHash"] = 56] = "IntlHash";
  ScanCode2[ScanCode2["Semicolon"] = 57] = "Semicolon";
  ScanCode2[ScanCode2["Quote"] = 58] = "Quote";
  ScanCode2[ScanCode2["Backquote"] = 59] = "Backquote";
  ScanCode2[ScanCode2["Comma"] = 60] = "Comma";
  ScanCode2[ScanCode2["Period"] = 61] = "Period";
  ScanCode2[ScanCode2["Slash"] = 62] = "Slash";
  ScanCode2[ScanCode2["CapsLock"] = 63] = "CapsLock";
  ScanCode2[ScanCode2["F1"] = 64] = "F1";
  ScanCode2[ScanCode2["F2"] = 65] = "F2";
  ScanCode2[ScanCode2["F3"] = 66] = "F3";
  ScanCode2[ScanCode2["F4"] = 67] = "F4";
  ScanCode2[ScanCode2["F5"] = 68] = "F5";
  ScanCode2[ScanCode2["F6"] = 69] = "F6";
  ScanCode2[ScanCode2["F7"] = 70] = "F7";
  ScanCode2[ScanCode2["F8"] = 71] = "F8";
  ScanCode2[ScanCode2["F9"] = 72] = "F9";
  ScanCode2[ScanCode2["F10"] = 73] = "F10";
  ScanCode2[ScanCode2["F11"] = 74] = "F11";
  ScanCode2[ScanCode2["F12"] = 75] = "F12";
  ScanCode2[ScanCode2["PrintScreen"] = 76] = "PrintScreen";
  ScanCode2[ScanCode2["ScrollLock"] = 77] = "ScrollLock";
  ScanCode2[ScanCode2["Pause"] = 78] = "Pause";
  ScanCode2[ScanCode2["Insert"] = 79] = "Insert";
  ScanCode2[ScanCode2["Home"] = 80] = "Home";
  ScanCode2[ScanCode2["PageUp"] = 81] = "PageUp";
  ScanCode2[ScanCode2["Delete"] = 82] = "Delete";
  ScanCode2[ScanCode2["End"] = 83] = "End";
  ScanCode2[ScanCode2["PageDown"] = 84] = "PageDown";
  ScanCode2[ScanCode2["ArrowRight"] = 85] = "ArrowRight";
  ScanCode2[ScanCode2["ArrowLeft"] = 86] = "ArrowLeft";
  ScanCode2[ScanCode2["ArrowDown"] = 87] = "ArrowDown";
  ScanCode2[ScanCode2["ArrowUp"] = 88] = "ArrowUp";
  ScanCode2[ScanCode2["NumLock"] = 89] = "NumLock";
  ScanCode2[ScanCode2["NumpadDivide"] = 90] = "NumpadDivide";
  ScanCode2[ScanCode2["NumpadMultiply"] = 91] = "NumpadMultiply";
  ScanCode2[ScanCode2["NumpadSubtract"] = 92] = "NumpadSubtract";
  ScanCode2[ScanCode2["NumpadAdd"] = 93] = "NumpadAdd";
  ScanCode2[ScanCode2["NumpadEnter"] = 94] = "NumpadEnter";
  ScanCode2[ScanCode2["Numpad1"] = 95] = "Numpad1";
  ScanCode2[ScanCode2["Numpad2"] = 96] = "Numpad2";
  ScanCode2[ScanCode2["Numpad3"] = 97] = "Numpad3";
  ScanCode2[ScanCode2["Numpad4"] = 98] = "Numpad4";
  ScanCode2[ScanCode2["Numpad5"] = 99] = "Numpad5";
  ScanCode2[ScanCode2["Numpad6"] = 100] = "Numpad6";
  ScanCode2[ScanCode2["Numpad7"] = 101] = "Numpad7";
  ScanCode2[ScanCode2["Numpad8"] = 102] = "Numpad8";
  ScanCode2[ScanCode2["Numpad9"] = 103] = "Numpad9";
  ScanCode2[ScanCode2["Numpad0"] = 104] = "Numpad0";
  ScanCode2[ScanCode2["NumpadDecimal"] = 105] = "NumpadDecimal";
  ScanCode2[ScanCode2["IntlBackslash"] = 106] = "IntlBackslash";
  ScanCode2[ScanCode2["ContextMenu"] = 107] = "ContextMenu";
  ScanCode2[ScanCode2["Power"] = 108] = "Power";
  ScanCode2[ScanCode2["NumpadEqual"] = 109] = "NumpadEqual";
  ScanCode2[ScanCode2["F13"] = 110] = "F13";
  ScanCode2[ScanCode2["F14"] = 111] = "F14";
  ScanCode2[ScanCode2["F15"] = 112] = "F15";
  ScanCode2[ScanCode2["F16"] = 113] = "F16";
  ScanCode2[ScanCode2["F17"] = 114] = "F17";
  ScanCode2[ScanCode2["F18"] = 115] = "F18";
  ScanCode2[ScanCode2["F19"] = 116] = "F19";
  ScanCode2[ScanCode2["F20"] = 117] = "F20";
  ScanCode2[ScanCode2["F21"] = 118] = "F21";
  ScanCode2[ScanCode2["F22"] = 119] = "F22";
  ScanCode2[ScanCode2["F23"] = 120] = "F23";
  ScanCode2[ScanCode2["F24"] = 121] = "F24";
  ScanCode2[ScanCode2["Open"] = 122] = "Open";
  ScanCode2[ScanCode2["Help"] = 123] = "Help";
  ScanCode2[ScanCode2["Select"] = 124] = "Select";
  ScanCode2[ScanCode2["Again"] = 125] = "Again";
  ScanCode2[ScanCode2["Undo"] = 126] = "Undo";
  ScanCode2[ScanCode2["Cut"] = 127] = "Cut";
  ScanCode2[ScanCode2["Copy"] = 128] = "Copy";
  ScanCode2[ScanCode2["Paste"] = 129] = "Paste";
  ScanCode2[ScanCode2["Find"] = 130] = "Find";
  ScanCode2[ScanCode2["AudioVolumeMute"] = 131] = "AudioVolumeMute";
  ScanCode2[ScanCode2["AudioVolumeUp"] = 132] = "AudioVolumeUp";
  ScanCode2[ScanCode2["AudioVolumeDown"] = 133] = "AudioVolumeDown";
  ScanCode2[ScanCode2["NumpadComma"] = 134] = "NumpadComma";
  ScanCode2[ScanCode2["IntlRo"] = 135] = "IntlRo";
  ScanCode2[ScanCode2["KanaMode"] = 136] = "KanaMode";
  ScanCode2[ScanCode2["IntlYen"] = 137] = "IntlYen";
  ScanCode2[ScanCode2["Convert"] = 138] = "Convert";
  ScanCode2[ScanCode2["NonConvert"] = 139] = "NonConvert";
  ScanCode2[ScanCode2["Lang1"] = 140] = "Lang1";
  ScanCode2[ScanCode2["Lang2"] = 141] = "Lang2";
  ScanCode2[ScanCode2["Lang3"] = 142] = "Lang3";
  ScanCode2[ScanCode2["Lang4"] = 143] = "Lang4";
  ScanCode2[ScanCode2["Lang5"] = 144] = "Lang5";
  ScanCode2[ScanCode2["Abort"] = 145] = "Abort";
  ScanCode2[ScanCode2["Props"] = 146] = "Props";
  ScanCode2[ScanCode2["NumpadParenLeft"] = 147] = "NumpadParenLeft";
  ScanCode2[ScanCode2["NumpadParenRight"] = 148] = "NumpadParenRight";
  ScanCode2[ScanCode2["NumpadBackspace"] = 149] = "NumpadBackspace";
  ScanCode2[ScanCode2["NumpadMemoryStore"] = 150] = "NumpadMemoryStore";
  ScanCode2[ScanCode2["NumpadMemoryRecall"] = 151] = "NumpadMemoryRecall";
  ScanCode2[ScanCode2["NumpadMemoryClear"] = 152] = "NumpadMemoryClear";
  ScanCode2[ScanCode2["NumpadMemoryAdd"] = 153] = "NumpadMemoryAdd";
  ScanCode2[ScanCode2["NumpadMemorySubtract"] = 154] = "NumpadMemorySubtract";
  ScanCode2[ScanCode2["NumpadClear"] = 155] = "NumpadClear";
  ScanCode2[ScanCode2["NumpadClearEntry"] = 156] = "NumpadClearEntry";
  ScanCode2[ScanCode2["ControlLeft"] = 157] = "ControlLeft";
  ScanCode2[ScanCode2["ShiftLeft"] = 158] = "ShiftLeft";
  ScanCode2[ScanCode2["AltLeft"] = 159] = "AltLeft";
  ScanCode2[ScanCode2["MetaLeft"] = 160] = "MetaLeft";
  ScanCode2[ScanCode2["ControlRight"] = 161] = "ControlRight";
  ScanCode2[ScanCode2["ShiftRight"] = 162] = "ShiftRight";
  ScanCode2[ScanCode2["AltRight"] = 163] = "AltRight";
  ScanCode2[ScanCode2["MetaRight"] = 164] = "MetaRight";
  ScanCode2[ScanCode2["BrightnessUp"] = 165] = "BrightnessUp";
  ScanCode2[ScanCode2["BrightnessDown"] = 166] = "BrightnessDown";
  ScanCode2[ScanCode2["MediaPlay"] = 167] = "MediaPlay";
  ScanCode2[ScanCode2["MediaRecord"] = 168] = "MediaRecord";
  ScanCode2[ScanCode2["MediaFastForward"] = 169] = "MediaFastForward";
  ScanCode2[ScanCode2["MediaRewind"] = 170] = "MediaRewind";
  ScanCode2[ScanCode2["MediaTrackNext"] = 171] = "MediaTrackNext";
  ScanCode2[ScanCode2["MediaTrackPrevious"] = 172] = "MediaTrackPrevious";
  ScanCode2[ScanCode2["MediaStop"] = 173] = "MediaStop";
  ScanCode2[ScanCode2["Eject"] = 174] = "Eject";
  ScanCode2[ScanCode2["MediaPlayPause"] = 175] = "MediaPlayPause";
  ScanCode2[ScanCode2["MediaSelect"] = 176] = "MediaSelect";
  ScanCode2[ScanCode2["LaunchMail"] = 177] = "LaunchMail";
  ScanCode2[ScanCode2["LaunchApp2"] = 178] = "LaunchApp2";
  ScanCode2[ScanCode2["LaunchApp1"] = 179] = "LaunchApp1";
  ScanCode2[ScanCode2["SelectTask"] = 180] = "SelectTask";
  ScanCode2[ScanCode2["LaunchScreenSaver"] = 181] = "LaunchScreenSaver";
  ScanCode2[ScanCode2["BrowserSearch"] = 182] = "BrowserSearch";
  ScanCode2[ScanCode2["BrowserHome"] = 183] = "BrowserHome";
  ScanCode2[ScanCode2["BrowserBack"] = 184] = "BrowserBack";
  ScanCode2[ScanCode2["BrowserForward"] = 185] = "BrowserForward";
  ScanCode2[ScanCode2["BrowserStop"] = 186] = "BrowserStop";
  ScanCode2[ScanCode2["BrowserRefresh"] = 187] = "BrowserRefresh";
  ScanCode2[ScanCode2["BrowserFavorites"] = 188] = "BrowserFavorites";
  ScanCode2[ScanCode2["ZoomToggle"] = 189] = "ZoomToggle";
  ScanCode2[ScanCode2["MailReply"] = 190] = "MailReply";
  ScanCode2[ScanCode2["MailForward"] = 191] = "MailForward";
  ScanCode2[ScanCode2["MailSend"] = 192] = "MailSend";
  ScanCode2[ScanCode2["MAX_VALUE"] = 193] = "MAX_VALUE";
  return ScanCode2;
})(ScanCode || {});
class KeyCodeStrMap {
  constructor() {
    this._keyCodeToStr = [];
    this._strToKeyCode = /* @__PURE__ */ Object.create(null);
  }
  define(keyCode, str) {
    this._keyCodeToStr[keyCode] = str;
    this._strToKeyCode[str.toLowerCase()] = keyCode;
  }
  keyCodeToStr(keyCode) {
    return this._keyCodeToStr[keyCode];
  }
  strToKeyCode(str) {
    return this._strToKeyCode[str.toLowerCase()] || 0 /* Unknown */;
  }
}
const uiMap = new KeyCodeStrMap();
const userSettingsUSMap = new KeyCodeStrMap();
const userSettingsGeneralMap = new KeyCodeStrMap();
const EVENT_KEY_CODE_MAP = new Array(230);
const NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
const scanCodeIntToStr = [];
const scanCodeStrToInt = /* @__PURE__ */ Object.create(null);
const scanCodeLowerCaseStrToInt = /* @__PURE__ */ Object.create(null);
const ScanCodeUtils = {
  lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || 0 /* None */,
  toEnum: (scanCode) => scanCodeStrToInt[scanCode] || 0 /* None */,
  toString: (scanCode) => scanCodeIntToStr[scanCode] || "None"
};
var KeyCodeUtils;
((KeyCodeUtils2) => {
  function toString(keyCode) {
    return uiMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toString = toString;
  function fromString(key) {
    return uiMap.strToKeyCode(key);
  }
  KeyCodeUtils2.fromString = fromString;
  function toUserSettingsUS(keyCode) {
    return userSettingsUSMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toUserSettingsUS = toUserSettingsUS;
  function toUserSettingsGeneral(keyCode) {
    return userSettingsGeneralMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toUserSettingsGeneral = toUserSettingsGeneral;
  function fromUserSettings(key) {
    return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
  }
  KeyCodeUtils2.fromUserSettings = fromUserSettings;
  function toElectronAccelerator(keyCode) {
    if (keyCode >= 98 /* Numpad0 */ && keyCode <= 113 /* NumpadDivide */) {
      return null;
    }
    switch (keyCode) {
      case 16 /* UpArrow */:
        return "Up";
      case 18 /* DownArrow */:
        return "Down";
      case 15 /* LeftArrow */:
        return "Left";
      case 17 /* RightArrow */:
        return "Right";
    }
    return uiMap.keyCodeToStr(keyCode);
  }
  KeyCodeUtils2.toElectronAccelerator = toElectronAccelerator;
})(KeyCodeUtils || (KeyCodeUtils = {}));
var KeyMod = /* @__PURE__ */ ((KeyMod2) => {
  KeyMod2[KeyMod2["CtrlCmd"] = 2048] = "CtrlCmd";
  KeyMod2[KeyMod2["Shift"] = 1024] = "Shift";
  KeyMod2[KeyMod2["Alt"] = 512] = "Alt";
  KeyMod2[KeyMod2["WinCtrl"] = 256] = "WinCtrl";
  return KeyMod2;
})(KeyMod || {});
function KeyChord(firstPart, secondPart) {
  const chordPart = (secondPart & 65535) << 16 >>> 0;
  return (firstPart | chordPart) >>> 0;
}
//# sourceMappingURL=keyCodes.js.map
