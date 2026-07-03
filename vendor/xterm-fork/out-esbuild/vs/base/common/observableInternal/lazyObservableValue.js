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
var lazyObservableValue_exports = {};
__export(lazyObservableValue_exports, {
  LazyObservableValue: () => LazyObservableValue
});
module.exports = __toCommonJS(lazyObservableValue_exports);
var import_base = require("vs/base/common/observableInternal/base");
class LazyObservableValue extends import_base.BaseObservable {
  constructor(_debugNameData, initialValue, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._equalityComparator = _equalityComparator;
    this._isUpToDate = true;
    this._deltas = [];
    this._updateCounter = 0;
    this._value = initialValue;
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "LazyObservableValue";
  }
  get() {
    this._update();
    return this._value;
  }
  _update() {
    if (this._isUpToDate) {
      return;
    }
    this._isUpToDate = true;
    if (this._deltas.length > 0) {
      for (const observer of this.observers) {
        for (const change of this._deltas) {
          observer.handleChange(this, change);
        }
      }
      this._deltas.length = 0;
    } else {
      for (const observer of this.observers) {
        observer.handleChange(this, void 0);
      }
    }
  }
  _beginUpdate() {
    this._updateCounter++;
    if (this._updateCounter === 1) {
      for (const observer of this.observers) {
        observer.beginUpdate(this);
      }
    }
  }
  _endUpdate() {
    this._updateCounter--;
    if (this._updateCounter === 0) {
      this._update();
      const observers = [...this.observers];
      for (const r of observers) {
        r.endUpdate(this);
      }
    }
  }
  addObserver(observer) {
    const shouldCallBeginUpdate = !this.observers.has(observer) && this._updateCounter > 0;
    super.addObserver(observer);
    if (shouldCallBeginUpdate) {
      observer.beginUpdate(this);
    }
  }
  removeObserver(observer) {
    const shouldCallEndUpdate = this.observers.has(observer) && this._updateCounter > 0;
    super.removeObserver(observer);
    if (shouldCallEndUpdate) {
      observer.endUpdate(this);
    }
  }
  set(value, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new import_base.TransactionImpl(() => {
      }, () => `Setting ${this.debugName}`);
    }
    try {
      this._isUpToDate = false;
      this._setValue(value);
      if (change !== void 0) {
        this._deltas.push(change);
      }
      tx.updateObserver({
        beginUpdate: () => this._beginUpdate(),
        endUpdate: () => this._endUpdate(),
        handleChange: (observable, change2) => {
        },
        handlePossibleChange: (observable) => {
        }
      }, this);
      if (this._updateCounter > 1) {
        for (const observer of this.observers) {
          observer.handlePossibleChange(this);
        }
      }
    } finally {
      if (_tx) {
        _tx.finish();
      }
    }
  }
  toString() {
    return `${this.debugName}: ${this._value}`;
  }
  _setValue(newValue) {
    this._value = newValue;
  }
}
//# sourceMappingURL=lazyObservableValue.js.map
