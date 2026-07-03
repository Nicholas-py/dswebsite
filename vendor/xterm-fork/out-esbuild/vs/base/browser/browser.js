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
var browser_exports = {};
__export(browser_exports, {
  addMatchMediaChangeListener: () => addMatchMediaChangeListener,
  getWCOBoundingRect: () => getWCOBoundingRect,
  getZoomFactor: () => getZoomFactor,
  getZoomLevel: () => getZoomLevel,
  isAndroid: () => isAndroid,
  isChrome: () => isChrome,
  isElectron: () => isElectron,
  isFirefox: () => isFirefox,
  isFullscreen: () => isFullscreen,
  isSafari: () => isSafari,
  isStandalone: () => isStandalone,
  isWCOEnabled: () => isWCOEnabled,
  isWebKit: () => isWebKit,
  isWebkitWebView: () => isWebkitWebView,
  onDidChangeFullscreen: () => onDidChangeFullscreen,
  onDidChangeZoomLevel: () => onDidChangeZoomLevel,
  setFullscreen: () => setFullscreen,
  setZoomFactor: () => setZoomFactor,
  setZoomLevel: () => setZoomLevel
});
module.exports = __toCommonJS(browser_exports);
var import_window = require("vs/base/browser/window");
var import_event = require("vs/base/common/event");
class WindowManager {
  constructor() {
    // --- Zoom Level
    this.mapWindowIdToZoomLevel = /* @__PURE__ */ new Map();
    this._onDidChangeZoomLevel = new import_event.Emitter();
    this.onDidChangeZoomLevel = this._onDidChangeZoomLevel.event;
    // --- Zoom Factor
    this.mapWindowIdToZoomFactor = /* @__PURE__ */ new Map();
    // --- Fullscreen
    this._onDidChangeFullscreen = new import_event.Emitter();
    this.onDidChangeFullscreen = this._onDidChangeFullscreen.event;
    this.mapWindowIdToFullScreen = /* @__PURE__ */ new Map();
  }
  static {
    this.INSTANCE = new WindowManager();
  }
  getZoomLevel(targetWindow) {
    return this.mapWindowIdToZoomLevel.get(this.getWindowId(targetWindow)) ?? 0;
  }
  setZoomLevel(zoomLevel, targetWindow) {
    if (this.getZoomLevel(targetWindow) === zoomLevel) {
      return;
    }
    const targetWindowId = this.getWindowId(targetWindow);
    this.mapWindowIdToZoomLevel.set(targetWindowId, zoomLevel);
    this._onDidChangeZoomLevel.fire(targetWindowId);
  }
  getZoomFactor(targetWindow) {
    return this.mapWindowIdToZoomFactor.get(this.getWindowId(targetWindow)) ?? 1;
  }
  setZoomFactor(zoomFactor, targetWindow) {
    this.mapWindowIdToZoomFactor.set(this.getWindowId(targetWindow), zoomFactor);
  }
  setFullscreen(fullscreen, targetWindow) {
    if (this.isFullscreen(targetWindow) === fullscreen) {
      return;
    }
    const windowId = this.getWindowId(targetWindow);
    this.mapWindowIdToFullScreen.set(windowId, fullscreen);
    this._onDidChangeFullscreen.fire(windowId);
  }
  isFullscreen(targetWindow) {
    return !!this.mapWindowIdToFullScreen.get(this.getWindowId(targetWindow));
  }
  getWindowId(targetWindow) {
    return targetWindow.vscodeWindowId;
  }
}
function addMatchMediaChangeListener(targetWindow, query, callback) {
  if (typeof query === "string") {
    query = targetWindow.matchMedia(query);
  }
  query.addEventListener("change", callback);
}
function setZoomLevel(zoomLevel, targetWindow) {
  WindowManager.INSTANCE.setZoomLevel(zoomLevel, targetWindow);
}
function getZoomLevel(targetWindow) {
  return WindowManager.INSTANCE.getZoomLevel(targetWindow);
}
const onDidChangeZoomLevel = WindowManager.INSTANCE.onDidChangeZoomLevel;
function getZoomFactor(targetWindow) {
  return WindowManager.INSTANCE.getZoomFactor(targetWindow);
}
function setZoomFactor(zoomFactor, targetWindow) {
  WindowManager.INSTANCE.setZoomFactor(zoomFactor, targetWindow);
}
function setFullscreen(fullscreen, targetWindow) {
  WindowManager.INSTANCE.setFullscreen(fullscreen, targetWindow);
}
function isFullscreen(targetWindow) {
  return WindowManager.INSTANCE.isFullscreen(targetWindow);
}
const onDidChangeFullscreen = WindowManager.INSTANCE.onDidChangeFullscreen;
const userAgent = typeof navigator === "object" ? navigator.userAgent : "";
const isFirefox = userAgent.indexOf("Firefox") >= 0;
const isWebKit = userAgent.indexOf("AppleWebKit") >= 0;
const isChrome = userAgent.indexOf("Chrome") >= 0;
const isSafari = !isChrome && userAgent.indexOf("Safari") >= 0;
const isWebkitWebView = !isChrome && !isSafari && isWebKit;
const isElectron = userAgent.indexOf("Electron/") >= 0;
const isAndroid = userAgent.indexOf("Android") >= 0;
let standalone = false;
if (typeof import_window.mainWindow.matchMedia === "function") {
  const standaloneMatchMedia = import_window.mainWindow.matchMedia("(display-mode: standalone) or (display-mode: window-controls-overlay)");
  const fullScreenMatchMedia = import_window.mainWindow.matchMedia("(display-mode: fullscreen)");
  standalone = standaloneMatchMedia.matches;
  addMatchMediaChangeListener(import_window.mainWindow, standaloneMatchMedia, ({ matches }) => {
    if (standalone && fullScreenMatchMedia.matches) {
      return;
    }
    standalone = matches;
  });
}
function isStandalone() {
  return standalone;
}
function isWCOEnabled() {
  return navigator?.windowControlsOverlay?.visible;
}
function getWCOBoundingRect() {
  return navigator?.windowControlsOverlay?.getTitlebarAreaRect();
}
//# sourceMappingURL=browser.js.map
