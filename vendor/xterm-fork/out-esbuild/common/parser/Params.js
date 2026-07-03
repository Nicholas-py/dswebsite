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
var Params_exports = {};
__export(Params_exports, {
  Params: () => Params
});
module.exports = __toCommonJS(Params_exports);
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const MAX_VALUE = 2147483647;
const MAX_SUBPARAMS = 256;
class Params {
  /**
   * @param maxLength max length of storable parameters
   * @param maxSubParamsLength max length of storable sub parameters
   */
  constructor(maxLength = 32, maxSubParamsLength = 32) {
    this.maxLength = maxLength;
    this.maxSubParamsLength = maxSubParamsLength;
    if (maxSubParamsLength > MAX_SUBPARAMS) {
      throw new Error("maxSubParamsLength must not be greater than 256");
    }
    this.params = new Int32Array(maxLength);
    this.length = 0;
    this._subParams = new Int32Array(maxSubParamsLength);
    this._subParamsLength = 0;
    this._subParamsIdx = new Uint16Array(maxLength);
    this._rejectDigits = false;
    this._rejectSubDigits = false;
    this._digitIsSub = false;
  }
  /**
   * Create a `Params` type from JS array representation.
   */
  static fromArray(values) {
    const params = new Params();
    if (!values.length) {
      return params;
    }
    for (let i = Array.isArray(values[0]) ? 1 : 0; i < values.length; ++i) {
      const value = values[i];
      if (Array.isArray(value)) {
        for (let k = 0; k < value.length; ++k) {
          params.addSubParam(value[k]);
        }
      } else {
        params.addParam(value);
      }
    }
    return params;
  }
  /**
   * Clone object.
   */
  clone() {
    const newParams = new Params(this.maxLength, this.maxSubParamsLength);
    newParams.params.set(this.params);
    newParams.length = this.length;
    newParams._subParams.set(this._subParams);
    newParams._subParamsLength = this._subParamsLength;
    newParams._subParamsIdx.set(this._subParamsIdx);
    newParams._rejectDigits = this._rejectDigits;
    newParams._rejectSubDigits = this._rejectSubDigits;
    newParams._digitIsSub = this._digitIsSub;
    return newParams;
  }
  /**
   * Get a JS array representation of the current parameters and sub parameters.
   * The array is structured as follows:
   *    sequence: "1;2:3:4;5::6"
   *    array   : [1, 2, [3, 4], 5, [-1, 6]]
   */
  toArray() {
    const res = [];
    for (let i = 0; i < this.length; ++i) {
      res.push(this.params[i]);
      const start = this._subParamsIdx[i] >> 8;
      const end = this._subParamsIdx[i] & 255;
      if (end - start > 0) {
        res.push(Array.prototype.slice.call(this._subParams, start, end));
      }
    }
    return res;
  }
  /**
   * Reset to initial empty state.
   */
  reset() {
    this.length = 0;
    this._subParamsLength = 0;
    this._rejectDigits = false;
    this._rejectSubDigits = false;
    this._digitIsSub = false;
  }
  /**
   * Add a parameter value.
   * `Params` only stores up to `maxLength` parameters, any later
   * parameter will be ignored.
   * Note: VT devices only stored up to 16 values, xterm seems to
   * store up to 30.
   */
  addParam(value) {
    this._digitIsSub = false;
    if (this.length >= this.maxLength) {
      this._rejectDigits = true;
      return;
    }
    if (value < -1) {
      throw new Error("values lesser than -1 are not allowed");
    }
    this._subParamsIdx[this.length] = this._subParamsLength << 8 | this._subParamsLength;
    this.params[this.length++] = value > MAX_VALUE ? MAX_VALUE : value;
  }
  /**
   * Add a sub parameter value.
   * The sub parameter is automatically associated with the last parameter value.
   * Thus it is not possible to add a subparameter without any parameter added yet.
   * `Params` only stores up to `subParamsLength` sub parameters, any later
   * sub parameter will be ignored.
   */
  addSubParam(value) {
    this._digitIsSub = true;
    if (!this.length) {
      return;
    }
    if (this._rejectDigits || this._subParamsLength >= this.maxSubParamsLength) {
      this._rejectSubDigits = true;
      return;
    }
    if (value < -1) {
      throw new Error("values lesser than -1 are not allowed");
    }
    this._subParams[this._subParamsLength++] = value > MAX_VALUE ? MAX_VALUE : value;
    this._subParamsIdx[this.length - 1]++;
  }
  /**
   * Whether parameter at index `idx` has sub parameters.
   */
  hasSubParams(idx) {
    return (this._subParamsIdx[idx] & 255) - (this._subParamsIdx[idx] >> 8) > 0;
  }
  /**
   * Return sub parameters for parameter at index `idx`.
   * Note: The values are borrowed, thus you need to copy
   * the values if you need to hold them in nonlocal scope.
   */
  getSubParams(idx) {
    const start = this._subParamsIdx[idx] >> 8;
    const end = this._subParamsIdx[idx] & 255;
    if (end - start > 0) {
      return this._subParams.subarray(start, end);
    }
    return null;
  }
  /**
   * Return all sub parameters as {idx: subparams} mapping.
   * Note: The values are not borrowed.
   */
  getSubParamsAll() {
    const result = {};
    for (let i = 0; i < this.length; ++i) {
      const start = this._subParamsIdx[i] >> 8;
      const end = this._subParamsIdx[i] & 255;
      if (end - start > 0) {
        result[i] = this._subParams.slice(start, end);
      }
    }
    return result;
  }
  /**
   * Add a single digit value to current parameter.
   * This is used by the parser to account digits on a char by char basis.
   */
  addDigit(value) {
    let length;
    if (this._rejectDigits || !(length = this._digitIsSub ? this._subParamsLength : this.length) || this._digitIsSub && this._rejectSubDigits) {
      return;
    }
    const store = this._digitIsSub ? this._subParams : this.params;
    const cur = store[length - 1];
    store[length - 1] = ~cur ? Math.min(cur * 10 + value, MAX_VALUE) : value;
  }
}
//# sourceMappingURL=Params.js.map
