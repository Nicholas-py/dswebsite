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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var touch_exports = {};
__export(touch_exports, {
  EventType: () => EventType,
  Gesture: () => Gesture
});
module.exports = __toCommonJS(touch_exports);
var DomUtils = __toESM(require("vs/base/browser/dom"));
var import_window = require("vs/base/browser/window");
var arrays = __toESM(require("vs/base/common/arrays"));
var import_decorators = require("vs/base/common/decorators");
var import_event = require("vs/base/common/event");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_linkedList = require("vs/base/common/linkedList");
var EventType;
((EventType2) => {
  EventType2.Tap = "-xterm-gesturetap";
  EventType2.Change = "-xterm-gesturechange";
  EventType2.Start = "-xterm-gesturestart";
  EventType2.End = "-xterm-gesturesend";
  EventType2.Contextmenu = "-xterm-gesturecontextmenu";
})(EventType || (EventType = {}));
const _Gesture = class _Gesture extends import_lifecycle.Disposable {
  // ms
  constructor() {
    super();
    this.dispatched = false;
    this.targets = new import_linkedList.LinkedList();
    this.ignoreTargets = new import_linkedList.LinkedList();
    this.activeTouches = {};
    this.handle = null;
    this._lastSetTapCountTime = 0;
    this._register(import_event.Event.runAndSubscribe(DomUtils.onDidRegisterWindow, ({ window, disposables }) => {
      disposables.add(DomUtils.addDisposableListener(window.document, "touchstart", (e) => this.onTouchStart(e), { passive: false }));
      disposables.add(DomUtils.addDisposableListener(window.document, "touchend", (e) => this.onTouchEnd(window, e)));
      disposables.add(DomUtils.addDisposableListener(window.document, "touchmove", (e) => this.onTouchMove(e), { passive: false }));
    }, { window: import_window.mainWindow, disposables: this._store }));
  }
  static {
    this.SCROLL_FRICTION = -5e-3;
  }
  static {
    this.HOLD_DELAY = 700;
  }
  static {
    this.CLEAR_TAP_COUNT_TIME = 400;
  }
  static addTarget(element) {
    if (!_Gesture.isTouchDevice()) {
      return import_lifecycle.Disposable.None;
    }
    if (!_Gesture.INSTANCE) {
      _Gesture.INSTANCE = (0, import_lifecycle.markAsSingleton)(new _Gesture());
    }
    const remove = _Gesture.INSTANCE.targets.push(element);
    return (0, import_lifecycle.toDisposable)(remove);
  }
  static ignoreTarget(element) {
    if (!_Gesture.isTouchDevice()) {
      return import_lifecycle.Disposable.None;
    }
    if (!_Gesture.INSTANCE) {
      _Gesture.INSTANCE = (0, import_lifecycle.markAsSingleton)(new _Gesture());
    }
    const remove = _Gesture.INSTANCE.ignoreTargets.push(element);
    return (0, import_lifecycle.toDisposable)(remove);
  }
  static isTouchDevice() {
    return "ontouchstart" in import_window.mainWindow || navigator.maxTouchPoints > 0;
  }
  dispose() {
    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
    }
    super.dispose();
  }
  onTouchStart(e) {
    const timestamp = Date.now();
    if (this.handle) {
      this.handle.dispose();
      this.handle = null;
    }
    for (let i = 0, len = e.targetTouches.length; i < len; i++) {
      const touch = e.targetTouches.item(i);
      this.activeTouches[touch.identifier] = {
        id: touch.identifier,
        initialTarget: touch.target,
        initialTimeStamp: timestamp,
        initialPageX: touch.pageX,
        initialPageY: touch.pageY,
        rollingTimestamps: [timestamp],
        rollingPageX: [touch.pageX],
        rollingPageY: [touch.pageY]
      };
      const evt = this.newGestureEvent(EventType.Start, touch.target);
      evt.pageX = touch.pageX;
      evt.pageY = touch.pageY;
      this.dispatchEvent(evt);
    }
    if (this.dispatched) {
      e.preventDefault();
      e.stopPropagation();
      this.dispatched = false;
    }
  }
  onTouchEnd(targetWindow, e) {
    const timestamp = Date.now();
    const activeTouchCount = Object.keys(this.activeTouches).length;
    for (let i = 0, len = e.changedTouches.length; i < len; i++) {
      const touch = e.changedTouches.item(i);
      if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
        console.warn("move of an UNKNOWN touch", touch);
        continue;
      }
      const data = this.activeTouches[touch.identifier], holdTime = Date.now() - data.initialTimeStamp;
      if (holdTime < _Gesture.HOLD_DELAY && Math.abs(data.initialPageX - arrays.tail(data.rollingPageX)) < 30 && Math.abs(data.initialPageY - arrays.tail(data.rollingPageY)) < 30) {
        const evt = this.newGestureEvent(EventType.Tap, data.initialTarget);
        evt.pageX = arrays.tail(data.rollingPageX);
        evt.pageY = arrays.tail(data.rollingPageY);
        this.dispatchEvent(evt);
      } else if (holdTime >= _Gesture.HOLD_DELAY && Math.abs(data.initialPageX - arrays.tail(data.rollingPageX)) < 30 && Math.abs(data.initialPageY - arrays.tail(data.rollingPageY)) < 30) {
        const evt = this.newGestureEvent(EventType.Contextmenu, data.initialTarget);
        evt.pageX = arrays.tail(data.rollingPageX);
        evt.pageY = arrays.tail(data.rollingPageY);
        this.dispatchEvent(evt);
      } else if (activeTouchCount === 1) {
        const finalX = arrays.tail(data.rollingPageX);
        const finalY = arrays.tail(data.rollingPageY);
        const deltaT = arrays.tail(data.rollingTimestamps) - data.rollingTimestamps[0];
        const deltaX = finalX - data.rollingPageX[0];
        const deltaY = finalY - data.rollingPageY[0];
        const dispatchTo = [...this.targets].filter((t) => data.initialTarget instanceof Node && t.contains(data.initialTarget));
        this.inertia(
          targetWindow,
          dispatchTo,
          timestamp,
          // time now
          Math.abs(deltaX) / deltaT,
          // speed
          deltaX > 0 ? 1 : -1,
          // x direction
          finalX,
          // x now
          Math.abs(deltaY) / deltaT,
          // y speed
          deltaY > 0 ? 1 : -1,
          // y direction
          finalY
          // y now
        );
      }
      this.dispatchEvent(this.newGestureEvent(EventType.End, data.initialTarget));
      delete this.activeTouches[touch.identifier];
    }
    if (this.dispatched) {
      e.preventDefault();
      e.stopPropagation();
      this.dispatched = false;
    }
  }
  newGestureEvent(type, initialTarget) {
    const event = document.createEvent("CustomEvent");
    event.initEvent(type, false, true);
    event.initialTarget = initialTarget;
    event.tapCount = 0;
    return event;
  }
  dispatchEvent(event) {
    if (event.type === EventType.Tap) {
      const currentTime = (/* @__PURE__ */ new Date()).getTime();
      let setTapCount = 0;
      if (currentTime - this._lastSetTapCountTime > _Gesture.CLEAR_TAP_COUNT_TIME) {
        setTapCount = 1;
      } else {
        setTapCount = 2;
      }
      this._lastSetTapCountTime = currentTime;
      event.tapCount = setTapCount;
    } else if (event.type === EventType.Change || event.type === EventType.Contextmenu) {
      this._lastSetTapCountTime = 0;
    }
    if (event.initialTarget instanceof Node) {
      for (const ignoreTarget of this.ignoreTargets) {
        if (ignoreTarget.contains(event.initialTarget)) {
          return;
        }
      }
      const targets = [];
      for (const target of this.targets) {
        if (target.contains(event.initialTarget)) {
          let depth = 0;
          let now = event.initialTarget;
          while (now && now !== target) {
            depth++;
            now = now.parentElement;
          }
          targets.push([depth, target]);
        }
      }
      targets.sort((a, b) => a[0] - b[0]);
      for (const [_, target] of targets) {
        target.dispatchEvent(event);
        this.dispatched = true;
      }
    }
  }
  inertia(targetWindow, dispatchTo, t1, vX, dirX, x, vY, dirY, y) {
    this.handle = DomUtils.scheduleAtNextAnimationFrame(targetWindow, () => {
      const now = Date.now();
      const deltaT = now - t1;
      let delta_pos_x = 0, delta_pos_y = 0;
      let stopped = true;
      vX += _Gesture.SCROLL_FRICTION * deltaT;
      vY += _Gesture.SCROLL_FRICTION * deltaT;
      if (vX > 0) {
        stopped = false;
        delta_pos_x = dirX * vX * deltaT;
      }
      if (vY > 0) {
        stopped = false;
        delta_pos_y = dirY * vY * deltaT;
      }
      const evt = this.newGestureEvent(EventType.Change);
      evt.translationX = delta_pos_x;
      evt.translationY = delta_pos_y;
      dispatchTo.forEach((d) => d.dispatchEvent(evt));
      if (!stopped) {
        this.inertia(targetWindow, dispatchTo, now, vX, dirX, x + delta_pos_x, vY, dirY, y + delta_pos_y);
      }
    });
  }
  onTouchMove(e) {
    const timestamp = Date.now();
    for (let i = 0, len = e.changedTouches.length; i < len; i++) {
      const touch = e.changedTouches.item(i);
      if (!this.activeTouches.hasOwnProperty(String(touch.identifier))) {
        console.warn("end of an UNKNOWN touch", touch);
        continue;
      }
      const data = this.activeTouches[touch.identifier];
      const evt = this.newGestureEvent(EventType.Change, data.initialTarget);
      evt.translationX = touch.pageX - arrays.tail(data.rollingPageX);
      evt.translationY = touch.pageY - arrays.tail(data.rollingPageY);
      evt.pageX = touch.pageX;
      evt.pageY = touch.pageY;
      this.dispatchEvent(evt);
      if (data.rollingPageX.length > 3) {
        data.rollingPageX.shift();
        data.rollingPageY.shift();
        data.rollingTimestamps.shift();
      }
      data.rollingPageX.push(touch.pageX);
      data.rollingPageY.push(touch.pageY);
      data.rollingTimestamps.push(timestamp);
    }
    if (this.dispatched) {
      e.preventDefault();
      e.stopPropagation();
      this.dispatched = false;
    }
  }
};
__decorateClass([
  import_decorators.memoize
], _Gesture, "isTouchDevice", 1);
let Gesture = _Gesture;
//# sourceMappingURL=touch.js.map
