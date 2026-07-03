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
var CellColorResolver_exports = {};
__export(CellColorResolver_exports, {
  CellColorResolver: () => CellColorResolver
});
module.exports = __toCommonJS(CellColorResolver_exports);
var import_Constants = require("common/buffer/Constants");
var import_Color = require("common/Color");
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
let $fg = 0;
let $bg = 0;
let $hasFg = false;
let $hasBg = false;
let $isSelected = false;
let $colors;
let $variantOffset = 0;
class CellColorResolver {
  constructor(_terminal, _optionService, _selectionRenderModel, _decorationService, _coreBrowserService, _themeService) {
    this._terminal = _terminal;
    this._optionService = _optionService;
    this._selectionRenderModel = _selectionRenderModel;
    this._decorationService = _decorationService;
    this._coreBrowserService = _coreBrowserService;
    this._themeService = _themeService;
    /**
     * The shared result of the {@link resolve} call. This is only safe to use immediately after as
     * any other calls will share object.
     */
    this.result = {
      fg: 0,
      bg: 0,
      ext: 0
    };
  }
  /**
   * Resolves colors for the cell, putting the result into the shared {@link result}. This resolves
   * overrides, inverse and selection for the cell which can then be used to feed into the renderer.
   */
  resolve(cell, x, y, deviceCellWidth) {
    this.result.bg = cell.bg;
    this.result.fg = cell.fg;
    this.result.ext = cell.bg & import_Constants.BgFlags.HAS_EXTENDED ? cell.extended.ext : 0;
    $bg = 0;
    $fg = 0;
    $hasBg = false;
    $hasFg = false;
    $isSelected = false;
    $colors = this._themeService.colors;
    $variantOffset = 0;
    const code = cell.getCode();
    if (code !== import_Constants.NULL_CELL_CODE && cell.extended.underlineStyle === import_Constants.UnderlineStyle.DOTTED) {
      const lineWidth = Math.max(1, Math.floor(this._optionService.rawOptions.fontSize * this._coreBrowserService.dpr / 15));
      $variantOffset = x * deviceCellWidth % (Math.round(lineWidth) * 2);
    }
    this._decorationService.forEachDecorationAtCell(x, y, "bottom", (d) => {
      if (d.backgroundColorRGB) {
        $bg = d.backgroundColorRGB.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
        $hasBg = true;
      }
      if (d.foregroundColorRGB) {
        $fg = d.foregroundColorRGB.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
        $hasFg = true;
      }
    });
    $isSelected = this._selectionRenderModel.isCellSelected(this._terminal, x, y);
    if ($isSelected) {
      if (this.result.fg & import_Constants.FgFlags.INVERSE || (this.result.bg & import_Constants.Attributes.CM_MASK) !== import_Constants.Attributes.CM_DEFAULT) {
        if (this.result.fg & import_Constants.FgFlags.INVERSE) {
          switch (this.result.fg & import_Constants.Attributes.CM_MASK) {
            case import_Constants.Attributes.CM_P16:
            case import_Constants.Attributes.CM_P256:
              $bg = this._themeService.colors.ansi[this.result.fg & import_Constants.Attributes.PCOLOR_MASK].rgba;
              break;
            case import_Constants.Attributes.CM_RGB:
              $bg = (this.result.fg & import_Constants.Attributes.RGB_MASK) << 8 | 255;
              break;
            case import_Constants.Attributes.CM_DEFAULT:
            default:
              $bg = this._themeService.colors.foreground.rgba;
          }
        } else {
          switch (this.result.bg & import_Constants.Attributes.CM_MASK) {
            case import_Constants.Attributes.CM_P16:
            case import_Constants.Attributes.CM_P256:
              $bg = this._themeService.colors.ansi[this.result.bg & import_Constants.Attributes.PCOLOR_MASK].rgba;
              break;
            case import_Constants.Attributes.CM_RGB:
              $bg = (this.result.bg & import_Constants.Attributes.RGB_MASK) << 8 | 255;
              break;
          }
        }
        $bg = import_Color.rgba.blend(
          $bg,
          (this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba & 4294967040 | 128
        ) >> 8 & import_Constants.Attributes.RGB_MASK;
      } else {
        $bg = (this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba >> 8 & import_Constants.Attributes.RGB_MASK;
      }
      $hasBg = true;
      if ($colors.selectionForeground) {
        $fg = $colors.selectionForeground.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
        $hasFg = true;
      }
      if ((0, import_RendererUtils.treatGlyphAsBackgroundColor)(cell.getCode())) {
        if (this.result.fg & import_Constants.FgFlags.INVERSE && (this.result.bg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_DEFAULT) {
          $fg = (this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba >> 8 & import_Constants.Attributes.RGB_MASK;
        } else {
          if (this.result.fg & import_Constants.FgFlags.INVERSE) {
            switch (this.result.bg & import_Constants.Attributes.CM_MASK) {
              case import_Constants.Attributes.CM_P16:
              case import_Constants.Attributes.CM_P256:
                $fg = this._themeService.colors.ansi[this.result.bg & import_Constants.Attributes.PCOLOR_MASK].rgba;
                break;
              case import_Constants.Attributes.CM_RGB:
                $fg = (this.result.bg & import_Constants.Attributes.RGB_MASK) << 8 | 255;
                break;
            }
          } else {
            switch (this.result.fg & import_Constants.Attributes.CM_MASK) {
              case import_Constants.Attributes.CM_P16:
              case import_Constants.Attributes.CM_P256:
                $fg = this._themeService.colors.ansi[this.result.fg & import_Constants.Attributes.PCOLOR_MASK].rgba;
                break;
              case import_Constants.Attributes.CM_RGB:
                $fg = (this.result.fg & import_Constants.Attributes.RGB_MASK) << 8 | 255;
                break;
              case import_Constants.Attributes.CM_DEFAULT:
              default:
                $fg = this._themeService.colors.foreground.rgba;
            }
          }
          $fg = import_Color.rgba.blend(
            $fg,
            (this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba & 4294967040 | 128
          ) >> 8 & import_Constants.Attributes.RGB_MASK;
        }
        $hasFg = true;
      }
    }
    this._decorationService.forEachDecorationAtCell(x, y, "top", (d) => {
      if (d.backgroundColorRGB) {
        $bg = d.backgroundColorRGB.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
        $hasBg = true;
      }
      if (d.foregroundColorRGB) {
        $fg = d.foregroundColorRGB.rgba >> 8 & import_Constants.Attributes.RGB_MASK;
        $hasFg = true;
      }
    });
    if ($hasBg) {
      if ($isSelected) {
        $bg = cell.bg & ~import_Constants.Attributes.RGB_MASK & ~import_Constants.BgFlags.DIM | $bg | import_Constants.Attributes.CM_RGB;
      } else {
        $bg = cell.bg & ~import_Constants.Attributes.RGB_MASK | $bg | import_Constants.Attributes.CM_RGB;
      }
    }
    if ($hasFg) {
      $fg = cell.fg & ~import_Constants.Attributes.RGB_MASK & ~import_Constants.FgFlags.INVERSE | $fg | import_Constants.Attributes.CM_RGB;
    }
    if (this.result.fg & import_Constants.FgFlags.INVERSE) {
      if ($hasBg && !$hasFg) {
        if ((this.result.bg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_DEFAULT) {
          $fg = this.result.fg & ~(import_Constants.Attributes.RGB_MASK | import_Constants.FgFlags.INVERSE | import_Constants.Attributes.CM_MASK) | $colors.background.rgba >> 8 & import_Constants.Attributes.RGB_MASK & import_Constants.Attributes.RGB_MASK | import_Constants.Attributes.CM_RGB;
        } else {
          $fg = this.result.fg & ~(import_Constants.Attributes.RGB_MASK | import_Constants.FgFlags.INVERSE | import_Constants.Attributes.CM_MASK) | this.result.bg & (import_Constants.Attributes.RGB_MASK | import_Constants.Attributes.CM_MASK);
        }
        $hasFg = true;
      }
      if (!$hasBg && $hasFg) {
        if ((this.result.fg & import_Constants.Attributes.CM_MASK) === import_Constants.Attributes.CM_DEFAULT) {
          $bg = this.result.bg & ~(import_Constants.Attributes.RGB_MASK | import_Constants.Attributes.CM_MASK) | $colors.foreground.rgba >> 8 & import_Constants.Attributes.RGB_MASK & import_Constants.Attributes.RGB_MASK | import_Constants.Attributes.CM_RGB;
        } else {
          $bg = this.result.bg & ~(import_Constants.Attributes.RGB_MASK | import_Constants.Attributes.CM_MASK) | this.result.fg & (import_Constants.Attributes.RGB_MASK | import_Constants.Attributes.CM_MASK);
        }
        $hasBg = true;
      }
    }
    $colors = void 0;
    this.result.bg = $hasBg ? $bg : this.result.bg;
    this.result.fg = $hasFg ? $fg : this.result.fg;
    this.result.ext &= ~import_Constants.ExtFlags.VARIANT_OFFSET;
    this.result.ext |= $variantOffset << 29 & import_Constants.ExtFlags.VARIANT_OFFSET;
  }
}
//# sourceMappingURL=CellColorResolver.js.map
