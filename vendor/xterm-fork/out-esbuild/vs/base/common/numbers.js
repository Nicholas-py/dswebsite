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
var numbers_exports = {};
__export(numbers_exports, {
  Counter: () => Counter,
  MovingAverage: () => MovingAverage,
  SlidingWindowAverage: () => SlidingWindowAverage,
  clamp: () => clamp,
  isPointWithinTriangle: () => isPointWithinTriangle,
  rot: () => rot
});
module.exports = __toCommonJS(numbers_exports);
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function rot(index, modulo) {
  return (modulo + index % modulo) % modulo;
}
class Counter {
  constructor() {
    this._next = 0;
  }
  getNext() {
    return this._next++;
  }
}
class MovingAverage {
  constructor() {
    this._n = 1;
    this._val = 0;
  }
  update(value) {
    this._val = this._val + (value - this._val) / this._n;
    this._n += 1;
    return this._val;
  }
  get value() {
    return this._val;
  }
}
class SlidingWindowAverage {
  constructor(size) {
    this._n = 0;
    this._val = 0;
    this._values = [];
    this._index = 0;
    this._sum = 0;
    this._values = new Array(size);
    this._values.fill(0, 0, size);
  }
  update(value) {
    const oldValue = this._values[this._index];
    this._values[this._index] = value;
    this._index = (this._index + 1) % this._values.length;
    this._sum -= oldValue;
    this._sum += value;
    if (this._n < this._values.length) {
      this._n += 1;
    }
    this._val = this._sum / this._n;
    return this._val;
  }
  get value() {
    return this._val;
  }
}
function isPointWithinTriangle(x, y, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax;
  const v0y = cy - ay;
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = x - ax;
  const v2y = y - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return u >= 0 && v >= 0 && u + v < 1;
}
//# sourceMappingURL=numbers.js.map
