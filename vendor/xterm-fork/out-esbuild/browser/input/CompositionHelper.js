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
var CompositionHelper_exports = {};
__export(CompositionHelper_exports, {
  CompositionHelper: () => CompositionHelper
});
module.exports = __toCommonJS(CompositionHelper_exports);
var import_Services = require("browser/services/Services");
var import_Services2 = require("common/services/Services");
var import_EscapeSequences = require("common/data/EscapeSequences");
/**
 * Copyright (c) 2016 The xterm.js authors. All rights reserved.
 * @license MIT
 */
let CompositionHelper = class {
  constructor(_textarea, _compositionView, _bufferService, _optionsService, _coreService, _renderService) {
    this._textarea = _textarea;
    this._compositionView = _compositionView;
    this._bufferService = _bufferService;
    this._optionsService = _optionsService;
    this._coreService = _coreService;
    this._renderService = _renderService;
    this._isComposing = false;
    this._isSendingComposition = false;
    this._compositionPosition = { start: 0, end: 0 };
    this._dataAlreadySent = "";
  }
  get isComposing() {
    return this._isComposing;
  }
  /**
   * Handles the compositionstart event, activating the composition view.
   */
  compositionstart() {
    this._isComposing = true;
    this._compositionPosition.start = this._textarea.value.length;
    this._compositionView.textContent = "";
    this._dataAlreadySent = "";
    this._compositionView.classList.add("active");
  }
  /**
   * Handles the compositionupdate event, updating the composition view.
   * @param ev The event.
   */
  compositionupdate(ev) {
    this._compositionView.textContent = ev.data;
    this.updateCompositionElements();
    setTimeout(() => {
      this._compositionPosition.end = this._textarea.value.length;
    }, 0);
  }
  /**
   * Handles the compositionend event, hiding the composition view and sending the composition to
   * the handler.
   */
  compositionend() {
    this._finalizeComposition(true);
  }
  /**
   * Handles the keydown event, routing any necessary events to the CompositionHelper functions.
   * @param ev The keydown event.
   * @returns Whether the Terminal should continue processing the keydown event.
   */
  keydown(ev) {
    if (this._isComposing || this._isSendingComposition) {
      if (ev.keyCode === 229) {
        return false;
      }
      if (ev.keyCode === 16 || ev.keyCode === 17 || ev.keyCode === 18) {
        return false;
      }
      this._finalizeComposition(false);
    }
    if (ev.keyCode === 229) {
      this._handleAnyTextareaChanges();
      return false;
    }
    return true;
  }
  /**
   * Finalizes the composition, resuming regular input actions. This is called when a composition
   * is ending.
   * @param waitForPropagation Whether to wait for events to propagate before sending
   *   the input. This should be false if a non-composition keystroke is entered before the
   *   compositionend event is triggered, such as enter, so that the composition is sent before
   *   the command is executed.
   */
  _finalizeComposition(waitForPropagation) {
    this._compositionView.classList.remove("active");
    this._isComposing = false;
    if (!waitForPropagation) {
      this._isSendingComposition = false;
      const input = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
      this._coreService.triggerDataEvent(input, true);
    } else {
      const currentCompositionPosition = {
        start: this._compositionPosition.start,
        end: this._compositionPosition.end
      };
      this._isSendingComposition = true;
      setTimeout(() => {
        if (this._isSendingComposition) {
          this._isSendingComposition = false;
          let input;
          currentCompositionPosition.start += this._dataAlreadySent.length;
          if (this._isComposing) {
            input = this._textarea.value.substring(currentCompositionPosition.start, this._compositionPosition.start);
          } else {
            input = this._textarea.value.substring(currentCompositionPosition.start);
          }
          if (input.length > 0) {
            this._coreService.triggerDataEvent(input, true);
          }
        }
      }, 0);
    }
  }
  /**
   * Apply any changes made to the textarea after the current event chain is allowed to complete.
   * This should be called when not currently composing but a keydown event with the "composition
   * character" (229) is triggered, in order to allow non-composition text to be entered when an
   * IME is active.
   */
  _handleAnyTextareaChanges() {
    const oldValue = this._textarea.value;
    setTimeout(() => {
      if (!this._isComposing) {
        const newValue = this._textarea.value;
        const diff = newValue.replace(oldValue, "");
        this._dataAlreadySent = diff;
        if (newValue.length > oldValue.length) {
          this._coreService.triggerDataEvent(diff, true);
        } else if (newValue.length < oldValue.length) {
          this._coreService.triggerDataEvent(`${import_EscapeSequences.C0.DEL}`, true);
        } else if (newValue.length === oldValue.length && newValue !== oldValue) {
          this._coreService.triggerDataEvent(newValue, true);
        }
      }
    }, 0);
  }
  /**
   * Positions the composition view on top of the cursor and the textarea just below it (so the
   * IME helper dialog is positioned correctly).
   * @param dontRecurse Whether to use setTimeout to recursively trigger another update, this is
   *   necessary as the IME events across browsers are not consistently triggered.
   */
  updateCompositionElements(dontRecurse) {
    if (!this._isComposing) {
      return;
    }
    if (this._bufferService.buffer.isCursorInViewport) {
      const cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
      const cellHeight = this._renderService.dimensions.css.cell.height;
      const cursorTop = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height;
      const cursorLeft = cursorX * this._renderService.dimensions.css.cell.width;
      this._compositionView.style.left = cursorLeft + "px";
      this._compositionView.style.top = cursorTop + "px";
      this._compositionView.style.height = cellHeight + "px";
      this._compositionView.style.lineHeight = cellHeight + "px";
      this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily;
      this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + "px";
      const compositionViewBounds = this._compositionView.getBoundingClientRect();
      this._textarea.style.left = cursorLeft + "px";
      this._textarea.style.top = cursorTop + "px";
      this._textarea.style.width = Math.max(compositionViewBounds.width, 1) + "px";
      this._textarea.style.height = Math.max(compositionViewBounds.height, 1) + "px";
      this._textarea.style.lineHeight = compositionViewBounds.height + "px";
    }
    if (!dontRecurse) {
      setTimeout(() => this.updateCompositionElements(true), 0);
    }
  }
};
CompositionHelper = __decorateClass([
  __decorateParam(2, import_Services2.IBufferService),
  __decorateParam(3, import_Services2.IOptionsService),
  __decorateParam(4, import_Services2.ICoreService),
  __decorateParam(5, import_Services.IRenderService)
], CompositionHelper);
//# sourceMappingURL=CompositionHelper.js.map
