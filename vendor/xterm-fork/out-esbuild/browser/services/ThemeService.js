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
var ThemeService_exports = {};
__export(ThemeService_exports, {
  ThemeService: () => ThemeService
});
module.exports = __toCommonJS(ThemeService_exports);
var import_ColorContrastCache = require("browser/ColorContrastCache");
var import_Types = require("browser/Types");
var import_Color = require("common/Color");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services2 = require("common/services/Services");
var import_Types2 = require("common/Types");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_FOREGROUND = import_Color.css.toColor("#ffffff");
const DEFAULT_BACKGROUND = import_Color.css.toColor("#000000");
const DEFAULT_CURSOR = import_Color.css.toColor("#ffffff");
const DEFAULT_CURSOR_ACCENT = DEFAULT_BACKGROUND;
const DEFAULT_SELECTION = {
  css: "rgba(255, 255, 255, 0.3)",
  rgba: 4294967117
};
const DEFAULT_OVERVIEW_RULER_BORDER = DEFAULT_FOREGROUND;
let ThemeService = class extends import_lifecycle.Disposable {
  constructor(_optionsService) {
    super();
    this._optionsService = _optionsService;
    this._contrastCache = new import_ColorContrastCache.ColorContrastCache();
    this._halfContrastCache = new import_ColorContrastCache.ColorContrastCache();
    this._onChangeColors = this._register(new import_event.Emitter());
    this.onChangeColors = this._onChangeColors.event;
    this._colors = {
      foreground: DEFAULT_FOREGROUND,
      background: DEFAULT_BACKGROUND,
      cursor: DEFAULT_CURSOR,
      cursorAccent: DEFAULT_CURSOR_ACCENT,
      selectionForeground: void 0,
      selectionBackgroundTransparent: DEFAULT_SELECTION,
      selectionBackgroundOpaque: import_Color.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
      selectionInactiveBackgroundTransparent: DEFAULT_SELECTION,
      selectionInactiveBackgroundOpaque: import_Color.color.blend(DEFAULT_BACKGROUND, DEFAULT_SELECTION),
      scrollbarSliderBackground: import_Color.color.opacity(DEFAULT_FOREGROUND, 0.2),
      scrollbarSliderHoverBackground: import_Color.color.opacity(DEFAULT_FOREGROUND, 0.4),
      scrollbarSliderActiveBackground: import_Color.color.opacity(DEFAULT_FOREGROUND, 0.5),
      overviewRulerBorder: DEFAULT_FOREGROUND,
      ansi: import_Types.DEFAULT_ANSI_COLORS.slice(),
      contrastCache: this._contrastCache,
      halfContrastCache: this._halfContrastCache
    };
    this._updateRestoreColors();
    this._setTheme(this._optionsService.rawOptions.theme);
    this._register(this._optionsService.onSpecificOptionChange("minimumContrastRatio", () => this._contrastCache.clear()));
    this._register(this._optionsService.onSpecificOptionChange("theme", () => this._setTheme(this._optionsService.rawOptions.theme)));
  }
  get colors() {
    return this._colors;
  }
  /**
   * Sets the terminal's theme.
   * @param theme The  theme to use. If a partial theme is provided then default
   * colors will be used where colors are not defined.
   */
  _setTheme(theme = {}) {
    const colors = this._colors;
    colors.foreground = parseColor(theme.foreground, DEFAULT_FOREGROUND);
    colors.background = parseColor(theme.background, DEFAULT_BACKGROUND);
    colors.cursor = import_Color.color.blend(colors.background, parseColor(theme.cursor, DEFAULT_CURSOR));
    colors.cursorAccent = import_Color.color.blend(colors.background, parseColor(theme.cursorAccent, DEFAULT_CURSOR_ACCENT));
    colors.selectionBackgroundTransparent = parseColor(theme.selectionBackground, DEFAULT_SELECTION);
    colors.selectionBackgroundOpaque = import_Color.color.blend(colors.background, colors.selectionBackgroundTransparent);
    colors.selectionInactiveBackgroundTransparent = parseColor(theme.selectionInactiveBackground, colors.selectionBackgroundTransparent);
    colors.selectionInactiveBackgroundOpaque = import_Color.color.blend(colors.background, colors.selectionInactiveBackgroundTransparent);
    colors.selectionForeground = theme.selectionForeground ? parseColor(theme.selectionForeground, import_Color.NULL_COLOR) : void 0;
    if (colors.selectionForeground === import_Color.NULL_COLOR) {
      colors.selectionForeground = void 0;
    }
    if (import_Color.color.isOpaque(colors.selectionBackgroundTransparent)) {
      const opacity = 0.3;
      colors.selectionBackgroundTransparent = import_Color.color.opacity(colors.selectionBackgroundTransparent, opacity);
    }
    if (import_Color.color.isOpaque(colors.selectionInactiveBackgroundTransparent)) {
      const opacity = 0.3;
      colors.selectionInactiveBackgroundTransparent = import_Color.color.opacity(colors.selectionInactiveBackgroundTransparent, opacity);
    }
    colors.scrollbarSliderBackground = parseColor(theme.scrollbarSliderBackground, import_Color.color.opacity(colors.foreground, 0.2));
    colors.scrollbarSliderHoverBackground = parseColor(theme.scrollbarSliderHoverBackground, import_Color.color.opacity(colors.foreground, 0.4));
    colors.scrollbarSliderActiveBackground = parseColor(theme.scrollbarSliderActiveBackground, import_Color.color.opacity(colors.foreground, 0.5));
    colors.overviewRulerBorder = parseColor(theme.overviewRulerBorder, DEFAULT_OVERVIEW_RULER_BORDER);
    colors.ansi = import_Types.DEFAULT_ANSI_COLORS.slice();
    colors.ansi[0] = parseColor(theme.black, import_Types.DEFAULT_ANSI_COLORS[0]);
    colors.ansi[1] = parseColor(theme.red, import_Types.DEFAULT_ANSI_COLORS[1]);
    colors.ansi[2] = parseColor(theme.green, import_Types.DEFAULT_ANSI_COLORS[2]);
    colors.ansi[3] = parseColor(theme.yellow, import_Types.DEFAULT_ANSI_COLORS[3]);
    colors.ansi[4] = parseColor(theme.blue, import_Types.DEFAULT_ANSI_COLORS[4]);
    colors.ansi[5] = parseColor(theme.magenta, import_Types.DEFAULT_ANSI_COLORS[5]);
    colors.ansi[6] = parseColor(theme.cyan, import_Types.DEFAULT_ANSI_COLORS[6]);
    colors.ansi[7] = parseColor(theme.white, import_Types.DEFAULT_ANSI_COLORS[7]);
    colors.ansi[8] = parseColor(theme.brightBlack, import_Types.DEFAULT_ANSI_COLORS[8]);
    colors.ansi[9] = parseColor(theme.brightRed, import_Types.DEFAULT_ANSI_COLORS[9]);
    colors.ansi[10] = parseColor(theme.brightGreen, import_Types.DEFAULT_ANSI_COLORS[10]);
    colors.ansi[11] = parseColor(theme.brightYellow, import_Types.DEFAULT_ANSI_COLORS[11]);
    colors.ansi[12] = parseColor(theme.brightBlue, import_Types.DEFAULT_ANSI_COLORS[12]);
    colors.ansi[13] = parseColor(theme.brightMagenta, import_Types.DEFAULT_ANSI_COLORS[13]);
    colors.ansi[14] = parseColor(theme.brightCyan, import_Types.DEFAULT_ANSI_COLORS[14]);
    colors.ansi[15] = parseColor(theme.brightWhite, import_Types.DEFAULT_ANSI_COLORS[15]);
    if (theme.extendedAnsi) {
      const colorCount = Math.min(colors.ansi.length - 16, theme.extendedAnsi.length);
      for (let i = 0; i < colorCount; i++) {
        colors.ansi[i + 16] = parseColor(theme.extendedAnsi[i], import_Types.DEFAULT_ANSI_COLORS[i + 16]);
      }
    }
    this._contrastCache.clear();
    this._halfContrastCache.clear();
    this._updateRestoreColors();
    this._onChangeColors.fire(this.colors);
  }
  restoreColor(slot) {
    this._restoreColor(slot);
    this._onChangeColors.fire(this.colors);
  }
  _restoreColor(slot) {
    if (slot === void 0) {
      for (let i = 0; i < this._restoreColors.ansi.length; ++i) {
        this._colors.ansi[i] = this._restoreColors.ansi[i];
      }
      return;
    }
    switch (slot) {
      case import_Types2.SpecialColorIndex.FOREGROUND:
        this._colors.foreground = this._restoreColors.foreground;
        break;
      case import_Types2.SpecialColorIndex.BACKGROUND:
        this._colors.background = this._restoreColors.background;
        break;
      case import_Types2.SpecialColorIndex.CURSOR:
        this._colors.cursor = this._restoreColors.cursor;
        break;
      default:
        this._colors.ansi[slot] = this._restoreColors.ansi[slot];
    }
  }
  modifyColors(callback) {
    callback(this._colors);
    this._onChangeColors.fire(this.colors);
  }
  _updateRestoreColors() {
    this._restoreColors = {
      foreground: this._colors.foreground,
      background: this._colors.background,
      cursor: this._colors.cursor,
      ansi: this._colors.ansi.slice()
    };
  }
};
ThemeService = __decorateClass([
  __decorateParam(0, import_Services2.IOptionsService)
], ThemeService);
function parseColor(cssString, fallback) {
  if (cssString !== void 0) {
    try {
      return import_Color.css.toColor(cssString);
    } catch {
    }
  }
  return fallback;
}
//# sourceMappingURL=ThemeService.js.map
