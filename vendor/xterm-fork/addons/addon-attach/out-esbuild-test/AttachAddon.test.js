"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var import_test = __toESM(require("@playwright/test"));
var import_TestUtils = require("../../../test/playwright/TestUtils");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
const WebSocket = require("ws");
let ctx;
import_test.default.beforeAll(async ({ browser }) => {
  ctx = await (0, import_TestUtils.createTestContext)(browser);
  await (0, import_TestUtils.openTerminal)(ctx);
});
import_test.default.afterAll(async () => await ctx.page.close());
import_test.default.describe("Search Tests", () => {
  import_test.default.beforeEach(async () => {
    await ctx.proxy.reset();
  });
  (0, import_test.default)("string", async function() {
    const port = 8080;
    const server = new WebSocket.Server({ port });
    server.on("connection", (socket) => socket.send("foo"));
    await ctx.page.evaluate(`window.term.loadAddon(new window.AttachAddon(new WebSocket('ws://localhost:${port}')))`);
    await (0, import_TestUtils.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, "foo");
    server.close();
  });
  (0, import_test.default)("utf8", async function() {
    const port = 8080;
    const server = new WebSocket.Server({ port });
    const data = new Uint8Array([102, 111, 111]);
    server.on("connection", (socket) => socket.send(data));
    await ctx.page.evaluate(`window.term.loadAddon(new window.AttachAddon(new WebSocket('ws://localhost:${port}')))`);
    await (0, import_TestUtils.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, "foo");
    server.close();
  });
});
//# sourceMappingURL=AttachAddon.test.js.map
