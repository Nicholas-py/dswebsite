"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var scrollbarArrow_exports = {};
__export(scrollbarArrow_exports, {
  ARROW_IMG_SIZE: () => ARROW_IMG_SIZE,
  ScrollbarArrow: () => ScrollbarArrow
});
module.exports = __toCommonJS(scrollbarArrow_exports);
var import_globalPointerMoveMonitor = require("vs/base/browser/globalPointerMoveMonitor");
var import_widget = require("vs/base/browser/ui/widget");
var import_async = require("vs/base/common/async");
var dom = __toESM(require("vs/base/browser/dom"));
const ARROW_IMG_SIZE = 11;
class ScrollbarArrow extends import_widget.Widget {
  constructor(opts) {
    super();
    this._onActivate = opts.onActivate;
    this.bgDomNode = document.createElement("div");
    this.bgDomNode.className = "arrow-background";
    this.bgDomNode.style.position = "absolute";
    this.bgDomNode.style.width = opts.bgWidth + "px";
    this.bgDomNode.style.height = opts.bgHeight + "px";
    if (typeof opts.top !== "undefined") {
      this.bgDomNode.style.top = "0px";
    }
    if (typeof opts.left !== "undefined") {
      this.bgDomNode.style.left = "0px";
    }
    if (typeof opts.bottom !== "undefined") {
      this.bgDomNode.style.bottom = "0px";
    }
    if (typeof opts.right !== "undefined") {
      this.bgDomNode.style.right = "0px";
    }
    this.domNode = document.createElement("div");
    this.domNode.className = opts.className;
    this.domNode.style.position = "absolute";
    this.domNode.style.width = ARROW_IMG_SIZE + "px";
    this.domNode.style.height = ARROW_IMG_SIZE + "px";
    if (typeof opts.top !== "undefined") {
      this.domNode.style.top = opts.top + "px";
    }
    if (typeof opts.left !== "undefined") {
      this.domNode.style.left = opts.left + "px";
    }
    if (typeof opts.bottom !== "undefined") {
      this.domNode.style.bottom = opts.bottom + "px";
    }
    if (typeof opts.right !== "undefined") {
      this.domNode.style.right = opts.right + "px";
    }
    this._pointerMoveMonitor = this._register(new import_globalPointerMoveMonitor.GlobalPointerMoveMonitor());
    this._register(dom.addStandardDisposableListener(this.bgDomNode, dom.EventType.POINTER_DOWN, (e) => this._arrowPointerDown(e)));
    this._register(dom.addStandardDisposableListener(this.domNode, dom.EventType.POINTER_DOWN, (e) => this._arrowPointerDown(e)));
    this._pointerdownRepeatTimer = this._register(new dom.WindowIntervalTimer());
    this._pointerdownScheduleRepeatTimer = this._register(new import_async.TimeoutTimer());
  }
  _arrowPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) {
      return;
    }
    const scheduleRepeater = () => {
      this._pointerdownRepeatTimer.cancelAndSet(() => this._onActivate(), 1e3 / 24, dom.getWindow(e));
    };
    this._onActivate();
    this._pointerdownRepeatTimer.cancel();
    this._pointerdownScheduleRepeatTimer.cancelAndSet(scheduleRepeater, 200);
    this._pointerMoveMonitor.startMonitoring(
      e.target,
      e.pointerId,
      e.buttons,
      (pointerMoveData) => {
      },
      () => {
        this._pointerdownRepeatTimer.cancel();
        this._pointerdownScheduleRepeatTimer.cancel();
      }
    );
    e.preventDefault();
  }
}
//# sourceMappingURL=scrollbarArrow.js.map
