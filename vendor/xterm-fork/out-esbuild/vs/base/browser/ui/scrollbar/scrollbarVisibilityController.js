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
var scrollbarVisibilityController_exports = {};
__export(scrollbarVisibilityController_exports, {
  ScrollbarVisibilityController: () => ScrollbarVisibilityController
});
module.exports = __toCommonJS(scrollbarVisibilityController_exports);
var import_async = require("vs/base/common/async");
var import_lifecycle = require("vs/base/common/lifecycle");
var import_scrollable = require("vs/base/common/scrollable");
class ScrollbarVisibilityController extends import_lifecycle.Disposable {
  constructor(visibility, visibleClassName, invisibleClassName) {
    super();
    this._visibility = visibility;
    this._visibleClassName = visibleClassName;
    this._invisibleClassName = invisibleClassName;
    this._domNode = null;
    this._isVisible = false;
    this._isNeeded = false;
    this._rawShouldBeVisible = false;
    this._shouldBeVisible = false;
    this._revealTimer = this._register(new import_async.TimeoutTimer());
  }
  setVisibility(visibility) {
    if (this._visibility !== visibility) {
      this._visibility = visibility;
      this._updateShouldBeVisible();
    }
  }
  // ----------------- Hide / Reveal
  setShouldBeVisible(rawShouldBeVisible) {
    this._rawShouldBeVisible = rawShouldBeVisible;
    this._updateShouldBeVisible();
  }
  _applyVisibilitySetting() {
    if (this._visibility === import_scrollable.ScrollbarVisibility.Hidden) {
      return false;
    }
    if (this._visibility === import_scrollable.ScrollbarVisibility.Visible) {
      return true;
    }
    return this._rawShouldBeVisible;
  }
  _updateShouldBeVisible() {
    const shouldBeVisible = this._applyVisibilitySetting();
    if (this._shouldBeVisible !== shouldBeVisible) {
      this._shouldBeVisible = shouldBeVisible;
      this.ensureVisibility();
    }
  }
  setIsNeeded(isNeeded) {
    if (this._isNeeded !== isNeeded) {
      this._isNeeded = isNeeded;
      this.ensureVisibility();
    }
  }
  setDomNode(domNode) {
    this._domNode = domNode;
    this._domNode.setClassName(this._invisibleClassName);
    this.setShouldBeVisible(false);
  }
  ensureVisibility() {
    if (!this._isNeeded) {
      this._hide(false);
      return;
    }
    if (this._shouldBeVisible) {
      this._reveal();
    } else {
      this._hide(true);
    }
  }
  _reveal() {
    if (this._isVisible) {
      return;
    }
    this._isVisible = true;
    this._revealTimer.setIfNotSet(() => {
      this._domNode?.setClassName(this._visibleClassName);
    }, 0);
  }
  _hide(withFadeAway) {
    this._revealTimer.cancel();
    if (!this._isVisible) {
      return;
    }
    this._isVisible = false;
    this._domNode?.setClassName(this._invisibleClassName + (withFadeAway ? " fade" : ""));
  }
}
//# sourceMappingURL=scrollbarVisibilityController.js.map
