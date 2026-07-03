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
var CoreBrowserTerminal_exports = {};
__export(CoreBrowserTerminal_exports, {
  CoreBrowserTerminal: () => CoreBrowserTerminal
});
module.exports = __toCommonJS(CoreBrowserTerminal_exports);
var import_Clipboard = require("browser/Clipboard");
var Strings = __toESM(require("browser/LocalizableStrings"));
var import_OscLinkProvider = require("browser/OscLinkProvider");
var import_Viewport = require("browser/Viewport");
var import_BufferDecorationRenderer = require("browser/decorations/BufferDecorationRenderer");
var import_OverviewRulerRenderer = require("browser/decorations/OverviewRulerRenderer");
var import_CompositionHelper = require("browser/input/CompositionHelper");
var import_DomRenderer = require("browser/renderer/dom/DomRenderer");
var import_CharSizeService = require("browser/services/CharSizeService");
var import_CharacterJoinerService = require("browser/services/CharacterJoinerService");
var import_CoreBrowserService = require("browser/services/CoreBrowserService");
var import_LinkProviderService = require("browser/services/LinkProviderService");
var import_MouseService = require("browser/services/MouseService");
var import_RenderService = require("browser/services/RenderService");
var import_SelectionService = require("browser/services/SelectionService");
var import_Services = require("browser/services/Services");
var import_ThemeService = require("browser/services/ThemeService");
var import_Color = require("common/Color");
var import_CoreTerminal = require("common/CoreTerminal");
var Browser = __toESM(require("common/Platform"));
var import_Types3 = require("common/Types");
var import_BufferLine = require("common/buffer/BufferLine");
var import_EscapeSequences = require("common/data/EscapeSequences");
var import_Keyboard = require("common/input/Keyboard");
var import_XParseColor = require("common/input/XParseColor");
var import_DecorationService = require("common/services/DecorationService");
var import_Services2 = require("common/services/Services");
var import_InputHandler = require("../common/InputHandler");
var import_AccessibilityManager = require("./AccessibilityManager");
var import_Linkifier = require("./Linkifier");
var import_event = require("vs/base/common/event");
var import_dom = require("vs/base/browser/dom");
var import_lifecycle = require("vs/base/common/lifecycle");
/**
 * Copyright (c) 2014 The xterm.js authors. All rights reserved.
 * Copyright (c) 2012-2013, Christopher Jeffrey (MIT License)
 * @license MIT
 *
 * Originally forked from (with the author's permission):
 *   Fabrice Bellard's javascript vt100 for jslinux:
 *   http://bellard.org/jslinux/
 *   Copyright (c) 2011 Fabrice Bellard
 *   The original design remains. The terminal itself
 *   has been extended to include xterm CSI codes, among
 *   other features.
 *
 * Terminal Emulation References:
 *   http://vt100.net/
 *   http://invisible-island.net/xterm/ctlseqs/ctlseqs.txt
 *   http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
 *   http://invisible-island.net/vttest/
 *   http://www.inwap.com/pdp10/ansicode.txt
 *   http://linux.die.net/man/4/console_codes
 *   http://linux.die.net/man/7/urxvt
 */
class CoreBrowserTerminal extends import_CoreTerminal.CoreTerminal {
  constructor(options = {}) {
    super(options);
    this._linkifier = this._register(new import_lifecycle.MutableDisposable());
    this.browser = Browser;
    /**
     * Records whether the keydown event has already been handled and triggered a data event, if so
     * the keypress event should not trigger a data event but should still print to the textarea so
     * screen readers will announce it.
     */
    this._keyDownHandled = false;
    /**
     * Records whether a keydown event has occured since the last keyup event, i.e. whether a key
     * is currently "pressed".
     */
    this._keyDownSeen = false;
    /**
     * Records whether the keypress event has already been handled and triggered a data event, if so
     * the input event should not trigger a data event but should still print to the textarea so
     * screen readers will announce it.
     */
    this._keyPressHandled = false;
    /**
     * Records whether there has been a keydown event for a dead key without a corresponding keydown
     * event for the composed/alternative character. If we cancel the keydown event for the dead key,
     * no events will be emitted for the final character.
     */
    this._unprocessedDeadKey = false;
    this._accessibilityManager = this._register(new import_lifecycle.MutableDisposable());
    this._onCursorMove = this._register(new import_event.Emitter());
    this.onCursorMove = this._onCursorMove.event;
    this._onKey = this._register(new import_event.Emitter());
    this.onKey = this._onKey.event;
    this._onRender = this._register(new import_event.Emitter());
    this.onRender = this._onRender.event;
    this._onSelectionChange = this._register(new import_event.Emitter());
    this.onSelectionChange = this._onSelectionChange.event;
    this._onTitleChange = this._register(new import_event.Emitter());
    this.onTitleChange = this._onTitleChange.event;
    this._onBell = this._register(new import_event.Emitter());
    this.onBell = this._onBell.event;
    this._onFocus = this._register(new import_event.Emitter());
    this._onBlur = this._register(new import_event.Emitter());
    this._onA11yCharEmitter = this._register(new import_event.Emitter());
    this._onA11yTabEmitter = this._register(new import_event.Emitter());
    this._onWillOpen = this._register(new import_event.Emitter());
    this._setup();
    this._decorationService = this._instantiationService.createInstance(import_DecorationService.DecorationService);
    this._instantiationService.setService(import_Services2.IDecorationService, this._decorationService);
    this._linkProviderService = this._instantiationService.createInstance(import_LinkProviderService.LinkProviderService);
    this._instantiationService.setService(import_Services.ILinkProviderService, this._linkProviderService);
    this._linkProviderService.registerLinkProvider(this._instantiationService.createInstance(import_OscLinkProvider.OscLinkProvider));
    this._register(this._inputHandler.onRequestBell(() => this._onBell.fire()));
    this._register(this._inputHandler.onRequestRefreshRows((e) => this.refresh(e?.start ?? 0, e?.end ?? this.rows - 1)));
    this._register(this._inputHandler.onRequestSendFocus(() => this._reportFocus()));
    this._register(this._inputHandler.onRequestReset(() => this.reset()));
    this._register(this._inputHandler.onRequestWindowsOptionsReport((type) => this._reportWindowsOptions(type)));
    this._register(this._inputHandler.onColor((event) => this._handleColorEvent(event)));
    this._register(import_event.Event.forward(this._inputHandler.onCursorMove, this._onCursorMove));
    this._register(import_event.Event.forward(this._inputHandler.onTitleChange, this._onTitleChange));
    this._register(import_event.Event.forward(this._inputHandler.onA11yChar, this._onA11yCharEmitter));
    this._register(import_event.Event.forward(this._inputHandler.onA11yTab, this._onA11yTabEmitter));
    this._register(this._bufferService.onResize((e) => this._afterResize(e.cols, e.rows)));
    this._register((0, import_lifecycle.toDisposable)(() => {
      this._customKeyEventHandler = void 0;
      this.element?.parentNode?.removeChild(this.element);
    }));
  }
  get linkifier() {
    return this._linkifier.value;
  }
  get onFocus() {
    return this._onFocus.event;
  }
  get onBlur() {
    return this._onBlur.event;
  }
  get onA11yChar() {
    return this._onA11yCharEmitter.event;
  }
  get onA11yTab() {
    return this._onA11yTabEmitter.event;
  }
  get onWillOpen() {
    return this._onWillOpen.event;
  }
  /**
   * Handle color event from inputhandler for OSC 4|104 | 10|110 | 11|111 | 12|112.
   * An event from OSC 4|104 may contain multiple set or report requests, and multiple
   * or none restore requests (resetting all),
   * while an event from OSC 10|110 | 11|111 | 12|112 always contains a single request.
   */
  _handleColorEvent(event) {
    if (!this._themeService) return;
    for (const req of event) {
      let acc;
      let ident = "";
      switch (req.index) {
        case import_Types3.SpecialColorIndex.FOREGROUND:
          acc = "foreground";
          ident = "10";
          break;
        case import_Types3.SpecialColorIndex.BACKGROUND:
          acc = "background";
          ident = "11";
          break;
        case import_Types3.SpecialColorIndex.CURSOR:
          acc = "cursor";
          ident = "12";
          break;
        default:
          acc = "ansi";
          ident = "4;" + req.index;
      }
      switch (req.type) {
        case import_Types3.ColorRequestType.REPORT:
          const colorRgb = import_Color.color.toColorRGB(acc === "ansi" ? this._themeService.colors.ansi[req.index] : this._themeService.colors[acc]);
          this.coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}]${ident};${(0, import_XParseColor.toRgbString)(colorRgb)}${import_EscapeSequences.C1_ESCAPED.ST}`);
          break;
        case import_Types3.ColorRequestType.SET:
          if (acc === "ansi") {
            this._themeService.modifyColors((colors) => colors.ansi[req.index] = import_Color.channels.toColor(...req.color));
          } else {
            const narrowedAcc = acc;
            this._themeService.modifyColors((colors) => colors[narrowedAcc] = import_Color.channels.toColor(...req.color));
          }
          break;
        case import_Types3.ColorRequestType.RESTORE:
          this._themeService.restoreColor(req.index);
          break;
      }
    }
  }
  _setup() {
    super._setup();
    this._customKeyEventHandler = void 0;
  }
  /**
   * Convenience property to active buffer.
   */
  get buffer() {
    return this.buffers.active;
  }
  /**
   * Focus the terminal. Delegates focus handling to the terminal's DOM element.
   */
  focus() {
    if (this.textarea) {
      this.textarea.focus({ preventScroll: true });
    }
  }
  _handleScreenReaderModeOptionChange(value) {
    if (value) {
      if (!this._accessibilityManager.value && this._renderService) {
        this._accessibilityManager.value = this._instantiationService.createInstance(import_AccessibilityManager.AccessibilityManager, this);
      }
    } else {
      this._accessibilityManager.clear();
    }
  }
  /**
   * Binds the desired focus behavior on a given terminal object.
   */
  _handleTextAreaFocus(ev) {
    if (this.coreService.decPrivateModes.sendFocus) {
      this.coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[I");
    }
    this.element.classList.add("focus");
    this._showCursor();
    this._onFocus.fire();
  }
  /**
   * Blur the terminal, calling the blur function on the terminal's underlying
   * textarea.
   */
  blur() {
    return this.textarea?.blur();
  }
  /**
   * Binds the desired blur behavior on a given terminal object.
   */
  _handleTextAreaBlur() {
    this.textarea.value = "";
    this.refresh(this.buffer.y, this.buffer.y);
    if (this.coreService.decPrivateModes.sendFocus) {
      this.coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[O");
    }
    this.element.classList.remove("focus");
    this._onBlur.fire();
  }
  _syncTextArea() {
    if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) {
      return;
    }
    const cursorY = this.buffer.ybase + this.buffer.y;
    const bufferLine = this.buffer.lines.get(cursorY);
    if (!bufferLine) {
      return;
    }
    const cursorX = Math.min(this.buffer.x, this.cols - 1);
    const cellHeight = this._renderService.dimensions.css.cell.height;
    const width = bufferLine.getWidth(cursorX);
    const cellWidth = this._renderService.dimensions.css.cell.width * width;
    const cursorTop = this.buffer.y * this._renderService.dimensions.css.cell.height;
    const cursorLeft = cursorX * this._renderService.dimensions.css.cell.width;
    this.textarea.style.left = cursorLeft + "px";
    this.textarea.style.top = cursorTop + "px";
    this.textarea.style.width = cellWidth + "px";
    this.textarea.style.height = cellHeight + "px";
    this.textarea.style.lineHeight = cellHeight + "px";
    this.textarea.style.zIndex = "-5";
  }
  /**
   * Initialize default behavior
   */
  _initGlobal() {
    this._bindKeys();
    this._register((0, import_dom.addDisposableListener)(this.element, "copy", (event) => {
      if (!this.hasSelection()) {
        return;
      }
      (0, import_Clipboard.copyHandler)(event, this._selectionService);
    }));
    const pasteHandlerWrapper = (event) => (0, import_Clipboard.handlePasteEvent)(event, this.textarea, this.coreService, this.optionsService);
    this._register((0, import_dom.addDisposableListener)(this.textarea, "paste", pasteHandlerWrapper));
    this._register((0, import_dom.addDisposableListener)(this.element, "paste", pasteHandlerWrapper));
    if (Browser.isFirefox) {
      this._register((0, import_dom.addDisposableListener)(this.element, "mousedown", (event) => {
        if (event.button === 2) {
          (0, import_Clipboard.rightClickHandler)(event, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
        }
      }));
    } else {
      this._register((0, import_dom.addDisposableListener)(this.element, "contextmenu", (event) => {
        (0, import_Clipboard.rightClickHandler)(event, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
      }));
    }
    if (Browser.isLinux) {
      this._register((0, import_dom.addDisposableListener)(this.element, "auxclick", (event) => {
        if (event.button === 1) {
          (0, import_Clipboard.moveTextAreaUnderMouseCursor)(event, this.textarea, this.screenElement);
        }
      }));
    }
  }
  /**
   * Apply key handling to the terminal
   */
  _bindKeys() {
    this._register((0, import_dom.addDisposableListener)(this.textarea, "keyup", (ev) => this._keyUp(ev), true));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "keydown", (ev) => this._keyDown(ev), true));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "keypress", (ev) => this._keyPress(ev), true));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "compositionstart", () => this._compositionHelper.compositionstart()));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "compositionupdate", (e) => this._compositionHelper.compositionupdate(e)));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "compositionend", () => this._compositionHelper.compositionend()));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "input", (ev) => this._inputEvent(ev), true));
    this._register(this.onRender(() => this._compositionHelper.updateCompositionElements()));
  }
  /**
   * Opens the terminal within an element.
   *
   * @param parent The element to create the terminal within.
   */
  open(parent) {
    if (!parent) {
      throw new Error("Terminal requires a parent element.");
    }
    if (!parent.isConnected) {
      this._logService.debug("Terminal.open was called on an element that was not attached to the DOM");
    }
    if (this.element?.ownerDocument.defaultView && this._coreBrowserService && this.element?.isConnected) {
      if (this.element.ownerDocument.defaultView !== this._coreBrowserService.window) {
        this._coreBrowserService.window = this.element.ownerDocument.defaultView;
      }
      return;
    }
    this._document = parent.ownerDocument;
    if (this.options.documentOverride && this.options.documentOverride instanceof Document) {
      this._document = this.optionsService.rawOptions.documentOverride;
    }
    this.element = this._document.createElement("div");
    this.element.dir = "ltr";
    this.element.classList.add("terminal");
    this.element.classList.add("xterm");
    parent.appendChild(this.element);
    const fragment = this._document.createDocumentFragment();
    this._viewportElement = this._document.createElement("div");
    this._viewportElement.classList.add("xterm-viewport");
    fragment.appendChild(this._viewportElement);
    this.screenElement = this._document.createElement("div");
    this.screenElement.classList.add("xterm-screen");
    this._register((0, import_dom.addDisposableListener)(this.screenElement, "mousemove", (ev) => this.updateCursorStyle(ev)));
    this._helperContainer = this._document.createElement("div");
    this._helperContainer.classList.add("xterm-helpers");
    this.screenElement.appendChild(this._helperContainer);
    fragment.appendChild(this.screenElement);
    const textarea = this.textarea = this._document.createElement("textarea");
    this.textarea.classList.add("xterm-helper-textarea");
    this.textarea.setAttribute("aria-label", Strings.promptLabel.get());
    if (!Browser.isChromeOS) {
      this.textarea.setAttribute("aria-multiline", "false");
    }
    this.textarea.setAttribute("autocorrect", "off");
    this.textarea.setAttribute("autocapitalize", "off");
    this.textarea.setAttribute("spellcheck", "false");
    this.textarea.tabIndex = 0;
    this._register(this.optionsService.onSpecificOptionChange("disableStdin", () => textarea.readOnly = this.optionsService.rawOptions.disableStdin));
    this.textarea.readOnly = this.optionsService.rawOptions.disableStdin;
    this._coreBrowserService = this._register(this._instantiationService.createInstance(
      import_CoreBrowserService.CoreBrowserService,
      this.textarea,
      parent.ownerDocument.defaultView ?? window,
      // Force unsafe null in node.js environment for tests
      this._document ?? typeof window !== "undefined" ? window.document : null
    ));
    this._instantiationService.setService(import_Services.ICoreBrowserService, this._coreBrowserService);
    this._register((0, import_dom.addDisposableListener)(this.textarea, "focus", (ev) => this._handleTextAreaFocus(ev)));
    this._register((0, import_dom.addDisposableListener)(this.textarea, "blur", () => this._handleTextAreaBlur()));
    this._helperContainer.appendChild(this.textarea);
    this._charSizeService = this._instantiationService.createInstance(import_CharSizeService.CharSizeService, this._document, this._helperContainer);
    this._instantiationService.setService(import_Services.ICharSizeService, this._charSizeService);
    this._themeService = this._instantiationService.createInstance(import_ThemeService.ThemeService);
    this._instantiationService.setService(import_Services.IThemeService, this._themeService);
    this._characterJoinerService = this._instantiationService.createInstance(import_CharacterJoinerService.CharacterJoinerService);
    this._instantiationService.setService(import_Services.ICharacterJoinerService, this._characterJoinerService);
    this._renderService = this._register(this._instantiationService.createInstance(import_RenderService.RenderService, this.rows, this.screenElement));
    this._instantiationService.setService(import_Services.IRenderService, this._renderService);
    this._register(this._renderService.onRenderedViewportChange((e) => this._onRender.fire(e)));
    this.onResize((e) => this._renderService.resize(e.cols, e.rows));
    this._compositionView = this._document.createElement("div");
    this._compositionView.classList.add("composition-view");
    this._compositionHelper = this._instantiationService.createInstance(import_CompositionHelper.CompositionHelper, this.textarea, this._compositionView);
    this._helperContainer.appendChild(this._compositionView);
    this._mouseService = this._instantiationService.createInstance(import_MouseService.MouseService);
    this._instantiationService.setService(import_Services.IMouseService, this._mouseService);
    const linkifier = this._linkifier.value = this._register(this._instantiationService.createInstance(import_Linkifier.Linkifier, this.screenElement));
    this.element.appendChild(fragment);
    try {
      this._onWillOpen.fire(this.element);
    } catch {
    }
    if (!this._renderService.hasRenderer()) {
      this._renderService.setRenderer(this._createRenderer());
    }
    this._register(this.onCursorMove(() => {
      this._renderService.handleCursorMove();
      this._syncTextArea();
    }));
    this._register(this.onResize(() => this._renderService.handleResize(this.cols, this.rows)));
    this._register(this.onBlur(() => this._renderService.handleBlur()));
    this._register(this.onFocus(() => this._renderService.handleFocus()));
    this._viewport = this._register(this._instantiationService.createInstance(import_Viewport.Viewport, this.element, this.screenElement));
    this._register(this._viewport.onRequestScrollLines((e) => {
      super.scrollLines(e, false);
      this.refresh(0, this.rows - 1);
    }));
    this._selectionService = this._register(this._instantiationService.createInstance(
      import_SelectionService.SelectionService,
      this.element,
      this.screenElement,
      linkifier
    ));
    this._instantiationService.setService(import_Services.ISelectionService, this._selectionService);
    this._register(this._selectionService.onRequestScrollLines((e) => this.scrollLines(e.amount, e.suppressScrollEvent)));
    this._register(this._selectionService.onSelectionChange(() => this._onSelectionChange.fire()));
    this._register(this._selectionService.onRequestRedraw((e) => this._renderService.handleSelectionChanged(e.start, e.end, e.columnSelectMode)));
    this._register(this._selectionService.onLinuxMouseSelection((text) => {
      this.textarea.value = text;
      this.textarea.focus();
      this.textarea.select();
    }));
    this._register(this._onScroll.event(() => this._selectionService.refresh()));
    this._register(this._instantiationService.createInstance(import_BufferDecorationRenderer.BufferDecorationRenderer, this.screenElement));
    this._register((0, import_dom.addDisposableListener)(this.element, "mousedown", (e) => this._selectionService.handleMouseDown(e)));
    if (this.coreMouseService.areMouseEventsActive) {
      this._selectionService.disable();
      this.element.classList.add("enable-mouse-events");
    } else {
      this._selectionService.enable();
    }
    if (this.options.screenReaderMode) {
      this._accessibilityManager.value = this._instantiationService.createInstance(import_AccessibilityManager.AccessibilityManager, this);
    }
    this._register(this.optionsService.onSpecificOptionChange("screenReaderMode", (e) => this._handleScreenReaderModeOptionChange(e)));
    if (this.options.overviewRuler.width) {
      this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(import_OverviewRulerRenderer.OverviewRulerRenderer, this._viewportElement, this.screenElement));
    }
    this.optionsService.onSpecificOptionChange("overviewRuler", (value) => {
      if (!this._overviewRulerRenderer && value && this._viewportElement && this.screenElement) {
        this._overviewRulerRenderer = this._register(this._instantiationService.createInstance(import_OverviewRulerRenderer.OverviewRulerRenderer, this._viewportElement, this.screenElement));
      }
    });
    this._charSizeService.measure();
    this.refresh(0, this.rows - 1);
    this._initGlobal();
    this.bindMouse();
  }
  _createRenderer() {
    return this._instantiationService.createInstance(import_DomRenderer.DomRenderer, this, this._document, this.element, this.screenElement, this._viewportElement, this._helperContainer, this.linkifier);
  }
  /**
   * Bind certain mouse events to the terminal.
   * By default only 3 button + wheel up/down is ativated. For higher buttons
   * no mouse report will be created. Typically the standard actions will be active.
   *
   * There are several reasons not to enable support for higher buttons/wheel:
   * - Button 4 and 5 are typically used for history back and forward navigation,
   *   there is no straight forward way to supress/intercept those standard actions.
   * - Support for higher buttons does not work in some platform/browser combinations.
   * - Left/right wheel was not tested.
   * - Emulators vary in mouse button support, typically only 3 buttons and
   *   wheel up/down work reliable.
   *
   * TODO: Move mouse event code into its own file.
   */
  bindMouse() {
    const self = this;
    const el = this.element;
    function sendEvent(ev) {
      const pos = self._mouseService.getMouseReportCoords(ev, self.screenElement);
      if (!pos) {
        return false;
      }
      let but;
      let action;
      switch (ev.overrideType || ev.type) {
        case "mousemove":
          action = import_Types3.CoreMouseAction.MOVE;
          if (ev.buttons === void 0) {
            but = import_Types3.CoreMouseButton.NONE;
            if (ev.button !== void 0) {
              but = ev.button < 3 ? ev.button : import_Types3.CoreMouseButton.NONE;
            }
          } else {
            but = ev.buttons & 1 ? import_Types3.CoreMouseButton.LEFT : ev.buttons & 4 ? import_Types3.CoreMouseButton.MIDDLE : ev.buttons & 2 ? import_Types3.CoreMouseButton.RIGHT : import_Types3.CoreMouseButton.NONE;
          }
          break;
        case "mouseup":
          action = import_Types3.CoreMouseAction.UP;
          but = ev.button < 3 ? ev.button : import_Types3.CoreMouseButton.NONE;
          break;
        case "mousedown":
          action = import_Types3.CoreMouseAction.DOWN;
          but = ev.button < 3 ? ev.button : import_Types3.CoreMouseButton.NONE;
          break;
        case "wheel":
          if (self._customWheelEventHandler && self._customWheelEventHandler(ev) === false) {
            return false;
          }
          const deltaY = ev.deltaY;
          if (deltaY === 0) {
            return false;
          }
          action = deltaY < 0 ? import_Types3.CoreMouseAction.UP : import_Types3.CoreMouseAction.DOWN;
          but = import_Types3.CoreMouseButton.WHEEL;
          break;
        default:
          return false;
      }
      if (action === void 0 || but === void 0 || but > import_Types3.CoreMouseButton.WHEEL) {
        return false;
      }
      return self.coreMouseService.triggerMouseEvent({
        col: pos.col,
        row: pos.row,
        x: pos.x,
        y: pos.y,
        button: but,
        action,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        shift: ev.shiftKey
      });
    }
    const requestedEvents = {
      mouseup: null,
      wheel: null,
      mousedrag: null,
      mousemove: null
    };
    const eventListeners = {
      mouseup: (ev) => {
        sendEvent(ev);
        if (!ev.buttons) {
          this._document.removeEventListener("mouseup", requestedEvents.mouseup);
          if (requestedEvents.mousedrag) {
            this._document.removeEventListener("mousemove", requestedEvents.mousedrag);
          }
        }
        return this.cancel(ev);
      },
      wheel: (ev) => {
        sendEvent(ev);
        return this.cancel(ev, true);
      },
      mousedrag: (ev) => {
        if (ev.buttons) {
          sendEvent(ev);
        }
      },
      mousemove: (ev) => {
        if (!ev.buttons) {
          sendEvent(ev);
        }
      }
    };
    this._register(this.coreMouseService.onProtocolChange((events) => {
      if (events) {
        if (this.optionsService.rawOptions.logLevel === "debug") {
          this._logService.debug("Binding to mouse events:", this.coreMouseService.explainEvents(events));
        }
        this.element.classList.add("enable-mouse-events");
        this._selectionService.disable();
      } else {
        this._logService.debug("Unbinding from mouse events.");
        this.element.classList.remove("enable-mouse-events");
        this._selectionService.enable();
      }
      if (!(events & import_Types3.CoreMouseEventType.MOVE)) {
        el.removeEventListener("mousemove", requestedEvents.mousemove);
        requestedEvents.mousemove = null;
      } else if (!requestedEvents.mousemove) {
        el.addEventListener("mousemove", eventListeners.mousemove);
        requestedEvents.mousemove = eventListeners.mousemove;
      }
      if (!(events & import_Types3.CoreMouseEventType.WHEEL)) {
        el.removeEventListener("wheel", requestedEvents.wheel);
        requestedEvents.wheel = null;
      } else if (!requestedEvents.wheel) {
        el.addEventListener("wheel", eventListeners.wheel, { passive: false });
        requestedEvents.wheel = eventListeners.wheel;
      }
      if (!(events & import_Types3.CoreMouseEventType.UP)) {
        this._document.removeEventListener("mouseup", requestedEvents.mouseup);
        requestedEvents.mouseup = null;
      } else if (!requestedEvents.mouseup) {
        requestedEvents.mouseup = eventListeners.mouseup;
      }
      if (!(events & import_Types3.CoreMouseEventType.DRAG)) {
        this._document.removeEventListener("mousemove", requestedEvents.mousedrag);
        requestedEvents.mousedrag = null;
      } else if (!requestedEvents.mousedrag) {
        requestedEvents.mousedrag = eventListeners.mousedrag;
      }
    }));
    this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol;
    this._register((0, import_dom.addDisposableListener)(el, "mousedown", (ev) => {
      ev.preventDefault();
      this.focus();
      if (!this.coreMouseService.areMouseEventsActive || this._selectionService.shouldForceSelection(ev)) {
        return;
      }
      sendEvent(ev);
      if (requestedEvents.mouseup) {
        this._document.addEventListener("mouseup", requestedEvents.mouseup);
      }
      if (requestedEvents.mousedrag) {
        this._document.addEventListener("mousemove", requestedEvents.mousedrag);
      }
      return this.cancel(ev);
    }));
    this._register((0, import_dom.addDisposableListener)(el, "wheel", (ev) => {
      if (requestedEvents.wheel) return;
      if (this._customWheelEventHandler && this._customWheelEventHandler(ev) === false) {
        return false;
      }
      if (!this.buffer.hasScrollback) {
        const deltaY = ev.deltaY;
        if (deltaY === 0) {
          return false;
        }
        const sequence = import_EscapeSequences.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? "O" : "[") + (ev.deltaY < 0 ? "A" : "B");
        this.coreService.triggerDataEvent(sequence, true);
        return this.cancel(ev, true);
      }
    }, { passive: false }));
  }
  /**
   * Tells the renderer to refresh terminal content between two rows (inclusive) at the next
   * opportunity.
   * @param start The row to start from (between 0 and this.rows - 1).
   * @param end The row to end at (between start and this.rows - 1).
   */
  refresh(start, end) {
    this._renderService?.refreshRows(start, end);
  }
  /**
   * Change the cursor style for different selection modes
   */
  updateCursorStyle(ev) {
    if (this._selectionService?.shouldColumnSelect(ev)) {
      this.element.classList.add("column-select");
    } else {
      this.element.classList.remove("column-select");
    }
  }
  /**
   * Display the cursor element
   */
  _showCursor() {
    if (!this.coreService.isCursorInitialized) {
      this.coreService.isCursorInitialized = true;
      this.refresh(this.buffer.y, this.buffer.y);
    }
  }
  scrollLines(disp, suppressScrollEvent) {
    if (this._viewport) {
      this._viewport.scrollLines(disp);
    } else {
      super.scrollLines(disp, suppressScrollEvent);
    }
    this.refresh(0, this.rows - 1);
  }
  scrollPages(pageCount) {
    this.scrollLines(pageCount * (this.rows - 1));
  }
  scrollToTop() {
    this.scrollLines(-this._bufferService.buffer.ydisp);
  }
  scrollToBottom(disableSmoothScroll) {
    if (disableSmoothScroll && this._viewport) {
      this._viewport.scrollToLine(this.buffer.ybase, true);
    } else {
      this.scrollLines(this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
    }
  }
  scrollToLine(line) {
    const scrollAmount = line - this._bufferService.buffer.ydisp;
    if (scrollAmount !== 0) {
      this.scrollLines(scrollAmount);
    }
  }
  paste(data) {
    (0, import_Clipboard.paste)(data, this.textarea, this.coreService, this.optionsService);
  }
  attachCustomKeyEventHandler(customKeyEventHandler) {
    this._customKeyEventHandler = customKeyEventHandler;
  }
  attachCustomWheelEventHandler(customWheelEventHandler) {
    this._customWheelEventHandler = customWheelEventHandler;
  }
  registerLinkProvider(linkProvider) {
    return this._linkProviderService.registerLinkProvider(linkProvider);
  }
  registerCharacterJoiner(handler) {
    if (!this._characterJoinerService) {
      throw new Error("Terminal must be opened first");
    }
    const joinerId = this._characterJoinerService.register(handler);
    this.refresh(0, this.rows - 1);
    return joinerId;
  }
  deregisterCharacterJoiner(joinerId) {
    if (!this._characterJoinerService) {
      throw new Error("Terminal must be opened first");
    }
    if (this._characterJoinerService.deregister(joinerId)) {
      this.refresh(0, this.rows - 1);
    }
  }
  get markers() {
    return this.buffer.markers;
  }
  registerMarker(cursorYOffset) {
    return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
  }
  registerDecoration(decorationOptions) {
    return this._decorationService.registerDecoration(decorationOptions);
  }
  /**
   * Gets whether the terminal has an active selection.
   */
  hasSelection() {
    return this._selectionService ? this._selectionService.hasSelection : false;
  }
  /**
   * Selects text within the terminal.
   * @param column The column the selection starts at..
   * @param row The row the selection starts at.
   * @param length The length of the selection.
   */
  select(column, row, length) {
    this._selectionService.setSelection(column, row, length);
  }
  /**
   * Gets the terminal's current selection, this is useful for implementing copy
   * behavior outside of xterm.js.
   */
  getSelection() {
    return this._selectionService ? this._selectionService.selectionText : "";
  }
  getSelectionPosition() {
    if (!this._selectionService || !this._selectionService.hasSelection) {
      return void 0;
    }
    return {
      start: {
        x: this._selectionService.selectionStart[0],
        y: this._selectionService.selectionStart[1]
      },
      end: {
        x: this._selectionService.selectionEnd[0],
        y: this._selectionService.selectionEnd[1]
      }
    };
  }
  /**
   * Clears the current terminal selection.
   */
  clearSelection() {
    this._selectionService?.clearSelection();
  }
  /**
   * Selects all text within the terminal.
   */
  selectAll() {
    this._selectionService?.selectAll();
  }
  selectLines(start, end) {
    this._selectionService?.selectLines(start, end);
  }
  /**
   * Handle a keydown [KeyboardEvent].
   *
   * [KeyboardEvent]: https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent
   */
  _keyDown(event) {
    this._keyDownHandled = false;
    this._keyDownSeen = true;
    if (this._customKeyEventHandler && this._customKeyEventHandler(event) === false) {
      return false;
    }
    const shouldIgnoreComposition = this.browser.isMac && this.options.macOptionIsMeta && event.altKey;
    if (!shouldIgnoreComposition && !this._compositionHelper.keydown(event)) {
      if (this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp) {
        this.scrollToBottom(true);
      }
      return false;
    }
    if (!shouldIgnoreComposition && (event.key === "Dead" || event.key === "AltGraph")) {
      this._unprocessedDeadKey = true;
    }
    const result = (0, import_Keyboard.evaluateKeyboardEvent)(event, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
    this.updateCursorStyle(event);
    if (result.type === import_Types3.KeyboardResultType.PAGE_DOWN || result.type === import_Types3.KeyboardResultType.PAGE_UP) {
      const scrollCount = this.rows - 1;
      this.scrollLines(result.type === import_Types3.KeyboardResultType.PAGE_UP ? -scrollCount : scrollCount);
      return this.cancel(event, true);
    }
    if (result.type === import_Types3.KeyboardResultType.SELECT_ALL) {
      this.selectAll();
    }
    if (this._isThirdLevelShift(this.browser, event)) {
      return true;
    }
    if (result.cancel) {
      this.cancel(event, true);
    }
    if (!result.key) {
      return true;
    }
    if (event.key && !event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1) {
      if (event.key.charCodeAt(0) >= 65 && event.key.charCodeAt(0) <= 90) {
        return true;
      }
    }
    if (this._unprocessedDeadKey) {
      this._unprocessedDeadKey = false;
      return true;
    }
    if (result.key === import_EscapeSequences.C0.ETX || result.key === import_EscapeSequences.C0.CR) {
      this.textarea.value = "";
    }
    this._onKey.fire({ key: result.key, domEvent: event });
    this._showCursor();
    this.coreService.triggerDataEvent(result.key, true);
    if (!this.optionsService.rawOptions.screenReaderMode || event.altKey || event.ctrlKey) {
      return this.cancel(event, true);
    }
    this._keyDownHandled = true;
  }
  _isThirdLevelShift(browser, ev) {
    const thirdLevelKey = browser.isMac && !this.options.macOptionIsMeta && ev.altKey && !ev.ctrlKey && !ev.metaKey || browser.isWindows && ev.altKey && ev.ctrlKey && !ev.metaKey || browser.isWindows && ev.getModifierState("AltGraph");
    if (ev.type === "keypress") {
      return thirdLevelKey;
    }
    return thirdLevelKey && (!ev.keyCode || ev.keyCode > 47);
  }
  _keyUp(ev) {
    this._keyDownSeen = false;
    if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
      return;
    }
    if (!wasModifierKeyOnlyEvent(ev)) {
      this.focus();
    }
    this.updateCursorStyle(ev);
    this._keyPressHandled = false;
  }
  /**
   * Handle a keypress event.
   * Key Resources:
   *   - https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent
   * @param ev The keypress event to be handled.
   */
  _keyPress(ev) {
    let key;
    this._keyPressHandled = false;
    if (this._keyDownHandled) {
      return false;
    }
    if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
      return false;
    }
    this.cancel(ev);
    if (ev.charCode) {
      key = ev.charCode;
    } else if (ev.which === null || ev.which === void 0) {
      key = ev.keyCode;
    } else if (ev.which !== 0 && ev.charCode !== 0) {
      key = ev.which;
    } else {
      return false;
    }
    if (!key || (ev.altKey || ev.ctrlKey || ev.metaKey) && !this._isThirdLevelShift(this.browser, ev)) {
      return false;
    }
    key = String.fromCharCode(key);
    this._onKey.fire({ key, domEvent: ev });
    this._showCursor();
    this.coreService.triggerDataEvent(key, true);
    this._keyPressHandled = true;
    this._unprocessedDeadKey = false;
    return true;
  }
  /**
   * Handle an input event.
   * Key Resources:
   *   - https://developer.mozilla.org/en-US/docs/Web/API/InputEvent
   * @param ev The input event to be handled.
   */
  _inputEvent(ev) {
    if (ev.data && ev.inputType === "insertText" && (!ev.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
      if (this._keyPressHandled) {
        return false;
      }
      this._unprocessedDeadKey = false;
      const text = ev.data;
      this.coreService.triggerDataEvent(text, true);
      this.cancel(ev);
      return true;
    }
    return false;
  }
  /**
   * Resizes the terminal.
   *
   * @param x The number of columns to resize to.
   * @param y The number of rows to resize to.
   */
  resize(x, y) {
    if (x === this.cols && y === this.rows) {
      if (this._charSizeService && !this._charSizeService.hasValidSize) {
        this._charSizeService.measure();
      }
      return;
    }
    super.resize(x, y);
  }
  _afterResize(x, y) {
    this._charSizeService?.measure();
  }
  /**
   * Clear the entire buffer, making the prompt line the new first line.
   */
  clear() {
    if (this.buffer.ybase === 0 && this.buffer.y === 0) {
      return;
    }
    this.buffer.clearAllMarkers();
    this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
    this.buffer.lines.length = 1;
    this.buffer.ydisp = 0;
    this.buffer.ybase = 0;
    this.buffer.y = 0;
    for (let i = 1; i < this.rows; i++) {
      this.buffer.lines.push(this.buffer.getBlankLine(import_BufferLine.DEFAULT_ATTR_DATA));
    }
    this._onScroll.fire({ position: this.buffer.ydisp });
    this.refresh(0, this.rows - 1);
  }
  /**
   * Reset terminal.
   * Note: Calling this directly from JS is synchronous but does not clear
   * input buffers and does not reset the parser, thus the terminal will
   * continue to apply pending input data.
   * If you need in band reset (synchronous with input data) consider
   * using DECSTR (soft reset, CSI ! p) or RIS instead (hard reset, ESC c).
   */
  reset() {
    this.options.rows = this.rows;
    this.options.cols = this.cols;
    const customKeyEventHandler = this._customKeyEventHandler;
    this._setup();
    super.reset();
    this._selectionService?.reset();
    this._decorationService.reset();
    this._customKeyEventHandler = customKeyEventHandler;
    this.refresh(0, this.rows - 1);
  }
  clearTextureAtlas() {
    this._renderService?.clearTextureAtlas();
  }
  _reportFocus() {
    if (this.element?.classList.contains("focus")) {
      this.coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[I");
    } else {
      this.coreService.triggerDataEvent(import_EscapeSequences.C0.ESC + "[O");
    }
  }
  _reportWindowsOptions(type) {
    if (!this._renderService) {
      return;
    }
    switch (type) {
      case import_InputHandler.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
        const canvasWidth = this._renderService.dimensions.css.canvas.width.toFixed(0);
        const canvasHeight = this._renderService.dimensions.css.canvas.height.toFixed(0);
        this.coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[4;${canvasHeight};${canvasWidth}t`);
        break;
      case import_InputHandler.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
        const cellWidth = this._renderService.dimensions.css.cell.width.toFixed(0);
        const cellHeight = this._renderService.dimensions.css.cell.height.toFixed(0);
        this.coreService.triggerDataEvent(`${import_EscapeSequences.C0.ESC}[6;${cellHeight};${cellWidth}t`);
        break;
    }
  }
  // TODO: Remove cancel function and cancelEvents option
  cancel(ev, force) {
    if (!this.options.cancelEvents && !force) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    return false;
  }
}
function wasModifierKeyOnlyEvent(ev) {
  return ev.keyCode === 16 || // Shift
  ev.keyCode === 17 || // Ctrl
  ev.keyCode === 18;
}
//# sourceMappingURL=CoreBrowserTerminal.js.map
