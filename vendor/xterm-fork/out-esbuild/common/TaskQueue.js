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
var TaskQueue_exports = {};
__export(TaskQueue_exports, {
  DebouncedIdleTask: () => DebouncedIdleTask,
  IdleTaskQueue: () => IdleTaskQueue,
  PriorityTaskQueue: () => PriorityTaskQueue
});
module.exports = __toCommonJS(TaskQueue_exports);
var import_Platform = require("common/Platform");
/**
 * Copyright (c) 2022 The xterm.js authors. All rights reserved.
 * @license MIT
 */
class TaskQueue {
  constructor() {
    this._tasks = [];
    this._i = 0;
  }
  enqueue(task) {
    this._tasks.push(task);
    this._start();
  }
  flush() {
    while (this._i < this._tasks.length) {
      if (!this._tasks[this._i]()) {
        this._i++;
      }
    }
    this.clear();
  }
  clear() {
    if (this._idleCallback) {
      this._cancelCallback(this._idleCallback);
      this._idleCallback = void 0;
    }
    this._i = 0;
    this._tasks.length = 0;
  }
  _start() {
    if (!this._idleCallback) {
      this._idleCallback = this._requestCallback(this._process.bind(this));
    }
  }
  _process(deadline) {
    this._idleCallback = void 0;
    let taskDuration = 0;
    let longestTask = 0;
    let lastDeadlineRemaining = deadline.timeRemaining();
    let deadlineRemaining = 0;
    while (this._i < this._tasks.length) {
      taskDuration = Date.now();
      if (!this._tasks[this._i]()) {
        this._i++;
      }
      taskDuration = Math.max(1, Date.now() - taskDuration);
      longestTask = Math.max(taskDuration, longestTask);
      deadlineRemaining = deadline.timeRemaining();
      if (longestTask * 1.5 > deadlineRemaining) {
        if (lastDeadlineRemaining - taskDuration < -20) {
          console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(lastDeadlineRemaining - taskDuration))}ms`);
        }
        this._start();
        return;
      }
      lastDeadlineRemaining = deadlineRemaining;
    }
    this.clear();
  }
}
class PriorityTaskQueue extends TaskQueue {
  _requestCallback(callback) {
    return setTimeout(() => callback(this._createDeadline(16)));
  }
  _cancelCallback(identifier) {
    clearTimeout(identifier);
  }
  _createDeadline(duration) {
    const end = Date.now() + duration;
    return {
      timeRemaining: () => Math.max(0, end - Date.now())
    };
  }
}
class IdleTaskQueueInternal extends TaskQueue {
  _requestCallback(callback) {
    return requestIdleCallback(callback);
  }
  _cancelCallback(identifier) {
    cancelIdleCallback(identifier);
  }
}
const IdleTaskQueue = !import_Platform.isNode && "requestIdleCallback" in window ? IdleTaskQueueInternal : PriorityTaskQueue;
class DebouncedIdleTask {
  constructor() {
    this._queue = new IdleTaskQueue();
  }
  set(task) {
    this._queue.clear();
    this._queue.enqueue(task);
  }
  flush() {
    this._queue.flush();
  }
}
//# sourceMappingURL=TaskQueue.js.map
