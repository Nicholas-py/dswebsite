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
var Color_exports = {};
__export(Color_exports, {
  NULL_COLOR: () => NULL_COLOR,
  channels: () => channels,
  color: () => color,
  contrastRatio: () => contrastRatio,
  css: () => css,
  rgb: () => rgb,
  rgba: () => rgba,
  toPaddedHex: () => toPaddedHex
});
module.exports = __toCommonJS(Color_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let $r = 0;
let $g = 0;
let $b = 0;
let $a = 0;
const NULL_COLOR = {
  css: "#00000000",
  rgba: 0
};
var channels;
((channels2) => {
  function toCss(r, g, b, a) {
    if (a !== void 0) {
      return `#${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}${toPaddedHex(a)}`;
    }
    return `#${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}`;
  }
  channels2.toCss = toCss;
  function toRgba(r, g, b, a = 255) {
    return (r << 24 | g << 16 | b << 8 | a) >>> 0;
  }
  channels2.toRgba = toRgba;
  function toColor(r, g, b, a) {
    return {
      css: channels2.toCss(r, g, b, a),
      rgba: channels2.toRgba(r, g, b, a)
    };
  }
  channels2.toColor = toColor;
})(channels || (channels = {}));
var color;
((color2) => {
  function blend(bg, fg) {
    $a = (fg.rgba & 255) / 255;
    if ($a === 1) {
      return {
        css: fg.css,
        rgba: fg.rgba
      };
    }
    const fgR = fg.rgba >> 24 & 255;
    const fgG = fg.rgba >> 16 & 255;
    const fgB = fg.rgba >> 8 & 255;
    const bgR = bg.rgba >> 24 & 255;
    const bgG = bg.rgba >> 16 & 255;
    const bgB = bg.rgba >> 8 & 255;
    $r = bgR + Math.round((fgR - bgR) * $a);
    $g = bgG + Math.round((fgG - bgG) * $a);
    $b = bgB + Math.round((fgB - bgB) * $a);
    const css2 = channels.toCss($r, $g, $b);
    const rgba2 = channels.toRgba($r, $g, $b);
    return { css: css2, rgba: rgba2 };
  }
  color2.blend = blend;
  function isOpaque(color3) {
    return (color3.rgba & 255) === 255;
  }
  color2.isOpaque = isOpaque;
  function ensureContrastRatio(bg, fg, ratio) {
    const result = rgba.ensureContrastRatio(bg.rgba, fg.rgba, ratio);
    if (!result) {
      return void 0;
    }
    return channels.toColor(
      result >> 24 & 255,
      result >> 16 & 255,
      result >> 8 & 255
    );
  }
  color2.ensureContrastRatio = ensureContrastRatio;
  function opaque(color3) {
    const rgbaColor = (color3.rgba | 255) >>> 0;
    [$r, $g, $b] = rgba.toChannels(rgbaColor);
    return {
      css: channels.toCss($r, $g, $b),
      rgba: rgbaColor
    };
  }
  color2.opaque = opaque;
  function opacity(color3, opacity2) {
    $a = Math.round(opacity2 * 255);
    [$r, $g, $b] = rgba.toChannels(color3.rgba);
    return {
      css: channels.toCss($r, $g, $b, $a),
      rgba: channels.toRgba($r, $g, $b, $a)
    };
  }
  color2.opacity = opacity;
  function multiplyOpacity(color3, factor) {
    $a = color3.rgba & 255;
    return opacity(color3, $a * factor / 255);
  }
  color2.multiplyOpacity = multiplyOpacity;
  function toColorRGB(color3) {
    return [color3.rgba >> 24 & 255, color3.rgba >> 16 & 255, color3.rgba >> 8 & 255];
  }
  color2.toColorRGB = toColorRGB;
})(color || (color = {}));
var css;
((css2) => {
  let $ctx;
  let $litmusColor;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });
    if (ctx) {
      $ctx = ctx;
      $ctx.globalCompositeOperation = "copy";
      $litmusColor = $ctx.createLinearGradient(0, 0, 1, 1);
    }
  } catch {
  }
  function toColor(css3) {
    if (css3.match(/#[\da-f]{3,8}/i)) {
      switch (css3.length) {
        case 4: {
          $r = parseInt(css3.slice(1, 2).repeat(2), 16);
          $g = parseInt(css3.slice(2, 3).repeat(2), 16);
          $b = parseInt(css3.slice(3, 4).repeat(2), 16);
          return channels.toColor($r, $g, $b);
        }
        case 5: {
          $r = parseInt(css3.slice(1, 2).repeat(2), 16);
          $g = parseInt(css3.slice(2, 3).repeat(2), 16);
          $b = parseInt(css3.slice(3, 4).repeat(2), 16);
          $a = parseInt(css3.slice(4, 5).repeat(2), 16);
          return channels.toColor($r, $g, $b, $a);
        }
        case 7:
          return {
            css: css3,
            rgba: (parseInt(css3.slice(1), 16) << 8 | 255) >>> 0
          };
        case 9:
          return {
            css: css3,
            rgba: parseInt(css3.slice(1), 16) >>> 0
          };
      }
    }
    const rgbaMatch = css3.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
    if (rgbaMatch) {
      $r = parseInt(rgbaMatch[1]);
      $g = parseInt(rgbaMatch[2]);
      $b = parseInt(rgbaMatch[3]);
      $a = Math.round((rgbaMatch[5] === void 0 ? 1 : parseFloat(rgbaMatch[5])) * 255);
      return channels.toColor($r, $g, $b, $a);
    }
    if (!$ctx || !$litmusColor) {
      throw new Error("css.toColor: Unsupported css format");
    }
    $ctx.fillStyle = $litmusColor;
    $ctx.fillStyle = css3;
    if (typeof $ctx.fillStyle !== "string") {
      throw new Error("css.toColor: Unsupported css format");
    }
    $ctx.fillRect(0, 0, 1, 1);
    [$r, $g, $b, $a] = $ctx.getImageData(0, 0, 1, 1).data;
    if ($a !== 255) {
      throw new Error("css.toColor: Unsupported css format");
    }
    return {
      rgba: channels.toRgba($r, $g, $b, $a),
      css: css3
    };
  }
  css2.toColor = toColor;
})(css || (css = {}));
var rgb;
((rgb2) => {
  function relativeLuminance(rgb3) {
    return relativeLuminance2(
      rgb3 >> 16 & 255,
      rgb3 >> 8 & 255,
      rgb3 & 255
    );
  }
  rgb2.relativeLuminance = relativeLuminance;
  function relativeLuminance2(r, g, b) {
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    const rr = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    const rg = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    const rb = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    return rr * 0.2126 + rg * 0.7152 + rb * 0.0722;
  }
  rgb2.relativeLuminance2 = relativeLuminance2;
})(rgb || (rgb = {}));
var rgba;
((rgba2) => {
  function blend(bg, fg) {
    $a = (fg & 255) / 255;
    if ($a === 1) {
      return fg;
    }
    const fgR = fg >> 24 & 255;
    const fgG = fg >> 16 & 255;
    const fgB = fg >> 8 & 255;
    const bgR = bg >> 24 & 255;
    const bgG = bg >> 16 & 255;
    const bgB = bg >> 8 & 255;
    $r = bgR + Math.round((fgR - bgR) * $a);
    $g = bgG + Math.round((fgG - bgG) * $a);
    $b = bgB + Math.round((fgB - bgB) * $a);
    return channels.toRgba($r, $g, $b);
  }
  rgba2.blend = blend;
  function ensureContrastRatio(bgRgba, fgRgba, ratio) {
    const bgL = rgb.relativeLuminance(bgRgba >> 8);
    const fgL = rgb.relativeLuminance(fgRgba >> 8);
    const cr = contrastRatio(bgL, fgL);
    if (cr < ratio) {
      if (fgL < bgL) {
        const resultA2 = reduceLuminance(bgRgba, fgRgba, ratio);
        const resultARatio2 = contrastRatio(bgL, rgb.relativeLuminance(resultA2 >> 8));
        if (resultARatio2 < ratio) {
          const resultB = increaseLuminance(bgRgba, fgRgba, ratio);
          const resultBRatio = contrastRatio(bgL, rgb.relativeLuminance(resultB >> 8));
          return resultARatio2 > resultBRatio ? resultA2 : resultB;
        }
        return resultA2;
      }
      const resultA = increaseLuminance(bgRgba, fgRgba, ratio);
      const resultARatio = contrastRatio(bgL, rgb.relativeLuminance(resultA >> 8));
      if (resultARatio < ratio) {
        const resultB = reduceLuminance(bgRgba, fgRgba, ratio);
        const resultBRatio = contrastRatio(bgL, rgb.relativeLuminance(resultB >> 8));
        return resultARatio > resultBRatio ? resultA : resultB;
      }
      return resultA;
    }
    return void 0;
  }
  rgba2.ensureContrastRatio = ensureContrastRatio;
  function reduceLuminance(bgRgba, fgRgba, ratio) {
    const bgR = bgRgba >> 24 & 255;
    const bgG = bgRgba >> 16 & 255;
    const bgB = bgRgba >> 8 & 255;
    let fgR = fgRgba >> 24 & 255;
    let fgG = fgRgba >> 16 & 255;
    let fgB = fgRgba >> 8 & 255;
    let cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
    while (cr < ratio && (fgR > 0 || fgG > 0 || fgB > 0)) {
      fgR -= Math.max(0, Math.ceil(fgR * 0.1));
      fgG -= Math.max(0, Math.ceil(fgG * 0.1));
      fgB -= Math.max(0, Math.ceil(fgB * 0.1));
      cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
    }
    return (fgR << 24 | fgG << 16 | fgB << 8 | 255) >>> 0;
  }
  rgba2.reduceLuminance = reduceLuminance;
  function increaseLuminance(bgRgba, fgRgba, ratio) {
    const bgR = bgRgba >> 24 & 255;
    const bgG = bgRgba >> 16 & 255;
    const bgB = bgRgba >> 8 & 255;
    let fgR = fgRgba >> 24 & 255;
    let fgG = fgRgba >> 16 & 255;
    let fgB = fgRgba >> 8 & 255;
    let cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
    while (cr < ratio && (fgR < 255 || fgG < 255 || fgB < 255)) {
      fgR = Math.min(255, fgR + Math.ceil((255 - fgR) * 0.1));
      fgG = Math.min(255, fgG + Math.ceil((255 - fgG) * 0.1));
      fgB = Math.min(255, fgB + Math.ceil((255 - fgB) * 0.1));
      cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
    }
    return (fgR << 24 | fgG << 16 | fgB << 8 | 255) >>> 0;
  }
  rgba2.increaseLuminance = increaseLuminance;
  function toChannels(value) {
    return [value >> 24 & 255, value >> 16 & 255, value >> 8 & 255, value & 255];
  }
  rgba2.toChannels = toChannels;
})(rgba || (rgba = {}));
function toPaddedHex(c) {
  const s = c.toString(16);
  return s.length < 2 ? "0" + s : s;
}
function contrastRatio(l1, l2) {
  if (l1 < l2) {
    return (l2 + 0.05) / (l1 + 0.05);
  }
  return (l1 + 0.05) / (l2 + 0.05);
}
//# sourceMappingURL=Color.js.map
