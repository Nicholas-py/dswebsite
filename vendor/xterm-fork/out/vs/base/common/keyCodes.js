"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyMod = exports.KeyCodeUtils = exports.ScanCodeUtils = exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = exports.EVENT_KEY_CODE_MAP = exports.ScanCode = exports.KeyCode = void 0;
exports.KeyChord = KeyChord;
/**
 * Virtual Key Codes, the value does not hold any inherent meaning.
 * Inspired somewhat from https://msdn.microsoft.com/en-us/library/windows/desktop/dd375731(v=vs.85).aspx
 * But these are "more general", as they should work across browsers & OS`s.
 */
var KeyCode;
(function (KeyCode) {
    KeyCode[KeyCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
    /**
     * Placed first to cover the 0 value of the enum.
     */
    KeyCode[KeyCode["Unknown"] = 0] = "Unknown";
    KeyCode[KeyCode["Backspace"] = 1] = "Backspace";
    KeyCode[KeyCode["Tab"] = 2] = "Tab";
    KeyCode[KeyCode["Enter"] = 3] = "Enter";
    KeyCode[KeyCode["Shift"] = 4] = "Shift";
    KeyCode[KeyCode["Ctrl"] = 5] = "Ctrl";
    KeyCode[KeyCode["Alt"] = 6] = "Alt";
    KeyCode[KeyCode["PauseBreak"] = 7] = "PauseBreak";
    KeyCode[KeyCode["CapsLock"] = 8] = "CapsLock";
    KeyCode[KeyCode["Escape"] = 9] = "Escape";
    KeyCode[KeyCode["Space"] = 10] = "Space";
    KeyCode[KeyCode["PageUp"] = 11] = "PageUp";
    KeyCode[KeyCode["PageDown"] = 12] = "PageDown";
    KeyCode[KeyCode["End"] = 13] = "End";
    KeyCode[KeyCode["Home"] = 14] = "Home";
    KeyCode[KeyCode["LeftArrow"] = 15] = "LeftArrow";
    KeyCode[KeyCode["UpArrow"] = 16] = "UpArrow";
    KeyCode[KeyCode["RightArrow"] = 17] = "RightArrow";
    KeyCode[KeyCode["DownArrow"] = 18] = "DownArrow";
    KeyCode[KeyCode["Insert"] = 19] = "Insert";
    KeyCode[KeyCode["Delete"] = 20] = "Delete";
    KeyCode[KeyCode["Digit0"] = 21] = "Digit0";
    KeyCode[KeyCode["Digit1"] = 22] = "Digit1";
    KeyCode[KeyCode["Digit2"] = 23] = "Digit2";
    KeyCode[KeyCode["Digit3"] = 24] = "Digit3";
    KeyCode[KeyCode["Digit4"] = 25] = "Digit4";
    KeyCode[KeyCode["Digit5"] = 26] = "Digit5";
    KeyCode[KeyCode["Digit6"] = 27] = "Digit6";
    KeyCode[KeyCode["Digit7"] = 28] = "Digit7";
    KeyCode[KeyCode["Digit8"] = 29] = "Digit8";
    KeyCode[KeyCode["Digit9"] = 30] = "Digit9";
    KeyCode[KeyCode["KeyA"] = 31] = "KeyA";
    KeyCode[KeyCode["KeyB"] = 32] = "KeyB";
    KeyCode[KeyCode["KeyC"] = 33] = "KeyC";
    KeyCode[KeyCode["KeyD"] = 34] = "KeyD";
    KeyCode[KeyCode["KeyE"] = 35] = "KeyE";
    KeyCode[KeyCode["KeyF"] = 36] = "KeyF";
    KeyCode[KeyCode["KeyG"] = 37] = "KeyG";
    KeyCode[KeyCode["KeyH"] = 38] = "KeyH";
    KeyCode[KeyCode["KeyI"] = 39] = "KeyI";
    KeyCode[KeyCode["KeyJ"] = 40] = "KeyJ";
    KeyCode[KeyCode["KeyK"] = 41] = "KeyK";
    KeyCode[KeyCode["KeyL"] = 42] = "KeyL";
    KeyCode[KeyCode["KeyM"] = 43] = "KeyM";
    KeyCode[KeyCode["KeyN"] = 44] = "KeyN";
    KeyCode[KeyCode["KeyO"] = 45] = "KeyO";
    KeyCode[KeyCode["KeyP"] = 46] = "KeyP";
    KeyCode[KeyCode["KeyQ"] = 47] = "KeyQ";
    KeyCode[KeyCode["KeyR"] = 48] = "KeyR";
    KeyCode[KeyCode["KeyS"] = 49] = "KeyS";
    KeyCode[KeyCode["KeyT"] = 50] = "KeyT";
    KeyCode[KeyCode["KeyU"] = 51] = "KeyU";
    KeyCode[KeyCode["KeyV"] = 52] = "KeyV";
    KeyCode[KeyCode["KeyW"] = 53] = "KeyW";
    KeyCode[KeyCode["KeyX"] = 54] = "KeyX";
    KeyCode[KeyCode["KeyY"] = 55] = "KeyY";
    KeyCode[KeyCode["KeyZ"] = 56] = "KeyZ";
    KeyCode[KeyCode["Meta"] = 57] = "Meta";
    KeyCode[KeyCode["ContextMenu"] = 58] = "ContextMenu";
    KeyCode[KeyCode["F1"] = 59] = "F1";
    KeyCode[KeyCode["F2"] = 60] = "F2";
    KeyCode[KeyCode["F3"] = 61] = "F3";
    KeyCode[KeyCode["F4"] = 62] = "F4";
    KeyCode[KeyCode["F5"] = 63] = "F5";
    KeyCode[KeyCode["F6"] = 64] = "F6";
    KeyCode[KeyCode["F7"] = 65] = "F7";
    KeyCode[KeyCode["F8"] = 66] = "F8";
    KeyCode[KeyCode["F9"] = 67] = "F9";
    KeyCode[KeyCode["F10"] = 68] = "F10";
    KeyCode[KeyCode["F11"] = 69] = "F11";
    KeyCode[KeyCode["F12"] = 70] = "F12";
    KeyCode[KeyCode["F13"] = 71] = "F13";
    KeyCode[KeyCode["F14"] = 72] = "F14";
    KeyCode[KeyCode["F15"] = 73] = "F15";
    KeyCode[KeyCode["F16"] = 74] = "F16";
    KeyCode[KeyCode["F17"] = 75] = "F17";
    KeyCode[KeyCode["F18"] = 76] = "F18";
    KeyCode[KeyCode["F19"] = 77] = "F19";
    KeyCode[KeyCode["F20"] = 78] = "F20";
    KeyCode[KeyCode["F21"] = 79] = "F21";
    KeyCode[KeyCode["F22"] = 80] = "F22";
    KeyCode[KeyCode["F23"] = 81] = "F23";
    KeyCode[KeyCode["F24"] = 82] = "F24";
    KeyCode[KeyCode["NumLock"] = 83] = "NumLock";
    KeyCode[KeyCode["ScrollLock"] = 84] = "ScrollLock";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ';:' key
     */
    KeyCode[KeyCode["Semicolon"] = 85] = "Semicolon";
    /**
     * For any country/region, the '+' key
     * For the US standard keyboard, the '=+' key
     */
    KeyCode[KeyCode["Equal"] = 86] = "Equal";
    /**
     * For any country/region, the ',' key
     * For the US standard keyboard, the ',<' key
     */
    KeyCode[KeyCode["Comma"] = 87] = "Comma";
    /**
     * For any country/region, the '-' key
     * For the US standard keyboard, the '-_' key
     */
    KeyCode[KeyCode["Minus"] = 88] = "Minus";
    /**
     * For any country/region, the '.' key
     * For the US standard keyboard, the '.>' key
     */
    KeyCode[KeyCode["Period"] = 89] = "Period";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '/?' key
     */
    KeyCode[KeyCode["Slash"] = 90] = "Slash";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '`~' key
     */
    KeyCode[KeyCode["Backquote"] = 91] = "Backquote";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '[{' key
     */
    KeyCode[KeyCode["BracketLeft"] = 92] = "BracketLeft";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the '\|' key
     */
    KeyCode[KeyCode["Backslash"] = 93] = "Backslash";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ']}' key
     */
    KeyCode[KeyCode["BracketRight"] = 94] = "BracketRight";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     * For the US standard keyboard, the ''"' key
     */
    KeyCode[KeyCode["Quote"] = 95] = "Quote";
    /**
     * Used for miscellaneous characters; it can vary by keyboard.
     */
    KeyCode[KeyCode["OEM_8"] = 96] = "OEM_8";
    /**
     * Either the angle bracket key or the backslash key on the RT 102-key keyboard.
     */
    KeyCode[KeyCode["IntlBackslash"] = 97] = "IntlBackslash";
    KeyCode[KeyCode["Numpad0"] = 98] = "Numpad0";
    KeyCode[KeyCode["Numpad1"] = 99] = "Numpad1";
    KeyCode[KeyCode["Numpad2"] = 100] = "Numpad2";
    KeyCode[KeyCode["Numpad3"] = 101] = "Numpad3";
    KeyCode[KeyCode["Numpad4"] = 102] = "Numpad4";
    KeyCode[KeyCode["Numpad5"] = 103] = "Numpad5";
    KeyCode[KeyCode["Numpad6"] = 104] = "Numpad6";
    KeyCode[KeyCode["Numpad7"] = 105] = "Numpad7";
    KeyCode[KeyCode["Numpad8"] = 106] = "Numpad8";
    KeyCode[KeyCode["Numpad9"] = 107] = "Numpad9";
    KeyCode[KeyCode["NumpadMultiply"] = 108] = "NumpadMultiply";
    KeyCode[KeyCode["NumpadAdd"] = 109] = "NumpadAdd";
    KeyCode[KeyCode["NUMPAD_SEPARATOR"] = 110] = "NUMPAD_SEPARATOR";
    KeyCode[KeyCode["NumpadSubtract"] = 111] = "NumpadSubtract";
    KeyCode[KeyCode["NumpadDecimal"] = 112] = "NumpadDecimal";
    KeyCode[KeyCode["NumpadDivide"] = 113] = "NumpadDivide";
    /**
     * Cover all key codes when IME is processing input.
     */
    KeyCode[KeyCode["KEY_IN_COMPOSITION"] = 114] = "KEY_IN_COMPOSITION";
    KeyCode[KeyCode["ABNT_C1"] = 115] = "ABNT_C1";
    KeyCode[KeyCode["ABNT_C2"] = 116] = "ABNT_C2";
    KeyCode[KeyCode["AudioVolumeMute"] = 117] = "AudioVolumeMute";
    KeyCode[KeyCode["AudioVolumeUp"] = 118] = "AudioVolumeUp";
    KeyCode[KeyCode["AudioVolumeDown"] = 119] = "AudioVolumeDown";
    KeyCode[KeyCode["BrowserSearch"] = 120] = "BrowserSearch";
    KeyCode[KeyCode["BrowserHome"] = 121] = "BrowserHome";
    KeyCode[KeyCode["BrowserBack"] = 122] = "BrowserBack";
    KeyCode[KeyCode["BrowserForward"] = 123] = "BrowserForward";
    KeyCode[KeyCode["MediaTrackNext"] = 124] = "MediaTrackNext";
    KeyCode[KeyCode["MediaTrackPrevious"] = 125] = "MediaTrackPrevious";
    KeyCode[KeyCode["MediaStop"] = 126] = "MediaStop";
    KeyCode[KeyCode["MediaPlayPause"] = 127] = "MediaPlayPause";
    KeyCode[KeyCode["LaunchMediaPlayer"] = 128] = "LaunchMediaPlayer";
    KeyCode[KeyCode["LaunchMail"] = 129] = "LaunchMail";
    KeyCode[KeyCode["LaunchApp2"] = 130] = "LaunchApp2";
    /**
     * VK_CLEAR, 0x0C, CLEAR key
     */
    KeyCode[KeyCode["Clear"] = 131] = "Clear";
    /**
     * Placed last to cover the length of the enum.
     * Please do not depend on this value!
     */
    KeyCode[KeyCode["MAX_VALUE"] = 132] = "MAX_VALUE";
})(KeyCode || (exports.KeyCode = KeyCode = {}));
/**
 * keyboardEvent.code
 */
var ScanCode;
(function (ScanCode) {
    ScanCode[ScanCode["DependsOnKbLayout"] = -1] = "DependsOnKbLayout";
    ScanCode[ScanCode["None"] = 0] = "None";
    ScanCode[ScanCode["Hyper"] = 1] = "Hyper";
    ScanCode[ScanCode["Super"] = 2] = "Super";
    ScanCode[ScanCode["Fn"] = 3] = "Fn";
    ScanCode[ScanCode["FnLock"] = 4] = "FnLock";
    ScanCode[ScanCode["Suspend"] = 5] = "Suspend";
    ScanCode[ScanCode["Resume"] = 6] = "Resume";
    ScanCode[ScanCode["Turbo"] = 7] = "Turbo";
    ScanCode[ScanCode["Sleep"] = 8] = "Sleep";
    ScanCode[ScanCode["WakeUp"] = 9] = "WakeUp";
    ScanCode[ScanCode["KeyA"] = 10] = "KeyA";
    ScanCode[ScanCode["KeyB"] = 11] = "KeyB";
    ScanCode[ScanCode["KeyC"] = 12] = "KeyC";
    ScanCode[ScanCode["KeyD"] = 13] = "KeyD";
    ScanCode[ScanCode["KeyE"] = 14] = "KeyE";
    ScanCode[ScanCode["KeyF"] = 15] = "KeyF";
    ScanCode[ScanCode["KeyG"] = 16] = "KeyG";
    ScanCode[ScanCode["KeyH"] = 17] = "KeyH";
    ScanCode[ScanCode["KeyI"] = 18] = "KeyI";
    ScanCode[ScanCode["KeyJ"] = 19] = "KeyJ";
    ScanCode[ScanCode["KeyK"] = 20] = "KeyK";
    ScanCode[ScanCode["KeyL"] = 21] = "KeyL";
    ScanCode[ScanCode["KeyM"] = 22] = "KeyM";
    ScanCode[ScanCode["KeyN"] = 23] = "KeyN";
    ScanCode[ScanCode["KeyO"] = 24] = "KeyO";
    ScanCode[ScanCode["KeyP"] = 25] = "KeyP";
    ScanCode[ScanCode["KeyQ"] = 26] = "KeyQ";
    ScanCode[ScanCode["KeyR"] = 27] = "KeyR";
    ScanCode[ScanCode["KeyS"] = 28] = "KeyS";
    ScanCode[ScanCode["KeyT"] = 29] = "KeyT";
    ScanCode[ScanCode["KeyU"] = 30] = "KeyU";
    ScanCode[ScanCode["KeyV"] = 31] = "KeyV";
    ScanCode[ScanCode["KeyW"] = 32] = "KeyW";
    ScanCode[ScanCode["KeyX"] = 33] = "KeyX";
    ScanCode[ScanCode["KeyY"] = 34] = "KeyY";
    ScanCode[ScanCode["KeyZ"] = 35] = "KeyZ";
    ScanCode[ScanCode["Digit1"] = 36] = "Digit1";
    ScanCode[ScanCode["Digit2"] = 37] = "Digit2";
    ScanCode[ScanCode["Digit3"] = 38] = "Digit3";
    ScanCode[ScanCode["Digit4"] = 39] = "Digit4";
    ScanCode[ScanCode["Digit5"] = 40] = "Digit5";
    ScanCode[ScanCode["Digit6"] = 41] = "Digit6";
    ScanCode[ScanCode["Digit7"] = 42] = "Digit7";
    ScanCode[ScanCode["Digit8"] = 43] = "Digit8";
    ScanCode[ScanCode["Digit9"] = 44] = "Digit9";
    ScanCode[ScanCode["Digit0"] = 45] = "Digit0";
    ScanCode[ScanCode["Enter"] = 46] = "Enter";
    ScanCode[ScanCode["Escape"] = 47] = "Escape";
    ScanCode[ScanCode["Backspace"] = 48] = "Backspace";
    ScanCode[ScanCode["Tab"] = 49] = "Tab";
    ScanCode[ScanCode["Space"] = 50] = "Space";
    ScanCode[ScanCode["Minus"] = 51] = "Minus";
    ScanCode[ScanCode["Equal"] = 52] = "Equal";
    ScanCode[ScanCode["BracketLeft"] = 53] = "BracketLeft";
    ScanCode[ScanCode["BracketRight"] = 54] = "BracketRight";
    ScanCode[ScanCode["Backslash"] = 55] = "Backslash";
    ScanCode[ScanCode["IntlHash"] = 56] = "IntlHash";
    ScanCode[ScanCode["Semicolon"] = 57] = "Semicolon";
    ScanCode[ScanCode["Quote"] = 58] = "Quote";
    ScanCode[ScanCode["Backquote"] = 59] = "Backquote";
    ScanCode[ScanCode["Comma"] = 60] = "Comma";
    ScanCode[ScanCode["Period"] = 61] = "Period";
    ScanCode[ScanCode["Slash"] = 62] = "Slash";
    ScanCode[ScanCode["CapsLock"] = 63] = "CapsLock";
    ScanCode[ScanCode["F1"] = 64] = "F1";
    ScanCode[ScanCode["F2"] = 65] = "F2";
    ScanCode[ScanCode["F3"] = 66] = "F3";
    ScanCode[ScanCode["F4"] = 67] = "F4";
    ScanCode[ScanCode["F5"] = 68] = "F5";
    ScanCode[ScanCode["F6"] = 69] = "F6";
    ScanCode[ScanCode["F7"] = 70] = "F7";
    ScanCode[ScanCode["F8"] = 71] = "F8";
    ScanCode[ScanCode["F9"] = 72] = "F9";
    ScanCode[ScanCode["F10"] = 73] = "F10";
    ScanCode[ScanCode["F11"] = 74] = "F11";
    ScanCode[ScanCode["F12"] = 75] = "F12";
    ScanCode[ScanCode["PrintScreen"] = 76] = "PrintScreen";
    ScanCode[ScanCode["ScrollLock"] = 77] = "ScrollLock";
    ScanCode[ScanCode["Pause"] = 78] = "Pause";
    ScanCode[ScanCode["Insert"] = 79] = "Insert";
    ScanCode[ScanCode["Home"] = 80] = "Home";
    ScanCode[ScanCode["PageUp"] = 81] = "PageUp";
    ScanCode[ScanCode["Delete"] = 82] = "Delete";
    ScanCode[ScanCode["End"] = 83] = "End";
    ScanCode[ScanCode["PageDown"] = 84] = "PageDown";
    ScanCode[ScanCode["ArrowRight"] = 85] = "ArrowRight";
    ScanCode[ScanCode["ArrowLeft"] = 86] = "ArrowLeft";
    ScanCode[ScanCode["ArrowDown"] = 87] = "ArrowDown";
    ScanCode[ScanCode["ArrowUp"] = 88] = "ArrowUp";
    ScanCode[ScanCode["NumLock"] = 89] = "NumLock";
    ScanCode[ScanCode["NumpadDivide"] = 90] = "NumpadDivide";
    ScanCode[ScanCode["NumpadMultiply"] = 91] = "NumpadMultiply";
    ScanCode[ScanCode["NumpadSubtract"] = 92] = "NumpadSubtract";
    ScanCode[ScanCode["NumpadAdd"] = 93] = "NumpadAdd";
    ScanCode[ScanCode["NumpadEnter"] = 94] = "NumpadEnter";
    ScanCode[ScanCode["Numpad1"] = 95] = "Numpad1";
    ScanCode[ScanCode["Numpad2"] = 96] = "Numpad2";
    ScanCode[ScanCode["Numpad3"] = 97] = "Numpad3";
    ScanCode[ScanCode["Numpad4"] = 98] = "Numpad4";
    ScanCode[ScanCode["Numpad5"] = 99] = "Numpad5";
    ScanCode[ScanCode["Numpad6"] = 100] = "Numpad6";
    ScanCode[ScanCode["Numpad7"] = 101] = "Numpad7";
    ScanCode[ScanCode["Numpad8"] = 102] = "Numpad8";
    ScanCode[ScanCode["Numpad9"] = 103] = "Numpad9";
    ScanCode[ScanCode["Numpad0"] = 104] = "Numpad0";
    ScanCode[ScanCode["NumpadDecimal"] = 105] = "NumpadDecimal";
    ScanCode[ScanCode["IntlBackslash"] = 106] = "IntlBackslash";
    ScanCode[ScanCode["ContextMenu"] = 107] = "ContextMenu";
    ScanCode[ScanCode["Power"] = 108] = "Power";
    ScanCode[ScanCode["NumpadEqual"] = 109] = "NumpadEqual";
    ScanCode[ScanCode["F13"] = 110] = "F13";
    ScanCode[ScanCode["F14"] = 111] = "F14";
    ScanCode[ScanCode["F15"] = 112] = "F15";
    ScanCode[ScanCode["F16"] = 113] = "F16";
    ScanCode[ScanCode["F17"] = 114] = "F17";
    ScanCode[ScanCode["F18"] = 115] = "F18";
    ScanCode[ScanCode["F19"] = 116] = "F19";
    ScanCode[ScanCode["F20"] = 117] = "F20";
    ScanCode[ScanCode["F21"] = 118] = "F21";
    ScanCode[ScanCode["F22"] = 119] = "F22";
    ScanCode[ScanCode["F23"] = 120] = "F23";
    ScanCode[ScanCode["F24"] = 121] = "F24";
    ScanCode[ScanCode["Open"] = 122] = "Open";
    ScanCode[ScanCode["Help"] = 123] = "Help";
    ScanCode[ScanCode["Select"] = 124] = "Select";
    ScanCode[ScanCode["Again"] = 125] = "Again";
    ScanCode[ScanCode["Undo"] = 126] = "Undo";
    ScanCode[ScanCode["Cut"] = 127] = "Cut";
    ScanCode[ScanCode["Copy"] = 128] = "Copy";
    ScanCode[ScanCode["Paste"] = 129] = "Paste";
    ScanCode[ScanCode["Find"] = 130] = "Find";
    ScanCode[ScanCode["AudioVolumeMute"] = 131] = "AudioVolumeMute";
    ScanCode[ScanCode["AudioVolumeUp"] = 132] = "AudioVolumeUp";
    ScanCode[ScanCode["AudioVolumeDown"] = 133] = "AudioVolumeDown";
    ScanCode[ScanCode["NumpadComma"] = 134] = "NumpadComma";
    ScanCode[ScanCode["IntlRo"] = 135] = "IntlRo";
    ScanCode[ScanCode["KanaMode"] = 136] = "KanaMode";
    ScanCode[ScanCode["IntlYen"] = 137] = "IntlYen";
    ScanCode[ScanCode["Convert"] = 138] = "Convert";
    ScanCode[ScanCode["NonConvert"] = 139] = "NonConvert";
    ScanCode[ScanCode["Lang1"] = 140] = "Lang1";
    ScanCode[ScanCode["Lang2"] = 141] = "Lang2";
    ScanCode[ScanCode["Lang3"] = 142] = "Lang3";
    ScanCode[ScanCode["Lang4"] = 143] = "Lang4";
    ScanCode[ScanCode["Lang5"] = 144] = "Lang5";
    ScanCode[ScanCode["Abort"] = 145] = "Abort";
    ScanCode[ScanCode["Props"] = 146] = "Props";
    ScanCode[ScanCode["NumpadParenLeft"] = 147] = "NumpadParenLeft";
    ScanCode[ScanCode["NumpadParenRight"] = 148] = "NumpadParenRight";
    ScanCode[ScanCode["NumpadBackspace"] = 149] = "NumpadBackspace";
    ScanCode[ScanCode["NumpadMemoryStore"] = 150] = "NumpadMemoryStore";
    ScanCode[ScanCode["NumpadMemoryRecall"] = 151] = "NumpadMemoryRecall";
    ScanCode[ScanCode["NumpadMemoryClear"] = 152] = "NumpadMemoryClear";
    ScanCode[ScanCode["NumpadMemoryAdd"] = 153] = "NumpadMemoryAdd";
    ScanCode[ScanCode["NumpadMemorySubtract"] = 154] = "NumpadMemorySubtract";
    ScanCode[ScanCode["NumpadClear"] = 155] = "NumpadClear";
    ScanCode[ScanCode["NumpadClearEntry"] = 156] = "NumpadClearEntry";
    ScanCode[ScanCode["ControlLeft"] = 157] = "ControlLeft";
    ScanCode[ScanCode["ShiftLeft"] = 158] = "ShiftLeft";
    ScanCode[ScanCode["AltLeft"] = 159] = "AltLeft";
    ScanCode[ScanCode["MetaLeft"] = 160] = "MetaLeft";
    ScanCode[ScanCode["ControlRight"] = 161] = "ControlRight";
    ScanCode[ScanCode["ShiftRight"] = 162] = "ShiftRight";
    ScanCode[ScanCode["AltRight"] = 163] = "AltRight";
    ScanCode[ScanCode["MetaRight"] = 164] = "MetaRight";
    ScanCode[ScanCode["BrightnessUp"] = 165] = "BrightnessUp";
    ScanCode[ScanCode["BrightnessDown"] = 166] = "BrightnessDown";
    ScanCode[ScanCode["MediaPlay"] = 167] = "MediaPlay";
    ScanCode[ScanCode["MediaRecord"] = 168] = "MediaRecord";
    ScanCode[ScanCode["MediaFastForward"] = 169] = "MediaFastForward";
    ScanCode[ScanCode["MediaRewind"] = 170] = "MediaRewind";
    ScanCode[ScanCode["MediaTrackNext"] = 171] = "MediaTrackNext";
    ScanCode[ScanCode["MediaTrackPrevious"] = 172] = "MediaTrackPrevious";
    ScanCode[ScanCode["MediaStop"] = 173] = "MediaStop";
    ScanCode[ScanCode["Eject"] = 174] = "Eject";
    ScanCode[ScanCode["MediaPlayPause"] = 175] = "MediaPlayPause";
    ScanCode[ScanCode["MediaSelect"] = 176] = "MediaSelect";
    ScanCode[ScanCode["LaunchMail"] = 177] = "LaunchMail";
    ScanCode[ScanCode["LaunchApp2"] = 178] = "LaunchApp2";
    ScanCode[ScanCode["LaunchApp1"] = 179] = "LaunchApp1";
    ScanCode[ScanCode["SelectTask"] = 180] = "SelectTask";
    ScanCode[ScanCode["LaunchScreenSaver"] = 181] = "LaunchScreenSaver";
    ScanCode[ScanCode["BrowserSearch"] = 182] = "BrowserSearch";
    ScanCode[ScanCode["BrowserHome"] = 183] = "BrowserHome";
    ScanCode[ScanCode["BrowserBack"] = 184] = "BrowserBack";
    ScanCode[ScanCode["BrowserForward"] = 185] = "BrowserForward";
    ScanCode[ScanCode["BrowserStop"] = 186] = "BrowserStop";
    ScanCode[ScanCode["BrowserRefresh"] = 187] = "BrowserRefresh";
    ScanCode[ScanCode["BrowserFavorites"] = 188] = "BrowserFavorites";
    ScanCode[ScanCode["ZoomToggle"] = 189] = "ZoomToggle";
    ScanCode[ScanCode["MailReply"] = 190] = "MailReply";
    ScanCode[ScanCode["MailForward"] = 191] = "MailForward";
    ScanCode[ScanCode["MailSend"] = 192] = "MailSend";
    ScanCode[ScanCode["MAX_VALUE"] = 193] = "MAX_VALUE";
})(ScanCode || (exports.ScanCode = ScanCode = {}));
class KeyCodeStrMap {
    constructor() {
        this._keyCodeToStr = [];
        this._strToKeyCode = Object.create(null);
    }
    define(keyCode, str) {
        this._keyCodeToStr[keyCode] = str;
        this._strToKeyCode[str.toLowerCase()] = keyCode;
    }
    keyCodeToStr(keyCode) {
        return this._keyCodeToStr[keyCode];
    }
    strToKeyCode(str) {
        return this._strToKeyCode[str.toLowerCase()] || KeyCode.Unknown;
    }
}
const uiMap = new KeyCodeStrMap();
const userSettingsUSMap = new KeyCodeStrMap();
const userSettingsGeneralMap = new KeyCodeStrMap();
exports.EVENT_KEY_CODE_MAP = new Array(230);
exports.NATIVE_WINDOWS_KEY_CODE_TO_KEY_CODE = {};
const scanCodeIntToStr = [];
const scanCodeStrToInt = Object.create(null);
const scanCodeLowerCaseStrToInt = Object.create(null);
exports.ScanCodeUtils = {
    lowerCaseToEnum: (scanCode) => scanCodeLowerCaseStrToInt[scanCode] || ScanCode.None,
    toEnum: (scanCode) => scanCodeStrToInt[scanCode] || ScanCode.None,
    toString: (scanCode) => scanCodeIntToStr[scanCode] || 'None'
};
var KeyCodeUtils;
(function (KeyCodeUtils) {
    function toString(keyCode) {
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toString = toString;
    function fromString(key) {
        return uiMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromString = fromString;
    function toUserSettingsUS(keyCode) {
        return userSettingsUSMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsUS = toUserSettingsUS;
    function toUserSettingsGeneral(keyCode) {
        return userSettingsGeneralMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toUserSettingsGeneral = toUserSettingsGeneral;
    function fromUserSettings(key) {
        return userSettingsUSMap.strToKeyCode(key) || userSettingsGeneralMap.strToKeyCode(key);
    }
    KeyCodeUtils.fromUserSettings = fromUserSettings;
    function toElectronAccelerator(keyCode) {
        if (keyCode >= KeyCode.Numpad0 && keyCode <= KeyCode.NumpadDivide) {
            // [Electron Accelerators] Electron is able to parse numpad keys, but unfortunately it
            // renders them just as regular keys in menus. For example, num0 is rendered as "0",
            // numdiv is rendered as "/", numsub is rendered as "-".
            //
            // This can lead to incredible confusion, as it makes numpad based keybindings indistinguishable
            // from keybindings based on regular keys.
            //
            // We therefore need to fall back to custom rendering for numpad keys.
            return null;
        }
        switch (keyCode) {
            case KeyCode.UpArrow:
                return 'Up';
            case KeyCode.DownArrow:
                return 'Down';
            case KeyCode.LeftArrow:
                return 'Left';
            case KeyCode.RightArrow:
                return 'Right';
        }
        return uiMap.keyCodeToStr(keyCode);
    }
    KeyCodeUtils.toElectronAccelerator = toElectronAccelerator;
})(KeyCodeUtils || (exports.KeyCodeUtils = KeyCodeUtils = {}));
var KeyMod;
(function (KeyMod) {
    KeyMod[KeyMod["CtrlCmd"] = 2048] = "CtrlCmd";
    KeyMod[KeyMod["Shift"] = 1024] = "Shift";
    KeyMod[KeyMod["Alt"] = 512] = "Alt";
    KeyMod[KeyMod["WinCtrl"] = 256] = "WinCtrl";
})(KeyMod || (exports.KeyMod = KeyMod = {}));
function KeyChord(firstPart, secondPart) {
    const chordPart = ((secondPart & 0x0000FFFF) << 16) >>> 0;
    return (firstPart | chordPart) >>> 0;
}
