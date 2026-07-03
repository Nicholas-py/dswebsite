"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var abstractScrollbar_exports = {};
__export(abstractScrollbar_exports, {
  AbstractScrollbar: () => AbstractScrollbar
});
module.exports = __toCommonJS(abstractScrollbar_exports);
var dom = __toESM(require("vs/base/browser/dom"));
var import_fastDomNode = require("vs/base/browser/fastDomNode");
var import_globalPointerMoveMonitor = require("vs/base/browser/globalPointerMoveMonitor");
var import_scrollbarArrow = require("vs/base/browser/ui/scrollbar/scrollbarArrow");
var import_scrollbarVisibilityController = require("vs/base/browser/ui/scrollbar/scrollbarVisibilityController");
var import_widget = require("vs/base/browser/ui/widget");
var platform = __toESM(require("vs/base/common/platform"));
const POINTER_DRAG_RESET_DISTANCE = 140;
class AbstractScrollbar extends import_widget.Widget {
  constructor(opts) {
    super();
    this._lazyRender = opts.lazyRender;
    this._host = opts.host;
    this._scrollable = opts.scrollable;
    this._scrollByPage = opts.scrollByPage;
    this._scrollbarState = opts.scrollbarState;
    this._visibilityController = this._register(new import_scrollbarVisibilityController.ScrollbarVisibilityController(opts.visibility, "visible scrollbar " + opts.extraScrollbarClassName, "invisible scrollbar " + opts.extraScrollbarClassName));
    this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
    this._pointerMoveMonitor = this._register(new import_globalPointerMoveMonitor.GlobalPointerMoveMonitor());
    this._shouldRender = true;
    this.domNode = (0, import_fastDomNode.createFastDomNode)(document.createElement("div"));
    this.domNode.setAttribute("role", "presentation");
    this.domNode.setAttribute("aria-hidden", "true");
    this._visibilityController.setDomNode(this.domNode);
    this.domNode.setPosition("absolute");
    this._register(dom.addDisposableListener(this.domNode.domNode, dom.EventType.POINTER_DOWN, (e) => this._domNodePointerDown(e)));
  }
  // ----------------- creation
  /**
   * Creates the dom node for an arrow & adds it to the container
   */
  _createArrow(opts) {
    const arrow = this._register(new import_scrollbarArrow.ScrollbarArrow(opts));
    this.domNode.domNode.appendChild(arrow.bgDomNode);
    this.domNode.domNode.appendChild(arrow.domNode);
  }
  /**
   * Creates the slider dom node, adds it to the container & hooks up the events
   */
  _createSlider(top, left, width, height) {
    this.slider = (0, import_fastDomNode.createFastDomNode)(document.createElement("div"));
    this.slider.setClassName("slider");
    this.slider.setPosition("absolute");
    this.slider.setTop(top);
    this.slider.setLeft(left);
    if (typeof width === "number") {
      this.slider.setWidth(width);
    }
    if (typeof height === "number") {
      this.slider.setHeight(height);
    }
    this.slider.setLayerHinting(true);
    this.slider.setContain("strict");
    this.domNode.domNode.appendChild(this.slider.domNode);
    this._register(dom.addDisposableListener(
      this.slider.domNode,
      dom.EventType.POINTER_DOWN,
      (e) => {
        if (e.button === 0) {
          e.preventDefault();
          this._sliderPointerDown(e);
        }
      }
    ));
    this.onclick(this.slider.domNode, (e) => {
      if (e.leftButton) {
        e.stopPropagation();
      }
    });
  }
  // ----------------- Update state
  _onElementSize(visibleSize) {
    if (this._scrollbarState.setVisibleSize(visibleSize)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }
  _onElementScrollSize(elementScrollSize) {
    if (this._scrollbarState.setScrollSize(elementScrollSize)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }
  _onElementScrollPosition(elementScrollPosition) {
    if (this._scrollbarState.setScrollPosition(elementScrollPosition)) {
      this._visibilityController.setIsNeeded(this._scrollbarState.isNeeded());
      this._shouldRender = true;
      if (!this._lazyRender) {
        this.render();
      }
    }
    return this._shouldRender;
  }
  // ----------------- rendering
  beginReveal() {
    this._visibilityController.setShouldBeVisible(true);
  }
  beginHide() {
    this._visibilityController.setShouldBeVisible(false);
  }
  render() {
    if (!this._shouldRender) {
      return;
    }
    this._shouldRender = false;
    this._renderDomNode(this._scrollbarState.getRectangleLargeSize(), this._scrollbarState.getRectangleSmallSize());
    this._updateSlider(this._scrollbarState.getSliderSize(), this._scrollbarState.getArrowSize() + this._scrollbarState.getSliderPosition());
  }
  // ----------------- DOM events
  _domNodePointerDown(e) {
    if (e.target !== this.domNode.domNode) {
      return;
    }
    this._onPointerDown(e);
  }
  delegatePointerDown(e) {
    const domTop = this.domNode.domNode.getClientRects()[0].top;
    const sliderStart = domTop + this._scrollbarState.getSliderPosition();
    const sliderStop = domTop + this._scrollbarState.getSliderPosition() + this._scrollbarState.getSliderSize();
    const pointerPos = this._sliderPointerPosition(e);
    if (sliderStart <= pointerPos && pointerPos <= sliderStop) {
      if (e.button === 0) {
        e.preventDefault();
        this._sliderPointerDown(e);
      }
    } else {
      this._onPointerDown(e);
    }
  }
  _onPointerDown(e) {
    let offsetX;
    let offsetY;
    if (e.target === this.domNode.domNode && typeof e.offsetX === "number" && typeof e.offsetY === "number") {
      offsetX = e.offsetX;
      offsetY = e.offsetY;
    } else {
      const domNodePosition = dom.getDomNodePagePosition(this.domNode.domNode);
      offsetX = e.pageX - domNodePosition.left;
      offsetY = e.pageY - domNodePosition.top;
    }
    const offset = this._pointerDownRelativePosition(offsetX, offsetY);
    this._setDesiredScrollPositionNow(
      this._scrollByPage ? this._scrollbarState.getDesiredScrollPositionFromOffsetPaged(offset) : this._scrollbarState.getDesiredScrollPositionFromOffset(offset)
    );
    if (e.button === 0) {
      e.preventDefault();
      this._sliderPointerDown(e);
    }
  }
  _sliderPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) {
      return;
    }
    const initialPointerPosition = this._sliderPointerPosition(e);
    const initialPointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(e);
    const initialScrollbarState = this._scrollbarState.clone();
    this.slider.toggleClassName("active", true);
    this._pointerMoveMonitor.startMonitoring(
      e.target,
      e.pointerId,
      e.buttons,
      (pointerMoveData) => {
        const pointerOrthogonalPosition = this._sliderOrthogonalPointerPosition(pointerMoveData);
        const pointerOrthogonalDelta = Math.abs(pointerOrthogonalPosition - initialPointerOrthogonalPosition);
        if (platform.isWindows && pointerOrthogonalDelta > POINTER_DRAG_RESET_DISTANCE) {
          this._setDesiredScrollPositionNow(initialScrollbarState.getScrollPosition());
          return;
        }
        const pointerPosition = this._sliderPointerPosition(pointerMoveData);
        const pointerDelta = pointerPosition - initialPointerPosition;
        this._setDesiredScrollPositionNow(initialScrollbarState.getDesiredScrollPositionFromDelta(pointerDelta));
      },
      () => {
        this.slider.toggleClassName("active", false);
        this._host.onDragEnd();
      }
    );
    this._host.onDragStart();
  }
  _setDesiredScrollPositionNow(_desiredScrollPosition) {
    const desiredScrollPosition = {};
    this.writeScrollPosition(desiredScrollPosition, _desiredScrollPosition);
    this._scrollable.setScrollPositionNow(desiredScrollPosition);
  }
  updateScrollbarSize(scrollbarSize) {
    this._updateScrollbarSize(scrollbarSize);
    this._scrollbarState.setScrollbarSize(scrollbarSize);
    this._shouldRender = true;
    if (!this._lazyRender) {
      this.render();
    }
  }
  isNeeded() {
    return this._scrollbarState.isNeeded();
  }
}
//# sourceMappingURL=abstractScrollbar.js.map
