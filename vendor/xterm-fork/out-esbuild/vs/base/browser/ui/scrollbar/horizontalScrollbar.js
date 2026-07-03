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
var horizontalScrollbar_exports = {};
__export(horizontalScrollbar_exports, {
  HorizontalScrollbar: () => HorizontalScrollbar
});
module.exports = __toCommonJS(horizontalScrollbar_exports);
var import_abstractScrollbar = require("vs/base/browser/ui/scrollbar/abstractScrollbar");
var import_scrollbarState = require("vs/base/browser/ui/scrollbar/scrollbarState");
var import_scrollable = require("vs/base/common/scrollable");
class HorizontalScrollbar extends import_abstractScrollbar.AbstractScrollbar {
  constructor(scrollable, options, host) {
    const scrollDimensions = scrollable.getScrollDimensions();
    const scrollPosition = scrollable.getCurrentScrollPosition();
    super({
      lazyRender: options.lazyRender,
      host,
      scrollbarState: new import_scrollbarState.ScrollbarState(
        options.horizontalHasArrows ? options.arrowSize : 0,
        options.horizontal === import_scrollable.ScrollbarVisibility.Hidden ? 0 : options.horizontalScrollbarSize,
        options.vertical === import_scrollable.ScrollbarVisibility.Hidden ? 0 : options.verticalScrollbarSize,
        scrollDimensions.width,
        scrollDimensions.scrollWidth,
        scrollPosition.scrollLeft
      ),
      visibility: options.horizontal,
      extraScrollbarClassName: "horizontal",
      scrollable,
      scrollByPage: options.scrollByPage
    });
    if (options.horizontalHasArrows) {
      throw new Error("horizontalHasArrows is not supported in xterm.js");
    }
    this._createSlider(Math.floor((options.horizontalScrollbarSize - options.horizontalSliderSize) / 2), 0, void 0, options.horizontalSliderSize);
  }
  _updateSlider(sliderSize, sliderPosition) {
    this.slider.setWidth(sliderSize);
    this.slider.setLeft(sliderPosition);
  }
  _renderDomNode(largeSize, smallSize) {
    this.domNode.setWidth(largeSize);
    this.domNode.setHeight(smallSize);
    this.domNode.setLeft(0);
    this.domNode.setBottom(0);
  }
  onDidScroll(e) {
    this._shouldRender = this._onElementScrollSize(e.scrollWidth) || this._shouldRender;
    this._shouldRender = this._onElementScrollPosition(e.scrollLeft) || this._shouldRender;
    this._shouldRender = this._onElementSize(e.width) || this._shouldRender;
    return this._shouldRender;
  }
  _pointerDownRelativePosition(offsetX, offsetY) {
    return offsetX;
  }
  _sliderPointerPosition(e) {
    return e.pageX;
  }
  _sliderOrthogonalPointerPosition(e) {
    return e.pageY;
  }
  _updateScrollbarSize(size) {
    this.slider.setHeight(size);
  }
  writeScrollPosition(target, scrollPosition) {
    target.scrollLeft = scrollPosition;
  }
  updateOptions(options) {
    this.updateScrollbarSize(options.horizontal === import_scrollable.ScrollbarVisibility.Hidden ? 0 : options.horizontalScrollbarSize);
    this._scrollbarState.setOppositeScrollbarSize(options.vertical === import_scrollable.ScrollbarVisibility.Hidden ? 0 : options.verticalScrollbarSize);
    this._visibilityController.setVisibility(options.horizontal);
    this._scrollByPage = options.scrollByPage;
  }
}
//# sourceMappingURL=horizontalScrollbar.js.map
