"use strict";
var import_chai = require("chai");
var import_Color = require("common/Color");
/**
 * Copyright (c) 2017 The xterm.js authors. All rights reserved.
 * @license MIT
 */
describe("Color", () => {
  describe("channels", () => {
    describe("toCss", () => {
      it("should convert an rgb array to css hex string", () => {
        import_chai.assert.equal(import_Color.channels.toCss(0, 0, 0), "#000000");
        import_chai.assert.equal(import_Color.channels.toCss(16, 16, 16), "#101010");
        import_chai.assert.equal(import_Color.channels.toCss(32, 32, 32), "#202020");
        import_chai.assert.equal(import_Color.channels.toCss(48, 48, 48), "#303030");
        import_chai.assert.equal(import_Color.channels.toCss(64, 64, 64), "#404040");
        import_chai.assert.equal(import_Color.channels.toCss(80, 80, 80), "#505050");
        import_chai.assert.equal(import_Color.channels.toCss(96, 96, 96), "#606060");
        import_chai.assert.equal(import_Color.channels.toCss(112, 112, 112), "#707070");
        import_chai.assert.equal(import_Color.channels.toCss(128, 128, 128), "#808080");
        import_chai.assert.equal(import_Color.channels.toCss(144, 144, 144), "#909090");
        import_chai.assert.equal(import_Color.channels.toCss(160, 160, 160), "#a0a0a0");
        import_chai.assert.equal(import_Color.channels.toCss(176, 176, 176), "#b0b0b0");
        import_chai.assert.equal(import_Color.channels.toCss(192, 192, 192), "#c0c0c0");
        import_chai.assert.equal(import_Color.channels.toCss(208, 208, 208), "#d0d0d0");
        import_chai.assert.equal(import_Color.channels.toCss(224, 224, 224), "#e0e0e0");
        import_chai.assert.equal(import_Color.channels.toCss(240, 240, 240), "#f0f0f0");
        import_chai.assert.equal(import_Color.channels.toCss(255, 255, 255), "#ffffff");
      });
      it("should convert an rgba array to css hex string", () => {
        import_chai.assert.equal(import_Color.channels.toCss(0, 0, 0, 0), "#00000000");
        import_chai.assert.equal(import_Color.channels.toCss(16, 16, 16, 16), "#10101010");
        import_chai.assert.equal(import_Color.channels.toCss(32, 32, 32, 32), "#20202020");
        import_chai.assert.equal(import_Color.channels.toCss(48, 48, 48, 48), "#30303030");
        import_chai.assert.equal(import_Color.channels.toCss(64, 64, 64, 64), "#40404040");
        import_chai.assert.equal(import_Color.channels.toCss(80, 80, 80, 80), "#50505050");
        import_chai.assert.equal(import_Color.channels.toCss(96, 96, 96, 96), "#60606060");
        import_chai.assert.equal(import_Color.channels.toCss(112, 112, 112, 112), "#70707070");
        import_chai.assert.equal(import_Color.channels.toCss(128, 128, 128, 128), "#80808080");
        import_chai.assert.equal(import_Color.channels.toCss(144, 144, 144, 144), "#90909090");
        import_chai.assert.equal(import_Color.channels.toCss(160, 160, 160, 160), "#a0a0a0a0");
        import_chai.assert.equal(import_Color.channels.toCss(176, 176, 176, 176), "#b0b0b0b0");
        import_chai.assert.equal(import_Color.channels.toCss(192, 192, 192, 192), "#c0c0c0c0");
        import_chai.assert.equal(import_Color.channels.toCss(208, 208, 208, 208), "#d0d0d0d0");
        import_chai.assert.equal(import_Color.channels.toCss(224, 224, 224, 224), "#e0e0e0e0");
        import_chai.assert.equal(import_Color.channels.toCss(240, 240, 240, 240), "#f0f0f0f0");
        import_chai.assert.equal(import_Color.channels.toCss(255, 255, 255, 255), "#ffffffff");
      });
    });
    describe("toRgba", () => {
      it("should convert an rgb array to an rgba number", () => {
        import_chai.assert.equal(import_Color.channels.toRgba(0, 0, 0), 255);
        import_chai.assert.equal(import_Color.channels.toRgba(16, 16, 16), 269488383);
        import_chai.assert.equal(import_Color.channels.toRgba(32, 32, 32), 538976511);
        import_chai.assert.equal(import_Color.channels.toRgba(48, 48, 48), 808464639);
        import_chai.assert.equal(import_Color.channels.toRgba(64, 64, 64), 1077952767);
        import_chai.assert.equal(import_Color.channels.toRgba(80, 80, 80), 1347440895);
        import_chai.assert.equal(import_Color.channels.toRgba(96, 96, 96), 1616929023);
        import_chai.assert.equal(import_Color.channels.toRgba(112, 112, 112), 1886417151);
        import_chai.assert.equal(import_Color.channels.toRgba(128, 128, 128), 2155905279);
        import_chai.assert.equal(import_Color.channels.toRgba(144, 144, 144), 2425393407);
        import_chai.assert.equal(import_Color.channels.toRgba(160, 160, 160), 2694881535);
        import_chai.assert.equal(import_Color.channels.toRgba(176, 176, 176), 2964369663);
        import_chai.assert.equal(import_Color.channels.toRgba(192, 192, 192), 3233857791);
        import_chai.assert.equal(import_Color.channels.toRgba(208, 208, 208), 3503345919);
        import_chai.assert.equal(import_Color.channels.toRgba(224, 224, 224), 3772834047);
        import_chai.assert.equal(import_Color.channels.toRgba(240, 240, 240), 4042322175);
        import_chai.assert.equal(import_Color.channels.toRgba(255, 255, 255), 4294967295);
      });
      it("should convert an rgba array to an rgba number", () => {
        import_chai.assert.equal(import_Color.channels.toRgba(0, 0, 0, 0), 0);
        import_chai.assert.equal(import_Color.channels.toRgba(16, 16, 16, 16), 269488144);
        import_chai.assert.equal(import_Color.channels.toRgba(32, 32, 32, 32), 538976288);
        import_chai.assert.equal(import_Color.channels.toRgba(48, 48, 48, 48), 808464432);
        import_chai.assert.equal(import_Color.channels.toRgba(64, 64, 64, 64), 1077952576);
        import_chai.assert.equal(import_Color.channels.toRgba(80, 80, 80, 80), 1347440720);
        import_chai.assert.equal(import_Color.channels.toRgba(96, 96, 96, 96), 1616928864);
        import_chai.assert.equal(import_Color.channels.toRgba(112, 112, 112, 112), 1886417008);
        import_chai.assert.equal(import_Color.channels.toRgba(128, 128, 128, 128), 2155905152);
        import_chai.assert.equal(import_Color.channels.toRgba(144, 144, 144, 144), 2425393296);
        import_chai.assert.equal(import_Color.channels.toRgba(160, 160, 160, 160), 2694881440);
        import_chai.assert.equal(import_Color.channels.toRgba(176, 176, 176, 176), 2964369584);
        import_chai.assert.equal(import_Color.channels.toRgba(192, 192, 192, 192), 3233857728);
        import_chai.assert.equal(import_Color.channels.toRgba(208, 208, 208, 208), 3503345872);
        import_chai.assert.equal(import_Color.channels.toRgba(224, 224, 224, 224), 3772834016);
        import_chai.assert.equal(import_Color.channels.toRgba(240, 240, 240, 240), 4042322160);
        import_chai.assert.equal(import_Color.channels.toRgba(255, 255, 255, 255), 4294967295);
      });
    });
    describe("toColor", () => {
      it("should convert an rgb array to an IColor", () => {
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(0, 0, 0), { css: "#000000", rgba: 255 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(16, 16, 16), { css: "#101010", rgba: 269488383 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(32, 32, 32), { css: "#202020", rgba: 538976511 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(48, 48, 48), { css: "#303030", rgba: 808464639 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(64, 64, 64), { css: "#404040", rgba: 1077952767 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(80, 80, 80), { css: "#505050", rgba: 1347440895 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(96, 96, 96), { css: "#606060", rgba: 1616929023 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(112, 112, 112), { css: "#707070", rgba: 1886417151 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(128, 128, 128), { css: "#808080", rgba: 2155905279 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(144, 144, 144), { css: "#909090", rgba: 2425393407 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(160, 160, 160), { css: "#a0a0a0", rgba: 2694881535 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(176, 176, 176), { css: "#b0b0b0", rgba: 2964369663 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(192, 192, 192), { css: "#c0c0c0", rgba: 3233857791 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(208, 208, 208), { css: "#d0d0d0", rgba: 3503345919 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(224, 224, 224), { css: "#e0e0e0", rgba: 3772834047 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(240, 240, 240), { css: "#f0f0f0", rgba: 4042322175 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(255, 255, 255), { css: "#ffffff", rgba: 4294967295 });
      });
      it("should convert an rgba array to an IColor", () => {
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(0, 0, 0, 0), { css: "#00000000", rgba: 0 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(16, 16, 16, 16), { css: "#10101010", rgba: 269488144 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(32, 32, 32, 32), { css: "#20202020", rgba: 538976288 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(48, 48, 48, 48), { css: "#30303030", rgba: 808464432 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(64, 64, 64, 64), { css: "#40404040", rgba: 1077952576 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(80, 80, 80, 80), { css: "#50505050", rgba: 1347440720 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(96, 96, 96, 96), { css: "#60606060", rgba: 1616928864 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(112, 112, 112, 112), { css: "#70707070", rgba: 1886417008 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(128, 128, 128, 128), { css: "#80808080", rgba: 2155905152 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(144, 144, 144, 144), { css: "#90909090", rgba: 2425393296 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(160, 160, 160, 160), { css: "#a0a0a0a0", rgba: 2694881440 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(176, 176, 176, 176), { css: "#b0b0b0b0", rgba: 2964369584 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(192, 192, 192, 192), { css: "#c0c0c0c0", rgba: 3233857728 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(208, 208, 208, 208), { css: "#d0d0d0d0", rgba: 3503345872 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(224, 224, 224, 224), { css: "#e0e0e0e0", rgba: 3772834016 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(240, 240, 240, 240), { css: "#f0f0f0f0", rgba: 4042322160 });
        import_chai.assert.deepStrictEqual(import_Color.channels.toColor(255, 255, 255, 255), { css: "#ffffffff", rgba: 4294967295 });
      });
    });
  });
  describe("color", () => {
    describe("blend", () => {
      it("should blend colors based on the alpha channel", () => {
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF00", rgba: 4294967040 }), { css: "#000000", rgba: 255 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF10", rgba: 4294967056 }), { css: "#101010", rgba: 269488383 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF20", rgba: 4294967072 }), { css: "#202020", rgba: 538976511 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF30", rgba: 4294967088 }), { css: "#303030", rgba: 808464639 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF40", rgba: 4294967104 }), { css: "#404040", rgba: 1077952767 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF50", rgba: 4294967120 }), { css: "#505050", rgba: 1347440895 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF60", rgba: 4294967136 }), { css: "#606060", rgba: 1616929023 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF70", rgba: 4294967152 }), { css: "#707070", rgba: 1886417151 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF80", rgba: 4294967168 }), { css: "#808080", rgba: 2155905279 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFF90", rgba: 4294967184 }), { css: "#909090", rgba: 2425393407 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFA0", rgba: 4294967200 }), { css: "#a0a0a0", rgba: 2694881535 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFB0", rgba: 4294967216 }), { css: "#b0b0b0", rgba: 2964369663 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFC0", rgba: 4294967232 }), { css: "#c0c0c0", rgba: 3233857791 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFD0", rgba: 4294967248 }), { css: "#d0d0d0", rgba: 3503345919 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFE0", rgba: 4294967264 }), { css: "#e0e0e0", rgba: 3772834047 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFF0", rgba: 4294967280 }), { css: "#f0f0f0", rgba: 4042322175 });
        import_chai.assert.deepEqual(import_Color.color.blend({ css: "#000000", rgba: 255 }, { css: "#FFFFFFFF", rgba: 4294967295 }), { css: "#FFFFFFFF", rgba: 4294967295 });
      });
    });
    describe("opaque", () => {
      it("should make the color opaque", () => {
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#00000000", rgba: 0 }), { css: "#000000", rgba: 255 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#10101010", rgba: 269488144 }), { css: "#101010", rgba: 269488383 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#20202020", rgba: 538976288 }), { css: "#202020", rgba: 538976511 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#30303030", rgba: 808464432 }), { css: "#303030", rgba: 808464639 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#40404040", rgba: 1077952576 }), { css: "#404040", rgba: 1077952767 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#50505050", rgba: 1347440720 }), { css: "#505050", rgba: 1347440895 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#60606060", rgba: 1616928864 }), { css: "#606060", rgba: 1616929023 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#70707070", rgba: 1886417008 }), { css: "#707070", rgba: 1886417151 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#80808080", rgba: 2155905152 }), { css: "#808080", rgba: 2155905279 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#90909090", rgba: 2425393296 }), { css: "#909090", rgba: 2425393407 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#a0a0a0a0", rgba: 2694881440 }), { css: "#a0a0a0", rgba: 2694881535 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#b0b0b0b0", rgba: 2964369584 }), { css: "#b0b0b0", rgba: 2964369663 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#c0c0c0c0", rgba: 3233857728 }), { css: "#c0c0c0", rgba: 3233857791 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#d0d0d0d0", rgba: 3503345872 }), { css: "#d0d0d0", rgba: 3503345919 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#e0e0e0e0", rgba: 3772834016 }), { css: "#e0e0e0", rgba: 3772834047 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#f0f0f0f0", rgba: 4042322160 }), { css: "#f0f0f0", rgba: 4042322175 });
        import_chai.assert.deepEqual(import_Color.color.opaque({ css: "#ffffffff", rgba: 4294967295 }), { css: "#ffffff", rgba: 4294967295 });
      });
    });
    describe("isOpaque", () => {
      it("should return true for opaque colors", () => {
        import_chai.assert.ok(import_Color.color.isOpaque(import_Color.css.toColor("#000000")));
        import_chai.assert.ok(import_Color.color.isOpaque(import_Color.css.toColor("#000000ff")));
        import_chai.assert.ok(import_Color.color.isOpaque(import_Color.css.toColor("#808080")));
        import_chai.assert.ok(import_Color.color.isOpaque(import_Color.css.toColor("#808080ff")));
        import_chai.assert.ok(import_Color.color.isOpaque(import_Color.css.toColor("#ffffff")));
        import_chai.assert.ok(import_Color.color.isOpaque(import_Color.css.toColor("#ffffffff")));
      });
      it("should return false for transparent colors", () => {
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#00000000")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#00000080")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#000000fe")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#80808000")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#80808080")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#808080fe")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#ffffff00")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#ffffff80")));
        import_chai.assert.ok(!import_Color.color.isOpaque(import_Color.css.toColor("#fffffffe")));
      });
    });
    describe("opacity", () => {
      it("should make the color transparent", () => {
        import_chai.assert.deepEqual(import_Color.color.opacity(import_Color.css.toColor("#000000"), 0), { css: "#00000000", rgba: 0 });
        import_chai.assert.deepEqual(import_Color.color.opacity(import_Color.css.toColor("#000000"), 0.25), { css: "#00000040", rgba: 64 });
        import_chai.assert.deepEqual(import_Color.color.opacity(import_Color.css.toColor("#000000"), 0.5), { css: "#00000080", rgba: 128 });
        import_chai.assert.deepEqual(import_Color.color.opacity(import_Color.css.toColor("#000000"), 0.75), { css: "#000000bf", rgba: 191 });
        import_chai.assert.deepEqual(import_Color.color.opacity(import_Color.css.toColor("#000000"), 1), { css: "#000000ff", rgba: 255 });
      });
    });
  });
  describe("css", () => {
    describe("toColor", () => {
      it("should convert the #rgb format to an IColor", () => {
        import_chai.assert.deepEqual(import_Color.css.toColor("#000"), { css: "#000000", rgba: 255 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#111"), { css: "#111111", rgba: 286331391 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#222"), { css: "#222222", rgba: 572662527 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#333"), { css: "#333333", rgba: 858993663 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#444"), { css: "#444444", rgba: 1145324799 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#555"), { css: "#555555", rgba: 1431655935 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#666"), { css: "#666666", rgba: 1717987071 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#777"), { css: "#777777", rgba: 2004318207 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#888"), { css: "#888888", rgba: 2290649343 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#999"), { css: "#999999", rgba: 2576980479 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#aaa"), { css: "#aaaaaa", rgba: 2863311615 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#bbb"), { css: "#bbbbbb", rgba: 3149642751 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#ccc"), { css: "#cccccc", rgba: 3435973887 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#ddd"), { css: "#dddddd", rgba: 3722305023 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#eee"), { css: "#eeeeee", rgba: 4008636159 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#fff"), { css: "#ffffff", rgba: 4294967295 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#fff"), { css: "#ffffff", rgba: 4294967295 });
      });
      it("should convert the #rgb format to an IColor", () => {
        import_chai.assert.deepEqual(import_Color.css.toColor("#0000"), { css: "#00000000", rgba: 0 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#1111"), { css: "#11111111", rgba: 286331153 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#2222"), { css: "#22222222", rgba: 572662306 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#3333"), { css: "#33333333", rgba: 858993459 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#4444"), { css: "#44444444", rgba: 1145324612 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#5555"), { css: "#55555555", rgba: 1431655765 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#6666"), { css: "#66666666", rgba: 1717986918 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#7777"), { css: "#77777777", rgba: 2004318071 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#8888"), { css: "#88888888", rgba: 2290649224 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#9999"), { css: "#99999999", rgba: 2576980377 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#aaaa"), { css: "#aaaaaaaa", rgba: 2863311530 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#bbbb"), { css: "#bbbbbbbb", rgba: 3149642683 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#cccc"), { css: "#cccccccc", rgba: 3435973836 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#dddd"), { css: "#dddddddd", rgba: 3722304989 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#eeee"), { css: "#eeeeeeee", rgba: 4008636142 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#ffff"), { css: "#ffffffff", rgba: 4294967295 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#ffff"), { css: "#ffffffff", rgba: 4294967295 });
      });
      it("should convert the #rrggbb format to an IColor", () => {
        import_chai.assert.deepEqual(import_Color.css.toColor("#000000"), { css: "#000000", rgba: 255 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#101010"), { css: "#101010", rgba: 269488383 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#202020"), { css: "#202020", rgba: 538976511 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#303030"), { css: "#303030", rgba: 808464639 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#404040"), { css: "#404040", rgba: 1077952767 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#505050"), { css: "#505050", rgba: 1347440895 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#606060"), { css: "#606060", rgba: 1616929023 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#707070"), { css: "#707070", rgba: 1886417151 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#808080"), { css: "#808080", rgba: 2155905279 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#909090"), { css: "#909090", rgba: 2425393407 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#a0a0a0"), { css: "#a0a0a0", rgba: 2694881535 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#b0b0b0"), { css: "#b0b0b0", rgba: 2964369663 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#c0c0c0"), { css: "#c0c0c0", rgba: 3233857791 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#d0d0d0"), { css: "#d0d0d0", rgba: 3503345919 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#e0e0e0"), { css: "#e0e0e0", rgba: 3772834047 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#f0f0f0"), { css: "#f0f0f0", rgba: 4042322175 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#ffffff"), { css: "#ffffff", rgba: 4294967295 });
      });
      it("should convert the #rrggbbaa format to an IColor", () => {
        import_chai.assert.deepEqual(import_Color.css.toColor("#00000000"), { css: "#00000000", rgba: 0 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#10101010"), { css: "#10101010", rgba: 269488144 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#20202020"), { css: "#20202020", rgba: 538976288 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#30303030"), { css: "#30303030", rgba: 808464432 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#40404040"), { css: "#40404040", rgba: 1077952576 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#50505050"), { css: "#50505050", rgba: 1347440720 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#60606060"), { css: "#60606060", rgba: 1616928864 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#70707070"), { css: "#70707070", rgba: 1886417008 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#80808080"), { css: "#80808080", rgba: 2155905152 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#90909090"), { css: "#90909090", rgba: 2425393296 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#a0a0a0a0"), { css: "#a0a0a0a0", rgba: 2694881440 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#b0b0b0b0"), { css: "#b0b0b0b0", rgba: 2964369584 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#c0c0c0c0"), { css: "#c0c0c0c0", rgba: 3233857728 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#d0d0d0d0"), { css: "#d0d0d0d0", rgba: 3503345872 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#e0e0e0e0"), { css: "#e0e0e0e0", rgba: 3772834016 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#f0f0f0f0"), { css: "#f0f0f0f0", rgba: 4042322160 });
        import_chai.assert.deepEqual(import_Color.css.toColor("#ffffffff"), { css: "#ffffffff", rgba: 4294967295 });
      });
      it("should convert the rgb() format to an IColor", () => {
        import_chai.assert.deepEqual(import_Color.css.toColor("rgb(0, 0, 0)"), { css: "#000000ff", rgba: 255 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgb(80, 0, 0)"), { css: "#500000ff", rgba: 1342177535 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgb(0, 80, 0)"), { css: "#005000ff", rgba: 5243135 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgb(0, 0, 80)"), { css: "#000050ff", rgba: 20735 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgb(255, 255, 255)"), { css: "#ffffffff", rgba: 4294967295 });
      });
      it("should convert the rgba() format to an IColor", () => {
        import_chai.assert.deepEqual(import_Color.css.toColor("rgba(0, 0, 0, 0)"), { css: "#00000000", rgba: 0 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgba(80, 0, 0, 0.5)"), { css: "#50000080", rgba: 1342177408 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgba(0, 80, 0, 0.5)"), { css: "#00500080", rgba: 5243008 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgba(0, 0, 80, 0.5)"), { css: "#00005080", rgba: 20608 });
        import_chai.assert.deepEqual(import_Color.css.toColor("rgba(255, 255, 255, 1)"), { css: "#ffffffff", rgba: 4294967295 });
      });
    });
  });
  describe("rgb", () => {
    describe("relativeLuminance", () => {
      it("should calculate the relative luminance of the color", () => {
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(0), 0);
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(1052688).toFixed(4), "0.0052");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(2105376).toFixed(4), "0.0144");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(3158064).toFixed(4), "0.0296");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(4210752).toFixed(4), "0.0513");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(5263440).toFixed(4), "0.0802");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(6316128).toFixed(4), "0.1170");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(7368816).toFixed(4), "0.1620");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(8421504).toFixed(4), "0.2159");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(9474192).toFixed(4), "0.2789");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(10526880).toFixed(4), "0.3515");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(11579568).toFixed(4), "0.4342");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(12632256).toFixed(4), "0.5271");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(13684944).toFixed(4), "0.6308");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(14737632).toFixed(4), "0.7454");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(15790320).toFixed(4), "0.8714");
        import_chai.assert.equal(import_Color.rgb.relativeLuminance(16777215), 1);
      });
    });
  });
  describe("rgba", () => {
    describe("blend", () => {
      it("should blend colors based on the alpha channel", () => {
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967040), 255);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967056), 269488383);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967072), 538976511);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967088), 808464639);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967104), 1077952767);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967120), 1347440895);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967136), 1616929023);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967152), 1886417151);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967168), 2155905279);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967184), 2425393407);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967200), 2694881535);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967216), 2964369663);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967232), 3233857791);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967248), 3503345919);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967264), 3772834047);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967280), 4042322175);
        import_chai.assert.deepEqual(import_Color.rgba.blend(255, 4294967295), 4294967295);
      });
    });
    describe("ensureContrastRatio", () => {
      it("should return undefined if the color already meets the contrast ratio (black bg)", () => {
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 1), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 2), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 3), void 0);
      });
      it("should return a color that meets the contrast ratio (black bg)", () => {
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 4), 1886417151);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 5), 2139062271);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 6), 2358021375);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 7), 2560137471);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 8), 2745410559);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 9), 2913840639);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 10), 3065427711);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 11), 3200171775);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 12), 3318072831);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 13), 3520188927);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 14), 3604403967);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 15), 3688619007);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 16), 3823363071);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 17), 3924421119);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 18), 4008636159);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 19), 4109694207);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 20), 4210752255);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(255, 1616929023, 21), 4294967295);
      });
      it("should return undefined if the color already meets the contrast ratio (white bg)", () => {
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 1), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 2), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 3), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 4), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 5), void 0);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 6), void 0);
      });
      it("should return a color that meets the contrast ratio (white bg)", () => {
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 7), 1448498943);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 8), 1296911871);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 9), 1162167807);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 10), 1044266751);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 11), 926365695);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 12), 825307647);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 13), 825307647);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 14), 656877567);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 15), 589505535);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 16), 522133503);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 17), 454761471);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 18), 353703423);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 19), 269488383);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 20), 134744319);
        import_chai.assert.equal(import_Color.rgba.ensureContrastRatio(4294967295, 1616929023, 21), 255);
      });
    });
    describe("toChannels", () => {
      it("should convert an rgba number to an rgba array", () => {
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(0), [0, 0, 0, 0]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(269488144), [16, 16, 16, 16]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(538976288), [32, 32, 32, 32]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(808464432), [48, 48, 48, 48]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(1077952576), [64, 64, 64, 64]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(1347440720), [80, 80, 80, 80]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(1616928864), [96, 96, 96, 96]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(1886417008), [112, 112, 112, 112]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(2155905152), [128, 128, 128, 128]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(2425393296), [144, 144, 144, 144]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(2694881440), [160, 160, 160, 160]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(2964369584), [176, 176, 176, 176]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(3233857728), [192, 192, 192, 192]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(3503345872), [208, 208, 208, 208]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(3772834016), [224, 224, 224, 224]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(4042322160), [240, 240, 240, 240]);
        import_chai.assert.deepEqual(import_Color.rgba.toChannels(4294967295), [255, 255, 255, 255]);
      });
    });
  });
  describe("toPaddedHex", () => {
    it("should convert numbers to 2-digit hex values", () => {
      import_chai.assert.equal((0, import_Color.toPaddedHex)(0), "00");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(16), "10");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(32), "20");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(48), "30");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(64), "40");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(80), "50");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(96), "60");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(112), "70");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(128), "80");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(144), "90");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(160), "a0");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(176), "b0");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(192), "c0");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(208), "d0");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(224), "e0");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(240), "f0");
      import_chai.assert.equal((0, import_Color.toPaddedHex)(255), "ff");
    });
  });
  describe("contrastRatio", () => {
    it("should calculate the relative luminance of the color", () => {
      import_chai.assert.equal((0, import_Color.contrastRatio)(0, 0), 1);
      import_chai.assert.equal((0, import_Color.contrastRatio)(0, 0.5), 11);
      import_chai.assert.equal((0, import_Color.contrastRatio)(0, 1), 21);
    });
    it("should work regardless of the parameter order", () => {
      import_chai.assert.equal((0, import_Color.contrastRatio)(0, 1), 21);
      import_chai.assert.equal((0, import_Color.contrastRatio)(1, 0), 21);
    });
  });
});
//# sourceMappingURL=Color.test.js.map
