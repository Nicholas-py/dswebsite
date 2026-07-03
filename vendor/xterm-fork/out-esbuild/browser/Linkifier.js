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
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
var Linkifier_exports = {};
__export(Linkifier_exports, {
  Linkifier: () => Linkifier
});
module.exports = __toCommonJS(Linkifier_exports);
var import_lifecycle = require("vs/base/common/lifecycle");
var import_Services = require("common/services/Services");
var import_Services2 = require("./services/Services");
var import_event = require("vs/base/common/event");
var import_dom = require("vs/base/browser/dom");
/**
 * Copyright (c) 2019 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let Linkifier = class extends import_lifecycle.Disposable {
  constructor(_element, _mouseService, _renderService, _bufferService, _linkProviderService) {
    super();
    this._element = _element;
    this._mouseService = _mouseService;
    this._renderService = _renderService;
    this._bufferService = _bufferService;
    this._linkProviderService = _linkProviderService;
    this._linkCacheDisposables = [];
    this._isMouseOut = true;
    this._wasResized = false;
    this._activeLine = -1;
    this._onShowLinkUnderline = this._register(new import_event.Emitter());
    this.onShowLinkUnderline = this._onShowLinkUnderline.event;
    this._onHideLinkUnderline = this._register(new import_event.Emitter());
    this.onHideLinkUnderline = this._onHideLinkUnderline.event;
    this._register((0, import_lifecycle.toDisposable)(() => {
      (0, import_lifecycle.dispose)(this._linkCacheDisposables);
      this._linkCacheDisposables.length = 0;
      this._lastMouseEvent = void 0;
      this._activeProviderReplies?.clear();
    }));
    this._register(this._bufferService.onResize(() => {
      this._clearCurrentLink();
      this._wasResized = true;
    }));
    this._register((0, import_dom.addDisposableListener)(this._element, "mouseleave", () => {
      this._isMouseOut = true;
      this._clearCurrentLink();
    }));
    this._register((0, import_dom.addDisposableListener)(this._element, "mousemove", this._handleMouseMove.bind(this)));
    this._register((0, import_dom.addDisposableListener)(this._element, "mousedown", this._handleMouseDown.bind(this)));
    this._register((0, import_dom.addDisposableListener)(this._element, "mouseup", this._handleMouseUp.bind(this)));
  }
  get currentLink() {
    return this._currentLink;
  }
  _handleMouseMove(event) {
    this._lastMouseEvent = event;
    const position = this._positionFromMouseEvent(event, this._element, this._mouseService);
    if (!position) {
      return;
    }
    this._isMouseOut = false;
    const composedPath = event.composedPath();
    for (let i = 0; i < composedPath.length; i++) {
      const target = composedPath[i];
      if (target.classList.contains("xterm")) {
        break;
      }
      if (target.classList.contains("xterm-hover")) {
        return;
      }
    }
    if (!this._lastBufferCell || (position.x !== this._lastBufferCell.x || position.y !== this._lastBufferCell.y)) {
      this._handleHover(position);
      this._lastBufferCell = position;
    }
  }
  _handleHover(position) {
    if (this._activeLine !== position.y || this._wasResized) {
      this._clearCurrentLink();
      this._askForLink(position, false);
      this._wasResized = false;
      return;
    }
    const isCurrentLinkInPosition = this._currentLink && this._linkAtPosition(this._currentLink.link, position);
    if (!isCurrentLinkInPosition) {
      this._clearCurrentLink();
      this._askForLink(position, true);
    }
  }
  _askForLink(position, useLineCache) {
    if (!this._activeProviderReplies || !useLineCache) {
      this._activeProviderReplies?.forEach((reply) => {
        reply?.forEach((linkWithState) => {
          if (linkWithState.link.dispose) {
            linkWithState.link.dispose();
          }
        });
      });
      this._activeProviderReplies = /* @__PURE__ */ new Map();
      this._activeLine = position.y;
    }
    let linkProvided = false;
    for (const [i, linkProvider] of this._linkProviderService.linkProviders.entries()) {
      if (useLineCache) {
        const existingReply = this._activeProviderReplies?.get(i);
        if (existingReply) {
          linkProvided = this._checkLinkProviderResult(i, position, linkProvided);
        }
      } else {
        linkProvider.provideLinks(position.y, (links) => {
          if (this._isMouseOut) {
            return;
          }
          const linksWithState = links?.map((link) => ({ link }));
          this._activeProviderReplies?.set(i, linksWithState);
          linkProvided = this._checkLinkProviderResult(i, position, linkProvided);
          if (this._activeProviderReplies?.size === this._linkProviderService.linkProviders.length) {
            this._removeIntersectingLinks(position.y, this._activeProviderReplies);
          }
        });
      }
    }
  }
  _removeIntersectingLinks(y, replies) {
    const occupiedCells = /* @__PURE__ */ new Set();
    for (let i = 0; i < replies.size; i++) {
      const providerReply = replies.get(i);
      if (!providerReply) {
        continue;
      }
      for (let i2 = 0; i2 < providerReply.length; i2++) {
        const linkWithState = providerReply[i2];
        const startX = linkWithState.link.range.start.y < y ? 0 : linkWithState.link.range.start.x;
        const endX = linkWithState.link.range.end.y > y ? this._bufferService.cols : linkWithState.link.range.end.x;
        for (let x = startX; x <= endX; x++) {
          if (occupiedCells.has(x)) {
            providerReply.splice(i2--, 1);
            break;
          }
          occupiedCells.add(x);
        }
      }
    }
  }
  _checkLinkProviderResult(index, position, linkProvided) {
    if (!this._activeProviderReplies) {
      return linkProvided;
    }
    const links = this._activeProviderReplies.get(index);
    let hasLinkBefore = false;
    for (let j = 0; j < index; j++) {
      if (!this._activeProviderReplies.has(j) || this._activeProviderReplies.get(j)) {
        hasLinkBefore = true;
      }
    }
    if (!hasLinkBefore && links) {
      const linkAtPosition = links.find((link) => this._linkAtPosition(link.link, position));
      if (linkAtPosition) {
        linkProvided = true;
        this._handleNewLink(linkAtPosition);
      }
    }
    if (this._activeProviderReplies.size === this._linkProviderService.linkProviders.length && !linkProvided) {
      for (let j = 0; j < this._activeProviderReplies.size; j++) {
        const currentLink = this._activeProviderReplies.get(j)?.find((link) => this._linkAtPosition(link.link, position));
        if (currentLink) {
          linkProvided = true;
          this._handleNewLink(currentLink);
          break;
        }
      }
    }
    return linkProvided;
  }
  _handleMouseDown() {
    this._mouseDownLink = this._currentLink;
  }
  _handleMouseUp(event) {
    if (!this._currentLink) {
      return;
    }
    const position = this._positionFromMouseEvent(event, this._element, this._mouseService);
    if (!position) {
      return;
    }
    if (this._mouseDownLink && linkEquals(this._mouseDownLink.link, this._currentLink.link) && this._linkAtPosition(this._currentLink.link, position)) {
      this._currentLink.link.activate(event, this._currentLink.link.text);
    }
  }
  _clearCurrentLink(startRow, endRow) {
    if (!this._currentLink || !this._lastMouseEvent) {
      return;
    }
    if (!startRow || !endRow || this._currentLink.link.range.start.y >= startRow && this._currentLink.link.range.end.y <= endRow) {
      this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent);
      this._currentLink = void 0;
      (0, import_lifecycle.dispose)(this._linkCacheDisposables);
      this._linkCacheDisposables.length = 0;
    }
  }
  _handleNewLink(linkWithState) {
    if (!this._lastMouseEvent) {
      return;
    }
    const position = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
    if (!position) {
      return;
    }
    if (this._linkAtPosition(linkWithState.link, position)) {
      this._currentLink = linkWithState;
      this._currentLink.state = {
        decorations: {
          underline: linkWithState.link.decorations === void 0 ? true : linkWithState.link.decorations.underline,
          pointerCursor: linkWithState.link.decorations === void 0 ? true : linkWithState.link.decorations.pointerCursor
        },
        isHovered: true
      };
      this._linkHover(this._element, linkWithState.link, this._lastMouseEvent);
      linkWithState.link.decorations = {};
      Object.defineProperties(linkWithState.link.decorations, {
        pointerCursor: {
          get: () => this._currentLink?.state?.decorations.pointerCursor,
          set: (v) => {
            if (this._currentLink?.state && this._currentLink.state.decorations.pointerCursor !== v) {
              this._currentLink.state.decorations.pointerCursor = v;
              if (this._currentLink.state.isHovered) {
                this._element.classList.toggle("xterm-cursor-pointer", v);
              }
            }
          }
        },
        underline: {
          get: () => this._currentLink?.state?.decorations.underline,
          set: (v) => {
            if (this._currentLink?.state && this._currentLink?.state?.decorations.underline !== v) {
              this._currentLink.state.decorations.underline = v;
              if (this._currentLink.state.isHovered) {
                this._fireUnderlineEvent(linkWithState.link, v);
              }
            }
          }
        }
      });
      this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange((e) => {
        if (!this._currentLink) {
          return;
        }
        const start = e.start === 0 ? 0 : e.start + 1 + this._bufferService.buffer.ydisp;
        const end = this._bufferService.buffer.ydisp + 1 + e.end;
        if (this._currentLink.link.range.start.y >= start && this._currentLink.link.range.end.y <= end) {
          this._clearCurrentLink(start, end);
          if (this._lastMouseEvent) {
            const position2 = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
            if (position2) {
              this._askForLink(position2, false);
            }
          }
        }
      }));
    }
  }
  _linkHover(element, link, event) {
    if (this._currentLink?.state) {
      this._currentLink.state.isHovered = true;
      if (this._currentLink.state.decorations.underline) {
        this._fireUnderlineEvent(link, true);
      }
      if (this._currentLink.state.decorations.pointerCursor) {
        element.classList.add("xterm-cursor-pointer");
      }
    }
    if (link.hover) {
      link.hover(event, link.text);
    }
  }
  _fireUnderlineEvent(link, showEvent) {
    const range = link.range;
    const scrollOffset = this._bufferService.buffer.ydisp;
    const event = this._createLinkUnderlineEvent(range.start.x - 1, range.start.y - scrollOffset - 1, range.end.x, range.end.y - scrollOffset - 1, void 0);
    const emitter = showEvent ? this._onShowLinkUnderline : this._onHideLinkUnderline;
    emitter.fire(event);
  }
  _linkLeave(element, link, event) {
    if (this._currentLink?.state) {
      this._currentLink.state.isHovered = false;
      if (this._currentLink.state.decorations.underline) {
        this._fireUnderlineEvent(link, false);
      }
      if (this._currentLink.state.decorations.pointerCursor) {
        element.classList.remove("xterm-cursor-pointer");
      }
    }
    if (link.leave) {
      link.leave(event, link.text);
    }
  }
  /**
   * Check if the buffer position is within the link
   * @param link
   * @param position
   */
  _linkAtPosition(link, position) {
    const lower = link.range.start.y * this._bufferService.cols + link.range.start.x;
    const upper = link.range.end.y * this._bufferService.cols + link.range.end.x;
    const current = position.y * this._bufferService.cols + position.x;
    return lower <= current && current <= upper;
  }
  /**
   * Get the buffer position from a mouse event
   * @param event
   */
  _positionFromMouseEvent(event, element, mouseService) {
    const coords = mouseService.getCoords(event, element, this._bufferService.cols, this._bufferService.rows);
    if (!coords) {
      return;
    }
    return { x: coords[0], y: coords[1] + this._bufferService.buffer.ydisp };
  }
  _createLinkUnderlineEvent(x1, y1, x2, y2, fg) {
    return { x1, y1, x2, y2, cols: this._bufferService.cols, fg };
  }
};
Linkifier = __decorateClass([
  __decorateParam(1, import_Services2.IMouseService),
  __decorateParam(2, import_Services2.IRenderService),
  __decorateParam(3, import_Services.IBufferService),
  __decorateParam(4, import_Services2.ILinkProviderService)
], Linkifier);
function linkEquals(a, b) {
  return a.text === b.text && a.range.start.x === b.range.start.x && a.range.start.y === b.range.start.y && a.range.end.x === b.range.end.x && a.range.end.y === b.range.end.y;
}
//# sourceMappingURL=Linkifier.js.map
