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
var DomRendererRowFactory_exports = {};
__export(DomRendererRowFactory_exports, {
  DomRendererRowFactory: () => DomRendererRowFactory,
  RowCss: () => RowCss
});
module.exports = __toCommonJS(DomRendererRowFactory_exports);
var import_Constants = require("browser/renderer/shared/Constants");
var import_Constants2 = require("common/buffer/Constants");
var import_CellData = require("common/buffer/CellData");
var import_Services = require("common/services/Services");
var import_Color = require("common/Color");
var import_Services2 = require("browser/services/Services");
var import_CharacterJoinerService = require("browser/services/CharacterJoinerService");
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_AttributeData = require("common/buffer/AttributeData");
/**
 * Copyright (c) 2018, 2023 The xterm.js authors. All rights reserved.
 * @license MIT
 */
var RowCss = /* @__PURE__ */ ((RowCss2) => {
  RowCss2["BOLD_CLASS"] = "xterm-bold";
  RowCss2["DIM_CLASS"] = "xterm-dim";
  RowCss2["ITALIC_CLASS"] = "xterm-italic";
  RowCss2["UNDERLINE_CLASS"] = "xterm-underline";
  RowCss2["OVERLINE_CLASS"] = "xterm-overline";
  RowCss2["STRIKETHROUGH_CLASS"] = "xterm-strikethrough";
  RowCss2["CURSOR_CLASS"] = "xterm-cursor";
  RowCss2["CURSOR_BLINK_CLASS"] = "xterm-cursor-blink";
  RowCss2["CURSOR_STYLE_BLOCK_CLASS"] = "xterm-cursor-block";
  RowCss2["CURSOR_STYLE_OUTLINE_CLASS"] = "xterm-cursor-outline";
  RowCss2["CURSOR_STYLE_BAR_CLASS"] = "xterm-cursor-bar";
  RowCss2["CURSOR_STYLE_UNDERLINE_CLASS"] = "xterm-cursor-underline";
  return RowCss2;
})(RowCss || {});
let DomRendererRowFactory = class {
  constructor(_document, _characterJoinerService, _optionsService, _coreBrowserService, _coreService, _decorationService, _themeService) {
    this._document = _document;
    this._characterJoinerService = _characterJoinerService;
    this._optionsService = _optionsService;
    this._coreBrowserService = _coreBrowserService;
    this._coreService = _coreService;
    this._decorationService = _decorationService;
    this._themeService = _themeService;
    this._workCell = new import_CellData.CellData();
    this._columnSelectMode = false;
    this.defaultSpacing = 0;
  }
  handleSelectionChanged(start, end, columnSelectMode) {
    this._selectionStart = start;
    this._selectionEnd = end;
    this._columnSelectMode = columnSelectMode;
  }
  createRow(lineData, row, isCursorRow, cursorStyle, cursorInactiveStyle, cursorX, cursorBlink, cellWidth, widthCache, linkStart, linkEnd) {
    const elements = [];
    const joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
    const colors = this._themeService.colors;
    let lineLength = lineData.getNoBgTrimmedLength();
    if (isCursorRow && lineLength < cursorX + 1) {
      lineLength = cursorX + 1;
    }
    let charElement;
    let cellAmount = 0;
    let text = "";
    let i = 0;
    let oldBg = 0;
    let oldFg = 0;
    let oldExt = 0;
    let oldLinkHover = false;
    let oldSpacing = 0;
    let oldIsInSelection = false;
    let spacing = 0;
    let skipJoinedCheckUntilX = 0;
    const classes = [];
    const hasHover = linkStart !== -1 && linkEnd !== -1;
    for (let x = 0; x < lineLength; x++) {
      lineData.loadCell(x, this._workCell);
      let width = this._workCell.getWidth();
      if (width === 0) {
        continue;
      }
      let isJoined = false;
      let isValidJoinRange = x >= skipJoinedCheckUntilX;
      let lastCharX = x;
      let cell = this._workCell;
      if (joinedRanges.length > 0 && x === joinedRanges[0][0] && isValidJoinRange) {
        const range = joinedRanges.shift();
        const firstSelectionState = this._isCellInSelection(range[0], row);
        for (i = range[0] + 1; i < range[1]; i++) {
          isValidJoinRange &&= firstSelectionState === this._isCellInSelection(i, row);
        }
        isValidJoinRange &&= !isCursorRow || cursorX < range[0] || cursorX >= range[1];
        if (!isValidJoinRange) {
          skipJoinedCheckUntilX = range[1];
        } else {
          isJoined = true;
          cell = new import_CharacterJoinerService.JoinedCellData(
            this._workCell,
            lineData.translateToString(true, range[0], range[1]),
            range[1] - range[0]
          );
          lastCharX = range[1] - 1;
          width = cell.getWidth();
        }
      }
      const isInSelection = this._isCellInSelection(x, row);
      const isCursorCell = isCursorRow && x === cursorX;
      const isLinkHover = hasHover && x >= linkStart && x <= linkEnd;
      let isDecorated = false;
      this._decorationService.forEachDecorationAtCell(x, row, void 0, (d) => {
        isDecorated = true;
      });
      let chars = cell.getChars() || import_Constants2.WHITESPACE_CELL_CHAR;
      if (chars === " " && (cell.isUnderline() || cell.isOverline())) {
        chars = "\xA0";
      }
      spacing = width * cellWidth - widthCache.get(chars, cell.isBold(), cell.isItalic());
      if (!charElement) {
        charElement = this._document.createElement("span");
      } else {
        if (cellAmount && (isInSelection && oldIsInSelection || !isInSelection && !oldIsInSelection && cell.bg === oldBg) && (isInSelection && oldIsInSelection && colors.selectionForeground || cell.fg === oldFg) && cell.extended.ext === oldExt && isLinkHover === oldLinkHover && spacing === oldSpacing && !isCursorCell && !isJoined && !isDecorated && isValidJoinRange) {
          if (cell.isInvisible()) {
            text += import_Constants2.WHITESPACE_CELL_CHAR;
          } else {
            text += chars;
          }
          cellAmount++;
          continue;
        } else {
          if (cellAmount) {
            charElement.textContent = text;
          }
          charElement = this._document.createElement("span");
          cellAmount = 0;
          text = "";
        }
      }
      oldBg = cell.bg;
      oldFg = cell.fg;
      oldExt = cell.extended.ext;
      oldLinkHover = isLinkHover;
      oldSpacing = spacing;
      oldIsInSelection = isInSelection;
      if (isJoined) {
        if (cursorX >= x && cursorX <= lastCharX) {
          cursorX = x;
        }
      }
      if (!this._coreService.isCursorHidden && isCursorCell && this._coreService.isCursorInitialized) {
        classes.push("xterm-cursor" /* CURSOR_CLASS */);
        if (this._coreBrowserService.isFocused) {
          if (cursorBlink) {
            classes.push("xterm-cursor-blink" /* CURSOR_BLINK_CLASS */);
          }
          classes.push(
            cursorStyle === "bar" ? "xterm-cursor-bar" /* CURSOR_STYLE_BAR_CLASS */ : cursorStyle === "underline" ? "xterm-cursor-underline" /* CURSOR_STYLE_UNDERLINE_CLASS */ : "xterm-cursor-block" /* CURSOR_STYLE_BLOCK_CLASS */
          );
        } else {
          if (cursorInactiveStyle) {
            switch (cursorInactiveStyle) {
              case "outline":
                classes.push("xterm-cursor-outline" /* CURSOR_STYLE_OUTLINE_CLASS */);
                break;
              case "block":
                classes.push("xterm-cursor-block" /* CURSOR_STYLE_BLOCK_CLASS */);
                break;
              case "bar":
                classes.push("xterm-cursor-bar" /* CURSOR_STYLE_BAR_CLASS */);
                break;
              case "underline":
                classes.push("xterm-cursor-underline" /* CURSOR_STYLE_UNDERLINE_CLASS */);
                break;
              default:
                break;
            }
          }
        }
      }
      if (cell.isBold()) {
        classes.push("xterm-bold" /* BOLD_CLASS */);
      }
      if (cell.isItalic()) {
        classes.push("xterm-italic" /* ITALIC_CLASS */);
      }
      if (cell.isDim()) {
        classes.push("xterm-dim" /* DIM_CLASS */);
      }
      if (cell.isInvisible()) {
        text = import_Constants2.WHITESPACE_CELL_CHAR;
      } else {
        text = cell.getChars() || import_Constants2.WHITESPACE_CELL_CHAR;
      }
      if (cell.isUnderline()) {
        classes.push(`${"xterm-underline" /* UNDERLINE_CLASS */}-${cell.extended.underlineStyle}`);
        if (text === " ") {
          text = "\xA0";
        }
        if (!cell.isUnderlineColorDefault()) {
          if (cell.isUnderlineColorRGB()) {
            charElement.style.textDecorationColor = `rgb(${import_AttributeData.AttributeData.toColorRGB(cell.getUnderlineColor()).join(",")})`;
          } else {
            let fg2 = cell.getUnderlineColor();
            if (this._optionsService.rawOptions.drawBoldTextInBrightColors && cell.isBold() && fg2 < 8) {
              fg2 += 8;
            }
            charElement.style.textDecorationColor = colors.ansi[fg2].css;
          }
        }
      }
      if (cell.isOverline()) {
        classes.push("xterm-overline" /* OVERLINE_CLASS */);
        if (text === " ") {
          text = "\xA0";
        }
      }
      if (cell.isStrikethrough()) {
        classes.push("xterm-strikethrough" /* STRIKETHROUGH_CLASS */);
      }
      if (isLinkHover) {
        charElement.style.textDecoration = "underline";
      }
      let fg = cell.getFgColor();
      let fgColorMode = cell.getFgColorMode();
      let bg = cell.getBgColor();
      let bgColorMode = cell.getBgColorMode();
      const isInverse = !!cell.isInverse();
      if (isInverse) {
        const temp = fg;
        fg = bg;
        bg = temp;
        const temp2 = fgColorMode;
        fgColorMode = bgColorMode;
        bgColorMode = temp2;
      }
      let bgOverride;
      let fgOverride;
      let isTop = false;
      this._decorationService.forEachDecorationAtCell(x, row, void 0, (d) => {
        if (d.options.layer !== "top" && isTop) {
          return;
        }
        if (d.backgroundColorRGB) {
          bgColorMode = import_Constants2.Attributes.CM_RGB;
          bg = d.backgroundColorRGB.rgba >> 8 & 16777215;
          bgOverride = d.backgroundColorRGB;
        }
        if (d.foregroundColorRGB) {
          fgColorMode = import_Constants2.Attributes.CM_RGB;
          fg = d.foregroundColorRGB.rgba >> 8 & 16777215;
          fgOverride = d.foregroundColorRGB;
        }
        isTop = d.options.layer === "top";
      });
      if (!isTop && isInSelection) {
        bgOverride = this._coreBrowserService.isFocused ? colors.selectionBackgroundOpaque : colors.selectionInactiveBackgroundOpaque;
        bg = bgOverride.rgba >> 8 & 16777215;
        bgColorMode = import_Constants2.Attributes.CM_RGB;
        isTop = true;
        if (colors.selectionForeground) {
          fgColorMode = import_Constants2.Attributes.CM_RGB;
          fg = colors.selectionForeground.rgba >> 8 & 16777215;
          fgOverride = colors.selectionForeground;
        }
      }
      if (isTop) {
        classes.push("xterm-decoration-top");
      }
      let resolvedBg;
      switch (bgColorMode) {
        case import_Constants2.Attributes.CM_P16:
        case import_Constants2.Attributes.CM_P256:
          resolvedBg = colors.ansi[bg];
          classes.push(`xterm-bg-${bg}`);
          break;
        case import_Constants2.Attributes.CM_RGB:
          resolvedBg = import_Color.channels.toColor(bg >> 16, bg >> 8 & 255, bg & 255);
          this._addStyle(charElement, `background-color:#${padStart((bg >>> 0).toString(16), "0", 6)}`);
          break;
        case import_Constants2.Attributes.CM_DEFAULT:
        default:
          if (isInverse) {
            resolvedBg = colors.foreground;
            classes.push(`xterm-bg-${import_Constants.INVERTED_DEFAULT_COLOR}`);
          } else {
            resolvedBg = colors.background;
          }
      }
      if (!bgOverride) {
        if (cell.isDim()) {
          bgOverride = import_Color.color.multiplyOpacity(resolvedBg, 0.5);
        }
      }
      switch (fgColorMode) {
        case import_Constants2.Attributes.CM_P16:
        case import_Constants2.Attributes.CM_P256:
          if (cell.isBold() && fg < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors) {
            fg += 8;
          }
          if (!this._applyMinimumContrast(charElement, resolvedBg, colors.ansi[fg], cell, bgOverride, void 0)) {
            classes.push(`xterm-fg-${fg}`);
          }
          break;
        case import_Constants2.Attributes.CM_RGB:
          const color2 = import_Color.channels.toColor(
            fg >> 16 & 255,
            fg >> 8 & 255,
            fg & 255
          );
          if (!this._applyMinimumContrast(charElement, resolvedBg, color2, cell, bgOverride, fgOverride)) {
            this._addStyle(charElement, `color:#${padStart(fg.toString(16), "0", 6)}`);
          }
          break;
        case import_Constants2.Attributes.CM_DEFAULT:
        default:
          if (!this._applyMinimumContrast(charElement, resolvedBg, colors.foreground, cell, bgOverride, fgOverride)) {
            if (isInverse) {
              classes.push(`xterm-fg-${import_Constants.INVERTED_DEFAULT_COLOR}`);
            }
          }
      }
      if (classes.length) {
        charElement.className = classes.join(" ");
        classes.length = 0;
      }
      if (!isCursorCell && !isJoined && !isDecorated && isValidJoinRange) {
        cellAmount++;
      } else {
        charElement.textContent = text;
      }
      if (spacing !== this.defaultSpacing) {
        charElement.style.letterSpacing = `${spacing}px`;
      }
      elements.push(charElement);
      x = lastCharX;
    }
    if (charElement && cellAmount) {
      charElement.textContent = text;
    }
    return elements;
  }
  _applyMinimumContrast(element, bg, fg, cell, bgOverride, fgOverride) {
    if (this._optionsService.rawOptions.minimumContrastRatio === 1 || (0, import_RendererUtils.treatGlyphAsBackgroundColor)(cell.getCode())) {
      return false;
    }
    const cache = this._getContrastCache(cell);
    let adjustedColor = void 0;
    if (!bgOverride && !fgOverride) {
      adjustedColor = cache.getColor(bg.rgba, fg.rgba);
    }
    if (adjustedColor === void 0) {
      const ratio = this._optionsService.rawOptions.minimumContrastRatio / (cell.isDim() ? 2 : 1);
      adjustedColor = import_Color.color.ensureContrastRatio(bgOverride || bg, fgOverride || fg, ratio);
      cache.setColor((bgOverride || bg).rgba, (fgOverride || fg).rgba, adjustedColor ?? null);
    }
    if (adjustedColor) {
      this._addStyle(element, `color:${adjustedColor.css}`);
      return true;
    }
    return false;
  }
  _getContrastCache(cell) {
    if (cell.isDim()) {
      return this._themeService.colors.halfContrastCache;
    }
    return this._themeService.colors.contrastCache;
  }
  _addStyle(element, style) {
    element.setAttribute("style", `${element.getAttribute("style") || ""}${style};`);
  }
  _isCellInSelection(x, y) {
    const start = this._selectionStart;
    const end = this._selectionEnd;
    if (!start || !end) {
      return false;
    }
    if (this._columnSelectMode) {
      if (start[0] <= end[0]) {
        return x >= start[0] && y >= start[1] && x < end[0] && y <= end[1];
      }
      return x < start[0] && y >= start[1] && x >= end[0] && y <= end[1];
    }
    return y > start[1] && y < end[1] || start[1] === end[1] && y === start[1] && x >= start[0] && x < end[0] || start[1] < end[1] && y === end[1] && x < end[0] || start[1] < end[1] && y === start[1] && x >= start[0];
  }
};
DomRendererRowFactory = __decorateClass([
  __decorateParam(1, import_Services2.ICharacterJoinerService),
  __decorateParam(2, import_Services.IOptionsService),
  __decorateParam(3, import_Services2.ICoreBrowserService),
  __decorateParam(4, import_Services.ICoreService),
  __decorateParam(5, import_Services.IDecorationService),
  __decorateParam(6, import_Services2.IThemeService)
], DomRendererRowFactory);
function padStart(text, padChar, length) {
  while (text.length < length) {
    text = padChar + text;
  }
  return text;
}
//# sourceMappingURL=DomRendererRowFactory.js.map
