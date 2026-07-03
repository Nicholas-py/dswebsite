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
var TextureAtlas_exports = {};
__export(TextureAtlas_exports, {
  TextureAtlas: () => TextureAtlas
});
module.exports = __toCommonJS(TextureAtlas_exports);
var import_Constants = require("browser/renderer/shared/Constants");
var import_CustomGlyphs = require("browser/renderer/shared/CustomGlyphs");
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
var import_Color = require("common/Color");
var import_MultiKeyMap = require("common/MultiKeyMap");
var import_TaskQueue = require("common/TaskQueue");
var import_AttributeData = require("common/buffer/AttributeData");
var import_Constants2 = require("common/buffer/Constants");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const NULL_RASTERIZED_GLYPH = {
  texturePage: 0,
  texturePosition: { x: 0, y: 0 },
  texturePositionClipSpace: { x: 0, y: 0 },
  offset: { x: 0, y: 0 },
  size: { x: 0, y: 0 },
  sizeClipSpace: { x: 0, y: 0 }
};
const TMP_CANVAS_GLYPH_PADDING = 2;
var Constants = /* @__PURE__ */ ((Constants2) => {
  Constants2[Constants2["ROW_PIXEL_THRESHOLD"] = 2] = "ROW_PIXEL_THRESHOLD";
  Constants2[Constants2["FORCED_MAX_TEXTURE_SIZE"] = 4096] = "FORCED_MAX_TEXTURE_SIZE";
  return Constants2;
})(Constants || {});
let $glyph = void 0;
class TextureAtlas {
  constructor(_document, _config, _unicodeService) {
    this._document = _document;
    this._config = _config;
    this._unicodeService = _unicodeService;
    this._didWarmUp = false;
    this._cacheMap = new import_MultiKeyMap.FourKeyMap();
    this._cacheMapCombined = new import_MultiKeyMap.FourKeyMap();
    // The texture that the atlas is drawn to
    this._pages = [];
    // The set of atlas pages that can be written to
    this._activePages = [];
    this._workBoundingBox = { top: 0, left: 0, bottom: 0, right: 0 };
    this._workAttributeData = new import_AttributeData.AttributeData();
    this._textureSize = 512;
    this._onAddTextureAtlasCanvas = new import_event.Emitter();
    this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    this._onRemoveTextureAtlasCanvas = new import_event.Emitter();
    this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
    this._requestClearModel = false;
    this._createNewPage();
    this._tmpCanvas = createCanvas(
      _document,
      this._config.deviceCellWidth * 4 + TMP_CANVAS_GLYPH_PADDING * 2,
      this._config.deviceCellHeight + TMP_CANVAS_GLYPH_PADDING * 2
    );
    this._tmpCtx = (0, import_RendererUtils.throwIfFalsy)(this._tmpCanvas.getContext("2d", {
      alpha: this._config.allowTransparency,
      willReadFrequently: true
    }));
  }
  get pages() {
    return this._pages;
  }
  dispose() {
    for (const page of this.pages) {
      page.canvas.remove();
    }
    this._onAddTextureAtlasCanvas.dispose();
  }
  warmUp() {
    if (!this._didWarmUp) {
      this._doWarmUp();
      this._didWarmUp = true;
    }
  }
  _doWarmUp() {
    const queue = new import_TaskQueue.IdleTaskQueue();
    for (let i = 33; i < 126; i++) {
      queue.enqueue(() => {
        if (!this._cacheMap.get(i, import_Constants2.DEFAULT_COLOR, import_Constants2.DEFAULT_COLOR, import_Constants2.DEFAULT_EXT)) {
          const rasterizedGlyph = this._drawToCache(i, import_Constants2.DEFAULT_COLOR, import_Constants2.DEFAULT_COLOR, import_Constants2.DEFAULT_EXT);
          this._cacheMap.set(i, import_Constants2.DEFAULT_COLOR, import_Constants2.DEFAULT_COLOR, import_Constants2.DEFAULT_EXT, rasterizedGlyph);
        }
      });
    }
  }
  beginFrame() {
    return this._requestClearModel;
  }
  clearTexture() {
    if (this._pages[0].currentRow.x === 0 && this._pages[0].currentRow.y === 0) {
      return;
    }
    for (const page of this._pages) {
      page.clear();
    }
    this._cacheMap.clear();
    this._cacheMapCombined.clear();
    this._didWarmUp = false;
  }
  _createNewPage() {
    if (TextureAtlas.maxAtlasPages && this._pages.length >= Math.max(4, TextureAtlas.maxAtlasPages)) {
      const pagesBySize = this._pages.filter((e) => {
        return e.canvas.width * 2 <= (TextureAtlas.maxTextureSize || 4096 /* FORCED_MAX_TEXTURE_SIZE */);
      }).sort((a, b) => {
        if (b.canvas.width !== a.canvas.width) {
          return b.canvas.width - a.canvas.width;
        }
        return b.percentageUsed - a.percentageUsed;
      });
      let sameSizeI = -1;
      let size = 0;
      for (let i = 0; i < pagesBySize.length; i++) {
        if (pagesBySize[i].canvas.width !== size) {
          sameSizeI = i;
          size = pagesBySize[i].canvas.width;
        } else if (i - sameSizeI === 3) {
          break;
        }
      }
      const mergingPages = pagesBySize.slice(sameSizeI, sameSizeI + 4);
      const sortedMergingPagesIndexes = mergingPages.map((e) => e.glyphs[0].texturePage).sort((a, b) => a > b ? 1 : -1);
      const mergedPageIndex = this.pages.length - mergingPages.length;
      const mergedPage = this._mergePages(mergingPages, mergedPageIndex);
      mergedPage.version++;
      for (let i = sortedMergingPagesIndexes.length - 1; i >= 0; i--) {
        this._deletePage(sortedMergingPagesIndexes[i]);
      }
      this.pages.push(mergedPage);
      this._requestClearModel = true;
      this._onAddTextureAtlasCanvas.fire(mergedPage.canvas);
    }
    const newPage = new AtlasPage(this._document, this._textureSize);
    this._pages.push(newPage);
    this._activePages.push(newPage);
    this._onAddTextureAtlasCanvas.fire(newPage.canvas);
    return newPage;
  }
  _mergePages(mergingPages, mergedPageIndex) {
    const mergedSize = mergingPages[0].canvas.width * 2;
    const mergedPage = new AtlasPage(this._document, mergedSize, mergingPages);
    for (const [i, p] of mergingPages.entries()) {
      const xOffset = i * p.canvas.width % mergedSize;
      const yOffset = Math.floor(i / 2) * p.canvas.height;
      mergedPage.ctx.drawImage(p.canvas, xOffset, yOffset);
      for (const g of p.glyphs) {
        g.texturePage = mergedPageIndex;
        g.sizeClipSpace.x = g.size.x / mergedSize;
        g.sizeClipSpace.y = g.size.y / mergedSize;
        g.texturePosition.x += xOffset;
        g.texturePosition.y += yOffset;
        g.texturePositionClipSpace.x = g.texturePosition.x / mergedSize;
        g.texturePositionClipSpace.y = g.texturePosition.y / mergedSize;
      }
      this._onRemoveTextureAtlasCanvas.fire(p.canvas);
      const index = this._activePages.indexOf(p);
      if (index !== -1) {
        this._activePages.splice(index, 1);
      }
    }
    return mergedPage;
  }
  _deletePage(pageIndex) {
    this._pages.splice(pageIndex, 1);
    for (let j = pageIndex; j < this._pages.length; j++) {
      const adjustingPage = this._pages[j];
      for (const g of adjustingPage.glyphs) {
        g.texturePage--;
      }
      adjustingPage.version++;
    }
  }
  getRasterizedGlyphCombinedChar(chars, bg, fg, ext, restrictToCellHeight) {
    return this._getFromCacheMap(this._cacheMapCombined, chars, bg, fg, ext, restrictToCellHeight);
  }
  getRasterizedGlyph(code, bg, fg, ext, restrictToCellHeight) {
    return this._getFromCacheMap(this._cacheMap, code, bg, fg, ext, restrictToCellHeight);
  }
  /**
   * Gets the glyphs texture coords, drawing the texture if it's not already
   */
  _getFromCacheMap(cacheMap, key, bg, fg, ext, restrictToCellHeight = false) {
    $glyph = cacheMap.get(key, bg, fg, ext);
    if (!$glyph) {
      $glyph = this._drawToCache(key, bg, fg, ext, restrictToCellHeight);
      cacheMap.set(key, bg, fg, ext, $glyph);
    }
    return $glyph;
  }
  _getColorFromAnsiIndex(idx) {
    if (idx >= this._config.colors.ansi.length) {
      throw new Error("No color found for idx " + idx);
    }
    return this._config.colors.ansi[idx];
  }
  _getBackgroundColor(bgColorMode, bgColor, inverse, dim) {
    if (this._config.allowTransparency) {
      return import_Color.NULL_COLOR;
    }
    let result;
    switch (bgColorMode) {
      case import_Constants2.Attributes.CM_P16:
      case import_Constants2.Attributes.CM_P256:
        result = this._getColorFromAnsiIndex(bgColor);
        break;
      case import_Constants2.Attributes.CM_RGB:
        const arr = import_AttributeData.AttributeData.toColorRGB(bgColor);
        result = import_Color.channels.toColor(arr[0], arr[1], arr[2]);
        break;
      case import_Constants2.Attributes.CM_DEFAULT:
      default:
        if (inverse) {
          result = import_Color.color.opaque(this._config.colors.foreground);
        } else {
          result = this._config.colors.background;
        }
        break;
    }
    return result;
  }
  _getForegroundColor(bg, bgColorMode, bgColor, fg, fgColorMode, fgColor, inverse, dim, bold, excludeFromContrastRatioDemands) {
    const minimumContrastColor = this._getMinimumContrastColor(bg, bgColorMode, bgColor, fg, fgColorMode, fgColor, inverse, bold, dim, excludeFromContrastRatioDemands);
    if (minimumContrastColor) {
      return minimumContrastColor;
    }
    let result;
    switch (fgColorMode) {
      case import_Constants2.Attributes.CM_P16:
      case import_Constants2.Attributes.CM_P256:
        if (this._config.drawBoldTextInBrightColors && bold && fgColor < 8) {
          fgColor += 8;
        }
        result = this._getColorFromAnsiIndex(fgColor);
        break;
      case import_Constants2.Attributes.CM_RGB:
        const arr = import_AttributeData.AttributeData.toColorRGB(fgColor);
        result = import_Color.channels.toColor(arr[0], arr[1], arr[2]);
        break;
      case import_Constants2.Attributes.CM_DEFAULT:
      default:
        if (inverse) {
          result = this._config.colors.background;
        } else {
          result = this._config.colors.foreground;
        }
    }
    if (this._config.allowTransparency) {
      result = import_Color.color.opaque(result);
    }
    if (dim) {
      result = import_Color.color.multiplyOpacity(result, import_Constants.DIM_OPACITY);
    }
    return result;
  }
  _resolveBackgroundRgba(bgColorMode, bgColor, inverse) {
    switch (bgColorMode) {
      case import_Constants2.Attributes.CM_P16:
      case import_Constants2.Attributes.CM_P256:
        return this._getColorFromAnsiIndex(bgColor).rgba;
      case import_Constants2.Attributes.CM_RGB:
        return bgColor << 8;
      case import_Constants2.Attributes.CM_DEFAULT:
      default:
        if (inverse) {
          return this._config.colors.foreground.rgba;
        }
        return this._config.colors.background.rgba;
    }
  }
  _resolveForegroundRgba(fgColorMode, fgColor, inverse, bold) {
    switch (fgColorMode) {
      case import_Constants2.Attributes.CM_P16:
      case import_Constants2.Attributes.CM_P256:
        if (this._config.drawBoldTextInBrightColors && bold && fgColor < 8) {
          fgColor += 8;
        }
        return this._getColorFromAnsiIndex(fgColor).rgba;
      case import_Constants2.Attributes.CM_RGB:
        return fgColor << 8;
      case import_Constants2.Attributes.CM_DEFAULT:
      default:
        if (inverse) {
          return this._config.colors.background.rgba;
        }
        return this._config.colors.foreground.rgba;
    }
  }
  _getMinimumContrastColor(bg, bgColorMode, bgColor, fg, fgColorMode, fgColor, inverse, bold, dim, excludeFromContrastRatioDemands) {
    if (this._config.minimumContrastRatio === 1 || excludeFromContrastRatioDemands) {
      return void 0;
    }
    const cache = this._getContrastCache(dim);
    const adjustedColor = cache.getColor(bg, fg);
    if (adjustedColor !== void 0) {
      return adjustedColor || void 0;
    }
    const bgRgba = this._resolveBackgroundRgba(bgColorMode, bgColor, inverse);
    const fgRgba = this._resolveForegroundRgba(fgColorMode, fgColor, inverse, bold);
    const result = import_Color.rgba.ensureContrastRatio(bgRgba, fgRgba, this._config.minimumContrastRatio / (dim ? 2 : 1));
    if (!result) {
      cache.setColor(bg, fg, null);
      return void 0;
    }
    const color2 = import_Color.channels.toColor(
      result >> 24 & 255,
      result >> 16 & 255,
      result >> 8 & 255
    );
    cache.setColor(bg, fg, color2);
    return color2;
  }
  _getContrastCache(dim) {
    if (dim) {
      return this._config.colors.halfContrastCache;
    }
    return this._config.colors.contrastCache;
  }
  _drawToCache(codeOrChars, bg, fg, ext, restrictToCellHeight = false) {
    const chars = typeof codeOrChars === "number" ? String.fromCharCode(codeOrChars) : codeOrChars;
    const allowedWidth = Math.min(this._config.deviceCellWidth * Math.max(chars.length, 2) + TMP_CANVAS_GLYPH_PADDING * 2, this._textureSize);
    if (this._tmpCanvas.width < allowedWidth) {
      this._tmpCanvas.width = allowedWidth;
    }
    const allowedHeight = Math.min(this._config.deviceCellHeight + TMP_CANVAS_GLYPH_PADDING * 4, this._textureSize);
    if (this._tmpCanvas.height < allowedHeight) {
      this._tmpCanvas.height = allowedHeight;
    }
    this._tmpCtx.save();
    this._workAttributeData.fg = fg;
    this._workAttributeData.bg = bg;
    this._workAttributeData.extended.ext = ext;
    const invisible = !!this._workAttributeData.isInvisible();
    if (invisible) {
      return NULL_RASTERIZED_GLYPH;
    }
    const bold = !!this._workAttributeData.isBold();
    const inverse = !!this._workAttributeData.isInverse();
    const dim = !!this._workAttributeData.isDim();
    const italic = !!this._workAttributeData.isItalic();
    const underline = !!this._workAttributeData.isUnderline();
    const strikethrough = !!this._workAttributeData.isStrikethrough();
    const overline = !!this._workAttributeData.isOverline();
    let fgColor = this._workAttributeData.getFgColor();
    let fgColorMode = this._workAttributeData.getFgColorMode();
    let bgColor = this._workAttributeData.getBgColor();
    let bgColorMode = this._workAttributeData.getBgColorMode();
    if (inverse) {
      const temp = fgColor;
      fgColor = bgColor;
      bgColor = temp;
      const temp2 = fgColorMode;
      fgColorMode = bgColorMode;
      bgColorMode = temp2;
    }
    const backgroundColor = this._getBackgroundColor(bgColorMode, bgColor, inverse, dim);
    this._tmpCtx.globalCompositeOperation = "copy";
    this._tmpCtx.fillStyle = backgroundColor.css;
    this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height);
    this._tmpCtx.globalCompositeOperation = "source-over";
    const fontWeight = bold ? this._config.fontWeightBold : this._config.fontWeight;
    const fontStyle = italic ? "italic" : "";
    this._tmpCtx.font = `${fontStyle} ${fontWeight} ${this._config.fontSize * this._config.devicePixelRatio}px ${this._config.fontFamily}`;
    this._tmpCtx.textBaseline = import_Constants.TEXT_BASELINE;
    const powerlineGlyph = chars.length === 1 && (0, import_RendererUtils.isPowerlineGlyph)(chars.charCodeAt(0));
    const restrictedPowerlineGlyph = chars.length === 1 && (0, import_RendererUtils.isRestrictedPowerlineGlyph)(chars.charCodeAt(0));
    const foregroundColor = this._getForegroundColor(bg, bgColorMode, bgColor, fg, fgColorMode, fgColor, inverse, dim, bold, (0, import_RendererUtils.treatGlyphAsBackgroundColor)(chars.charCodeAt(0)));
    this._tmpCtx.fillStyle = foregroundColor.css;
    const padding = restrictedPowerlineGlyph ? 0 : TMP_CANVAS_GLYPH_PADDING * 2;
    let customGlyph = false;
    if (this._config.customGlyphs !== false) {
      customGlyph = (0, import_CustomGlyphs.tryDrawCustomChar)(this._tmpCtx, chars, padding, padding, this._config.deviceCellWidth, this._config.deviceCellHeight, this._config.fontSize, this._config.devicePixelRatio);
    }
    let enableClearThresholdCheck = !powerlineGlyph;
    let chWidth;
    if (typeof codeOrChars === "number") {
      chWidth = this._unicodeService.wcwidth(codeOrChars);
    } else {
      chWidth = this._unicodeService.getStringCellWidth(codeOrChars);
    }
    if (underline) {
      this._tmpCtx.save();
      const lineWidth = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 15));
      const yOffset = lineWidth % 2 === 1 ? 0.5 : 0;
      this._tmpCtx.lineWidth = lineWidth;
      if (this._workAttributeData.isUnderlineColorDefault()) {
        this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle;
      } else if (this._workAttributeData.isUnderlineColorRGB()) {
        enableClearThresholdCheck = false;
        this._tmpCtx.strokeStyle = `rgb(${import_AttributeData.AttributeData.toColorRGB(this._workAttributeData.getUnderlineColor()).join(",")})`;
      } else {
        enableClearThresholdCheck = false;
        let fg2 = this._workAttributeData.getUnderlineColor();
        if (this._config.drawBoldTextInBrightColors && this._workAttributeData.isBold() && fg2 < 8) {
          fg2 += 8;
        }
        this._tmpCtx.strokeStyle = this._getColorFromAnsiIndex(fg2).css;
      }
      this._tmpCtx.beginPath();
      const xLeft = padding;
      const yTop = Math.ceil(padding + this._config.deviceCharHeight) - yOffset - (restrictToCellHeight ? lineWidth * 2 : 0);
      const yMid = yTop + lineWidth;
      const yBot = yTop + lineWidth * 2;
      let nextOffset = this._workAttributeData.getUnderlineVariantOffset();
      for (let i = 0; i < chWidth; i++) {
        this._tmpCtx.save();
        const xChLeft = xLeft + i * this._config.deviceCellWidth;
        const xChRight = xLeft + (i + 1) * this._config.deviceCellWidth;
        const xChMid = xChLeft + this._config.deviceCellWidth / 2;
        switch (this._workAttributeData.extended.underlineStyle) {
          case import_Constants2.UnderlineStyle.DOUBLE:
            this._tmpCtx.moveTo(xChLeft, yTop);
            this._tmpCtx.lineTo(xChRight, yTop);
            this._tmpCtx.moveTo(xChLeft, yBot);
            this._tmpCtx.lineTo(xChRight, yBot);
            break;
          case import_Constants2.UnderlineStyle.CURLY:
            const yCurlyBot = lineWidth <= 1 ? yBot : Math.ceil(padding + this._config.deviceCharHeight - lineWidth / 2) - yOffset;
            const yCurlyTop = lineWidth <= 1 ? yTop : Math.ceil(padding + this._config.deviceCharHeight + lineWidth / 2) - yOffset;
            const clipRegion = new Path2D();
            clipRegion.rect(xChLeft, yTop, this._config.deviceCellWidth, yBot - yTop);
            this._tmpCtx.clip(clipRegion);
            this._tmpCtx.moveTo(xChLeft - this._config.deviceCellWidth / 2, yMid);
            this._tmpCtx.bezierCurveTo(
              xChLeft - this._config.deviceCellWidth / 2,
              yCurlyTop,
              xChLeft,
              yCurlyTop,
              xChLeft,
              yMid
            );
            this._tmpCtx.bezierCurveTo(
              xChLeft,
              yCurlyBot,
              xChMid,
              yCurlyBot,
              xChMid,
              yMid
            );
            this._tmpCtx.bezierCurveTo(
              xChMid,
              yCurlyTop,
              xChRight,
              yCurlyTop,
              xChRight,
              yMid
            );
            this._tmpCtx.bezierCurveTo(
              xChRight,
              yCurlyBot,
              xChRight + this._config.deviceCellWidth / 2,
              yCurlyBot,
              xChRight + this._config.deviceCellWidth / 2,
              yMid
            );
            break;
          case import_Constants2.UnderlineStyle.DOTTED:
            const offsetWidth = nextOffset === 0 ? 0 : nextOffset >= lineWidth ? lineWidth * 2 - nextOffset : lineWidth - nextOffset;
            const isLineStart = nextOffset >= lineWidth ? false : true;
            if (isLineStart === false || offsetWidth === 0) {
              this._tmpCtx.setLineDash([Math.round(lineWidth), Math.round(lineWidth)]);
              this._tmpCtx.moveTo(xChLeft + offsetWidth, yTop);
              this._tmpCtx.lineTo(xChRight, yTop);
            } else {
              this._tmpCtx.setLineDash([Math.round(lineWidth), Math.round(lineWidth)]);
              this._tmpCtx.moveTo(xChLeft, yTop);
              this._tmpCtx.lineTo(xChLeft + offsetWidth, yTop);
              this._tmpCtx.moveTo(xChLeft + offsetWidth + lineWidth, yTop);
              this._tmpCtx.lineTo(xChRight, yTop);
            }
            nextOffset = (0, import_RendererUtils.computeNextVariantOffset)(xChRight - xChLeft, lineWidth, nextOffset);
            break;
          case import_Constants2.UnderlineStyle.DASHED:
            const lineRatio = 0.6;
            const gapRatio = 0.3;
            const xChWidth = xChRight - xChLeft;
            const line = Math.floor(lineRatio * xChWidth);
            const gap = Math.floor(gapRatio * xChWidth);
            const end = xChWidth - line - gap;
            this._tmpCtx.setLineDash([line, gap, end]);
            this._tmpCtx.moveTo(xChLeft, yTop);
            this._tmpCtx.lineTo(xChRight, yTop);
            break;
          case import_Constants2.UnderlineStyle.SINGLE:
          default:
            this._tmpCtx.moveTo(xChLeft, yTop);
            this._tmpCtx.lineTo(xChRight, yTop);
            break;
        }
        this._tmpCtx.stroke();
        this._tmpCtx.restore();
      }
      this._tmpCtx.restore();
      if (!customGlyph && this._config.fontSize >= 12) {
        if (!this._config.allowTransparency && chars !== " ") {
          this._tmpCtx.save();
          this._tmpCtx.textBaseline = "alphabetic";
          const metrics = this._tmpCtx.measureText(chars);
          this._tmpCtx.restore();
          if ("actualBoundingBoxDescent" in metrics && metrics.actualBoundingBoxDescent > 0) {
            this._tmpCtx.save();
            const clipRegion = new Path2D();
            clipRegion.rect(xLeft, yTop - Math.ceil(lineWidth / 2), this._config.deviceCellWidth * chWidth, yBot - yTop + Math.ceil(lineWidth / 2));
            this._tmpCtx.clip(clipRegion);
            this._tmpCtx.lineWidth = this._config.devicePixelRatio * 3;
            this._tmpCtx.strokeStyle = backgroundColor.css;
            this._tmpCtx.strokeText(chars, padding, padding + this._config.deviceCharHeight);
            this._tmpCtx.restore();
          }
        }
      }
    }
    if (overline) {
      const lineWidth = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 15));
      const yOffset = lineWidth % 2 === 1 ? 0.5 : 0;
      this._tmpCtx.lineWidth = lineWidth;
      this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle;
      this._tmpCtx.beginPath();
      this._tmpCtx.moveTo(padding, padding + yOffset);
      this._tmpCtx.lineTo(padding + this._config.deviceCharWidth * chWidth, padding + yOffset);
      this._tmpCtx.stroke();
    }
    if (!customGlyph) {
      this._tmpCtx.fillText(chars, padding, padding + this._config.deviceCharHeight);
    }
    if (chars === "_" && !this._config.allowTransparency) {
      let isBeyondCellBounds = clearColor(this._tmpCtx.getImageData(padding, padding, this._config.deviceCellWidth, this._config.deviceCellHeight), backgroundColor, foregroundColor, enableClearThresholdCheck);
      if (isBeyondCellBounds) {
        for (let offset = 1; offset <= 5; offset++) {
          this._tmpCtx.save();
          this._tmpCtx.fillStyle = backgroundColor.css;
          this._tmpCtx.fillRect(0, 0, this._tmpCanvas.width, this._tmpCanvas.height);
          this._tmpCtx.restore();
          this._tmpCtx.fillText(chars, padding, padding + this._config.deviceCharHeight - offset);
          isBeyondCellBounds = clearColor(this._tmpCtx.getImageData(padding, padding, this._config.deviceCellWidth, this._config.deviceCellHeight), backgroundColor, foregroundColor, enableClearThresholdCheck);
          if (!isBeyondCellBounds) {
            break;
          }
        }
      }
    }
    if (strikethrough) {
      const lineWidth = Math.max(1, Math.floor(this._config.fontSize * this._config.devicePixelRatio / 10));
      const yOffset = this._tmpCtx.lineWidth % 2 === 1 ? 0.5 : 0;
      this._tmpCtx.lineWidth = lineWidth;
      this._tmpCtx.strokeStyle = this._tmpCtx.fillStyle;
      this._tmpCtx.beginPath();
      this._tmpCtx.moveTo(padding, padding + Math.floor(this._config.deviceCharHeight / 2) - yOffset);
      this._tmpCtx.lineTo(padding + this._config.deviceCharWidth * chWidth, padding + Math.floor(this._config.deviceCharHeight / 2) - yOffset);
      this._tmpCtx.stroke();
    }
    this._tmpCtx.restore();
    const imageData = this._tmpCtx.getImageData(
      0,
      0,
      this._tmpCanvas.width,
      this._tmpCanvas.height
    );
    let isEmpty;
    if (!this._config.allowTransparency) {
      isEmpty = clearColor(imageData, backgroundColor, foregroundColor, enableClearThresholdCheck);
    } else {
      isEmpty = checkCompletelyTransparent(imageData);
    }
    if (isEmpty) {
      return NULL_RASTERIZED_GLYPH;
    }
    const rasterizedGlyph = this._findGlyphBoundingBox(imageData, this._workBoundingBox, allowedWidth, restrictedPowerlineGlyph, customGlyph, padding);
    let activePage;
    let activeRow;
    while (true) {
      if (this._activePages.length === 0) {
        const newPage = this._createNewPage();
        activePage = newPage;
        activeRow = newPage.currentRow;
        activeRow.height = rasterizedGlyph.size.y;
        break;
      }
      activePage = this._activePages[this._activePages.length - 1];
      activeRow = activePage.currentRow;
      for (const p of this._activePages) {
        if (rasterizedGlyph.size.y <= p.currentRow.height) {
          activePage = p;
          activeRow = p.currentRow;
        }
      }
      for (let i = this._activePages.length - 1; i >= 0; i--) {
        for (const row of this._activePages[i].fixedRows) {
          if (row.height <= activeRow.height && rasterizedGlyph.size.y <= row.height) {
            activePage = this._activePages[i];
            activeRow = row;
          }
        }
      }
      if (activeRow.y + rasterizedGlyph.size.y >= activePage.canvas.height || activeRow.height > rasterizedGlyph.size.y + 2 /* ROW_PIXEL_THRESHOLD */) {
        let wasPageAndRowFound = false;
        if (activePage.currentRow.y + activePage.currentRow.height + rasterizedGlyph.size.y >= activePage.canvas.height) {
          let candidatePage;
          for (const p of this._activePages) {
            if (p.currentRow.y + p.currentRow.height + rasterizedGlyph.size.y < p.canvas.height) {
              candidatePage = p;
              break;
            }
          }
          if (candidatePage) {
            activePage = candidatePage;
          } else {
            if (TextureAtlas.maxAtlasPages && this._pages.length >= TextureAtlas.maxAtlasPages && activeRow.y + rasterizedGlyph.size.y <= activePage.canvas.height && activeRow.height >= rasterizedGlyph.size.y && activeRow.x + rasterizedGlyph.size.x <= activePage.canvas.width) {
              wasPageAndRowFound = true;
            } else {
              const newPage = this._createNewPage();
              activePage = newPage;
              activeRow = newPage.currentRow;
              activeRow.height = rasterizedGlyph.size.y;
              wasPageAndRowFound = true;
            }
          }
        }
        if (!wasPageAndRowFound) {
          if (activePage.currentRow.height > 0) {
            activePage.fixedRows.push(activePage.currentRow);
          }
          activeRow = {
            x: 0,
            y: activePage.currentRow.y + activePage.currentRow.height,
            height: rasterizedGlyph.size.y
          };
          activePage.fixedRows.push(activeRow);
          activePage.currentRow = {
            x: 0,
            y: activeRow.y + activeRow.height,
            height: 0
          };
        }
      }
      if (activeRow.x + rasterizedGlyph.size.x <= activePage.canvas.width) {
        break;
      }
      if (activeRow === activePage.currentRow) {
        activeRow.x = 0;
        activeRow.y += activeRow.height;
        activeRow.height = 0;
      } else {
        activePage.fixedRows.splice(activePage.fixedRows.indexOf(activeRow), 1);
      }
    }
    rasterizedGlyph.texturePage = this._pages.indexOf(activePage);
    rasterizedGlyph.texturePosition.x = activeRow.x;
    rasterizedGlyph.texturePosition.y = activeRow.y;
    rasterizedGlyph.texturePositionClipSpace.x = activeRow.x / activePage.canvas.width;
    rasterizedGlyph.texturePositionClipSpace.y = activeRow.y / activePage.canvas.height;
    rasterizedGlyph.sizeClipSpace.x /= activePage.canvas.width;
    rasterizedGlyph.sizeClipSpace.y /= activePage.canvas.height;
    activeRow.height = Math.max(activeRow.height, rasterizedGlyph.size.y);
    activeRow.x += rasterizedGlyph.size.x;
    activePage.ctx.putImageData(
      imageData,
      rasterizedGlyph.texturePosition.x - this._workBoundingBox.left,
      rasterizedGlyph.texturePosition.y - this._workBoundingBox.top,
      this._workBoundingBox.left,
      this._workBoundingBox.top,
      rasterizedGlyph.size.x,
      rasterizedGlyph.size.y
    );
    activePage.addGlyph(rasterizedGlyph);
    activePage.version++;
    return rasterizedGlyph;
  }
  /**
   * Given an ImageData object, find the bounding box of the non-transparent
   * portion of the texture and return an IRasterizedGlyph with these
   * dimensions.
   * @param imageData The image data to read.
   * @param boundingBox An IBoundingBox to put the clipped bounding box values.
   */
  _findGlyphBoundingBox(imageData, boundingBox, allowedWidth, restrictedGlyph, customGlyph, padding) {
    boundingBox.top = 0;
    const height = restrictedGlyph ? this._config.deviceCellHeight : this._tmpCanvas.height;
    const width = restrictedGlyph ? this._config.deviceCellWidth : allowedWidth;
    let found = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          boundingBox.top = y;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    boundingBox.left = 0;
    found = false;
    for (let x = 0; x < padding + width; x++) {
      for (let y = 0; y < height; y++) {
        const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          boundingBox.left = x;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    boundingBox.right = width;
    found = false;
    for (let x = padding + width - 1; x >= padding; x--) {
      for (let y = 0; y < height; y++) {
        const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          boundingBox.right = x;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    boundingBox.bottom = height;
    found = false;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const alphaOffset = y * this._tmpCanvas.width * 4 + x * 4 + 3;
        if (imageData.data[alphaOffset] !== 0) {
          boundingBox.bottom = y;
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    return {
      texturePage: 0,
      texturePosition: { x: 0, y: 0 },
      texturePositionClipSpace: { x: 0, y: 0 },
      size: {
        x: boundingBox.right - boundingBox.left + 1,
        y: boundingBox.bottom - boundingBox.top + 1
      },
      sizeClipSpace: {
        x: boundingBox.right - boundingBox.left + 1,
        y: boundingBox.bottom - boundingBox.top + 1
      },
      offset: {
        x: -boundingBox.left + padding + (restrictedGlyph || customGlyph ? Math.floor((this._config.deviceCellWidth - this._config.deviceCharWidth) / 2) : 0),
        y: -boundingBox.top + padding + (restrictedGlyph || customGlyph ? this._config.lineHeight === 1 ? 0 : Math.round((this._config.deviceCellHeight - this._config.deviceCharHeight) / 2) : 0)
      }
    };
  }
}
class AtlasPage {
  constructor(document, size, sourcePages) {
    this._usedPixels = 0;
    this._glyphs = [];
    /**
     * Used to check whether the canvas of the atlas page has changed.
     */
    this.version = 0;
    // Texture atlas current positioning data. The texture packing strategy used is to fill from
    // left-to-right and top-to-bottom. When the glyph being written is less than half of the current
    // row's height, the following happens:
    //
    // - The current row becomes the fixed height row A
    // - A new fixed height row B the exact size of the glyph is created below the current row
    // - A new dynamic height current row is created below B
    //
    // This strategy does a good job preventing space being wasted for very short glyphs such as
    // underscores, hyphens etc. or those with underlines rendered.
    this.currentRow = {
      x: 0,
      y: 0,
      height: 0
    };
    this.fixedRows = [];
    if (sourcePages) {
      for (const p of sourcePages) {
        this._glyphs.push(...p.glyphs);
        this._usedPixels += p._usedPixels;
      }
    }
    this.canvas = createCanvas(document, size, size);
    this.ctx = (0, import_RendererUtils.throwIfFalsy)(this.canvas.getContext("2d", { alpha: true }));
  }
  get percentageUsed() {
    return this._usedPixels / (this.canvas.width * this.canvas.height);
  }
  get glyphs() {
    return this._glyphs;
  }
  addGlyph(glyph) {
    this._glyphs.push(glyph);
    this._usedPixels += glyph.size.x * glyph.size.y;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.currentRow.x = 0;
    this.currentRow.y = 0;
    this.currentRow.height = 0;
    this.fixedRows.length = 0;
    this.version++;
  }
}
function clearColor(imageData, bg, fg, enableThresholdCheck) {
  const r = bg.rgba >>> 24;
  const g = bg.rgba >>> 16 & 255;
  const b = bg.rgba >>> 8 & 255;
  const fgR = fg.rgba >>> 24;
  const fgG = fg.rgba >>> 16 & 255;
  const fgB = fg.rgba >>> 8 & 255;
  const threshold = Math.floor((Math.abs(r - fgR) + Math.abs(g - fgG) + Math.abs(b - fgB)) / 12);
  let isEmpty = true;
  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    if (imageData.data[offset] === r && imageData.data[offset + 1] === g && imageData.data[offset + 2] === b) {
      imageData.data[offset + 3] = 0;
    } else {
      if (enableThresholdCheck && Math.abs(imageData.data[offset] - r) + Math.abs(imageData.data[offset + 1] - g) + Math.abs(imageData.data[offset + 2] - b) < threshold) {
        imageData.data[offset + 3] = 0;
      } else {
        isEmpty = false;
      }
    }
  }
  return isEmpty;
}
function checkCompletelyTransparent(imageData) {
  for (let offset = 0; offset < imageData.data.length; offset += 4) {
    if (imageData.data[offset + 3] > 0) {
      return false;
    }
  }
  return true;
}
function createCanvas(document, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}
//# sourceMappingURL=TextureAtlas.js.map
