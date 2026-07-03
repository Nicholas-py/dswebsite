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
var CustomGlyphs_exports = {};
__export(CustomGlyphs_exports, {
  blockElementDefinitions: () => blockElementDefinitions,
  boxDrawingDefinitions: () => boxDrawingDefinitions,
  powerlineDefinitions: () => powerlineDefinitions,
  tryDrawCustomChar: () => tryDrawCustomChar
});
module.exports = __toCommonJS(CustomGlyphs_exports);
var import_RendererUtils = require("browser/renderer/shared/RendererUtils");
/**
 * Copyright (c) 2021 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const blockElementDefinitions = {
  // Block elements (0x2580-0x2590)
  "\u2580": [{ x: 0, y: 0, w: 8, h: 4 }],
  // UPPER HALF BLOCK
  "\u2581": [{ x: 0, y: 7, w: 8, h: 1 }],
  // LOWER ONE EIGHTH BLOCK
  "\u2582": [{ x: 0, y: 6, w: 8, h: 2 }],
  // LOWER ONE QUARTER BLOCK
  "\u2583": [{ x: 0, y: 5, w: 8, h: 3 }],
  // LOWER THREE EIGHTHS BLOCK
  "\u2584": [{ x: 0, y: 4, w: 8, h: 4 }],
  // LOWER HALF BLOCK
  "\u2585": [{ x: 0, y: 3, w: 8, h: 5 }],
  // LOWER FIVE EIGHTHS BLOCK
  "\u2586": [{ x: 0, y: 2, w: 8, h: 6 }],
  // LOWER THREE QUARTERS BLOCK
  "\u2587": [{ x: 0, y: 1, w: 8, h: 7 }],
  // LOWER SEVEN EIGHTHS BLOCK
  "\u2588": [{ x: 0, y: 0, w: 8, h: 8 }],
  // FULL BLOCK
  "\u2589": [{ x: 0, y: 0, w: 7, h: 8 }],
  // LEFT SEVEN EIGHTHS BLOCK
  "\u258A": [{ x: 0, y: 0, w: 6, h: 8 }],
  // LEFT THREE QUARTERS BLOCK
  "\u258B": [{ x: 0, y: 0, w: 5, h: 8 }],
  // LEFT FIVE EIGHTHS BLOCK
  "\u258C": [{ x: 0, y: 0, w: 4, h: 8 }],
  // LEFT HALF BLOCK
  "\u258D": [{ x: 0, y: 0, w: 3, h: 8 }],
  // LEFT THREE EIGHTHS BLOCK
  "\u258E": [{ x: 0, y: 0, w: 2, h: 8 }],
  // LEFT ONE QUARTER BLOCK
  "\u258F": [{ x: 0, y: 0, w: 1, h: 8 }],
  // LEFT ONE EIGHTH BLOCK
  "\u2590": [{ x: 4, y: 0, w: 4, h: 8 }],
  // RIGHT HALF BLOCK
  // Block elements (0x2594-0x2595)
  "\u2594": [{ x: 0, y: 0, w: 8, h: 1 }],
  // UPPER ONE EIGHTH BLOCK
  "\u2595": [{ x: 7, y: 0, w: 1, h: 8 }],
  // RIGHT ONE EIGHTH BLOCK
  // Terminal graphic characters (0x2596-0x259F)
  "\u2596": [{ x: 0, y: 4, w: 4, h: 4 }],
  // QUADRANT LOWER LEFT
  "\u2597": [{ x: 4, y: 4, w: 4, h: 4 }],
  // QUADRANT LOWER RIGHT
  "\u2598": [{ x: 0, y: 0, w: 4, h: 4 }],
  // QUADRANT UPPER LEFT
  "\u2599": [{ x: 0, y: 0, w: 4, h: 8 }, { x: 0, y: 4, w: 8, h: 4 }],
  // QUADRANT UPPER LEFT AND LOWER LEFT AND LOWER RIGHT
  "\u259A": [{ x: 0, y: 0, w: 4, h: 4 }, { x: 4, y: 4, w: 4, h: 4 }],
  // QUADRANT UPPER LEFT AND LOWER RIGHT
  "\u259B": [{ x: 0, y: 0, w: 4, h: 8 }, { x: 4, y: 0, w: 4, h: 4 }],
  // QUADRANT UPPER LEFT AND UPPER RIGHT AND LOWER LEFT
  "\u259C": [{ x: 0, y: 0, w: 8, h: 4 }, { x: 4, y: 0, w: 4, h: 8 }],
  // QUADRANT UPPER LEFT AND UPPER RIGHT AND LOWER RIGHT
  "\u259D": [{ x: 4, y: 0, w: 4, h: 4 }],
  // QUADRANT UPPER RIGHT
  "\u259E": [{ x: 4, y: 0, w: 4, h: 4 }, { x: 0, y: 4, w: 4, h: 4 }],
  // QUADRANT UPPER RIGHT AND LOWER LEFT
  "\u259F": [{ x: 4, y: 0, w: 4, h: 8 }, { x: 0, y: 4, w: 8, h: 4 }],
  // QUADRANT UPPER RIGHT AND LOWER LEFT AND LOWER RIGHT
  // VERTICAL ONE EIGHTH BLOCK-2 through VERTICAL ONE EIGHTH BLOCK-7
  "\u{1FB70}": [{ x: 1, y: 0, w: 1, h: 8 }],
  "\u{1FB71}": [{ x: 2, y: 0, w: 1, h: 8 }],
  "\u{1FB72}": [{ x: 3, y: 0, w: 1, h: 8 }],
  "\u{1FB73}": [{ x: 4, y: 0, w: 1, h: 8 }],
  "\u{1FB74}": [{ x: 5, y: 0, w: 1, h: 8 }],
  "\u{1FB75}": [{ x: 6, y: 0, w: 1, h: 8 }],
  // HORIZONTAL ONE EIGHTH BLOCK-2 through HORIZONTAL ONE EIGHTH BLOCK-7
  "\u{1FB76}": [{ x: 0, y: 1, w: 8, h: 1 }],
  "\u{1FB77}": [{ x: 0, y: 2, w: 8, h: 1 }],
  "\u{1FB78}": [{ x: 0, y: 3, w: 8, h: 1 }],
  "\u{1FB79}": [{ x: 0, y: 4, w: 8, h: 1 }],
  "\u{1FB7A}": [{ x: 0, y: 5, w: 8, h: 1 }],
  "\u{1FB7B}": [{ x: 0, y: 6, w: 8, h: 1 }],
  // LEFT AND LOWER ONE EIGHTH BLOCK
  "\u{1FB7C}": [{ x: 0, y: 0, w: 1, h: 8 }, { x: 0, y: 7, w: 8, h: 1 }],
  // LEFT AND UPPER ONE EIGHTH BLOCK
  "\u{1FB7D}": [{ x: 0, y: 0, w: 1, h: 8 }, { x: 0, y: 0, w: 8, h: 1 }],
  // RIGHT AND UPPER ONE EIGHTH BLOCK
  "\u{1FB7E}": [{ x: 7, y: 0, w: 1, h: 8 }, { x: 0, y: 0, w: 8, h: 1 }],
  // RIGHT AND LOWER ONE EIGHTH BLOCK
  "\u{1FB7F}": [{ x: 7, y: 0, w: 1, h: 8 }, { x: 0, y: 7, w: 8, h: 1 }],
  // UPPER AND LOWER ONE EIGHTH BLOCK
  "\u{1FB80}": [{ x: 0, y: 0, w: 8, h: 1 }, { x: 0, y: 7, w: 8, h: 1 }],
  // HORIZONTAL ONE EIGHTH BLOCK-1358
  "\u{1FB81}": [{ x: 0, y: 0, w: 8, h: 1 }, { x: 0, y: 2, w: 8, h: 1 }, { x: 0, y: 4, w: 8, h: 1 }, { x: 0, y: 7, w: 8, h: 1 }],
  // UPPER ONE QUARTER BLOCK
  "\u{1FB82}": [{ x: 0, y: 0, w: 8, h: 2 }],
  // UPPER THREE EIGHTHS BLOCK
  "\u{1FB83}": [{ x: 0, y: 0, w: 8, h: 3 }],
  // UPPER FIVE EIGHTHS BLOCK
  "\u{1FB84}": [{ x: 0, y: 0, w: 8, h: 5 }],
  // UPPER THREE QUARTERS BLOCK
  "\u{1FB85}": [{ x: 0, y: 0, w: 8, h: 6 }],
  // UPPER SEVEN EIGHTHS BLOCK
  "\u{1FB86}": [{ x: 0, y: 0, w: 8, h: 7 }],
  // RIGHT ONE QUARTER BLOCK
  "\u{1FB87}": [{ x: 6, y: 0, w: 2, h: 8 }],
  // RIGHT THREE EIGHTHS B0OCK
  "\u{1FB88}": [{ x: 5, y: 0, w: 3, h: 8 }],
  // RIGHT FIVE EIGHTHS BL0CK
  "\u{1FB89}": [{ x: 3, y: 0, w: 5, h: 8 }],
  // RIGHT THREE QUARTERS 0LOCK
  "\u{1FB8A}": [{ x: 2, y: 0, w: 6, h: 8 }],
  // RIGHT SEVEN EIGHTHS B0OCK
  "\u{1FB8B}": [{ x: 1, y: 0, w: 7, h: 8 }],
  // CHECKER BOARD FILL
  "\u{1FB95}": [
    { x: 0, y: 0, w: 2, h: 2 },
    { x: 4, y: 0, w: 2, h: 2 },
    { x: 2, y: 2, w: 2, h: 2 },
    { x: 6, y: 2, w: 2, h: 2 },
    { x: 0, y: 4, w: 2, h: 2 },
    { x: 4, y: 4, w: 2, h: 2 },
    { x: 2, y: 6, w: 2, h: 2 },
    { x: 6, y: 6, w: 2, h: 2 }
  ],
  // INVERSE CHECKER BOARD FILL
  "\u{1FB96}": [
    { x: 2, y: 0, w: 2, h: 2 },
    { x: 6, y: 0, w: 2, h: 2 },
    { x: 0, y: 2, w: 2, h: 2 },
    { x: 4, y: 2, w: 2, h: 2 },
    { x: 2, y: 4, w: 2, h: 2 },
    { x: 6, y: 4, w: 2, h: 2 },
    { x: 0, y: 6, w: 2, h: 2 },
    { x: 4, y: 6, w: 2, h: 2 }
  ],
  // HEAVY HORIZONTAL FILL (upper middle and lower one quarter block)
  "\u{1FB97}": [{ x: 0, y: 2, w: 8, h: 2 }, { x: 0, y: 6, w: 8, h: 2 }]
};
const patternCharacterDefinitions = {
  // Shade characters (0x2591-0x2593)
  "\u2591": [
    // LIGHT SHADE (25%)
    [1, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0]
  ],
  "\u2592": [
    // MEDIUM SHADE (50%)
    [1, 0],
    [0, 0],
    [0, 1],
    [0, 0]
  ],
  "\u2593": [
    // DARK SHADE (75%)
    [0, 1],
    [1, 1],
    [1, 0],
    [1, 1]
  ]
};
var Shapes = /* @__PURE__ */ ((Shapes2) => {
  Shapes2["TOP_TO_BOTTOM"] = "M.5,0 L.5,1";
  Shapes2["LEFT_TO_RIGHT"] = "M0,.5 L1,.5";
  Shapes2["TOP_TO_RIGHT"] = "M.5,0 L.5,.5 L1,.5";
  Shapes2["TOP_TO_LEFT"] = "M.5,0 L.5,.5 L0,.5";
  Shapes2["LEFT_TO_BOTTOM"] = "M0,.5 L.5,.5 L.5,1";
  Shapes2["RIGHT_TO_BOTTOM"] = "M0.5,1 L.5,.5 L1,.5";
  Shapes2["MIDDLE_TO_TOP"] = "M.5,.5 L.5,0";
  Shapes2["MIDDLE_TO_LEFT"] = "M.5,.5 L0,.5";
  Shapes2["MIDDLE_TO_RIGHT"] = "M.5,.5 L1,.5";
  Shapes2["MIDDLE_TO_BOTTOM"] = "M.5,.5 L.5,1";
  Shapes2["T_TOP"] = "M0,.5 L1,.5 M.5,.5 L.5,0";
  Shapes2["T_LEFT"] = "M.5,0 L.5,1 M.5,.5 L0,.5";
  Shapes2["T_RIGHT"] = "M.5,0 L.5,1 M.5,.5 L1,.5";
  Shapes2["T_BOTTOM"] = "M0,.5 L1,.5 M.5,.5 L.5,1";
  Shapes2["CROSS"] = "M0,.5 L1,.5 M.5,0 L.5,1";
  Shapes2["TWO_DASHES_HORIZONTAL"] = "M.1,.5 L.4,.5 M.6,.5 L.9,.5";
  Shapes2["THREE_DASHES_HORIZONTAL"] = "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5";
  Shapes2["FOUR_DASHES_HORIZONTAL"] = "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5";
  Shapes2["TWO_DASHES_VERTICAL"] = "M.5,.1 L.5,.4 M.5,.6 L.5,.9";
  Shapes2["THREE_DASHES_VERTICAL"] = "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333";
  Shapes2["FOUR_DASHES_VERTICAL"] = "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95";
  return Shapes2;
})(Shapes || {});
var Style = /* @__PURE__ */ ((Style2) => {
  Style2[Style2["NORMAL"] = 1] = "NORMAL";
  Style2[Style2["BOLD"] = 3] = "BOLD";
  return Style2;
})(Style || {});
const boxDrawingDefinitions = {
  // Uniform normal and bold
  "\u2500": { [1 /* NORMAL */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */ },
  "\u2501": { [3 /* BOLD */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */ },
  "\u2502": { [1 /* NORMAL */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */ },
  "\u2503": { [3 /* BOLD */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */ },
  "\u250C": { [1 /* NORMAL */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */ },
  "\u250F": { [3 /* BOLD */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */ },
  "\u2510": { [1 /* NORMAL */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */ },
  "\u2513": { [3 /* BOLD */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */ },
  "\u2514": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */ },
  "\u2517": { [3 /* BOLD */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */ },
  "\u2518": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */ },
  "\u251B": { [3 /* BOLD */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */ },
  "\u251C": { [1 /* NORMAL */]: "M.5,0 L.5,1 M.5,.5 L1,.5" /* T_RIGHT */ },
  "\u2523": { [3 /* BOLD */]: "M.5,0 L.5,1 M.5,.5 L1,.5" /* T_RIGHT */ },
  "\u2524": { [1 /* NORMAL */]: "M.5,0 L.5,1 M.5,.5 L0,.5" /* T_LEFT */ },
  "\u252B": { [3 /* BOLD */]: "M.5,0 L.5,1 M.5,.5 L0,.5" /* T_LEFT */ },
  "\u252C": { [1 /* NORMAL */]: "M0,.5 L1,.5 M.5,.5 L.5,1" /* T_BOTTOM */ },
  "\u2533": { [3 /* BOLD */]: "M0,.5 L1,.5 M.5,.5 L.5,1" /* T_BOTTOM */ },
  "\u2534": { [1 /* NORMAL */]: "M0,.5 L1,.5 M.5,.5 L.5,0" /* T_TOP */ },
  "\u253B": { [3 /* BOLD */]: "M0,.5 L1,.5 M.5,.5 L.5,0" /* T_TOP */ },
  "\u253C": { [1 /* NORMAL */]: "M0,.5 L1,.5 M.5,0 L.5,1" /* CROSS */ },
  "\u254B": { [3 /* BOLD */]: "M0,.5 L1,.5 M.5,0 L.5,1" /* CROSS */ },
  "\u2574": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u2578": { [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u2575": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u2579": { [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u2576": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u257A": { [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u2577": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u257B": { [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  // Double border
  "\u2550": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 - yp} L1,${0.5 - yp} M0,${0.5 + yp} L1,${0.5 + yp}` },
  "\u2551": { [1 /* NORMAL */]: (xp, yp) => `M${0.5 - xp},0 L${0.5 - xp},1 M${0.5 + xp},0 L${0.5 + xp},1` },
  "\u2552": { [1 /* NORMAL */]: (xp, yp) => `M.5,1 L.5,${0.5 - yp} L1,${0.5 - yp} M.5,${0.5 + yp} L1,${0.5 + yp}` },
  "\u2553": { [1 /* NORMAL */]: (xp, yp) => `M${0.5 - xp},1 L${0.5 - xp},.5 L1,.5 M${0.5 + xp},.5 L${0.5 + xp},1` },
  "\u2554": { [1 /* NORMAL */]: (xp, yp) => `M1,${0.5 - yp} L${0.5 - xp},${0.5 - yp} L${0.5 - xp},1 M1,${0.5 + yp} L${0.5 + xp},${0.5 + yp} L${0.5 + xp},1` },
  "\u2555": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 - yp} L.5,${0.5 - yp} L.5,1 M0,${0.5 + yp} L.5,${0.5 + yp}` },
  "\u2556": { [1 /* NORMAL */]: (xp, yp) => `M${0.5 + xp},1 L${0.5 + xp},.5 L0,.5 M${0.5 - xp},.5 L${0.5 - xp},1` },
  "\u2557": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 + yp} L${0.5 - xp},${0.5 + yp} L${0.5 - xp},1 M0,${0.5 - yp} L${0.5 + xp},${0.5 - yp} L${0.5 + xp},1` },
  "\u2558": { [1 /* NORMAL */]: (xp, yp) => `M.5,0 L.5,${0.5 + yp} L1,${0.5 + yp} M.5,${0.5 - yp} L1,${0.5 - yp}` },
  "\u2559": { [1 /* NORMAL */]: (xp, yp) => `M1,.5 L${0.5 - xp},.5 L${0.5 - xp},0 M${0.5 + xp},.5 L${0.5 + xp},0` },
  "\u255A": { [1 /* NORMAL */]: (xp, yp) => `M1,${0.5 - yp} L${0.5 + xp},${0.5 - yp} L${0.5 + xp},0 M1,${0.5 + yp} L${0.5 - xp},${0.5 + yp} L${0.5 - xp},0` },
  "\u255B": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 + yp} L.5,${0.5 + yp} L.5,0 M0,${0.5 - yp} L.5,${0.5 - yp}` },
  "\u255C": { [1 /* NORMAL */]: (xp, yp) => `M0,.5 L${0.5 + xp},.5 L${0.5 + xp},0 M${0.5 - xp},.5 L${0.5 - xp},0` },
  "\u255D": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 - yp} L${0.5 - xp},${0.5 - yp} L${0.5 - xp},0 M0,${0.5 + yp} L${0.5 + xp},${0.5 + yp} L${0.5 + xp},0` },
  "\u255E": { [1 /* NORMAL */]: (xp, yp) => `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} M.5,${0.5 - yp} L1,${0.5 - yp} M.5,${0.5 + yp} L1,${0.5 + yp}` },
  "\u255F": { [1 /* NORMAL */]: (xp, yp) => `M${0.5 - xp},0 L${0.5 - xp},1 M${0.5 + xp},0 L${0.5 + xp},1 M${0.5 + xp},.5 L1,.5` },
  "\u2560": { [1 /* NORMAL */]: (xp, yp) => `M${0.5 - xp},0 L${0.5 - xp},1 M1,${0.5 + yp} L${0.5 + xp},${0.5 + yp} L${0.5 + xp},1 M1,${0.5 - yp} L${0.5 + xp},${0.5 - yp} L${0.5 + xp},0` },
  "\u2561": { [1 /* NORMAL */]: (xp, yp) => `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} M0,${0.5 - yp} L.5,${0.5 - yp} M0,${0.5 + yp} L.5,${0.5 + yp}` },
  "\u2562": { [1 /* NORMAL */]: (xp, yp) => `M0,.5 L${0.5 - xp},.5 M${0.5 - xp},0 L${0.5 - xp},1 M${0.5 + xp},0 L${0.5 + xp},1` },
  "\u2563": { [1 /* NORMAL */]: (xp, yp) => `M${0.5 + xp},0 L${0.5 + xp},1 M0,${0.5 + yp} L${0.5 - xp},${0.5 + yp} L${0.5 - xp},1 M0,${0.5 - yp} L${0.5 - xp},${0.5 - yp} L${0.5 - xp},0` },
  "\u2564": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 - yp} L1,${0.5 - yp} M0,${0.5 + yp} L1,${0.5 + yp} M.5,${0.5 + yp} L.5,1` },
  "\u2565": { [1 /* NORMAL */]: (xp, yp) => `${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */} M${0.5 - xp},.5 L${0.5 - xp},1 M${0.5 + xp},.5 L${0.5 + xp},1` },
  "\u2566": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 - yp} L1,${0.5 - yp} M0,${0.5 + yp} L${0.5 - xp},${0.5 + yp} L${0.5 - xp},1 M1,${0.5 + yp} L${0.5 + xp},${0.5 + yp} L${0.5 + xp},1` },
  "\u2567": { [1 /* NORMAL */]: (xp, yp) => `M.5,0 L.5,${0.5 - yp} M0,${0.5 - yp} L1,${0.5 - yp} M0,${0.5 + yp} L1,${0.5 + yp}` },
  "\u2568": { [1 /* NORMAL */]: (xp, yp) => `${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */} M${0.5 - xp},.5 L${0.5 - xp},0 M${0.5 + xp},.5 L${0.5 + xp},0` },
  "\u2569": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 + yp} L1,${0.5 + yp} M0,${0.5 - yp} L${0.5 - xp},${0.5 - yp} L${0.5 - xp},0 M1,${0.5 - yp} L${0.5 + xp},${0.5 - yp} L${0.5 + xp},0` },
  "\u256A": { [1 /* NORMAL */]: (xp, yp) => `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} M0,${0.5 - yp} L1,${0.5 - yp} M0,${0.5 + yp} L1,${0.5 + yp}` },
  "\u256B": { [1 /* NORMAL */]: (xp, yp) => `${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */} M${0.5 - xp},0 L${0.5 - xp},1 M${0.5 + xp},0 L${0.5 + xp},1` },
  "\u256C": { [1 /* NORMAL */]: (xp, yp) => `M0,${0.5 + yp} L${0.5 - xp},${0.5 + yp} L${0.5 - xp},1 M1,${0.5 + yp} L${0.5 + xp},${0.5 + yp} L${0.5 + xp},1 M0,${0.5 - yp} L${0.5 - xp},${0.5 - yp} L${0.5 - xp},0 M1,${0.5 - yp} L${0.5 + xp},${0.5 - yp} L${0.5 + xp},0` },
  // Diagonal
  "\u2571": { [1 /* NORMAL */]: "M1,0 L0,1" },
  "\u2572": { [1 /* NORMAL */]: "M0,0 L1,1" },
  "\u2573": { [1 /* NORMAL */]: "M1,0 L0,1 M0,0 L1,1" },
  // Mixed weight
  "\u257C": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u257D": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u257E": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u257F": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u250D": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u250E": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u2511": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u2512": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u2515": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u2516": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u2519": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u251A": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u251D": { [1 /* NORMAL */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u251E": { [1 /* NORMAL */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u251F": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u2520": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */ },
  "\u2521": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */ },
  "\u2522": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */ },
  "\u2525": { [1 /* NORMAL */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u2526": { [1 /* NORMAL */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u2527": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u2528": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */ },
  "\u2529": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */ },
  "\u252A": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */ },
  "\u252D": { [1 /* NORMAL */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u252E": { [1 /* NORMAL */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u252F": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */ },
  "\u2530": { [1 /* NORMAL */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u2531": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */ },
  "\u2532": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */ },
  "\u2535": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u2536": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u2537": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */ },
  "\u2538": { [1 /* NORMAL */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u2539": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */ },
  "\u253A": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */ },
  "\u253D": { [1 /* NORMAL */]: `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} ${"M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */}`, [3 /* BOLD */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */ },
  "\u253E": { [1 /* NORMAL */]: `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} ${"M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */}`, [3 /* BOLD */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */ },
  "\u253F": { [1 /* NORMAL */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */, [3 /* BOLD */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */ },
  "\u2540": { [1 /* NORMAL */]: `${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */} ${"M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */}`, [3 /* BOLD */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */ },
  "\u2541": { [1 /* NORMAL */]: `${"M.5,.5 L.5,0" /* MIDDLE_TO_TOP */} ${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */}`, [3 /* BOLD */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */ },
  "\u2542": { [1 /* NORMAL */]: "M0,.5 L1,.5" /* LEFT_TO_RIGHT */, [3 /* BOLD */]: "M.5,0 L.5,1" /* TOP_TO_BOTTOM */ },
  "\u2543": { [1 /* NORMAL */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */, [3 /* BOLD */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */ },
  "\u2544": { [1 /* NORMAL */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */, [3 /* BOLD */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */ },
  "\u2545": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L1,.5" /* TOP_TO_RIGHT */, [3 /* BOLD */]: "M0,.5 L.5,.5 L.5,1" /* LEFT_TO_BOTTOM */ },
  "\u2546": { [1 /* NORMAL */]: "M.5,0 L.5,.5 L0,.5" /* TOP_TO_LEFT */, [3 /* BOLD */]: "M0.5,1 L.5,.5 L1,.5" /* RIGHT_TO_BOTTOM */ },
  "\u2547": { [1 /* NORMAL */]: "M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */, [3 /* BOLD */]: `${"M.5,.5 L.5,0" /* MIDDLE_TO_TOP */} ${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */}` },
  "\u2548": { [1 /* NORMAL */]: "M.5,.5 L.5,0" /* MIDDLE_TO_TOP */, [3 /* BOLD */]: `${"M0,.5 L1,.5" /* LEFT_TO_RIGHT */} ${"M.5,.5 L.5,1" /* MIDDLE_TO_BOTTOM */}` },
  "\u2549": { [1 /* NORMAL */]: "M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */, [3 /* BOLD */]: `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} ${"M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */}` },
  "\u254A": { [1 /* NORMAL */]: "M.5,.5 L0,.5" /* MIDDLE_TO_LEFT */, [3 /* BOLD */]: `${"M.5,0 L.5,1" /* TOP_TO_BOTTOM */} ${"M.5,.5 L1,.5" /* MIDDLE_TO_RIGHT */}` },
  // Dashed
  "\u254C": { [1 /* NORMAL */]: "M.1,.5 L.4,.5 M.6,.5 L.9,.5" /* TWO_DASHES_HORIZONTAL */ },
  "\u254D": { [3 /* BOLD */]: "M.1,.5 L.4,.5 M.6,.5 L.9,.5" /* TWO_DASHES_HORIZONTAL */ },
  "\u2504": { [1 /* NORMAL */]: "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5" /* THREE_DASHES_HORIZONTAL */ },
  "\u2505": { [3 /* BOLD */]: "M.0667,.5 L.2667,.5 M.4,.5 L.6,.5 M.7333,.5 L.9333,.5" /* THREE_DASHES_HORIZONTAL */ },
  "\u2508": { [1 /* NORMAL */]: "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5" /* FOUR_DASHES_HORIZONTAL */ },
  "\u2509": { [3 /* BOLD */]: "M.05,.5 L.2,.5 M.3,.5 L.45,.5 M.55,.5 L.7,.5 M.8,.5 L.95,.5" /* FOUR_DASHES_HORIZONTAL */ },
  "\u254E": { [1 /* NORMAL */]: "M.5,.1 L.5,.4 M.5,.6 L.5,.9" /* TWO_DASHES_VERTICAL */ },
  "\u254F": { [3 /* BOLD */]: "M.5,.1 L.5,.4 M.5,.6 L.5,.9" /* TWO_DASHES_VERTICAL */ },
  "\u2506": { [1 /* NORMAL */]: "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333" /* THREE_DASHES_VERTICAL */ },
  "\u2507": { [3 /* BOLD */]: "M.5,.0667 L.5,.2667 M.5,.4 L.5,.6 M.5,.7333 L.5,.9333" /* THREE_DASHES_VERTICAL */ },
  "\u250A": { [1 /* NORMAL */]: "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95" /* FOUR_DASHES_VERTICAL */ },
  "\u250B": { [3 /* BOLD */]: "M.5,.05 L.5,.2 M.5,.3 L.5,.45 L.5,.55 M.5,.7 L.5,.95" /* FOUR_DASHES_VERTICAL */ },
  // Curved
  "\u256D": { [1 /* NORMAL */]: (xp, yp) => `M.5,1 L.5,${0.5 + yp / 0.15 * 0.5} C.5,${0.5 + yp / 0.15 * 0.5},.5,.5,1,.5` },
  "\u256E": { [1 /* NORMAL */]: (xp, yp) => `M.5,1 L.5,${0.5 + yp / 0.15 * 0.5} C.5,${0.5 + yp / 0.15 * 0.5},.5,.5,0,.5` },
  "\u256F": { [1 /* NORMAL */]: (xp, yp) => `M.5,0 L.5,${0.5 - yp / 0.15 * 0.5} C.5,${0.5 - yp / 0.15 * 0.5},.5,.5,0,.5` },
  "\u2570": { [1 /* NORMAL */]: (xp, yp) => `M.5,0 L.5,${0.5 - yp / 0.15 * 0.5} C.5,${0.5 - yp / 0.15 * 0.5},.5,.5,1,.5` }
};
var VectorType = /* @__PURE__ */ ((VectorType2) => {
  VectorType2[VectorType2["FILL"] = 0] = "FILL";
  VectorType2[VectorType2["STROKE"] = 1] = "STROKE";
  return VectorType2;
})(VectorType || {});
const powerlineDefinitions = {
  // Git branch
  "\uE0A0": { d: "M.3,1 L.03,1 L.03,.88 C.03,.82,.06,.78,.11,.73 C.15,.7,.2,.68,.28,.65 L.43,.6 C.49,.58,.53,.56,.56,.53 C.59,.5,.6,.47,.6,.43 L.6,.27 L.4,.27 L.69,.1 L.98,.27 L.78,.27 L.78,.46 C.78,.52,.76,.56,.72,.61 C.68,.66,.63,.67,.56,.7 L.48,.72 C.42,.74,.38,.76,.35,.78 C.32,.8,.31,.84,.31,.88 L.31,1 M.3,.5 L.03,.59 L.03,.09 L.3,.09 L.3,.655", type: 0 /* FILL */ },
  // L N
  "\uE0A1": { d: "M.7,.4 L.7,.47 L.2,.47 L.2,.03 L.355,.03 L.355,.4 L.705,.4 M.7,.5 L.86,.5 L.86,.95 L.69,.95 L.44,.66 L.46,.86 L.46,.95 L.3,.95 L.3,.49 L.46,.49 L.71,.78 L.69,.565 L.69,.5", type: 0 /* FILL */ },
  // Lock
  "\uE0A2": { d: "M.25,.94 C.16,.94,.11,.92,.11,.87 L.11,.53 C.11,.48,.15,.455,.23,.45 L.23,.3 C.23,.25,.26,.22,.31,.19 C.36,.16,.43,.15,.51,.15 C.59,.15,.66,.16,.71,.19 C.77,.22,.79,.26,.79,.3 L.79,.45 C.87,.45,.91,.48,.91,.53 L.91,.87 C.91,.92,.86,.94,.77,.94 L.24,.94 M.53,.2 C.49,.2,.45,.21,.42,.23 C.39,.25,.38,.27,.38,.3 L.38,.45 L.68,.45 L.68,.3 C.68,.27,.67,.25,.64,.23 C.61,.21,.58,.2,.53,.2 M.58,.82 L.58,.66 C.63,.65,.65,.63,.65,.6 C.65,.58,.64,.57,.61,.56 C.58,.55,.56,.54,.52,.54 C.48,.54,.46,.55,.43,.56 C.4,.57,.39,.59,.39,.6 C.39,.63,.41,.64,.46,.66 L.46,.82 L.57,.82", type: 0 /* FILL */ },
  // Right triangle solid
  "\uE0B0": { d: "M0,0 L1,.5 L0,1", type: 0 /* FILL */, rightPadding: 2 },
  // Right triangle line
  "\uE0B1": { d: "M-1,-.5 L1,.5 L-1,1.5", type: 1 /* STROKE */, leftPadding: 1, rightPadding: 1 },
  // Left triangle solid
  "\uE0B2": { d: "M1,0 L0,.5 L1,1", type: 0 /* FILL */, leftPadding: 2 },
  // Left triangle line
  "\uE0B3": { d: "M2,-.5 L0,.5 L2,1.5", type: 1 /* STROKE */, leftPadding: 1, rightPadding: 1 },
  // Right semi-circle solid
  "\uE0B4": { d: "M0,0 L0,1 C0.552,1,1,0.776,1,.5 C1,0.224,0.552,0,0,0", type: 0 /* FILL */, rightPadding: 1 },
  // Right semi-circle line
  "\uE0B5": { d: "M.2,1 C.422,1,.8,.826,.78,.5 C.8,.174,0.422,0,.2,0", type: 1 /* STROKE */, rightPadding: 1 },
  // Left semi-circle solid
  "\uE0B6": { d: "M1,0 L1,1 C0.448,1,0,0.776,0,.5 C0,0.224,0.448,0,1,0", type: 0 /* FILL */, leftPadding: 1 },
  // Left semi-circle line
  "\uE0B7": { d: "M.8,1 C0.578,1,0.2,.826,.22,.5 C0.2,0.174,0.578,0,0.8,0", type: 1 /* STROKE */, leftPadding: 1 },
  // Lower left triangle
  "\uE0B8": { d: "M-.5,-.5 L1.5,1.5 L-.5,1.5", type: 0 /* FILL */ },
  // Backslash separator
  "\uE0B9": { d: "M-.5,-.5 L1.5,1.5", type: 1 /* STROKE */, leftPadding: 1, rightPadding: 1 },
  // Lower right triangle
  "\uE0BA": { d: "M1.5,-.5 L-.5,1.5 L1.5,1.5", type: 0 /* FILL */ },
  // Upper left triangle
  "\uE0BC": { d: "M1.5,-.5 L-.5,1.5 L-.5,-.5", type: 0 /* FILL */ },
  // Forward slash separator
  "\uE0BD": { d: "M1.5,-.5 L-.5,1.5", type: 1 /* STROKE */, leftPadding: 1, rightPadding: 1 },
  // Upper right triangle
  "\uE0BE": { d: "M-.5,-.5 L1.5,1.5 L1.5,-.5", type: 0 /* FILL */ }
};
powerlineDefinitions["\uE0BB"] = powerlineDefinitions["\uE0BD"];
powerlineDefinitions["\uE0BF"] = powerlineDefinitions["\uE0B9"];
function tryDrawCustomChar(ctx, c, xOffset, yOffset, deviceCellWidth, deviceCellHeight, fontSize, devicePixelRatio) {
  const blockElementDefinition = blockElementDefinitions[c];
  if (blockElementDefinition) {
    drawBlockElementChar(ctx, blockElementDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight);
    return true;
  }
  const patternDefinition = patternCharacterDefinitions[c];
  if (patternDefinition) {
    drawPatternChar(ctx, patternDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight);
    return true;
  }
  const boxDrawingDefinition = boxDrawingDefinitions[c];
  if (boxDrawingDefinition) {
    drawBoxDrawingChar(ctx, boxDrawingDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight, devicePixelRatio);
    return true;
  }
  const powerlineDefinition = powerlineDefinitions[c];
  if (powerlineDefinition) {
    drawPowerlineChar(ctx, powerlineDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight, fontSize, devicePixelRatio);
    return true;
  }
  return false;
}
function drawBlockElementChar(ctx, charDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight) {
  for (let i = 0; i < charDefinition.length; i++) {
    const box = charDefinition[i];
    const xEighth = deviceCellWidth / 8;
    const yEighth = deviceCellHeight / 8;
    ctx.fillRect(
      xOffset + box.x * xEighth,
      yOffset + box.y * yEighth,
      box.w * xEighth,
      box.h * yEighth
    );
  }
}
const cachedPatterns = /* @__PURE__ */ new Map();
function drawPatternChar(ctx, charDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight) {
  let patternSet = cachedPatterns.get(charDefinition);
  if (!patternSet) {
    patternSet = /* @__PURE__ */ new Map();
    cachedPatterns.set(charDefinition, patternSet);
  }
  const fillStyle = ctx.fillStyle;
  if (typeof fillStyle !== "string") {
    throw new Error(`Unexpected fillStyle type "${fillStyle}"`);
  }
  let pattern = patternSet.get(fillStyle);
  if (!pattern) {
    const width = charDefinition[0].length;
    const height = charDefinition.length;
    const tmpCanvas = ctx.canvas.ownerDocument.createElement("canvas");
    tmpCanvas.width = width;
    tmpCanvas.height = height;
    const tmpCtx = (0, import_RendererUtils.throwIfFalsy)(tmpCanvas.getContext("2d"));
    const imageData = new ImageData(width, height);
    let r;
    let g;
    let b;
    let a;
    if (fillStyle.startsWith("#")) {
      r = parseInt(fillStyle.slice(1, 3), 16);
      g = parseInt(fillStyle.slice(3, 5), 16);
      b = parseInt(fillStyle.slice(5, 7), 16);
      a = fillStyle.length > 7 && parseInt(fillStyle.slice(7, 9), 16) || 1;
    } else if (fillStyle.startsWith("rgba")) {
      [r, g, b, a] = fillStyle.substring(5, fillStyle.length - 1).split(",").map((e) => parseFloat(e));
    } else {
      throw new Error(`Unexpected fillStyle color format "${fillStyle}" when drawing pattern glyph`);
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        imageData.data[(y * width + x) * 4] = r;
        imageData.data[(y * width + x) * 4 + 1] = g;
        imageData.data[(y * width + x) * 4 + 2] = b;
        imageData.data[(y * width + x) * 4 + 3] = charDefinition[y][x] * (a * 255);
      }
    }
    tmpCtx.putImageData(imageData, 0, 0);
    pattern = (0, import_RendererUtils.throwIfFalsy)(ctx.createPattern(tmpCanvas, null));
    patternSet.set(fillStyle, pattern);
  }
  ctx.fillStyle = pattern;
  ctx.fillRect(xOffset, yOffset, deviceCellWidth, deviceCellHeight);
}
function drawBoxDrawingChar(ctx, charDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight, devicePixelRatio) {
  ctx.strokeStyle = ctx.fillStyle;
  for (const [fontWeight, instructions] of Object.entries(charDefinition)) {
    ctx.beginPath();
    ctx.lineWidth = devicePixelRatio * Number.parseInt(fontWeight);
    let actualInstructions;
    if (typeof instructions === "function") {
      const xp = 0.15;
      const yp = 0.15 / deviceCellHeight * deviceCellWidth;
      actualInstructions = instructions(xp, yp);
    } else {
      actualInstructions = instructions;
    }
    for (const instruction of actualInstructions.split(" ")) {
      const type = instruction[0];
      const f = svgToCanvasInstructionMap[type];
      if (!f) {
        console.error(`Could not find drawing instructions for "${type}"`);
        continue;
      }
      const args = instruction.substring(1).split(",");
      if (!args[0] || !args[1]) {
        continue;
      }
      f(ctx, translateArgs(args, deviceCellWidth, deviceCellHeight, xOffset, yOffset, true, devicePixelRatio));
    }
    ctx.stroke();
    ctx.closePath();
  }
}
function drawPowerlineChar(ctx, charDefinition, xOffset, yOffset, deviceCellWidth, deviceCellHeight, fontSize, devicePixelRatio) {
  const clipRegion = new Path2D();
  clipRegion.rect(xOffset, yOffset, deviceCellWidth, deviceCellHeight);
  ctx.clip(clipRegion);
  ctx.beginPath();
  const cssLineWidth = fontSize / 12;
  ctx.lineWidth = devicePixelRatio * cssLineWidth;
  for (const instruction of charDefinition.d.split(" ")) {
    const type = instruction[0];
    const f = svgToCanvasInstructionMap[type];
    if (!f) {
      console.error(`Could not find drawing instructions for "${type}"`);
      continue;
    }
    const args = instruction.substring(1).split(",");
    if (!args[0] || !args[1]) {
      continue;
    }
    f(ctx, translateArgs(
      args,
      deviceCellWidth,
      deviceCellHeight,
      xOffset,
      yOffset,
      false,
      devicePixelRatio,
      (charDefinition.leftPadding ?? 0) * (cssLineWidth / 2),
      (charDefinition.rightPadding ?? 0) * (cssLineWidth / 2)
    ));
  }
  if (charDefinition.type === 1 /* STROKE */) {
    ctx.strokeStyle = ctx.fillStyle;
    ctx.stroke();
  } else {
    ctx.fill();
  }
  ctx.closePath();
}
function clamp(value, max, min = 0) {
  return Math.max(Math.min(value, max), min);
}
const svgToCanvasInstructionMap = {
  "C": (ctx, args) => ctx.bezierCurveTo(args[0], args[1], args[2], args[3], args[4], args[5]),
  "L": (ctx, args) => ctx.lineTo(args[0], args[1]),
  "M": (ctx, args) => ctx.moveTo(args[0], args[1])
};
function translateArgs(args, cellWidth, cellHeight, xOffset, yOffset, doClamp, devicePixelRatio, leftPadding = 0, rightPadding = 0) {
  const result = args.map((e) => parseFloat(e) || parseInt(e));
  if (result.length < 2) {
    throw new Error("Too few arguments for instruction");
  }
  for (let x = 0; x < result.length; x += 2) {
    result[x] *= cellWidth - leftPadding * devicePixelRatio - rightPadding * devicePixelRatio;
    if (doClamp && result[x] !== 0) {
      result[x] = clamp(Math.round(result[x] + 0.5) - 0.5, cellWidth, 0);
    }
    result[x] += xOffset + leftPadding * devicePixelRatio;
  }
  for (let y = 1; y < result.length; y += 2) {
    result[y] *= cellHeight;
    if (doClamp && result[y] !== 0) {
      result[y] = clamp(Math.round(result[y] + 0.5) - 0.5, cellHeight, 0);
    }
    result[y] += yOffset;
  }
  return result;
}
//# sourceMappingURL=CustomGlyphs.js.map
