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
var AttachAddon_exports = {};
__export(AttachAddon_exports, {
  AttachAddon: () => AttachAddon
});
module.exports = __toCommonJS(AttachAddon_exports);
/**
 * Copyright (c) 2014, 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 *
 * Implements the attach method, that attaches the terminal to a WebSocket stream.
 */
class AttachAddon {
  constructor(socket, options) {
    this._disposables = [];
    this._socket = socket;
    this._socket.binaryType = "arraybuffer";
    this._bidirectional = !(options && options.bidirectional === false);
  }
  activate(terminal) {
    this._disposables.push(
      addSocketListener(this._socket, "message", (ev) => {
        const data = ev.data;
        terminal.write(typeof data === "string" ? data : new Uint8Array(data));
      })
    );
    if (this._bidirectional) {
      this._disposables.push(terminal.onData((data) => this._sendData(data)));
      this._disposables.push(terminal.onBinary((data) => this._sendBinary(data)));
    }
    this._disposables.push(addSocketListener(this._socket, "close", () => this.dispose()));
    this._disposables.push(addSocketListener(this._socket, "error", () => this.dispose()));
  }
  dispose() {
    for (const d of this._disposables) {
      d.dispose();
    }
  }
  _sendData(data) {
    if (!this._checkOpenSocket()) {
      return;
    }
    this._socket.send(data);
  }
  _sendBinary(data) {
    if (!this._checkOpenSocket()) {
      return;
    }
    const buffer = new Uint8Array(data.length);
    for (let i = 0; i < data.length; ++i) {
      buffer[i] = data.charCodeAt(i) & 255;
    }
    this._socket.send(buffer);
  }
  _checkOpenSocket() {
    switch (this._socket.readyState) {
      case WebSocket.OPEN:
        return true;
      case WebSocket.CONNECTING:
        throw new Error("Attach addon was loaded before socket was open");
      case WebSocket.CLOSING:
        console.warn("Attach addon socket is closing");
        return false;
      case WebSocket.CLOSED:
        throw new Error("Attach addon socket is closed");
      default:
        throw new Error("Unexpected socket state");
    }
  }
}
function addSocketListener(socket, type, handler) {
  socket.addEventListener(type, handler);
  return {
    dispose: () => {
      if (!handler) {
        return;
      }
      socket.removeEventListener(type, handler);
    }
  };
}
//# sourceMappingURL=AttachAddon.js.map
