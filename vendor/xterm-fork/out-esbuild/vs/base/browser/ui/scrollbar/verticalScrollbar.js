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
var verticalScrollbar_exports = {};
__export(verticalScrollbar_exports, {
  VerticalScrollbar: () => VerticalScrollbar
});
module.exports = __toCommonJS(verticalScrollbar_exports);
var import_abstractScrollbar = require("vs/base/browser/ui/scrollbar/abstractScrollbar");
var import_scrollbarState = require("vs/base/browser/ui/scrollbar/scrollbarState");
var import_scrollable = require("vs/base/common/scrollable");
class VerticalScrollbar extends import_abstractScrollbar.AbstractScrollbar {
  constructor(scrollable, options, host) {
    const scrollDimensions = scrollable.getScrollDimensions();
    const scrollPosition = scrollable.getCurrentScrollPosition();
    super({
      lazyRender: options.lazyRender,
      host,
      scrollbarState: new import_scrollbarState.ScrollbarState(
        options.verticalHasArrows ? options.arrowSize : 0,
        options.vertical === import_scrollable.ScrollbarVisibility.Hidden ? 0 : options.verticalScrollbarSize,
        // give priority to vertical scroll bar over horizontal and let it scroll all the way to the bottom
        0,
        scrollDimensions.height,
        scrollDimensions.scrollHeight,
        scrollPosition.scrollTop
      ),
      visibility: options.vertical,
      extraScrollbarClassName: "vertical",
      scrollable,
      scrollByPage: options.scrollByPage
    });
    if (options.verticalHasArrows) {
      throw new Error("horizontalHasArrows is not supported in xterm.js");
    }
    this._createSlider(0, Math.floor((options.verticalScrollbarSize - options.verticalSliderSize) / 2), options.verticalSliderSize, void 0);
  }
  _updateSlider(sliderSize, sliderPosition) {
    this.slider.setHeight(sliderSize);
    this.slider.setTop(sliderPosition);
  }
  _renderDomNode(largeSize, smallSize) {
    this.domNode.setWidth(smallSize);
    this.domNode.setHeight(largeSize);
    this.domNode.setRight(0);
    this.domNode.setTop(0);
  }
  onDidScroll(e) {
    this._shouldRender = this._onElementScrollSize(e.scrollHeight) || this._shouldRender;
    this._shouldRender = this._onElementScrollPosition(e.scrollTop) || this._shouldRender;
    this._shouldRender = this._onElementSize(e.height) || this._shouldRender;
    return this._shouldRender;
  }
  _pointerDownRelativePosition(offsetX, offsetY) {
    return offsetY;
  }
  _sliderPointerPosition(e) {
    return e.pageY;
  }
  _sliderOrthogonalPointerPosition(e) {
    return e.pageX;
  }
  _updateScrollbarSize(size) {
    this.slider.setWidth(size);
  }
  writeScrollPosition(target, scrollPosition) {
    target.scrollTop = scrollPosition;
  }
  updateOptions(options) {
    this.updateScrollbarSize(options.vertical === import_scrollable.ScrollbarVisibility.Hidden ? 0 : options.verticalScrollbarSize);
    this._scrollbarState.setOppositeScrollbarSize(0);
    this._visibilityController.setVisibility(options.vertical);
    this._scrollByPage = options.scrollByPage;
  }
}
//# sourceMappingURL=verticalScrollbar.js.map
