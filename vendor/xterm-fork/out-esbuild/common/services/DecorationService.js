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
var DecorationService_exports = {};
__export(DecorationService_exports, {
  DecorationService: () => DecorationService
});
module.exports = __toCommonJS(DecorationService_exports);
var import_Color = require("common/Color");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_SortedList = require("common/SortedList");
var import_event = require("vs/base/common/event");
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let $xmin = 0;
let $xmax = 0;
class DecorationService extends import_lifecycle.Disposable {
  constructor() {
    super();
    /**
     * A list of all decorations, sorted by the marker's line value. This relies on the fact that
     * while marker line values do change, they should all change by the same amount so this should
     * never become out of order.
     */
    this._decorations = new import_SortedList.SortedList((e) => e?.marker.line);
    this._onDecorationRegistered = this._register(new import_event.Emitter());
    this.onDecorationRegistered = this._onDecorationRegistered.event;
    this._onDecorationRemoved = this._register(new import_event.Emitter());
    this.onDecorationRemoved = this._onDecorationRemoved.event;
    this._register((0, import_lifecycle.toDisposable)(() => this.reset()));
  }
  get decorations() {
    return this._decorations.values();
  }
  registerDecoration(options) {
    if (options.marker.isDisposed) {
      return void 0;
    }
    const decoration = new Decoration(options);
    if (decoration) {
      const markerDispose = decoration.marker.onDispose(() => decoration.dispose());
      const listener = decoration.onDispose(() => {
        listener.dispose();
        if (decoration) {
          if (this._decorations.delete(decoration)) {
            this._onDecorationRemoved.fire(decoration);
          }
          markerDispose.dispose();
        }
      });
      this._decorations.insert(decoration);
      this._onDecorationRegistered.fire(decoration);
    }
    return decoration;
  }
  reset() {
    for (const d of this._decorations.values()) {
      d.dispose();
    }
    this._decorations.clear();
  }
  *getDecorationsAtCell(x, line, layer) {
    let xmin = 0;
    let xmax = 0;
    for (const d of this._decorations.getKeyIterator(line)) {
      xmin = d.options.x ?? 0;
      xmax = xmin + (d.options.width ?? 1);
      if (x >= xmin && x < xmax && (!layer || (d.options.layer ?? "bottom") === layer)) {
        yield d;
      }
    }
  }
  forEachDecorationAtCell(x, line, layer, callback) {
    this._decorations.forEachByKey(line, (d) => {
      $xmin = d.options.x ?? 0;
      $xmax = $xmin + (d.options.width ?? 1);
      if (x >= $xmin && x < $xmax && (!layer || (d.options.layer ?? "bottom") === layer)) {
        callback(d);
      }
    });
  }
}
class Decoration extends import_lifecycle.DisposableStore {
  constructor(options) {
    super();
    this.options = options;
    this.onRenderEmitter = this.add(new import_event.Emitter());
    this.onRender = this.onRenderEmitter.event;
    this._onDispose = this.add(new import_event.Emitter());
    this.onDispose = this._onDispose.event;
    this._cachedBg = null;
    this._cachedFg = null;
    this.marker = options.marker;
    if (this.options.overviewRulerOptions && !this.options.overviewRulerOptions.position) {
      this.options.overviewRulerOptions.position = "full";
    }
  }
  get backgroundColorRGB() {
    if (this._cachedBg === null) {
      if (this.options.backgroundColor) {
        this._cachedBg = import_Color.css.toColor(this.options.backgroundColor);
      } else {
        this._cachedBg = void 0;
      }
    }
    return this._cachedBg;
  }
  get foregroundColorRGB() {
    if (this._cachedFg === null) {
      if (this.options.foregroundColor) {
        this._cachedFg = import_Color.css.toColor(this.options.foregroundColor);
      } else {
        this._cachedFg = void 0;
      }
    }
    return this._cachedFg;
  }
  dispose() {
    this._onDispose.fire();
    super.dispose();
  }
}
//# sourceMappingURL=DecorationService.js.map
