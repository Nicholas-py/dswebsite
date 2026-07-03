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
var OptionsService_exports = {};
__export(OptionsService_exports, {
  DEFAULT_OPTIONS: () => DEFAULT_OPTIONS,
  OptionsService: () => OptionsService
});
module.exports = __toCommonJS(OptionsService_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Platform = require("common/Platform");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_OPTIONS = {
  cols: 80,
  rows: 24,
  cursorBlink: false,
  cursorStyle: "block",
  cursorWidth: 1,
  cursorInactiveStyle: "outline",
  customGlyphs: true,
  drawBoldTextInBrightColors: true,
  documentOverride: null,
  fastScrollModifier: "alt",
  fastScrollSensitivity: 5,
  fontFamily: "courier-new, courier, monospace",
  fontSize: 15,
  fontWeight: "normal",
  fontWeightBold: "bold",
  ignoreBracketedPasteMode: false,
  lineHeight: 1,
  letterSpacing: 0,
  linkHandler: null,
  logLevel: "info",
  logger: null,
  scrollback: 1e3,
  scrollOnUserInput: true,
  scrollSensitivity: 1,
  screenReaderMode: false,
  smoothScrollDuration: 0,
  macOptionIsMeta: false,
  macOptionClickForcesSelection: false,
  minimumContrastRatio: 1,
  disableStdin: false,
  allowProposedApi: false,
  allowTransparency: false,
  tabStopWidth: 8,
  theme: {},
  reflowCursorLine: false,
  rescaleOverlappingGlyphs: false,
  rightClickSelectsWord: import_Platform.isMac,
  windowOptions: {},
  windowsMode: false,
  windowsPty: {},
  wordSeparator: " ()[]{}',\"`",
  altClickMovesCursor: true,
  convertEol: false,
  termName: "xterm",
  cancelEvents: false,
  overviewRuler: {}
};
const FONT_WEIGHT_OPTIONS = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
class OptionsService extends import_lifecycle.Disposable {
  constructor(options) {
    super();
    this._onOptionChange = this._register(new import_event.Emitter());
    this.onOptionChange = this._onOptionChange.event;
    const defaultOptions = { ...DEFAULT_OPTIONS };
    for (const key in options) {
      if (key in defaultOptions) {
        try {
          const newValue = options[key];
          defaultOptions[key] = this._sanitizeAndValidateOption(key, newValue);
        } catch (e) {
          console.error(e);
        }
      }
    }
    this.rawOptions = defaultOptions;
    this.options = { ...defaultOptions };
    this._setupOptions();
    this._register((0, import_lifecycle.toDisposable)(() => {
      this.rawOptions.linkHandler = null;
      this.rawOptions.documentOverride = null;
    }));
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  onSpecificOptionChange(key, listener) {
    return this.onOptionChange((eventKey) => {
      if (eventKey === key) {
        listener(this.rawOptions[key]);
      }
    });
  }
  // eslint-disable-next-line @typescript-eslint/naming-convention
  onMultipleOptionChange(keys, listener) {
    return this.onOptionChange((eventKey) => {
      if (keys.indexOf(eventKey) !== -1) {
        listener();
      }
    });
  }
  _setupOptions() {
    const getter = (propName) => {
      if (!(propName in DEFAULT_OPTIONS)) {
        throw new Error(`No option with key "${propName}"`);
      }
      return this.rawOptions[propName];
    };
    const setter = (propName, value) => {
      if (!(propName in DEFAULT_OPTIONS)) {
        throw new Error(`No option with key "${propName}"`);
      }
      value = this._sanitizeAndValidateOption(propName, value);
      if (this.rawOptions[propName] !== value) {
        this.rawOptions[propName] = value;
        this._onOptionChange.fire(propName);
      }
    };
    for (const propName in this.rawOptions) {
      const desc = {
        get: getter.bind(this, propName),
        set: setter.bind(this, propName)
      };
      Object.defineProperty(this.options, propName, desc);
    }
  }
  _sanitizeAndValidateOption(key, value) {
    switch (key) {
      case "cursorStyle":
        if (!value) {
          value = DEFAULT_OPTIONS[key];
        }
        if (!isCursorStyle(value)) {
          throw new Error(`"${value}" is not a valid value for ${key}`);
        }
        break;
      case "wordSeparator":
        if (!value) {
          value = DEFAULT_OPTIONS[key];
        }
        break;
      case "fontWeight":
      case "fontWeightBold":
        if (typeof value === "number" && 1 <= value && value <= 1e3) {
          break;
        }
        value = FONT_WEIGHT_OPTIONS.includes(value) ? value : DEFAULT_OPTIONS[key];
        break;
      case "cursorWidth":
        value = Math.floor(value);
      // Fall through for bounds check
      case "lineHeight":
      case "tabStopWidth":
        if (value < 1) {
          throw new Error(`${key} cannot be less than 1, value: ${value}`);
        }
        break;
      case "minimumContrastRatio":
        value = Math.max(1, Math.min(21, Math.round(value * 10) / 10));
        break;
      case "scrollback":
        value = Math.min(value, 4294967295);
        if (value < 0) {
          throw new Error(`${key} cannot be less than 0, value: ${value}`);
        }
        break;
      case "fastScrollSensitivity":
      case "scrollSensitivity":
        if (value <= 0) {
          throw new Error(`${key} cannot be less than or equal to 0, value: ${value}`);
        }
        break;
      case "rows":
      case "cols":
        if (!value && value !== 0) {
          throw new Error(`${key} must be numeric, value: ${value}`);
        }
        break;
      case "windowsPty":
        value = value ?? {};
        break;
    }
    return value;
  }
}
function isCursorStyle(value) {
  return value === "block" || value === "underline" || value === "bar";
}
//# sourceMappingURL=OptionsService.js.map
