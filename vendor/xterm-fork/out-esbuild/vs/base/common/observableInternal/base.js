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
var base_exports = {};
__export(base_exports, {
  BaseObservable: () => BaseObservable,
  ConvenientObservable: () => ConvenientObservable,
  DisposableObservableValue: () => DisposableObservableValue,
  ObservableValue: () => ObservableValue,
  TransactionImpl: () => TransactionImpl,
  _setDerivedOpts: () => _setDerivedOpts,
  _setKeepObserved: () => _setKeepObserved,
  _setRecomputeInitiallyAndOnChange: () => _setRecomputeInitiallyAndOnChange,
  asyncTransaction: () => asyncTransaction,
  disposableObservableValue: () => disposableObservableValue,
  globalTransaction: () => globalTransaction,
  observableValue: () => observableValue,
  subtransaction: () => subtransaction,
  transaction: () => transaction
});
module.exports = __toCommonJS(base_exports);
var import_equals = require("vs/base/common/equals");
var import_debugName = require("vs/base/common/observableInternal/debugName");
var import_logging = require("vs/base/common/observableInternal/logging");
let _recomputeInitiallyAndOnChange;
function _setRecomputeInitiallyAndOnChange(recomputeInitiallyAndOnChange2) {
  _recomputeInitiallyAndOnChange = recomputeInitiallyAndOnChange2;
}
let _keepObserved;
function _setKeepObserved(keepObserved2) {
  _keepObserved = keepObserved2;
}
let _derived;
function _setDerivedOpts(derived) {
  _derived = derived;
}
class ConvenientObservable {
  get TChange() {
    return null;
  }
  reportChanges() {
    this.get();
  }
  /** @sealed */
  read(reader) {
    if (reader) {
      return reader.readObservable(this);
    } else {
      return this.get();
    }
  }
  map(fnOrOwner, fnOrUndefined) {
    const owner = fnOrUndefined === void 0 ? void 0 : fnOrOwner;
    const fn = fnOrUndefined === void 0 ? fnOrOwner : fnOrUndefined;
    return _derived(
      {
        owner,
        debugName: () => {
          const name = (0, import_debugName.getFunctionName)(fn);
          if (name !== void 0) {
            return name;
          }
          const regexp = /^\s*\(?\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*\)?\s*=>\s*\1(?:\??)\.([a-zA-Z_$][a-zA-Z_$0-9]*)\s*$/;
          const match = regexp.exec(fn.toString());
          if (match) {
            return `${this.debugName}.${match[2]}`;
          }
          if (!owner) {
            return `${this.debugName} (mapped)`;
          }
          return void 0;
        },
        debugReferenceFn: fn
      },
      (reader) => fn(this.read(reader), reader)
    );
  }
  recomputeInitiallyAndOnChange(store, handleValue) {
    store.add(_recomputeInitiallyAndOnChange(this, handleValue));
    return this;
  }
  /**
   * Ensures that this observable is observed. This keeps the cache alive.
   * However, in case of deriveds, it does not force eager evaluation (only when the value is read/get).
   * Use `recomputeInitiallyAndOnChange` for eager evaluation.
   */
  keepObserved(store) {
    store.add(_keepObserved(this));
    return this;
  }
  get debugValue() {
    return this.get();
  }
}
class BaseObservable extends ConvenientObservable {
  constructor() {
    super(...arguments);
    this.observers = /* @__PURE__ */ new Set();
  }
  addObserver(observer) {
    const len = this.observers.size;
    this.observers.add(observer);
    if (len === 0) {
      this.onFirstObserverAdded();
    }
  }
  removeObserver(observer) {
    const deleted = this.observers.delete(observer);
    if (deleted && this.observers.size === 0) {
      this.onLastObserverRemoved();
    }
  }
  onFirstObserverAdded() {
  }
  onLastObserverRemoved() {
  }
}
function transaction(fn, getDebugName) {
  const tx = new TransactionImpl(fn, getDebugName);
  try {
    fn(tx);
  } finally {
    tx.finish();
  }
}
let _globalTransaction = void 0;
function globalTransaction(fn) {
  if (_globalTransaction) {
    fn(_globalTransaction);
  } else {
    const tx = new TransactionImpl(fn, void 0);
    _globalTransaction = tx;
    try {
      fn(tx);
    } finally {
      tx.finish();
      _globalTransaction = void 0;
    }
  }
}
async function asyncTransaction(fn, getDebugName) {
  const tx = new TransactionImpl(fn, getDebugName);
  try {
    await fn(tx);
  } finally {
    tx.finish();
  }
}
function subtransaction(tx, fn, getDebugName) {
  if (!tx) {
    transaction(fn, getDebugName);
  } else {
    fn(tx);
  }
}
class TransactionImpl {
  constructor(_fn, _getDebugName) {
    this._fn = _fn;
    this._getDebugName = _getDebugName;
    this.updatingObservers = [];
    (0, import_logging.getLogger)()?.handleBeginTransaction(this);
  }
  getDebugName() {
    if (this._getDebugName) {
      return this._getDebugName();
    }
    return (0, import_debugName.getFunctionName)(this._fn);
  }
  updateObserver(observer, observable) {
    this.updatingObservers.push({ observer, observable });
    observer.beginUpdate(observable);
  }
  finish() {
    const updatingObservers = this.updatingObservers;
    for (let i = 0; i < updatingObservers.length; i++) {
      const { observer, observable } = updatingObservers[i];
      observer.endUpdate(observable);
    }
    this.updatingObservers = null;
    (0, import_logging.getLogger)()?.handleEndTransaction();
  }
}
function observableValue(nameOrOwner, initialValue) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new import_debugName.DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new import_debugName.DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new ObservableValue(debugNameData, initialValue, import_equals.strictEquals);
}
class ObservableValue extends BaseObservable {
  constructor(_debugNameData, initialValue, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this._equalityComparator = _equalityComparator;
    this._value = initialValue;
  }
  get debugName() {
    return this._debugNameData.getDebugName(this) ?? "ObservableValue";
  }
  get() {
    return this._value;
  }
  set(value, tx, change) {
    if (change === void 0 && this._equalityComparator(this._value, value)) {
      return;
    }
    let _tx;
    if (!tx) {
      tx = _tx = new TransactionImpl(() => {
      }, () => `Setting ${this.debugName}`);
    }
    try {
      const oldValue = this._value;
      this._setValue(value);
      (0, import_logging.getLogger)()?.handleObservableChanged(this, { oldValue, newValue: value, change, didChange: true, hadValue: true });
      for (const observer of this.observers) {
        tx.updateObserver(observer, this);
        observer.handleChange(this, change);
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
function disposableObservableValue(nameOrOwner, initialValue) {
  let debugNameData;
  if (typeof nameOrOwner === "string") {
    debugNameData = new import_debugName.DebugNameData(void 0, nameOrOwner, void 0);
  } else {
    debugNameData = new import_debugName.DebugNameData(nameOrOwner, void 0, void 0);
  }
  return new DisposableObservableValue(debugNameData, initialValue, import_equals.strictEquals);
}
class DisposableObservableValue extends ObservableValue {
  _setValue(newValue) {
    if (this._value === newValue) {
      return;
    }
    if (this._value) {
      this._value.dispose();
    }
    this._value = newValue;
  }
  dispose() {
    this._value?.dispose();
  }
}
//# sourceMappingURL=base.js.map
