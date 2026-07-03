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
var Types_exports = {};
__export(Types_exports, {
  DEFAULT_ANSI_COLORS: () => DEFAULT_ANSI_COLORS
});
module.exports = __toCommonJS(Types_exports);
var import_Color = require("common/Color");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const DEFAULT_ANSI_COLORS = Object.freeze((() => {
  const colors = [
    // dark:
    import_Color.css.toColor("#2e3436"),
    import_Color.css.toColor("#cc0000"),
    import_Color.css.toColor("#4e9a06"),
    import_Color.css.toColor("#c4a000"),
    import_Color.css.toColor("#3465a4"),
    import_Color.css.toColor("#75507b"),
    import_Color.css.toColor("#06989a"),
    import_Color.css.toColor("#d3d7cf"),
    // bright:
    import_Color.css.toColor("#555753"),
    import_Color.css.toColor("#ef2929"),
    import_Color.css.toColor("#8ae234"),
    import_Color.css.toColor("#fce94f"),
    import_Color.css.toColor("#729fcf"),
    import_Color.css.toColor("#ad7fa8"),
    import_Color.css.toColor("#34e2e2"),
    import_Color.css.toColor("#eeeeec")
  ];
  const v = [0, 95, 135, 175, 215, 255];
  for (let i = 0; i < 216; i++) {
    const r = v[i / 36 % 6 | 0];
    const g = v[i / 6 % 6 | 0];
    const b = v[i % 6];
    colors.push({
      css: import_Color.channels.toCss(r, g, b),
      rgba: import_Color.channels.toRgba(r, g, b)
    });
  }
  for (let i = 0; i < 24; i++) {
    const c = 8 + i * 10;
    colors.push({
      css: import_Color.channels.toCss(c, c, c),
      rgba: import_Color.channels.toRgba(c, c, c)
    });
  }
  return colors;
})());
//# sourceMappingURL=Types.js.map
