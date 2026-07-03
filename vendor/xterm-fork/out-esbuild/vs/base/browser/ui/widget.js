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
var widget_exports = {};
__export(widget_exports, {
  Widget: () => Widget
});
module.exports = __toCommonJS(widget_exports);
var dom = __toESM(require("vs/base/browser/dom"));
var import_keyboardEvent = require("vs/base/browser/keyboardEvent");
var import_mouseEvent = require("vs/base/browser/mouseEvent");
var import_touch = require("vs/base/browser/touch");
var import_lifecycle = require("vs/base/common/lifecycle");
class Widget extends import_lifecycle.Disposable {
  onclick(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.CLICK, (e) => listener(new import_mouseEvent.StandardMouseEvent(dom.getWindow(domNode), e))));
  }
  onmousedown(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_DOWN, (e) => listener(new import_mouseEvent.StandardMouseEvent(dom.getWindow(domNode), e))));
  }
  onmouseover(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_OVER, (e) => listener(new import_mouseEvent.StandardMouseEvent(dom.getWindow(domNode), e))));
  }
  onmouseleave(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.MOUSE_LEAVE, (e) => listener(new import_mouseEvent.StandardMouseEvent(dom.getWindow(domNode), e))));
  }
  onkeydown(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.KEY_DOWN, (e) => listener(new import_keyboardEvent.StandardKeyboardEvent(e))));
  }
  onkeyup(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.KEY_UP, (e) => listener(new import_keyboardEvent.StandardKeyboardEvent(e))));
  }
  oninput(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.INPUT, listener));
  }
  onblur(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.BLUR, listener));
  }
  onfocus(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.FOCUS, listener));
  }
  onchange(domNode, listener) {
    this._register(dom.addDisposableListener(domNode, dom.EventType.CHANGE, listener));
  }
  ignoreGesture(domNode) {
    return import_touch.Gesture.ignoreTarget(domNode);
  }
}
//# sourceMappingURL=widget.js.map
