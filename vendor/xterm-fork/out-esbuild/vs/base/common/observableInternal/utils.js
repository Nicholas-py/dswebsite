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
var utils_exports = {};
__export(utils_exports, {
  FromEventObservable: () => FromEventObservable,
  KeepAliveObserver: () => KeepAliveObserver,
  ValueWithChangeEventFromObservable: () => ValueWithChangeEventFromObservable,
  constObservable: () => constObservable,
  debouncedObservable: () => debouncedObservable,
  debouncedObservable2: () => debouncedObservable2,
  derivedObservableWithCache: () => derivedObservableWithCache,
  derivedObservableWithWritableCache: () => derivedObservableWithWritableCache,
  keepObserved: () => keepObserved,
  latestChangedValue: () => latestChangedValue,
  mapObservableArrayCached: () => mapObservableArrayCached,
  observableFromEvent: () => observableFromEvent,
  observableFromEventOpts: () => observableFromEventOpts,
  observableFromPromise: () => observableFromPromise,
  observableFromValueWithChangeEvent: () => observableFromValueWithChangeEvent,
  observableSignal: () => observableSignal,
  observableSignalFromEvent: () => observableSignalFromEvent,
  recomputeInitiallyAndOnChange: () => recomputeInitiallyAndOnChange,
  wasEventTriggeredRecently: () => wasEventTriggeredRecently
});
module.exports = __toCommonJS(utils_exports);
var import_event = require("vs/base/common/event");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_autorun = require("vs/base/common/observableInternal/autorun");
var import_base = require("vs/base/common/observableInternal/base");
var import_debugName = require("vs/base/common/observableInternal/debugName");
var import_derived = require("vs/base/common/observableInternal/derived");
var import_logging = require("vs/base/common/observableInternal/logging");
var import_errors = require("vs/base/common/errors");
var import_equals = require("vs/base/common/equals");
function constObservable(value) {
  return new ConstObservable(value);
}
class ConstObservable extends import_base.ConvenientObservable {
  constructor(value) {
    super();
    this.value = value;
  }
  get debugName() {
    return this.toString();
  }
  get() {
    return this.value;
  }
  addObserver(observer) {
  }
  removeObserver(observer) {
  }
  toString() {
    return `Const: ${this.value}`;
  }
}
function observableFromPromise(promise) {
  const observable = (0, import_base.observableValue)("promiseValue", {});
  promise.then((value) => {
    observable.set({ value }, void 0);
  });
  return observable;
}
function observableFromEvent(...args) {
  let owner;
  let event;
  let getValue;
  if (args.length === 3) {
    [owner, event, getValue] = args;
  } else {
    [event, getValue] = args;
  }
  return new FromEventObservable(
    new import_debugName.DebugNameData(owner, void 0, getValue),
    event,
    getValue,
    () => FromEventObservable.globalTransaction,
    import_equals.strictEquals
  );
}
function observableFromEventOpts(options, event, getValue) {
  return new FromEventObservable(
    new import_debugName.DebugNameData(options.owner, options.debugName, options.debugReferenceFn ?? getValue),
    event,
    getValue,
    () => FromEventObservable.globalTransaction,
    options.equalsFn ?? import_equals.strictEquals
  );
}
class FromEventObservable extends import_base.BaseObservable {
  constructor(_debugNameData, event, _getValue, _getTransaction, _equalityComparator) {
    super();
    this._debugNameData = _debugNameData;
    this.event = event;
    this._getValue = _getValue;
    this._getTransaction = _getTransaction;
    this._equalityComparator = _equalityComparator;
    this.hasValue = false;
    this.handleEvent = (args) => {
      const newValue = this._getValue(args);
      const oldValue = this.value;
      const didChange = !this.hasValue || !this._equalityComparator(oldValue, newValue);
      let didRunTransaction = false;
      if (didChange) {
        this.value = newValue;
        if (this.hasValue) {
          didRunTransaction = true;
          (0, import_base.subtransaction)(
            this._getTransaction(),
            (tx) => {
              (0, import_logging.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue, newValue, change: void 0, didChange, hadValue: this.hasValue });
              for (const o of this.observers) {
                tx.updateObserver(o, this);
                o.handleChange(this, void 0);
              }
            },
            () => {
              const name = this.getDebugName();
              return "Event fired" + (name ? `: ${name}` : "");
            }
          );
        }
        this.hasValue = true;
      }
      if (!didRunTransaction) {
        (0, import_logging.getLogger)()?.handleFromEventObservableTriggered(this, { oldValue, newValue, change: void 0, didChange, hadValue: this.hasValue });
      }
    };
  }
  getDebugName() {
    return this._debugNameData.getDebugName(this);
  }
  get debugName() {
    const name = this.getDebugName();
    return "From Event" + (name ? `: ${name}` : "");
  }
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
    this.hasValue = false;
    this.value = void 0;
  }
  get() {
    if (this.subscription) {
      if (!this.hasValue) {
        this.handleEvent(void 0);
      }
      return this.value;
    } else {
      const value = this._getValue(void 0);
      return value;
    }
  }
}
((observableFromEvent2) => {
  observableFromEvent2.Observer = FromEventObservable;
  function batchEventsGlobally(tx, fn) {
    let didSet = false;
    if (FromEventObservable.globalTransaction === void 0) {
      FromEventObservable.globalTransaction = tx;
      didSet = true;
    }
    try {
      fn();
    } finally {
      if (didSet) {
        FromEventObservable.globalTransaction = void 0;
      }
    }
  }
  observableFromEvent2.batchEventsGlobally = batchEventsGlobally;
})(observableFromEvent || (observableFromEvent = {}));
function observableSignalFromEvent(debugName, event) {
  return new FromEventObservableSignal(debugName, event);
}
class FromEventObservableSignal extends import_base.BaseObservable {
  constructor(debugName, event) {
    super();
    this.debugName = debugName;
    this.event = event;
    this.handleEvent = () => {
      (0, import_base.transaction)(
        (tx) => {
          for (const o of this.observers) {
            tx.updateObserver(o, this);
            o.handleChange(this, void 0);
          }
        },
        () => this.debugName
      );
    };
  }
  onFirstObserverAdded() {
    this.subscription = this.event(this.handleEvent);
  }
  onLastObserverRemoved() {
    this.subscription.dispose();
    this.subscription = void 0;
  }
  get() {
  }
}
function observableSignal(debugNameOrOwner) {
  if (typeof debugNameOrOwner === "string") {
    return new ObservableSignal(debugNameOrOwner);
  } else {
    return new ObservableSignal(void 0, debugNameOrOwner);
  }
}
class ObservableSignal extends import_base.BaseObservable {
  constructor(_debugName, _owner) {
    super();
    this._debugName = _debugName;
    this._owner = _owner;
  }
  get debugName() {
    return new import_debugName.DebugNameData(this._owner, this._debugName, void 0).getDebugName(this) ?? "Observable Signal";
  }
  toString() {
    return this.debugName;
  }
  trigger(tx, change) {
    if (!tx) {
      (0, import_base.transaction)((tx2) => {
        this.trigger(tx2, change);
      }, () => `Trigger signal ${this.debugName}`);
      return;
    }
    for (const o of this.observers) {
      tx.updateObserver(o, this);
      o.handleChange(this, change);
    }
  }
  get() {
  }
}
function debouncedObservable(observable, debounceMs, disposableStore) {
  const debouncedObservable3 = (0, import_base.observableValue)("debounced", void 0);
  let timeout = void 0;
  disposableStore.add((0, import_autorun.autorun)((reader) => {
    const value = observable.read(reader);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      (0, import_base.transaction)((tx) => {
        debouncedObservable3.set(value, tx);
      });
    }, debounceMs);
  }));
  return debouncedObservable3;
}
function debouncedObservable2(observable, debounceMs) {
  let hasValue = false;
  let lastValue;
  let timeout = void 0;
  return observableFromEvent((cb) => {
    const d = (0, import_autorun.autorun)((reader) => {
      const value = observable.read(reader);
      if (!hasValue) {
        hasValue = true;
        lastValue = value;
      } else {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
          lastValue = value;
          cb();
        }, debounceMs);
      }
    });
    return {
      dispose() {
        d.dispose();
        hasValue = false;
        lastValue = void 0;
      }
    };
  }, () => {
    if (hasValue) {
      return lastValue;
    } else {
      return observable.get();
    }
  });
}
function wasEventTriggeredRecently(event, timeoutMs, disposableStore) {
  const observable = (0, import_base.observableValue)("triggeredRecently", false);
  let timeout = void 0;
  disposableStore.add(event(() => {
    observable.set(true, void 0);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      observable.set(false, void 0);
    }, timeoutMs);
  }));
  return observable;
}
function keepObserved(observable) {
  const o = new KeepAliveObserver(false, void 0);
  observable.addObserver(o);
  return (0, import_lifecycle.toDisposable)(() => {
    observable.removeObserver(o);
  });
}
(0, import_base._setKeepObserved)(keepObserved);
function recomputeInitiallyAndOnChange(observable, handleValue) {
  const o = new KeepAliveObserver(true, handleValue);
  observable.addObserver(o);
  if (handleValue) {
    handleValue(observable.get());
  } else {
    observable.reportChanges();
  }
  return (0, import_lifecycle.toDisposable)(() => {
    observable.removeObserver(o);
  });
}
(0, import_base._setRecomputeInitiallyAndOnChange)(recomputeInitiallyAndOnChange);
class KeepAliveObserver {
  constructor(_forceRecompute, _handleValue) {
    this._forceRecompute = _forceRecompute;
    this._handleValue = _handleValue;
    this._counter = 0;
  }
  beginUpdate(observable) {
    this._counter++;
  }
  endUpdate(observable) {
    this._counter--;
    if (this._counter === 0 && this._forceRecompute) {
      if (this._handleValue) {
        this._handleValue(observable.get());
      } else {
        observable.reportChanges();
      }
    }
  }
  handlePossibleChange(observable) {
  }
  handleChange(observable, change) {
  }
}
function derivedObservableWithCache(owner, computeFn) {
  let lastValue = void 0;
  const observable = (0, import_derived.derivedOpts)({ owner, debugReferenceFn: computeFn }, (reader) => {
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return observable;
}
function derivedObservableWithWritableCache(owner, computeFn) {
  let lastValue = void 0;
  const onChange = observableSignal("derivedObservableWithWritableCache");
  const observable = (0, import_derived.derived)(owner, (reader) => {
    onChange.read(reader);
    lastValue = computeFn(reader, lastValue);
    return lastValue;
  });
  return Object.assign(observable, {
    clearCache: (tx) => {
      lastValue = void 0;
      onChange.trigger(tx);
    },
    setCache: (newValue, tx) => {
      lastValue = newValue;
      onChange.trigger(tx);
    }
  });
}
function mapObservableArrayCached(owner, items, map, keySelector) {
  let m = new ArrayMap(map, keySelector);
  const self = (0, import_derived.derivedOpts)({
    debugReferenceFn: map,
    owner,
    onLastObserverRemoved: () => {
      m.dispose();
      m = new ArrayMap(map);
    }
  }, (reader) => {
    m.setItems(items.read(reader));
    return m.getItems();
  });
  return self;
}
class ArrayMap {
  constructor(_map, _keySelector) {
    this._map = _map;
    this._keySelector = _keySelector;
    this._cache = /* @__PURE__ */ new Map();
    this._items = [];
  }
  dispose() {
    this._cache.forEach((entry) => entry.store.dispose());
    this._cache.clear();
  }
  setItems(items) {
    const newItems = [];
    const itemsToRemove = new Set(this._cache.keys());
    for (const item of items) {
      const key = this._keySelector ? this._keySelector(item) : item;
      let entry = this._cache.get(key);
      if (!entry) {
        const store = new import_lifecycle.DisposableStore();
        const out = this._map(item, store);
        entry = { out, store };
        this._cache.set(key, entry);
      } else {
        itemsToRemove.delete(key);
      }
      newItems.push(entry.out);
    }
    for (const item of itemsToRemove) {
      const entry = this._cache.get(item);
      entry.store.dispose();
      this._cache.delete(item);
    }
    this._items = newItems;
  }
  getItems() {
    return this._items;
  }
}
class ValueWithChangeEventFromObservable {
  constructor(observable) {
    this.observable = observable;
  }
  get onDidChange() {
    return import_event.Event.fromObservableLight(this.observable);
  }
  get value() {
    return this.observable.get();
  }
}
function observableFromValueWithChangeEvent(owner, value) {
  if (value instanceof ValueWithChangeEventFromObservable) {
    return value.observable;
  }
  return observableFromEvent(owner, value.onDidChange, () => value.value);
}
function latestChangedValue(owner, observables) {
  if (observables.length === 0) {
    throw new import_errors.BugIndicatingError();
  }
  let hasLastChangedValue = false;
  let lastChangedValue = void 0;
  const result = observableFromEvent(owner, (cb) => {
    const store = new import_lifecycle.DisposableStore();
    for (const o of observables) {
      store.add((0, import_autorun.autorunOpts)({ debugName: () => (0, import_debugName.getDebugName)(result, new import_debugName.DebugNameData(owner, void 0, void 0)) + ".updateLastChangedValue" }, (reader) => {
        hasLastChangedValue = true;
        lastChangedValue = o.read(reader);
        cb();
      }));
    }
    store.add({
      dispose() {
        hasLastChangedValue = false;
        lastChangedValue = void 0;
      }
    });
    return store;
  }, () => {
    if (hasLastChangedValue) {
      return lastChangedValue;
    } else {
      return observables[observables.length - 1].get();
    }
  });
  return result;
}
//# sourceMappingURL=utils.js.map
